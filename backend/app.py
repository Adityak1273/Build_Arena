"""
AutoForge Backend Engine
FastAPI Server, Full-Duplex WebSockets Telemetry, REST Endpoints, and Outcome Verification
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from orchestrator import AntiBoilerplateCouncil, CouncilVerdict
from verifier import OutcomeVerifier, VerificationOutcome
from gtm_pipeline import GTMPipeline
from security import ArmorIQGate, IntentToken

app = FastAPI(
    title="AutoForge Backend Engine",
    description="The AI-Native Developer Browser Orchestration & Verification Engine",
    version="1.0.0"
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
                "engine": "AutoForge ArmorIQ & Outcome Telemetry",
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

# Request Models
class TaskExecuteRequest(BaseModel):
    task_type: str # 'COUNCIL_AUDIT' | 'CODE_GEN' | 'SECURITY_EVAL' | 'VERIFICATION_BENCH'
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
            except Exception as e:
                await websocket.send_json({"type": "ERROR", "message": str(e)})
    except WebSocketDisconnect:
        telemetry.disconnect(websocket)

# REST Endpoints
@app.post("/api/task/execute")
async def execute_task(req: TaskExecuteRequest):
    # Step 1: Zero-Trust Security Gate evaluation
    token: IntentToken = ArmorIQGate.evaluate_intent(
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

    # Consequential actions require human approval
    if token.status == "PENDING_APPROVAL":
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
        return {
            "status": "PENDING_APPROVAL",
            "token": token.model_dump(),
            "message": "Consequential task requires human approval before proceeding."
        }

    # Execute Safe Task
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
    csv_path = OutcomeVerifier.get_csv_path()
    if not os.path.exists(csv_path):
        # Auto-initialize baseline verification
        outcome = await OutcomeVerifier.run_benchmark("LIVE_SCRAPED")
        return outcome.model_dump()
    
    # Read verified CSV directly from disk
    rows = []
    import csv
    with open(csv_path, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    
    import hashlib
    disk_hash = hashlib.sha256(open(csv_path, 'rb').read()).hexdigest()

    return {
        "status": "VERIFIED_DISK_SYNC",
        "total_evaluated": len(rows),
        "verified_count": len(rows),
        "flagged_sales_gates": sum(1 for r in rows if r.get("enterprise_sales_gate") == "FLAGGED_SALES_GATE"),
        "artifact_path": csv_path,
        "disk_hash": disk_hash,
        "rows": rows
    }

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
            "log": f"Outcome complete: {outcome.status} ({outcome.verified_count}/{outcome.total_evaluated} verified)",
            "level": "SUCCESS" if outcome.status == "VERIFIED_DISK_SYNC" else "FAIL"
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
            "sha256": result["sha256"]
        }
    })
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
