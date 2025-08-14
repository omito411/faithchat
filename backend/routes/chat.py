# routes/chat.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from supabase import create_client
import os
import openai

router = APIRouter()

# Init Supabase client
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

# Init OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/chat")
async def chat_endpoint(request: Request):
    body = await request.json()
    token = request.headers.get("Authorization")

    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    # Verify token with Supabase
    user = supabase.auth.get_user(token.replace("Bearer ", ""))
    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    messages = body.get("messages")
    if not messages:
        raise HTTPException(status_code=400, detail="Missing messages")

    # OpenAI streaming response
    def generate():
        completion = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True
        )
        for chunk in completion:
            if chunk["choices"][0]["delta"].get("content"):
                yield f"data:{chunk['choices'][0]['delta']['content']}\n\n"
        yield "data:[DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
