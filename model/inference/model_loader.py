from transformers import pipeline

# Load HuggingFace pipeline
pipe = pipeline(
    "image-classification",
    model="haywoodsloan/ai-image-detector-deploy"
)