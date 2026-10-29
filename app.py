"""
AutoForge Root Application Server Entry Point
"""

import sys
import os

# Ensure backend directory is in python module path
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app
import uvicorn

if __name__ == "__main__":
    print("[*] Starting AutoForge FastAPI & Full-Duplex WebSocket Engine on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
