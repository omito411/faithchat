"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import "./register.css"; // or reuse login.css

export default function RegisterView() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/chat";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // optionally auto-login, or tell user to verify email depending on your Supabase settings
      router.push(`/login?next=${encodeURIComponent(next)}`);
    } else {
      alert("Registration failed");
    }
  }

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          <a className="brand" href="/">
            <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 4c11 0 20 8 20 18s-9 18-20 18c-1.5 0-3-.15-4.4-.44L9.3 43.2a1.4 1.4 0 0 1-1.9-1.53l1.76-7.65C6.3 31 4 26.7 4 22 4 12 13 4 24 4z"/>
              <rect x="22" y="14" width="4" height="14" rx="1"></rect>
              <rect x="16" y="20" width="16" height="4" rx="1"></rect>
            </svg>
            <span className="brand-text">FaithChat AI</span>
          </a>

          <nav className="nav-links">
            <a className="pill" href="/">Home</a>
            <a className="pill" href="/chat">Chat</a>
            <a className="pill" href="/donate">Donate</a>
            <a className="pill active" href="/register">Register</a>
          </nav>
        </div>
      </header>

      <main className="container page">
        <section className="card">
          <h1 className="card-title">Create account</h1>

          <form className="form" onSubmit={onSubmit} noValidate>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@example.com" required />

            <label className="label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <input className="input" id="password" name="password" type="password" placeholder="Choose a strong password" required />
              <svg className="eye" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5c5.5 0 9.5 5 9.5 7s-4 7-9.5 7S2.5 14 2.5 12 6.5 5 12 5zm0 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
              </svg>
            </div>

            <button className="btn-primary" type="submit">Create account</button>

            <hr className="sep" />
            <p className="muted">
              Already have an account? <Link className="link-strong" href="/login">Sign in</Link>
            </p>
          </form>
        </section>
        <p className="footnote">Built with ❤️ • NKJV Scripture references only • Spurgeon quotes when helpful</p>
      </main>
    </>
  );
}
