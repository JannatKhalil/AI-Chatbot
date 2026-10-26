import os
import logging
from functools import lru_cache

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from fastembed import TextEmbedding

load_dotenv()

logger = logging.getLogger(__name__)

COLLECTION_NAME = "jannat_knowledge"


@lru_cache(maxsize=1)
def get_embedding_model():
    return TextEmbedding(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


@lru_cache(maxsize=1)
def get_qdrant_client():
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")

    if not url or not api_key:
        raise RuntimeError(
            "Qdrant environment variables are missing"
        )

    return QdrantClient(
        url=url,
        api_key=api_key,
        timeout=30,
    )


def retrieve_knowledge(question: str) -> str:
    try:
        model = get_embedding_model()

        # Generate 384-dimensional query embedding
        vector = list(model.embed([question]))[0].tolist()

        results = get_qdrant_client().query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=10,
            score_threshold=0.20,
            with_payload=True,
        )

        chunks = [
            point.payload["text"]
            for point in results.points
            if point.payload and point.payload.get("text")
        ]

        return "\n\n".join(chunks)

    except Exception:
        logger.exception("Knowledge retrieval failed")

        # Allow AI to respond even if RAG is unavailable
        return ""