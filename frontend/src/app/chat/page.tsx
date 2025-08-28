"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import "./chat.css";

type Msg = { role: "ai" | "me"; content: string; ts: number };

const LS_KEY = "fc_chat_v2";

export default function ChatPage() {
  // ---- auth guard ----
  const { token } = useAuth();
  useEffect(() => {
    if (token === null) return;        // wait for hydration
    if (!token) window.location.href = "/login";
  }, [token]);

  // ---- state ----
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      content:
        "Hi! Ask anything about faith, life, or the Bible (NKJV). I’ll answer clearly and pastorally.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");

  const chatRef = useRef<HTMLDivElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  // ---- storage ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const prev = JSON.parse(raw) as Msg[];
        if (Array.isArray(prev) && prev.length) setMsgs(prev);
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(msgs));
  }, [msgs]);

  // ---- helpers ----
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = chatRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const addBubble = (text: string, who: Msg["role"]) => {
    setMsgs((prev) => [...prev, { role: who, content: text, ts: Date.now() }]);
    scrollToBottom();
  };

  // ---- drawer a11y bits ----
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (drawerOpen) {
      drawerRef.current?.focus();
    } else {
      openBtnRef.current?.focus();
    }
  }, [drawerOpen]);

  // ---- chat call (proxy → backend) ----
  async function getBotReply(userText: string) {
    const apiHistory = msgs.map((m) => ({
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
      try {
        detail = await res.text();
      } catch {}
      throw new Error(detail || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as { reply?: string };
    return (data.reply ?? "").trim() || "Sorry — I couldn’t generate a reply.";
  }

  // ---- submit ----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    addBubble(text, "me");
    addBubble("…", "ai"); // typing stub

    try {
      const reply = await getBotReply(text);
      // remove stub (last ai bubble "…")
      setMsgs((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "ai" && next[i].content === "…") {
            next.splice(i, 1);
            break;
          }
        }
        return [...next, { role: "ai", content: reply, ts: Date.now() }];
      });
      scrollToBottom();
    } catch (err: any) {
      setMsgs((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "ai" && next[i].content === "…") {
            next.splice(i, 1);
            break;
          }
        }
        return [
          ...next,
          { role: "ai", content: "Error: " + (err?.message || "request failed"), ts: Date.now() },
        ];
      });
    }
  }

  // ---- render ----
  return (
    <>
      {/* Backdrop */}
      <div className="scrim" hidden={!drawerOpen} onClick={() => setDrawerOpen(false)} />

      {/* Drawer / Sidebar */}
      <aside
        className={`drawer${drawerOpen ? " open" : ""}`}
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        ref={drawerRef as any}
      >
        <div className="drawer-inner">
          <div className="drawer-header">
            <h2 id="drawer-title">GospelAI</h2>
            <button
              className="icon-btn close-drawer"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="drawer-search">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input type="search" placeholder="Search" aria-label="Search" />
          </div>

          <nav className="drawer-nav">
            <Link href="/chat"><span className="ico">💬</span> Chat</Link>
            <a href="#"><span className="ico">📚</span> Library</a>
            <a href="#"><span className="ico">🔎</span> GPTs</a>
            <a href="#"><span className="ico">🖼️</span> Reimaginator</a>
            <a href="#"><span className="ico">✨</span> New Project</a>

            <div className="drawer-group-label">Workspaces</div>
            <a href="#"><span className="ico">📁</span> GospelAI</a>
            <a href="#"><span className="ico">📁</span> MED</a>
            <a href="#"><span className="ico">📁</span> SermonAI</a>
            <a href="#"><span className="ico">📁</span> Trading course website</a>

            <div className="drawer-group-label">Recent</div>
            <a href="#"><span className="ico">📝</span> Create FaithChat logo</a>
          </nav>

          <div className="drawer-footer">
            <div className="me">
              <div className="avatar">ST</div>
              <div className="who">Stephen Omitogun</div>
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
              <path
                d="M4 6h16M4 12h16M4 18h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="title">GospelAI</div>

          <button className="icon-btn" aria-label="Activity" title="Activity">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 3"
              />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <main className="chat" id="chat" role="main" aria-live="polite" ref={chatRef}>
          {msgs.map((m, i) => (
            <div key={m.ts + "-" + i} className={`bubble ${m.role}`}>{m.content}</div>
          ))}
        </main>

        {/* Composer */}
        <form className="composer" autoComplete="off" onSubmit={onSubmit}>
          <button className="circle-btn" type="button" title="Add" aria-label="Add">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
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
                <path
                  d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M5 12a7 7 0 0 0 14 0M12 19v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <button className="circle-btn send" type="submit" title="Send" aria-label="Send">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M3 12h2m2 0h2m2-3v6m2-8v10m2-6h2m2 0h2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
