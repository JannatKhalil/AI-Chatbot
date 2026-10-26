from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routers
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.ai import router as ai_router

app = FastAPI(
    title="Jannat Chatbot API",
    description="Full-Stack AI Chatbot Backend",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home Route
@app.get("/")
def home():
    return {
        "message": "Welcome to Jannat Chatbot API",
        "status": "Backend is running successfully!"
    }

# Health Check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }

# Register Authentication Routes
app.include_router(auth_router)

# Register Chat Routes
app.include_router(chat_router)

# Register AI Routes
app.include_router(ai_router)