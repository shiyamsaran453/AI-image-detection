from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import users_collection
from app.core.security import create_access_token, hash_password, verify_password


def normalize_email(email: str) -> str:
    return email.strip().lower()


def serialize_user(user: dict):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "created_at": user.get("created_at"),
    }


def register_user(name: str, email: str, password: str):
    normalized_email = normalize_email(email)

    try:
        existing_user = users_collection.find_one({"email": normalized_email})
        if existing_user:
            return None, "Email already registered"

        hashed_password = hash_password(password)

        new_user = {
            "name": name.strip(),
            "email": normalized_email,
            "password": hashed_password,
            "created_at": datetime.utcnow().isoformat(),
        }

        result = users_collection.insert_one(new_user)
        created_user = users_collection.find_one({"_id": result.inserted_id})

        return serialize_user(created_user), None
    except Exception as db_err:
        print("Database error during register:", str(db_err))
        return None, "Database connection error. Please verify MONGO_URL configuration."


def login_user(email: str, password: str):
    normalized_email = normalize_email(email)

    try:
        user = users_collection.find_one({"email": normalized_email})
        if not user:
            return None, "Invalid email or password"

        if not verify_password(password, user["password"]):
            return None, "Invalid email or password"

        token = create_access_token(
            {
                "user_id": str(user["_id"]),
                "email": user["email"],
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": serialize_user(user),
        }, None
    except Exception as db_err:
        print("Database error during login:", str(db_err))
        return None, "Database connection error. Please verify MONGO_URL configuration."


def get_user_by_id(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None

    user = users_collection.find_one({"_id": object_id})
    if not user:
        return None

    return serialize_user(user)