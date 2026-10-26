import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=30,
)

try:
    collections = client.get_collections()
    print("SUCCESS! Qdrant Cloud connected!")
    print("Collections:", collections)
except Exception as e:
    print("Connection failed:", e)