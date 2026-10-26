from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.db.mongodb import db
from app.schemas.auth import UserRegister, UserLogin, UserResponse
from app.services.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ==============================
# REGISTER API
# ==============================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(user: UserRegister):

    email = str(user.email).lower()

    existing_user = db.users.find_one({"email": email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": email,
        "password": hashed_password
    }

    result = db.users.insert_one(new_user)

    return UserResponse(
        id=str(result.inserted_id),
        name=user.name,
        email=email
    )


# ==============================
# LOGIN API WITH JWT
# ==============================

@router.post("/login")
def login_user(user: UserLogin):

    existing_user = db.users.find_one({
        "email": str(user.email).lower()
    })

    if not existing_user or not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        str(existing_user["_id"])
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"]
        }
    }


# ==============================
# GET CURRENT LOGGED-IN USER
# ==============================

@router.get("/me", response_model=UserResponse)
def get_current_user(
    user_id: str = Depends(get_current_user_id)
):

    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"]
    )