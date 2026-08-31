import os
from pymongo import MongoClient
from app.core.config import MONGO_URL, DATABASE_NAME

_client = None
_db = None


def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    return _client


def get_database():
    global _db
    if _db is None:
        _db = get_client()[DATABASE_NAME]
    return _db


class _LazyCollection:
    """Proxy that defers collection access until first use."""

    def __init__(self, name: str):
        self._name = name

    def _col(self):
        return get_database()[self._name]

    def find_one(self, *args, **kwargs):
        return self._col().find_one(*args, **kwargs)

    def insert_one(self, *args, **kwargs):
        return self._col().insert_one(*args, **kwargs)

    def find(self, *args, **kwargs):
        return self._col().find(*args, **kwargs)

    def count_documents(self, *args, **kwargs):
        return self._col().count_documents(*args, **kwargs)

    def update_one(self, *args, **kwargs):
        return self._col().update_one(*args, **kwargs)

    def delete_one(self, *args, **kwargs):
        return self._col().delete_one(*args, **kwargs)


users_collection = _LazyCollection("users")
predictions_collection = _LazyCollection("predictions")