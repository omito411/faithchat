"use client";
import { useEffect, useRef, useState } from "react";
import type { Msg } from "../lib/api";
import { supabase } from "../lib/supabaseClient"; // ✅ Import Supabase
import Link from "next/link";

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendUrl] = useState(
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  );
  const scroller = useRef<HTMLDivElement>(null);

  // Store session token
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/auth"; // redirect to login/signup
      } else {
        setToken(data.session.access_token);
      }
    });
  }, []);

  const send = async () => {
    if (!input.trim() || loading || !token) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messages: next })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() || "";
        for (const f of frames) {
          if (!f.startsWith("data:")) continue;
          const payload = f.slice(5);
          if (payload === "[DONE]") return;
          if (payload.startsWith("__ERROR__"))
            throw new Error(payload.replace("__ERROR__ ", ""));
          acc += payload;
          setMessages([...next, { role: "assistant", content: acc }]);
          scroller.current?.scrollTo({ top: 1e9, behavior: "auto" });
        }
      }
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      {/* Top Nav */}
      <nav className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
        <h1 className="text-xl font-bold text-red-500">📖 FaithChat</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/donate" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Donate
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/auth";
            }}
            className="text-gray-700 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Chat Window */}
      <div
        ref={scroller}
        className="h-[60vh] overflow-auto border rounded-lg bg-gray-50 p-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex my-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg whitespace-pre-wrap ${
                m.role === "user" ? "bg-blue-100" : "bg-white border"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        className="flex gap-2 mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="flex-1 border rounded p-2"
          placeholder="Ask a question or follow-up…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </form>
    </main>
  );
}
