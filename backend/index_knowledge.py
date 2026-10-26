import os
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

load_dotenv()

# Connect to Qdrant Cloud
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=60,
)

COLLECTION_NAME = "jannat_knowledge"

# Load embedding model
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Read knowledge base
file_path = Path(__file__).parent / "knowledge_base" / "knowledge.txt"
text = file_path.read_text(encoding="utf-8")

# Split knowledge into separate paragraphs
chunks = [
    chunk.strip()
    for chunk in text.split("\n\n")
    if chunk.strip()
]

print(f"Found {len(chunks)} knowledge chunks.")

# Generate embeddings
print("Generating embeddings...")
embeddings = model.encode(chunks).tolist()

# Create Qdrant collection if needed
if not client.collection_exists(COLLECTION_NAME):
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=384,
            distance=models.Distance.COSINE,
        ),
    )

# Upload knowledge chunks
points = [
    models.PointStruct(
        id=index + 1,
        vector=embedding,
        payload={"text": chunk},
    )
    for index, (chunk, embedding) in enumerate(zip(chunks, embeddings))
]

client.upsert(
    collection_name=COLLECTION_NAME,
    points=points,
    wait=True,
)

print("SUCCESS! Knowledge base uploaded to Qdrant Cloud!")
print(f"Total chunks uploaded: {len(points)}")