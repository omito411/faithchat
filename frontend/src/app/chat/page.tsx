"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import "./chat.css";

type Msg = { role: "ai" | "me"; content: string; ts: number };
type Thread = { id: string; title: string; createdAt: number; messages: Msg[] };

const LS_THREADS = "faithchat_threads_v2";
const LS_NAME = "fc_name";
const LS_EMAIL = "fc_email";

export default function ChatPage() {
  // ---- auth guard ----
  const { token } = useAuth();
  useEffect(() => {
    if (token === null) return; // wait for hydration
    if (!token) window.location.href = "/login";
  }, [token]);

  // ---- drawer state ----
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (drawerOpen) drawerRef.current?.focus();
    else openBtnRef.current?.focus();
  }, [drawerOpen]);

  // ---- user display name (from localStorage set at login) ----
  const [displayName, setDisplayName] = useState<string>("You");
  useEffect(() => {
    const n = localStorage.getItem(LS_NAME) || localStorage.getItem(LS_EMAIL);
    if (n) setDisplayName(n);
  }, []);

  // ---- threads & active thread ----
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_THREADS);
      if (raw) {
        const parsed = JSON.parse(raw) as { threads: Thread[]; activeId?: string } | Thread[];
        const list = Array.isArray(parsed) ? parsed : parsed?.threads || [];
        if (list.length) {
          setThreads(list);
          setActiveId((Array.isArray(parsed) ? null : parsed?.activeId) ?? list[0]?.id ?? null);
          return;
        }
      }
    } catch {}
    const t = makeWelcomeThread();
    setThreads([t]);
    setActiveId(t.id);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_THREADS, JSON.stringify({ threads, activeId }));
  }, [threads, activeId]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) || null,
    [threads, activeId]
  );

  // ---- chat input & scrolling ----
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = chatRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  // ---- helpers ----
  function cryptoRandom() {
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0].toString(36);
    }
    return Math.random().toString(36).slice(2);
  }

  function makeThread(title = "New conversation"): Thread {
    return { id: "t_" + cryptoRandom(), title, createdAt: Date.now(), messages: [] };
  }
  function makeWelcomeThread(): Thread {
    const t = makeThread("New conversation");
    t.messages.push({
      role: "ai",
      content:
        "Hi! Ask anything about faith, life, or the Bible (KJV). I’ll answer clearly and pastorally.",
      ts: Date.now(),
    });
    return t;
  }

  function updateTitleFromFirstUserMsg(t: Thread) {
    const firstUser = t.messages.find((m) => m.role === "me");
    if (firstUser) t.title = firstUser.content.length > 40 ? firstUser.content.slice(0, 37) + "…" : firstUser.content;
  }

  function createThread() {
    const t = makeWelcomeThread();
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
    setDrawerOpen(false);
  }

  function deleteThread(id: string) {
    if (!confirm("Delete this conversation?")) return;
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === activeId) {
        if (next.length) setActiveId(next[0].id);
        else {
          const fresh = makeWelcomeThread();
          setActiveId(fresh.id);
          return [fresh];
        }
      }
      return next;
    });
  }

  function setActive(id: string) {
    setActiveId(id);
    setDrawerOpen(false);
  }

  function appendMessage(role: "ai" | "me", content: string) {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeId) return t;
        const next = { ...t, messages: [...t.messages, { role, content, ts: Date.now() }] };
        if (role === "me" && t.messages.every((m) => m.role !== "me")) updateTitleFromFirstUserMsg(next);
        return next;
      })
    );
    scrollToBottom();
  }

  // ---- backend call (proxy → backend) ----
  async function getBotReply(userText: string, thread: Thread) {
    const apiHistory = thread.messages.map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: userText,
        history: [...apiHistory, { role: "user", content: userText }],
      }),
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch {}
      throw new Error(detail || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as { reply?: string };
    return (data.reply ?? "").trim() || "Sorry — I couldn’t generate a reply.";
  }

  // ---- submit ----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeThread) return;

    setInput("");
    appendMessage("me", text);
    appendMessage("ai", "…"); // typing stub

    try {
      const reply = await getBotReply(text, activeThread);
      // remove stub & append real reply
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeId) return t;
          const withoutStub = t.messages.filter((m) => !(m.role === "ai" && m.content === "…"));
          return { ...t, messages: [...withoutStub, { role: "ai", content: reply, ts: Date.now() }] };
        })
      );
      scrollToBottom();
    } catch (err: any) {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeId) return t;
          const withoutStub = t.messages.filter((m) => !(m.role === "ai" && m.content === "…"));
          return {
            ...t,
            messages: [...withoutStub, { role: "ai", content: "Error: " + (err?.message || "request failed"), ts: Date.now() }],
          };
        })
      );
    }
  }

  // ---- render ----
  return (
    <div className="fc-chat">{/* SCOPED WRAPPER to prevent CSS leakage */}
      {/* Backdrop */}
      <div className="scrim" hidden={!drawerOpen} onClick={() => setDrawerOpen(false)} />

      {/* Drawer */}
      <aside
        className={`drawer${drawerOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        ref={drawerRef as any}
      >
        <div className="drawer-inner">
          <div className="drawer-header">
            <h2 id="drawer-title">Conversations</h2>
            <button className="icon-btn" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="drawer-actions">
            <button className="drawer-new" onClick={createThread}>＋ New chat</button>
          </div>

          <nav className="drawer-threads" aria-label="Conversations">
            {threads.map((t) => (
              <div key={t.id} className={`thread-item${t.id === activeId ? " active" : ""}`}>
                <button className="thread-main" onClick={() => setActive(t.id)} title={t.title}>
                  <span className="thread-title">{t.title || "New conversation"}</span>
                  <span className="thread-meta">{new Date(t.createdAt).toLocaleDateString()}</span>
                </button>
                <button className="thread-del" aria-label={`Delete ${t.title || "conversation"}`} onClick={() => deleteThread(t.id)}>🗑</button>
              </div>
            ))}
          </nav>

          <div className="drawer-footer">
            <div className="me">
              <div className="avatar">{(displayName || "You").slice(0,2).toUpperCase()}</div>
              <div className="who">{displayName || "You"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* App frame */}
      <div className="app" aria-hidden={false}>
        {/* Top bar */}
        <header className="topbar" role="banner">
          <button
            ref={openBtnRef}
            className="icon-btn"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            aria-controls="drawer"
            title="Menu"
            onClick={() => setDrawerOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="title">GospelAI</div>

          <button className="icon-btn" aria-label="New chat" title="New chat" onClick={createThread}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        {/* Messages */}
        <main className="chat" role="main" aria-live="polite" ref={chatRef}>
          {activeThread?.messages.map((m, i) => (
            <div key={m.ts + "-" + i} className={`bubble ${m.role}`}>{m.content}</div>
          ))}
        </main>

        {/* Composer */}
        <form className="composer" autoComplete="off" onSubmit={onSubmit}>
          <button className="circle-btn" type="button" title="New chat" aria-label="New chat" onClick={createThread}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <input
            id="msg"
            name="msg"
            className="input"
            placeholder="Message GospelAI…"
            inputMode="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />

          <div className="trailing">
            <button className="circle-btn" type="button" title="Voice" aria-label="Voice">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 12a7 7 0 0 0 14 0M12 19v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <button className="circle-btn send" type="submit" title="Send" aria-label="Send">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M3 12h2m2 0h2m2-3v6m2-8v10m2-6h2m2 0h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
