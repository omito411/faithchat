"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthContext"; // redirect guard
import "./chat.css";

type Msg = { role: "user" | "bot"; content: string; ts: number };
type Thread = { id: string; title: string; createdAt: number; messages: Msg[] };

const LS_KEY = "faithchat_threads_v1";

export default function ChatPage() {
  const { token } = useAuth(); // only for redirect; not used in fetch
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  // ---------- storage ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { threads?: Thread[]; activeId?: string };
        if (Array.isArray(parsed.threads)) setThreads(parsed.threads);
        setActiveId(parsed.activeId ?? parsed.threads?.[0]?.id ?? null);
      } else {
        const t = makeWelcomeThread();
        setThreads([t]);
        setActiveId(t.id);
      }
    } catch {
      const t = makeWelcomeThread();
      setThreads([t]);
      setActiveId(t.id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ threads, activeId }));
  }, [threads, activeId]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId]
  );

  // redirect if unauthenticated
  useEffect(() => {
    if (token === null || token === undefined) return; // wait for context init
    if (!token) window.location.href = "/login";
  }, [token]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = chatWindowRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  // ---------- helpers ----------
  function makeThread(title = "New conversation"): Thread {
    return {
      id: "t_" + cryptoRandom(),
      title,
      createdAt: Date.now(),
      messages: [],
    };
  }

  function makeWelcomeThread(): Thread {
    const t = makeThread("New conversation");
    t.messages.push({
      role: "bot",
      content: "Hello 👋 I’m FaithChat AI. Ask me anything about faith, life, or the Bible.",
      ts: Date.now(),
    });
    return t;
  }

  function createThread() {
    const t = makeWelcomeThread();
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  }

  function setActive(id: string) {
    setActiveId(id);
  }

  function updateThreadTitleFromFirstUserMsg(t: Thread) {
    const firstUser = t.messages.find((m) => m.role === "user");
    if (firstUser) t.title = trimTitle(firstUser.content);
  }

  function appendMessage(role: Msg["role"], content: string) {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeId) return t;
        const next = { ...t, messages: [...t.messages, { role, content, ts: Date.now() }] };
        if (role === "user" && t.messages.filter((m) => m.role === "user").length === 0) {
          updateThreadTitleFromFirstUserMsg(next);
        }
        return next;
      })
    );
  }

  // Delete a single thread
  function deleteThread(id: string) {
    if (!confirm("Delete this conversation?")) return;

    setThreads((prev) => {
      const nextThreads = prev.filter((t) => t.id !== id);

      if (id === activeId) {
        if (nextThreads.length > 0) {
          setActiveId(nextThreads[0].id);
        } else {
          const fresh = makeWelcomeThread();
          setActiveId(fresh.id);
          return [fresh];
        }
      }

      return nextThreads;
    });
  }

  // Clear all
  function clearAllThreads() {
    if (!confirm("Delete all conversations?")) return;
    const fresh = makeWelcomeThread();
    setThreads([fresh]);
    setActiveId(fresh.id);
  }

  // ---------- backend call via server proxy ----------
  async function getBotReply(userText: string, thread: Thread) {
    // Map UI history (user|bot) -> API history (user|assistant)
    const apiHistory = thread.messages.map((m) => ({
      role: m.role === "bot" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    // Call our Next.js proxy; it injects Authorization server-side.
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // include cookies so the proxy can read fc_token
      body: JSON.stringify({
        message: userText,
        history: [...apiHistory, { role: "user", content: userText }],
      }),
    });

    if (!res.ok) {
      const text = await safeText(res);
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = (await res.json()) as { reply?: string };
    return (data.reply ?? "").trim() || "Sorry — I couldn’t generate a reply.";
  }

  // ---------- events ----------
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeThread) return;

    appendMessage("user", text);
    setInput("");
    setTyping(true);

    // typing stub
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, { role: "bot", content: "…", ts: Date.now() }] }
          : t
      )
    );
    scrollToBottom();

    try {
      const reply = await getBotReply(text, { ...activeThread, messages: activeThread.messages });
      // remove typing stub (last bot "…")
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? {
                ...t,
                messages: t.messages.filter(
                  (m, i, arr) => !(m.role === "bot" && m.content === "…" && i === arr.length - 1)
                ),
              }
            : t
        )
      );
      appendMessage("bot", reply);
      scrollToBottom();
    } catch (err: any) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? {
                ...t,
                messages: t.messages.filter(
                  (m, i, arr) => !(m.role === "bot" && m.content === "…" && i === arr.length - 1)
                ),
              }
            : t
        )
      );
      appendMessage("bot", "Error: " + (err?.message || "request failed"));
    } finally {
      setTyping(false);
    }
  }

  return (
    <main className="chat-app chat-container">
      {/* SIDEBAR */}
      <aside className="chat-sidebar" aria-label="Previous Conversations">
        <h2>Previous Conversations</h2>

        <div className="chat-sidebar-actions">
          <button onClick={createThread} className="chat-btn-new">New Chat</button>
          <button onClick={clearAllThreads} className="chat-btn-clear" aria-label="Clear all conversations">
            Clear All
          </button>
        </div>

        <div className="chat-thread-list" role="listbox" aria-label="Conversation list">
          {threads.map((t) => (
            <div key={t.id} className="chat-thread-row">
              <button
                className={`chat-thread${t.id === activeId ? " active" : ""}`}
                role="option"
                onClick={() => setActive(t.id)}
                title={t.title}
              >
                <span className="title">{t.title || "New conversation"}</span>
                <span className="meta">{new Date(t.createdAt).toLocaleDateString()}</span>
              </button>

              <button
                className="chat-thread-del"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(t.id);
                }}
                aria-label={`Delete conversation: ${t.title || "New conversation"}`}
                title="Delete conversation"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* DIVIDER */}
      <div className="chat-divider" aria-hidden="true" />

      {/* CHAT PANEL */}
      <section className="chat-panel">
        <header className="chat-head">
          <h1>📖 <span className="title">FaithChat</span></h1>
          <p className="lede">
            Ask anything about faith, life, or the Bible — NKJV-only answers with clear
            explanation and a Spurgeon insight.
          </p>
        </header>

        <div
          id="chatWindow"
          ref={chatWindowRef}
          className="chat-window"
          aria-live="polite"
          aria-relevant="additions"
        >
          {activeThread?.messages.map((m, idx) => (
            <div key={m.ts + "-" + idx} className={`chat-message ${m.role === "user" ? "user" : "bot"}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
        </div>

        <form className="chat-form" autoComplete="off" onSubmit={onSubmit}>
          <input
            id="userInput"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Start the conversation. Example: "What does Proverbs 3:5–6 teach for anxiety?"'
            aria-label="Your message"
            required
          />
          <button type="submit" className="send" disabled={typing}>Send</button>
        </form>

        <footer className="chat-foot">
          Built with ❤️ • NKJV Scripture references only • Spurgeon quotes when helpful
        </footer>
      </section>
    </main>
  );
}

/* ---------- utils ---------- */
function cryptoRandom() {
  if (typeof window !== "undefined" && (window as any).crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    (window as any).crypto.getRandomValues(buf);
    return buf[0].toString(36);
  }
  return Math.random().toString(36).slice(2);
}
const trimTitle = (s: string) => (s.length > 34 ? s.slice(0, 31) + "…" : s);

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ""; }
}
