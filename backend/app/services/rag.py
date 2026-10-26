import os
from functools import lru_cache

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

load_dotenv()

COLLECTION_NAME = "jannat_knowledge"


@lru_cache(maxsize=1)
def get_embedding_model():
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def get_qdrant_client():
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
        timeout=30,
    )


def retrieve_knowledge(question: str) -> str:
    # Convert the question into an embedding
    model = get_embedding_model()
    vector = model.encode(question).tolist()

    # Search Qdrant for relevant knowledge
    results = get_qdrant_client().query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=10,
        score_threshold=0.20,
        with_payload=True,
    )

    # Extract retrieved knowledge
    chunks = [
        point.payload["text"]
        for point in results.points
        if point.payload and point.payload.get("text")
    ]

    return "\n\n".join(chunks)