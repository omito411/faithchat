"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/chat";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || `Login failed (${res.status})`);
      }
      window.location.href = next;
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page container">
      <section className="login-card">
        <h1 className="login-title">Sign In</h1>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          {/* Email */}
          <label className="login-label" htmlFor="email">Email</label>
          <input
            className="login-input"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="login-row">
            <label className="login-label" htmlFor="password">Password</label>
            <Link className="login-link" href="/forgot">Forgot password?</Link>
          </div>
          <div className="login-input-wrap">
            <input
              className="login-input"
              id="password"
              type="password"
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* decorative eye icon */}
            <svg className="login-eye" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5c5.5 0 9.5 5 9.5 7s-4 7-9.5 7S2.5 14 2.5 12 6.5 5 12 5zm0 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
            </svg>
          </div>

          {/* Remember me */}
          <label className="login-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Submit */}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>

          <hr className="login-sep" />

          <p className="login-muted">
            Don’t have an account?{" "}
            <Link className="login-link-strong" href="/register">
              Create account
            </Link>
          </p>
        </form>
      </section>

      <p className="login-footnote">
        Built with ❤️ • NKJV Scripture references only • Spurgeon quotes when helpful
      </p>
    </main>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
