"use client";
import { useRef, useState } from "react";
import React from "react";
import type { Msg } from "../lib/api";
import { streamChat } from "../lib/api";

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState(
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  );
  const scroller = useRef<HTMLDivElement>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    try {
      for await (const chunk of streamChat(backendUrl, next)) {
        acc += chunk;
        setMessages([...next, { role: "assistant" as const, content: acc }]);
        scroller.current?.scrollTo({ top: 1e9, behavior: "auto" });
      }
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="wrap">
      <h1>📖 FaithChat — Learn more about the faith</h1>

      <div className="bar">
        <input value={backendUrl} onChange={e=>setBackendUrl(e.target.value)} />
        <button onClick={()=>setMessages([])}>Clear</button>
      </div>

      <div className="chat" ref={scroller}>
        {messages.map((m,i)=>(
          <div key={i} className={`row ${m.role}`}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
      </div>

      <form className="compose" onSubmit={(e)=>{e.preventDefault(); send();}}>
        <input
          placeholder="Ask a question or follow‑up…"
          value={input}
          onChange={e=>setInput(e.target.value)}
        />
        <button disabled={loading}>{loading? "Thinking…" : "Send"}</button>
      </form>

      <style jsx>{`
        .wrap { max-width: 780px; margin: 24px auto; padding: 16px; }
        .bar { display:flex; gap:8px; margin:8px 0 12px; }
        .bar input { flex:1; padding:8px; }
        .chat { height:60vh; overflow:auto; border:1px solid #ddd; border-radius:8px; background:#fafafa; padding:12px; }
        .row { display:flex; margin:8px 0; }
        .row.user { justify-content:flex-end; }
        .bubble { background:#fff; padding:10px 12px; border-radius:10px; white-space:pre-wrap; }
        .row.user .bubble { background:#e6f0ff; }
        .compose { display:flex; gap:8px; margin-top:12px; }
        .compose input { flex:1; padding:10px; }
      `}</style>
    </main>
  );
}
