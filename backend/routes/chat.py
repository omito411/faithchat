from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from openai import APIConnectionError, AuthenticationError, RateLimitError, APIStatusError
from .auth import require_user
import os

router = APIRouter()

SYSTEM_PROMPT = (
  "ROLE & TONE:\n"
  "- You are a conservative Baptist biblical counselor.\n"
  "- Speak clearly, compassionately, and with reverence for truth.\n"
  "\nHARD RULES:\n"
  "- Quote ONLY the King James Version (KJV). Do not use any other translation.\n"
  "- If Scripture is silent, say so and apply general biblical principles (KJV-based).\n"
  "- Optionally include ONE brief insight from Spurgeon or Bunyan if it truly fits; otherwise omit.\n"
  "\nFORMAT (strict):\n"
  "- Write in SHORT paragraphs of 1–3 sentences each.\n"
  "- Insert a BLANK LINE between paragraphs (two newlines: '\\n\\n').\n"
  "- Each Bible verse MUST be presented in its OWN PARAGRAPH, with reference and text.\n"
  "- Use exactly these sections, in this order:\n"
  "  1) BIBLE VERSE (KJV): one or two relevant verses. Each verse in its own paragraph.\n"
  "  2) EXPLANATION (modern language): 2–4 short paragraphs.\n"
  "  3) CLASSIC CHRISTIAN INSIGHT (optional): one short line or '—'.\n"
  "  4) SUMMARY: one short paragraph that ties it together.\n"
)


class ChatInput(BaseModel):
    message: str
    history: list[dict] = []

class ChatOutput(BaseModel):
    reply: str

def _openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY on server")
    base_url = os.getenv("OPENAI_BASE_URL")  # optional
    # Let the SDK read env for api_key if you prefer: OpenAI()
    return OpenAI(api_key=api_key, base_url=base_url)

@router.post("", response_model=ChatOutput)
def chat(input_data: ChatInput, authorization: str | None = Header(default=None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]

    try:
        user_email = require_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {e}")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in input_data.history[-10:]:
        if "role" in m and "content" in m:
            messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": input_data.message})

    try:
        client = _openai_client()
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            timeout=30,  # seconds
        )
        return ChatOutput(reply=resp.choices[0].message.content)
    except AuthenticationError as e:
        # bad/expired API key
        raise HTTPException(status_code=401, detail=f"OpenAI auth error: {e}")
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail="OpenAI rate limit; please retry.")
    except APIConnectionError as e:
        # network/DNS/TLS issues
        raise HTTPException(status_code=502, detail=f"OpenAI network error: {e}")
    except APIStatusError as e:
        # non-2xx from OpenAI
        raise HTTPException(status_code=e.status_code, detail=f"OpenAI API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI unexpected error: {e}")
