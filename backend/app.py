"""
AutoForge Backend Engine
FastAPI Server, Full-Duplex WebSockets Telemetry, REST Endpoints,
Local Intent Policy Gate with Human Approval Waiting Loop, and Outcome Verification
"""

import os
import json
import uuid
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from orchestrator import AntiBoilerplateCouncil, CouncilVerdict
from verifier import OutcomeVerifier, VerificationOutcome
from gtm_pipeline import GTMPipeline
from security import LocalIntentPolicyGate, IntentToken
from autonomous_runner import AutonomousRunner, AutonomousPlanResult
from multimodal import MultimodalEngine

app = FastAPI(
    title="AutoForge Backend Engine",
    description="The AI-Native Developer Browser Orchestration & Verification Engine",
    version="2.0.0"
)

# CORS setup for Electron / Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=ARTIFACTS_DIR), name="artifacts")

# WebSocket Connection Manager
class TelemetryManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.pending_approvals: Dict[str, asyncio.Event] = {}
        self.approval_decisions: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "data": {
                "engine": "AutoForge Local Intent Policy Gate & Outcome Telemetry",
                "status": "ONLINE",
                "connected_clients": len(self.active_connections)
            }
        })

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.disconnect(dc)

telemetry = TelemetryManager()

# Browser Bridge connecting AutonomousRunner to live Electron browser via full-duplex WebSocket
class BrowserBridge:
    def __init__(self, telemetry_mgr: TelemetryManager):
        self.telemetry = telemetry_mgr
        self._pending_requests: Dict[str, asyncio.Future] = {}

    def is_connected(self) -> bool:
        return len(self.telemetry.active_connections) > 0

    async def dispatch(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatches a browser command to the active Electron browser session over WebSocket."""
        if not self.is_connected():
            return {
                "success": False,
                "error": "BROWSER_BRIDGE_UNAVAILABLE",
                "message": "No active Electron browser session connected over WebSocket telemetry."
            }

        request_id = str(uuid.uuid4())
        loop = asyncio.get_event_loop()
        fut: asyncio.Future = loop.create_future()
        self._pending_requests[request_id] = fut

        try:
            await self.telemetry.broadcast({
                "type": "BROWSER_ACTION",
                "data": {
                    "request_id": request_id,
                    "action": action,
                    "params": params
                }
            })
            result = await asyncio.wait_for(fut, timeout=12.0)
            return result
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": "BROWSER_BRIDGE_TIMEOUT",
                "message": f"Browser bridge action '{action}' timed out after 12000ms."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"BRIDGE_ERROR: {str(e)}"
            }
        finally:
            self._pending_requests.pop(request_id, None)

    def resolve_response(self, request_id: str, payload: Dict[str, Any]):
        fut = self._pending_requests.get(request_id)
        if fut and not fut.done():
            fut.set_result(payload)

# Register live browser bridge during application startup
browser_bridge = BrowserBridge(telemetry)
AutonomousRunner.register_browser_bridge(browser_bridge.dispatch)

# Request Models
class TaskExecuteRequest(BaseModel):
    task_type: str # 'COUNCIL_AUDIT' | 'CODE_GEN' | 'SECURITY_EVAL' | 'VERIFICATION_BENCH' | 'GENERATE_GTM'
    prompt: str
    code_snippet: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

class TaskApproveRequest(BaseModel):
    intent_id: str
    decision: str # 'APPROVED' | 'REJECTED'

class BenchmarkExportRequest(BaseModel):
    mode: str = "LIVE_SCRAPED" # 'LIVE_SCRAPED' | 'OFFLINE_HOST_FAILURE' | 'CORRUPTION_DETECTION'

class GTMGenerateRequest(BaseModel):
    title: str = "AutoForge Launchpad"
    headline: str = "AI-Native Developer Browser Shell with CDP Accessibility Automation"
    script: Optional[str] = None

class AutonomousPlanRequest(BaseModel):
    goal: str
    context: Optional[Dict[str, Any]] = None

class AutonomousCancelRequest(BaseModel):
    plan_id: str

class ImageGenerateRequest(BaseModel):
    title: str = "AutoForge Launchpad"
    tagline: str = "AI-Native Browser & Autonomous Multimodal Companion"
    badge: str = "GTM CAMPAIGN"
    theme: str = "indigo"

class ImageAnalyzeRequest(BaseModel):
    image_base64: Optional[str] = None
    context_url: str = ""

# WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await telemetry.connect(websocket)
    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
                msg_type = msg.get("type")
                if msg_type == "PING":
                    await websocket.send_json({"type": "PONG", "timestamp": asyncio.get_event_loop().time()})
                elif msg_type == "APPROVE_INTENT":
                    data = msg.get("data", {})
                    intent_id = data.get("intent_id")
                    decision = data.get("decision", "APPROVED")
                    if intent_id in telemetry.pending_approvals:
                        telemetry.approval_decisions[intent_id] = decision
                        telemetry.pending_approvals[intent_id].set()
                elif msg_type == "BROWSER_ACTION_RESULT":
                    data = msg.get("data", {})
                    req_id = data.get("request_id")
                    if req_id:
                        browser_bridge.resolve_response(req_id, data)
            except Exception as e:
                await websocket.send_json({"type": "ERROR", "message": str(e)})
    except WebSocketDisconnect:
        telemetry.disconnect(websocket)

# REST Endpoints
@app.post("/api/task/execute")
async def execute_task(req: TaskExecuteRequest):
    # Step 1: Local Intent Policy Gate evaluation
    token: IntentToken = LocalIntentPolicyGate.evaluate_intent(
        action=req.task_type,
        target="execution_runtime",
        subtasks=[req.prompt, req.code_snippet or ""]
    )

    await telemetry.broadcast({
        "type": "PLAN_LOCKING",
        "data": {
            "intent_id": token.intent_id,
            "merkle_root": token.merkle_root,
            "risk_level": token.risk_level,
            "status": token.status,
            "reason": token.reason
        }
    })

    # Fail-closed interception for destructive commands
    if token.status == "TASK_BLOCKED":
        await telemetry.broadcast({
            "type": "TASK_BLOCKED",
            "data": {
                "intent_id": token.intent_id,
                "error": token.reason
            }
        })
        return JSONResponse(
            status_code=403,
            content={
                "status": "TASK_BLOCKED",
                "error": token.reason,
                "token": token.model_dump()
            }
        )

    # Consequential actions require real human-in-the-loop approval before proceeding
    if token.status == "PENDING_APPROVAL":
        approval_event = asyncio.Event()
        telemetry.pending_approvals[token.intent_id] = approval_event

        await telemetry.broadcast({
            "type": "APPROVAL_REQUEST",
            "data": {
                "intent_id": token.intent_id,
                "action": token.action,
                "target": token.target,
                "risk_level": token.risk_level,
                "reason": token.reason
            }
        })

        try:
            # Wait up to 60 seconds for explicit user approval via /api/task/approve or WebSocket
            await asyncio.wait_for(approval_event.wait(), timeout=60.0)
        except asyncio.TimeoutError:
            del telemetry.pending_approvals[token.intent_id]
            return JSONResponse(
                status_code=408,
                content={
                    "status": "APPROVAL_TIMEOUT",
                    "error": "Task approval timed out after 60s. Operation safely cancelled.",
                    "intent_id": token.intent_id
                }
            )

        decision = telemetry.approval_decisions.get(token.intent_id, "REJECTED")
        if decision != "APPROVED":
            return JSONResponse(
                status_code=403,
                content={
                    "status": "TASK_REJECTED",
                    "error": "Consequential task was rejected by user. Operation safely halted.",
                    "intent_id": token.intent_id
                }
            )

        # Token consumed
        consumed = LocalIntentPolicyGate.consume_token(token)
        if not consumed:
            return JSONResponse(
                status_code=403,
                content={
                    "status": "TOKEN_CONSUMPTION_FAILED",
                    "error": "Intent token consumption failed: token was already consumed or signature invalid.",
                    "intent_id": token.intent_id
                }
            )

    # Execute Safe or Approved Task
    if req.task_type in ("COUNCIL_AUDIT", "CODE_GEN"):
        await telemetry.broadcast({
            "type": "AGENT_STATUS",
            "data": {
                "agent": "AntiBoilerplateCouncil",
                "status": "CONCURRENT_7_CRITIC_EVALUATION"
            }
        })
        code_to_eval = req.code_snippet or req.prompt
        verdict = await AntiBoilerplateCouncil.evaluate_code(code_to_eval, user_prompt=req.prompt)
        
        await telemetry.broadcast({
            "type": "TASK_COMPLETED",
            "data": {
                "task_type": req.task_type,
                "verdict_id": verdict.verdict_id,
                "average_score": verdict.average_score,
                "passed": verdict.passed
            }
        })
        return verdict.model_dump()

    elif req.task_type == "VERIFICATION_BENCH":
        mode = (req.options or {}).get("mode", "LIVE_SCRAPED")
        outcome = await OutcomeVerifier.run_benchmark(mode)
        return outcome.model_dump()

    elif req.task_type == "GENERATE_GTM":
        title = (req.options or {}).get("title", "AutoForge Launchpad")
        headline = (req.options or {}).get("headline", req.prompt)
        script = req.code_snippet
        res = await GTMPipeline.composite_gtm_video(title, headline, script)
        return res

    return {"status": "AUTHORIZED", "token": token.model_dump()}

@app.post("/api/task/approve")
async def approve_task(req: TaskApproveRequest):
    telemetry.approval_decisions[req.intent_id] = req.decision
    if req.intent_id in telemetry.pending_approvals:
        telemetry.pending_approvals[req.intent_id].set()

    await telemetry.broadcast({
        "type": "APPROVAL_RESOLVED",
        "data": {
            "intent_id": req.intent_id,
            "decision": req.decision
        }
    })
    return {"status": "RESOLVED", "intent_id": req.intent_id, "decision": req.decision}

@app.get("/api/spreadsheet/latest")
async def get_latest_spreadsheet():
    cached = OutcomeVerifier.get_latest_cached_outcome()
    if cached is None:
        # Perform initial baseline run if no file exists
        outcome = await OutcomeVerifier.run_benchmark("LIVE_SCRAPED")
        return outcome.model_dump()
    return cached.model_dump()

@app.post("/api/spreadsheet/export")
async def export_spreadsheet(req: BenchmarkExportRequest):
    await telemetry.broadcast({
        "type": "VERIFICATION_LOG",
        "data": {
            "log": f"Initiating benchmark run in mode: '{req.mode}'",
            "level": "INFO"
        }
    })
    outcome = await OutcomeVerifier.run_benchmark(req.mode)
    
    await telemetry.broadcast({
        "type": "VERIFICATION_LOG",
        "data": {
            "log": f"Outcome complete: {outcome.status} ({outcome.verified_count}/{outcome.total_evaluated} rows verified on disk)",
            "level": "SUCCESS" if outcome.disk_integrity_verified else "FAIL"
        }
    })
    return outcome.model_dump()

@app.get("/api/spreadsheet/download")
async def download_spreadsheet():
    csv_path = OutcomeVerifier.get_csv_path()
    if not os.path.exists(csv_path):
        await OutcomeVerifier.run_benchmark("LIVE_SCRAPED")
    return FileResponse(
        path=csv_path,
        filename="ai_startups_matrix.csv",
        media_type="text/csv"
    )

@app.post("/api/gtm/generate")
async def generate_gtm(req: GTMGenerateRequest):
    await telemetry.broadcast({
        "type": "AGENT_STATUS",
        "data": {
            "agent": "MultimodalGTMCompositor",
            "status": "COMPOSITING_1080P_VIDEO"
        }
    })
    result = await GTMPipeline.composite_gtm_video(
        title=req.title,
        headline=req.headline,
        script=req.script
    )
    await telemetry.broadcast({
        "type": "TASK_COMPLETED",
        "data": {
            "task_type": "GTM_COMPOSITE",
            "success": result["success"],
            "resolution": result["resolution"],
            "audio_source": result["audio_source"]
        }
    })
    return result

# Autonomous Workflow Endpoints
@app.post("/api/autonomous/plan")
async def autonomous_plan(req: AutonomousPlanRequest):
    plan = await AutonomousRunner.plan_task(req.goal, req.context)
    return plan.model_dump()

@app.post("/api/autonomous/execute")
async def autonomous_execute(plan: AutonomousPlanResult):
    async def broadcast_step(msg: Dict[str, Any]):
        await telemetry.broadcast(msg)

    async def approval_handler(token: IntentToken) -> str:
        approval_event = asyncio.Event()
        telemetry.pending_approvals[token.intent_id] = approval_event
        await telemetry.broadcast({
            "type": "APPROVAL_REQUEST",
            "data": {
                "intent_id": token.intent_id,
                "action": token.action,
                "target": token.target,
                "risk_level": token.risk_level,
                "reason": token.reason
            }
        })
        try:
            await asyncio.wait_for(approval_event.wait(), timeout=60.0)
            return telemetry.approval_decisions.get(token.intent_id, "REJECTED")
        finally:
            telemetry.pending_approvals.pop(token.intent_id, None)

    executed = await AutonomousRunner.execute_plan(
        plan,
        broadcast_callback=broadcast_step,
        approval_callback=approval_handler
    )
    return executed.model_dump()

@app.post("/api/autonomous/cancel")
async def autonomous_cancel(req: AutonomousCancelRequest):
    cancelled = AutonomousRunner.cancel_plan(req.plan_id)
    return {"status": "CANCELLED" if cancelled else "NOT_FOUND", "plan_id": req.plan_id}

# Browser Bridge Endpoints
@app.get("/api/browser/bridge/status")
async def get_browser_bridge_status():
    return {
        "connected": browser_bridge.is_connected(),
        "active_clients": len(telemetry.active_connections)
    }

class BridgeDispatchRequest(BaseModel):
    action: str
    params: Optional[Dict[str, Any]] = None

@app.post("/api/browser/bridge/dispatch")
async def dispatch_browser_bridge_action(req: BridgeDispatchRequest):
    res = await browser_bridge.dispatch(req.action, req.params or {})
    return res

# Web Preview Endpoints (Eliminates X-Frame-Options blocking in standard browsers)
@app.get("/api/browser/preview")
async def browser_preview(url: str = "https://news.ycombinator.com"):
    """
    Renders clean HTML for web preview mode in standard browsers without X-Frame-Options blocking.
    """
    target = url.strip()
    if not target.startswith("http://") and not target.startswith("https://"):
        target = "https://" + target

    try:
        async with httpx.AsyncClient(verify=True, timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(target, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"})
            html_text = resp.text
            base_tag = f'<base href="{target}">'
            if "<head>" in html_text:
                html_text = html_text.replace("<head>", f"<head>{base_tag}", 1)
            elif "<html>" in html_text:
                html_text = html_text.replace("<html>", f"<html><head>{base_tag}</head>", 1)

            response = HTMLResponse(content=html_text, status_code=resp.status_code)
            response.headers["X-Frame-Options"] = "ALLOWALL"
            response.headers["Content-Security-Policy"] = "frame-ancestors *;"
            return response
    except Exception as e:
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, sans-serif; background: #0c1018; color: #f1f5f9; padding: 40px; text-align: center; }}
                .card {{ max-width: 500px; margin: 40px auto; padding: 28px; background: #131926; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }}
                h2 {{ color: #f43f5e; font-size: 18px; margin-bottom: 8px; }}
                p {{ color: #94a3b8; font-size: 13px; line-height: 1.5; }}
                .tag {{ display: inline-block; padding: 6px 12px; background: rgba(244,63,94,0.15); color: #fda4af; border-radius: 8px; font-size: 11px; margin-top: 14px; font-family: monospace; }}
                .btn {{ display: inline-block; margin-top: 18px; padding: 8px 18px; background: #6366f1; color: white; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Target Site Unreachable in Web Preview</h2>
                <p>Could not fetch <strong>{target}</strong> due to network timeout or connection reset.</p>
                <div class="tag">{type(e).__name__}: {str(e)[:60]}</div>
                <br>
                <a href="javascript:location.reload()" class="btn">Retry Navigation</a>
            </div>
        </body>
        </html>
        """
        err_resp = HTMLResponse(content=error_html, status_code=200)
        err_resp.headers["X-Frame-Options"] = "ALLOWALL"
        err_resp.headers["Content-Security-Policy"] = "frame-ancestors *;"
        return err_resp

@app.get("/api/browser/preview/ax")
async def browser_preview_ax(url: str = "https://news.ycombinator.com"):
    """
    Extracts semantic accessibility nodes from the HTML page for web preview mode.
    """
    target = url.strip()
    if not target.startswith("http://") and not target.startswith("https://"):
        target = "https://" + target

    try:
        from html.parser import HTMLParser
        async with httpx.AsyncClient(verify=True, timeout=5.0, follow_redirects=True) as client:
            resp = await client.get(target, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            
            class SemanticHTMLParser(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.nodes = []
                    self.node_id = 1
                    self.current_tag = None
                    self.current_text = []

                def handle_starttag(self, tag, attrs):
                    attr_dict = dict(attrs)
                    role = attr_dict.get("role", tag).lower()
                    if tag in ("button", "a", "h1", "h2", "h3", "input", "textarea", "select") or "role" in attr_dict:
                        self.current_tag = {
                            "nodeId": str(self.node_id),
                            "backendDOMNodeId": self.node_id,
                            "role": "link" if tag == "a" else "button" if tag == "button" else "heading" if tag.startswith("h") else role,
                            "name": attr_dict.get("aria-label", attr_dict.get("title", "")),
                            "value": attr_dict.get("value", "")
                        }
                        self.node_id += 1
                        self.current_text = []

                def handle_data(self, data):
                    if self.current_tag is not None:
                        self.current_text.append(data.strip())

                def handle_endtag(self, tag):
                    if self.current_tag is not None:
                        text = " ".join([t for t in self.current_text if t]).strip()
                        if not self.current_tag["name"] and text:
                            self.current_tag["name"] = text[:60]
                        if self.current_tag["name"]:
                            self.nodes.append(self.current_tag)
                        self.current_tag = None
                        self.current_text = []

            parser = SemanticHTMLParser()
            parser.feed(resp.text[:120000])
            return {"nodes": parser.nodes[:40], "mode": "HTML_PARSER_PREVIEW"}
    except Exception:
        return {"nodes": [], "mode": "HTML_PARSER_PREVIEW"}

# Multimodal Intelligence Endpoints (Point 3: Image, Audio, Video)
@app.post("/api/multimodal/image/generate")
async def generate_creative_banner(req: ImageGenerateRequest):
    return await MultimodalEngine.generate_creative_banner(
        title=req.title,
        tagline=req.tagline,
        badge=req.badge,
        theme=req.theme
    )

@app.post("/api/multimodal/image/analyze")
async def analyze_visual_structure(req: ImageAnalyzeRequest):
    return await MultimodalEngine.analyze_visual_structure(
        image_base64=req.image_base64,
        context_url=req.context_url
    )

@app.get("/api/multimodal/audio/analyze")
async def analyze_audio_track():
    return await MultimodalEngine.analyze_audio_track()

# Mount static production build if available for seamless local deployment
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")
