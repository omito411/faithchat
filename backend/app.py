from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
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

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: list[dict]  # [{role:"user"/"assistant", content:"..."}]

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/chat")
def chat(req: ChatRequest):
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    msgs.extend(req.messages[-16:])  # keep conversation short to save tokens

    def gen():
        try:
            stream = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=msgs,
                temperature=0.4,
                stream=True,
            )
            for chunk in stream:
                delta = getattr(chunk.choices[0].delta, "content", None)
                if delta:
                    yield f"data:{delta}\n\n"
            yield "data:[DONE]\n\n"
        except Exception as e:
            yield f"data:__ERROR__ {str(e)}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
