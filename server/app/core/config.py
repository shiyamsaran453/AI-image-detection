import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_image_detection")

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

default_upload_dir = os.path.join(tempfile.gettempdir(), "uploads") if os.getenv("VERCEL") else "uploads"
UPLOAD_DIR = os.getenv("UPLOAD_DIR", default_upload_dir)
API_TITLE = os.getenv("API_TITLE", "AI Image Detection API")
API_VERSION = os.getenv("API_VERSION", "1.0.0")