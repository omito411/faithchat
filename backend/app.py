# app.py / main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.donations import router as donations_router      # ⬅️ NEW
from routes.stripe_webhook import router as stripe_hook_router  # ⬅️ NEW

app = FastAPI(title="FaithChat API", version="0.1.0")

# Explicit origins for CORS
origins = [
    os.getenv("FRONTEND_ORIGIN", ""),
    *(os.getenv("FRONTEND_ORIGIN_EXTRA","").split(",") if os.getenv("FRONTEND_ORIGIN_EXTRA") else [])
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(donations_router, tags=["donations"])          # ⬅️ NEW
app.include_router(stripe_hook_router, tags=["webhooks"])         # ⬅️ NEW

@app.get("/health")
def health():
    return {"status": "ok"}
