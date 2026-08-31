from pymongo import MongoClient
from app.core.config import MONGO_URL, DATABASE_NAME

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[DATABASE_NAME]

users_collection = db["users"]
predictions_collection = db["predictions"]


def get_database():
    return db