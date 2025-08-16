# app.py  (public, no auth)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing")
client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = (
    "You are a conservative Baptist biblical counselor.\n"
    "Rules:\n"
    "1) Answer using only the NKJV Bible.\n"
    "2) Provide a modern-language, biblically accurate, practical explanation.\n"
    "3) Include a short, relevant Charles Spurgeon quote when apt.\n"
    "4) If Scripture is silent, say so and apply general biblical principles.\n"
    "Tone: clear, compassionate, reverent."
)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
ALLOWED_ORIGINS = [o.strip() for o in FRONTEND_ORIGIN.split(",") if o.strip()]

app = FastAPI(title="FaithChat API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict]  # [{role:"user"/"assistant", content:"..."}]

def stream_chat(messages: List[Dict], temperature: float = 0.4):
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    msgs.extend(messages[-16:])  # keep context small
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=msgs,
        temperature=0.4,
        stream=True,
    )
    for chunk in stream:
        delta = getattr(chunk.choices[0].delta, "content", None)
        if delta:
            yield delta

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/")
def root():
    return JSONResponse({"service": "faithchat-api", "status": "ok"})

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)

@app.post("/chat")
def chat(req: ChatRequest):
    def gen():
        try:
            for delta in stream_chat(req.messages):
                yield f"data:{delta}\n\n"
            yield "data:[DONE]\n\n"
        except Exception as e:
            yield f"data:__ERROR__ {str(e)}\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
