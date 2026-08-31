import io
import os
import requests
from model.inference.model_loader import pipe, MODEL_NAME

HF_API_URL = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"
HF_TOKEN = os.getenv("HF_TOKEN", "")


def predict_image(pil_img, blocky_save_path=None, forensic_save_path=None):
    if not hasattr(pil_img, "convert"):
        return {"label": "ERROR", "confidence": 0.0}

    try:
        img = pil_img.convert("RGB")

        if pipe is not None:
            results = pipe(img)
        else:
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG")
            img_bytes = buffer.getvalue()

            headers = {}
            if HF_TOKEN:
                headers["Authorization"] = f"Bearer {HF_TOKEN}"

            response = requests.post(HF_API_URL, headers=headers, data=img_bytes, timeout=30)

            if response.status_code == 200:
                results = response.json()
            else:
                try:
                    from huggingface_hub import InferenceClient
                    client = InferenceClient(model=MODEL_NAME, token=HF_TOKEN or None)
                    results = client.image_classification(img_bytes)
                except Exception as hf_err:
                    print(f"HF Inference error ({response.status_code}): {response.text} / {hf_err}")
                    return {"label": "ERROR", "confidence": 0.0}

        if isinstance(results, list) and len(results) > 0:
            top = results[0]
            if isinstance(top, dict):
                label = top.get("label", "UNKNOWN").upper()
                score = top.get("score", 0.0)
            else:
                label = getattr(top, "label", "UNKNOWN").upper()
                score = getattr(top, "score", 0.0)

            confidence = round(float(score) * 100, 2)
            return {
                "label": label,
                "confidence": confidence,
            }

        return {"label": "UNKNOWN", "confidence": 0.0}

    except Exception as e:
        print("Prediction error:", str(e))
        return {
            "label": "ERROR",
            "confidence": 0.0,
        }