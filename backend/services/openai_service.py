# openai_service.py
import os
from openai import OpenAI
from typing import List, Dict

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

def stream_chat(messages: List[Dict], temperature: float = 0.4):
    """
    Takes a list of messages and yields the response in a streaming fashion.
    Each message dict must have {role: "user"/"assistant", content: "..."}.
    """
    msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    msgs.extend(messages[-16:])  # keep conversation short to save tokens

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
