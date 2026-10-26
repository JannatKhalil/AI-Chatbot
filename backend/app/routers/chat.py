from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.db.mongodb import db
from app.services.security import get_current_user_id


router = APIRouter(prefix="/api/chats", tags=["Chats"])


# ==============================
# PYDANTIC SCHEMAS
# ==============================

class ChatCreate(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=100)


class MessageCreate(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=10000)


class ChatRename(BaseModel):
    title: str = Field(min_length=1, max_length=100)


# ==============================
# VERIFY CHAT OWNERSHIP
# ==============================

def get_owned_chat(chat_id: str, user_id: str):
    if not ObjectId.is_valid(chat_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid chat ID"
        )

    chat = db.chats.find_one({
        "_id": ObjectId(chat_id),
        "user_id": user_id
    })

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found or access denied"
        )

    return chat


# ==============================
# CREATE NEW CHAT
# ==============================

@router.post("/")
def create_chat(
    chat: ChatCreate,
    user_id: str = Depends(get_current_user_id)
):
    new_chat = {
        "user_id": user_id,
        "title": chat.title,
        "messages": [],
        "created_at": datetime.now(timezone.utc)
    }

    result = db.chats.insert_one(new_chat)

    return {
        "chat_id": str(result.inserted_id),
        "title": chat.title
    }


# ==============================
# GET USER CHATS
# ==============================

@router.get("/user/{requested_user_id}")
def get_user_chats(
    requested_user_id: str,
    user_id: str = Depends(get_current_user_id)
):
    if requested_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    chats = db.chats.find({
        "user_id": user_id
    }).sort("created_at", -1)

    return {
        "chats": [
            {
                "chat_id": str(chat["_id"]),
                "title": chat.get("title", "New Chat"),
                "created_at": chat.get("created_at")
            }
            for chat in chats
        ]
    }


# ==============================
# SAVE CHAT MESSAGE
# ==============================

@router.post("/{chat_id}/messages")
def save_message(
    chat_id: str,
    message: MessageCreate,
    user_id: str = Depends(get_current_user_id)
):
    get_owned_chat(chat_id, user_id)

    if message.role not in ["user", "assistant"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid message role"
        )

    new_message = {
        "role": message.role,
        "content": message.content,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.chats.update_one(
        {
            "_id": ObjectId(chat_id),
            "user_id": user_id
        },
        {
            "$push": {
                "messages": new_message
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    return {
        "message": "Message saved successfully"
    }


# ==============================
# GET CHAT MESSAGES
# ==============================

@router.get("/{chat_id}/messages")
def get_chat_messages(
    chat_id: str,
    user_id: str = Depends(get_current_user_id)
):
    chat = get_owned_chat(chat_id, user_id)

    messages = [
        {
            "role": message.get("role"),
            "content": message.get("content"),
            "created_at": message.get("created_at")
        }
        for message in chat.get("messages", [])
    ]

    return {
        "chat_id": str(chat["_id"]),
        "messages": messages
    }


# ==============================
# RENAME CHAT
# ==============================

@router.patch("/{chat_id}/rename")
def rename_chat(
    chat_id: str,
    data: ChatRename,
    user_id: str = Depends(get_current_user_id)
):
    get_owned_chat(chat_id, user_id)

    db.chats.update_one(
        {
            "_id": ObjectId(chat_id),
            "user_id": user_id
        },
        {
            "$set": {
                "title": data.title
            }
        }
    )

    return {
        "chat_id": chat_id,
        "title": data.title
    }


# ==============================
# DELETE CHAT
# ==============================

@router.delete("/{chat_id}")
def delete_chat(
    chat_id: str,
    user_id: str = Depends(get_current_user_id)
):
    get_owned_chat(chat_id, user_id)

    db.chats.delete_one({
        "_id": ObjectId(chat_id),
        "user_id": user_id
    })

    return {
        "message": "Chat deleted successfully"
    }