from fastapi import FastAPI

app = FastAPI(title="Jannat Chatbot API")

@app.get("/")
def home():
    return {
        "message": "Welcome to Jannat Chatbot API",
        "status": "Backend is running successfully!"
    }