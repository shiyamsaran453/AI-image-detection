import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from app.core.database import predictions_collection
from app.core.config import UPLOAD_DIR
from model.inference.predict import predict_image


def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def sanitize_filename(filename: str) -> str:
    if not filename:
        return f"image_{uuid4().hex}.jpg"

    filename = filename.strip().replace(" ", "_")
    filename = filename.replace("/", "_").replace("\\", "_")
    return filename


def generate_file_path(filename: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = uuid4().hex[:8]
    safe_name = sanitize_filename(filename)
    return os.path.join(UPLOAD_DIR, f"{timestamp}_{unique_id}_{safe_name}")


def save_uploaded_file(file: UploadFile) -> str:
    ensure_upload_dir()

    file_path = generate_file_path(file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def run_model_prediction(file_path: str):
    pil_img = Image.open(file_path)

    blocky_path = file_path.replace(".", "_blocky.", 1)
    forensic_path = file_path.replace(".", "_forensic.", 1)

    return predict_image(
        pil_img,
        blocky_save_path=blocky_path,
        forensic_save_path=forensic_path,
    )

def save_prediction_to_db(
    user_id: str,
    image_path: str,
    label: str,
    confidence: float,
):
    prediction_doc = {
        "user_id": user_id,
        "image_path": image_path,
        "label": str(label).upper(),
        "confidence": float(confidence),
        "created_at": datetime.utcnow().isoformat(),
    }

    result = predictions_collection.insert_one(prediction_doc)
    return str(result.inserted_id)