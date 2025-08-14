# app.py  (single-file backend)

from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from pydantic import BaseModel
from openai import OpenAI
from jose import jwt
import os, time, requests
from typing import List, Dict

# ========= ENV =========
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing")
client = OpenAI(api_key=OPENAI_API_KEY)

# Supabase settings (Dashboard → Project Settings → API / Auth)
SUPABASE_URL = os.getenv("SUPABASE_URL")  # e.g. https://xxxxx.supabase.co
SUPABASE_JWT_AUDIENCE = os.getenv("SUPABASE_JWT_AUDIENCE")  # Auth → Settings → JWT → JWT Aud
if not SUPABASE_URL or not SUPABASE_JWT_AUDIENCE:
    raise RuntimeError("SUPABASE_URL or SUPABASE_JWT_AUDIENCE missing")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/keys"

# allow one or more origins (comma-separated)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
ALLOWED_ORIGINS = [o.strip() for o in FRONTEND_ORIGIN.split(",") if o.strip()]

SYSTEM_PROMPT = (
    "You are a conservative Baptist biblical counselor.\n"
    "Rules:\n"
    "1) Answer using only the NKJV Bible.\n"
    "2) Provide a modern-language, biblically accurate, practical explanation.\n"
    "3) Include a short, relevant Charles Spurgeon quote when apt.\n"
    "4) If Scripture is silent, say so and apply general biblical principles.\n"
    "Tone: clear, compassionate, reverent."
)

# ========= APP =========
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

# ========= Supabase JWT verify (via JWKS) =========
_JWKS_CACHE = {"keys": None, "ts": 0.0}

def _get_jwks():
    now = time.time()
    if not _JWKS_CACHE["keys"] or now - _JWKS_CACHE["ts"] > 3600:
        r = requests.get(JWKS_URL, timeout=5)
        r.raise_for_status()
        _JWKS_CACHE["keys"] = r.json()
        _JWKS_CACHE["ts"] = now
    return _JWKS_CACHE["keys"]

def verify_bearer(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1]

    jwks = _get_jwks()
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks["keys"] if k["kid"] == header["kid"])
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=SUPABASE_JWT_AUDIENCE,
        )
        return payload  # includes 'sub' (user id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ========= OpenAI streaming (inlined) =========
def stream_chat(messages: List[Dict], temperature: float = 0.4):
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    msgs.extend(messages[-16:])  # keep context short to control cost

    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=msgs,
        temperature=temperature,
        stream=True,
    )
    for chunk in stream:
        delta = getattr(chunk.choices[0].delta, "content", None)
        if delta:
            yield delta

# ========= ROUTES =========
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
def chat(req: ChatRequest, claims: dict = Depends(verify_bearer)):
    user_id = claims.get("sub", "anonymous")

    def gen():
        try:
            for delta in stream_chat(req.messages):
                yield f"data:{delta}\n\n"
            # Here you could persist the exchange with user_id
            yield "data:[DONE]\n\n"
        except Exception as e:
            yield f"data:__ERROR__ {str(e)}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
