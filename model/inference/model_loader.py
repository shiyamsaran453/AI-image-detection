import os

MODEL_NAME = os.getenv("MODEL_NAME", "shiyam453/ai-image-detector-deploy")

pipe = None

# On Vercel / serverless runtime, always use Hugging Face Inference API to prevent initialization timeout
if not os.getenv("VERCEL"):
    try:
        from transformers import pipeline
        pipe = pipeline("image-classification", model=MODEL_NAME)
    except Exception as e:
        print(f"Local transformers pipeline not loaded: {e}. Falling back to Hugging Face Inference API.")