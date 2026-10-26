import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from groq import Groq, APIStatusError, APIConnectionError

from app.services.rag import retrieve_knowledge
from app.services.security import get_current_user_id


router = APIRouter(prefix="/api/ai", tags=["AI"])


class AIRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


@router.post("/chat")
def chat_with_ai(
    request: AIRequest,
    user_id: str = Depends(get_current_user_id)
):
    try:
        # STEP 1: Retrieve knowledge from Qdrant
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

        # STEP 3: Read Groq API key
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="GROQ_API_KEY is not configured"
            )

        # STEP 4: Connect to Groq
        client = Groq(api_key=api_key, timeout=60.0)

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            temperature=0.7
        )

        # STEP 5: Return AI response
        reply = response.choices[0].message.content

        if not reply:
            raise HTTPException(
                status_code=502,
                detail="AI returned an empty response"
            )

        return {
            "reply": reply,
            "rag_used": bool(knowledge)
        }

    except HTTPException:
        raise

    except APIStatusError as error:
        print("Groq API status:", error.status_code)
        print("Groq API details:", str(error))

        raise HTTPException(
            status_code=502,
            detail="Groq AI request failed"
        )

    except APIConnectionError as error:
        print("Groq connection error:", type(error).__name__)

        raise HTTPException(
            status_code=503,
            detail="Groq AI connection failed"
        )

    except Exception as error:
        print("AI/RAG Error:", type(error).__name__)

        raise HTTPException(
            status_code=500,
            detail="AI or knowledge retrieval failed"
        )