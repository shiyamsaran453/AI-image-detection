from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.auth_routes import router as auth_router
from app.routes.prediction_routes import router as prediction_router
from app.routes.history_routes import router as history_router

import os
from app.core.config import UPLOAD_DIR

app = FastAPI(
    title="AI Image Detection API",
    description="Backend API for authentication, image prediction, and history management.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(history_router)


@app.get("/")
def root():
    return {
        "message": "AI Image Detection API is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "message": "Server is healthy",
        "status": "ok",
    }