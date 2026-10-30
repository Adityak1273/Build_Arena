"""
AutoForge v1.8 Root Application Server Entry Point
"""

import sys
import os

# Ensure project root and backend directory are in python module path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(1, root_dir)

# Import the FastAPI instance from backend/app.py
from backend.app import app
import uvicorn

if __name__ == "__main__":
    print("[*] Starting AutoForge FastAPI & Full-Duplex WebSocket Engine on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
