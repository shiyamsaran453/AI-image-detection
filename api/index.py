import os
import sys
from pathlib import Path

# Add project root and server directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = ROOT_DIR / "server"

for path_str in [str(ROOT_DIR), str(SERVER_DIR)]:
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

try:
    from server.app.main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI(title="AI Image Detection API - Error Mode")

    @app.get("/")
    @app.get("/api")
    @app.get("/api/health")
    @app.get("/health")
    def health_error():
        return {
            "status": "error",
            "message": "Initialization error in serverless runtime",
            "detail": str(e)
        }
