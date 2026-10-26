# ✦ Jannat AI Chatbot

A full-stack AI chatbot built with React, FastAPI, MongoDB Atlas, Qdrant Cloud, and Ollama.

## About the Project

Jannat AI is an intelligent chatbot that allows users to create accounts, have AI-powered conversations, and manage their chat history.

The project uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from a knowledge base before generating responses.

## Technologies Used

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript

### Backend
- Python
- FastAPI
- Pydantic
- JWT Authentication

### Databases
- MongoDB Atlas — User accounts and chat history
- Qdrant Cloud — Vector database for RAG

### Artificial Intelligence
- Ollama
- Qwen2.5:1.5b
- Sentence Transformers
- all-MiniLM-L6-v2 Embedding Model

## Features

- User registration and login
- Secure password hashing
- JWT authentication
- Create multiple conversations
- AI-powered responses
- Save and reload chat history
- Automatic conversation titles
- Rename and delete conversations
- Chat history grouped by date
- RAG-based knowledge retrieval
- Responsive user interface
- Logout functionality

## Project Structure

```text
AI-Chatbot-Hackathon/
│
├── backend/
│   ├── app/
│   │   ├── db/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── knowledge_base/
│   ├── index_knowledge.py
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

## Environment Variables

Create a `.env` file inside the `backend` folder.

Use `backend/.env.example` as a reference.

Never upload your real `.env` file to GitHub.

## Backend Setup

Open a terminal inside the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Install and start Ollama separately.

Download the AI model:

```bash
ollama pull qwen2.5:1.5b
```

Start the backend:

```bash
python -m uvicorn app.main:app --port 8010
```

API documentation:

http://127.0.0.1:8010/docs

## Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite.

## RAG Knowledge Base

The knowledge base is stored in:

```text
backend/knowledge_base/knowledge.txt
```

The indexing script creates embeddings and uploads them to Qdrant Cloud:

```bash
python index_knowledge.py
```

When a user asks a question, the backend retrieves relevant knowledge from Qdrant and sends it to the AI model as context.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/chats/` | Create chat |
| GET | `/api/chats/user/{user_id}` | Chat history |
| GET | `/api/chats/{chat_id}/messages` | Get messages |
| POST | `/api/chats/{chat_id}/messages` | Save message |
| PATCH | `/api/chats/{chat_id}/rename` | Rename chat |
| DELETE | `/api/chats/{chat_id}` | Delete chat |
| POST | `/api/ai/chat` | Generate AI reply |

## Security

- Passwords are stored as hashes.
- JWT tokens protect authenticated endpoints.
- Chat operations verify conversation ownership.
- Sensitive credentials are stored in environment variables.

## Deployment

The frontend and backend are intended to be deployed separately.

The current AI integration uses a local Ollama server. A hosted AI service is required for a fully cloud-hosted deployment.

## Project Status

Development and integration are in progress. Final testing and deployment are pending.

## Project Name

Jannat AI Chatbot

Full-Stack AI Chatbot Hackathon Project
