from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
from openai_service import stream_chat  # ✅ import service

class ChatRequest(BaseModel):
    messages: List[Dict]

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
