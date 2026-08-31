import os
import sys
from pathlib import Path

# Add project root and server directory to sys.path for clean serverless imports
ROOT_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = ROOT_DIR / "server"

for path_str in [str(SERVER_DIR), str(ROOT_DIR)]:
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.prediction_routes import router as prediction_router
from app.routes.history_routes import router as history_router

app = FastAPI(title="AI Image Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(history_router)


@app.get("/")
@app.get("/api")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "AI Image Detection API is operational"}
