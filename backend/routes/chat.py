from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from .auth import require_user
import os

router = APIRouter()
SYSTEM_PROMPT = (
    "You are a conservative Baptist biblical counselor. For every user question:\n"
    "1. Answer using only the King James Version (KJV) Bible.\n"
    "2. Provide a modern-language explanation that is biblically accurate and practical.\n"
    "3. Include a short, relevant quote or insight from Charles Spurgeon where applicable.\n"
    "Do not use other theologians. If Scripture is silent, admit it and apply general biblical principles.\n"
    "Speak clearly, compassionately, and with reverence for truth."
)

class ChatInput(BaseModel):
    message: str
    history: list[dict] = []  # optional past messages [{role, content}]

class ChatOutput(BaseModel):
    reply: str

@router.post("", response_model=ChatOutput)
def chat(input_data: ChatInput, authorization: str | None = Header(default=None)):
    # Extract Bearer token
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]

    try:
        user_email = require_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY on server")

    client = OpenAI(api_key=api_key)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in input_data.history[-10:]:
        if "role" in m and "content" in m:
            messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": input_data.message})

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
        )
        reply = resp.choices[0].message.content
        return ChatOutput(reply=reply)
    except Exception as e:
        # Now you’ll see the actual cause in Railway logs
        raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")
