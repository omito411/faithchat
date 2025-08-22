"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
// if you have the @ alias set up, prefer "@/components/..."
// otherwise keep as "components/..."
import { useAuth } from "@/components/AuthContext";
import ChatBubble from "@/components/ChatBubble";

// ✅ Strong type for chat messages
type ChatMsg = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    if (!input.trim()) return;

    // ✅ Lock the literal so TS doesn't widen to `string`
    const newHistory: ChatMsg[] = [...history, { role: "user" as const, content: input }];

    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const { data } = await axios.post(
        base + "/chat",
        { message: input, history: newHistory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHistory([...newHistory, { role: "assistant" as const, content: data.reply as string }]);
    } catch (e: any) {
      setHistory([
        ...newHistory,
        { role: "assistant" as const, content: "Error: " + (e?.response?.data?.detail || e.message) }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => viewRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, [token]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">📖 FaithChat</h1>
      <p className="text-sm text-neutral-600">
        Ask anything about faith, life, or the Bible — NKJV-only answers with clear explanation and a Spurgeon insight.
      </p>

      <div className="space-y-3 border rounded-2xl p-4 bg-white">
        {history.length === 0 && (
          <div className="text-sm text-neutral-600">
            Start the conversation below. Examples: “What does Proverbs 3:5–6 teach for anxiety?”
          </div>
        )}
        {history.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
        <div ref={viewRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-xl"
          placeholder="Ask a question or follow-up..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white disabled:opacity-50"
        >
          {loading ? "Searching the Scriptures..." : "Send"}
        </button>
      </div>
    </section>
  );
}
