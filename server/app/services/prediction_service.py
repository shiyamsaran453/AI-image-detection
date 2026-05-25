import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

import os
import shutil
from datetime import datetime
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image

from model.inference.predict import predict_image
from model.inference.preprocess import generate_display_images  # ✅ UPDATED
from app.core.database import predictions_collection
from app.core.config import UPLOAD_DIR


# ==============================
# 📁 Ensure upload folder
# ==============================
def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==============================
# 🧹 Clean filename
# ==============================
def sanitize_filename(filename: str) -> str:
    if not filename:
        return f"image_{uuid4().hex}.jpg"

    return filename.strip().replace(" ", "_").replace("/", "_").replace("\\", "_")


# ==============================
# 📌 Generate file path
# ==============================
def generate_file_path(filename: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = uuid4().hex[:8]
    safe_name = sanitize_filename(filename)

    return os.path.join(UPLOAD_DIR, f"{timestamp}_{unique_id}_{safe_name}")


# ==============================
# 💾 Save uploaded file
# ==============================
def save_uploaded_file(file: UploadFile) -> str:
    ensure_upload_dir()

    file_path = generate_file_path(file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


# ==============================
# 🔥 MAIN LOGIC
# ==============================
def run_model_prediction(file_path: str):
    try:
        pil_img = Image.open(file_path).convert("RGB")

        # 🔥 UIக்கு 3 forensic images generate
        images = generate_display_images(pil_img, file_path)

        # 🔥 Modelக்கு ORIGINAL image மட்டும்
        result = predict_image(pil_img)

        # 🔥 UIக்கு images attach
        result["images"] = images

        # 🔥 Optional: original path also include
        result["image_path"] = file_path

        return result

    except Exception as e:
        print("PREDICTION ERROR:", e)
        return {
            "label": "ERROR",
            "confidence": 0.0,
            "images": {}
        }


# ==============================
# 💾 Save to DB
# ==============================
def save_prediction_to_db(user_id, image_path, label, confidence):
    doc = {
        "user_id": user_id,
        "image_path": image_path,
        "label": label,
        "confidence": confidence,
        "created_at": datetime.utcnow()
    }

    res = predictions_collection.insert_one(doc)
    return str(res.inserted_id)