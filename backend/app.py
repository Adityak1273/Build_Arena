import os
import sys
import json
import asyncio
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from orchestrator import SecureAutoForgeRuntime, AutoForgeMultiAgentPipeline
from gtm_pipeline import AutoForgeGTMPipeline
from verifier import OutcomeVerifier

app = FastAPI(title="AutoForge Backend Orchestrator", version="1.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        dead_conns = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_conns.append(connection)
        for dead in dead_conns:
            self.disconnect(dead)

ws_manager = ConnectionManager()
workspace_dir = Path(__file__).resolve().parent.parent

# Initialize runtime & pipelines
runtime = SecureAutoForgeRuntime(
    workspace=str(workspace_dir),
    ws_broadcaster=ws_manager
)
agent_pipeline = AutoForgeMultiAgentPipeline(runtime=runtime, ws_broadcaster=ws_manager)
gtm_pipeline = AutoForgeGTMPipeline(workspace_dir=str(workspace_dir))
verifier = OutcomeVerifier(workspace_root=workspace_dir)

class TaskRequest(BaseModel):
    prompt: str
    mode: Optional[str] = "build"
    failure_mode: Optional[str] = None

class ApprovalResponse(BaseModel):
    approvalId: str
    approved: bool

class GTMRequest(BaseModel):
    headline: str
    script: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "agent": "AutoForge 1.5 Orchestrator",
        "security": "ArmorIQ CSRG-IAP Active (Fail-Closed)",
        "adal_connected": True,
        "council_agents": 7,
        "fan_out_concurrency": True,
        "outcome_verification_active": True
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    # Send welcome handshake
    await websocket.send_json({
        "type": "HANDSHAKE_READY",
        "system": "AutoForge AI-Native Browser Agent v1.5",
        "active_intent_token": runtime.active_intent_token,
        "connected_at": time.time()
    })
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                msg_type = payload.get("type")

                if msg_type == "SUBMIT_TASK":
                    prompt = payload.get("prompt", "")
                    mode = payload.get("mode", "build")
                    failure_mode = payload.get("failure_mode")
                    asyncio.create_task(agent_pipeline.execute_task(prompt, mode, failure_mode=failure_mode))

                elif msg_type == "APPROVAL_DECISION":
                    approval_id = payload.get("approvalId")
                    approved = payload.get("approved", False)
                    runtime.resolve_approval(approval_id, approved)

                elif msg_type == "PING":
                    await websocket.send_json({"type": "PONG", "time": time.time()})

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.post("/api/task/execute")
async def execute_task(req: TaskRequest):
    res = await agent_pipeline.execute_task(req.prompt, req.mode, failure_mode=req.failure_mode)
    return res

@app.post("/api/task/approve")
def resolve_approval(req: ApprovalResponse):
    runtime.resolve_approval(req.approvalId, req.approved)
    return {"success": True, "approvalId": req.approvalId, "approved": req.approved}

@app.get("/api/spreadsheet/latest")
async def get_spreadsheet():
    # Read-back latest verified data from disk
    report = await verifier.execute_and_verify_spreadsheet()
    return {
        "dataset": "Top 10 AI Startups Comparative Matrix",
        "verified": report["verified"],
        "status": report["status"],
        "summary": report["summary"],
        "rows_written": report["rows_written"],
        "rows_verified": report["rows_verified"],
        "cells_checked": report["cells_checked"],
        "flagged_unknown": report["flagged_unknown"],
        "unreachable_hosts": report.get("unreachable_hosts", 0),
        "artifact_path": report["artifact_path"],
        "rows": report["sample_rows"]
    }

@app.post("/api/spreadsheet/export")
async def export_spreadsheet(failure_mode: Optional[str] = Query(None)):
    await ws_manager.broadcast({
        "type": "SPREADSHEET_SYNC",
        "status": "WRITING_CELLS",
        "message": "Writing ai_startups_matrix.csv to physical disk..."
    })
    
    report = await verifier.execute_and_verify_spreadsheet(failure_mode=failure_mode)
    await asyncio.sleep(0.4)

    await ws_manager.broadcast({
        "type": "SPREADSHEET_SYNC",
        "status": "READ_BACK_VERIFIED" if report["verified"] else "VERIFICATION_FAILED",
        "report": report,
        "outcome": report["summary"]
    })
    return {"status": "SUCCESS" if report["verified"] else "FAILED", "report": report}

@app.get("/api/spreadsheet/download")
def download_spreadsheet():
    csv_file = workspace_dir / "artifacts" / "ai_startups_matrix.csv"
    if not csv_file.exists():
        asyncio.run(verifier.execute_and_verify_spreadsheet())
    return FileResponse(
        csv_file,
        media_type="text/csv",
        filename="ai_startups_matrix.csv"
    )

@app.post("/api/gtm/generate")
async def generate_gtm(req: GTMRequest):
    audio_path = gtm_pipeline.synthesize_voiceover_cached(req.script)
    
    gtm_dir = workspace_dir / "gtm_assets"
    gtm_dir.mkdir(parents=True, exist_ok=True)
    ui_screenshot = gtm_dir / "autoforge_ui_render.png"

    # Generate 1280x720 canvas if no screenshot
    if not ui_screenshot.exists():
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (1280, 720), color=(15, 15, 15))
            draw = ImageDraw.Draw(img)
            draw.rectangle([0, 0, 1280, 60], fill=(24, 24, 27))
            draw.text((30, 20), "AutoForge AI-Native Browser - Live Verification Workspace", fill=(255, 255, 255))
            draw.rounded_rectangle([40, 90, 1240, 680], radius=16, fill=(248, 250, 252), outline=(228, 228, 231))
            draw.text((70, 120), req.headline, fill=(15, 15, 15))
            img.save(ui_screenshot, "PNG")
        except Exception:
            pass

    video_path = gtm_pipeline.composite_launch_video(
        screenshot_path=ui_screenshot,
        audio_path=audio_path,
        headline_caption=req.headline
    )
    return {
        "status": "COMPLETED",
        "audio_path": str(audio_path),
        "video_path": str(video_path),
        "headline": req.headline
    }

# Serve frontend build from FastAPI
dist_dir = workspace_dir / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(dist_dir / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
