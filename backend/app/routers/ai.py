import json
import urllib.request
import urllib.error

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.services.rag import retrieve_knowledge
from app.services.security import get_current_user_id


router = APIRouter(prefix="/api/ai", tags=["AI"])


# ==============================
# REQUEST SCHEMA
# ==============================

class AIRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


# ==============================
# SECURE AI + RAG ENDPOINT
# ==============================

@router.post("/chat")
def chat_with_ai(
    request: AIRequest,
    user_id: str = Depends(get_current_user_id)
):
    try:
        # STEP 1: Retrieve relevant knowledge from Qdrant
        knowledge = retrieve_knowledge(request.message)

        # STEP 2: Prepare AI instructions
        if knowledge:
            system_prompt = f"""
You are Jannat AI, a friendly and helpful assistant.

Use the following retrieved knowledge when answering
questions about the Jannat AI project:

{knowledge}

Rules:
- Answer project questions using the retrieved knowledge.
- Do not invent project details.
- If the knowledge does not contain the answer to a
  project-related question, say you do not have
  enough information to confirm it.
- For general questions unrelated to Jannat AI,
  answer using your general knowledge.
"""
        else:
            system_prompt = """
You are Jannat AI, a friendly and helpful assistant.

Rules:
- If asked about Jannat AI project details,
  explain that the knowledge base does not
  contain enough information to confirm the answer.
- For general questions, answer normally.
"""

        # STEP 3: Prepare Ollama request
        payload = json.dumps({
            "model": "qwen2.5:1.5b",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            "stream": False
        }).encode("utf-8")

        http_request = urllib.request.Request(
            "http://127.0.0.1:11434/api/chat",
            data=payload,
            headers={
                "Content-Type": "application/json"
            },
            method="POST"
        )

        # STEP 4: Generate AI response
        with urllib.request.urlopen(
            http_request,
            timeout=180
        ) as response:
            result = json.loads(
                response.read().decode("utf-8")
            )

        reply = result.get("message", {}).get("content")

        if not reply:
            raise HTTPException(
                status_code=502,
                detail="AI returned an empty response"
            )

        # STEP 5: Return answer
        return {
            "reply": reply,
            "rag_used": bool(knowledge)
        }

    except HTTPException:
        raise

    except (urllib.error.URLError, TimeoutError):
        raise HTTPException(
            status_code=503,
            detail="Ollama is unavailable or took too long to respond"
        )

    except Exception as error:
        print("AI/RAG Error:", type(error).__name__)

        raise HTTPException(
            status_code=500,
            detail="AI or knowledge retrieval failed"
        )