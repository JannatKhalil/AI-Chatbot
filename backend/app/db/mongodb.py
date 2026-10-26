import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "jannat_chatbot_db")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is missing from backend/.env")

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
db = client[MONGODB_DB]


def test_connection():
    client.admin.command("ping")
    print("✅ Jannat Chatbot connected to MongoDB successfully!")