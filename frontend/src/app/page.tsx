"use client";
import { useRef, useState } from "react";
import type { Msg } from "../lib/api";
import { streamChat } from "../lib/api";
import Link from "next/link";

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendUrl] = useState(
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
  );
  const scroller = useRef<HTMLDivElement>(null);

  const send = async () => {
    if (!input.trim() || loading) return;

    const next = [
      ...messages,
      { role: "user" as const, content: input.trim() },
    ];
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
      setMessages([
        ...next,
        { role: "assistant", content: `Error: ${e.message}` },
      ]);
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
          {/* You can keep these or remove them since auth is disabled */}
          <Link href="/donate" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Donate
          </Link>
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
