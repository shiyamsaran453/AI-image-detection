from model.inference.model_loader import pipe
from PIL import Image


def predict_image(pil_img):
    try:
        # 🔥 Safety: ensure PIL Image
        if not isinstance(pil_img, Image.Image):
            return {"label": "ERROR", "confidence": 0.0}

        # 🔥 Ensure RGB (important for HF models)
        pil_img = pil_img.convert("RGB")

        # 🔥 Prediction using HuggingFace pipeline
        result = pipe(pil_img)

        if not result or len(result) == 0:
            return {"label": "ERROR", "confidence": 0.0}

        top_result = result[0]

        label = str(top_result.get("label", "UNKNOWN")).upper()
        confidence = float(top_result.get("score", 0.0)) * 100

        return {
            "label": label,
            "confidence": round(confidence, 2),
        }

    except Exception as e:
        print("PREDICTION ERROR:", e)
        return {
            "label": "ERROR",
            "confidence": 0.0,
        }