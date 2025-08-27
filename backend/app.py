import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.chat import router as chat_router

app = FastAPI(title="FaithChat API", version="0.1.0")

# Explicit origins for CORS
ALLOWED_ORIGINS = [
    "https://faithchat-ncg3.vercel.app",  # Vercel
    "http://localhost:3002",              # Dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])

@app.get("/health")
def health():
    return {"status": "ok"}
