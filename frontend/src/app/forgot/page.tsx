"use client";

import { useState } from "react";
import "../login/login.css"; // reuse the scoped styles
export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      setError("Something went wrong");
      return;
    }
    // In dev, you may get reset_url back to test
    try {
      const data = await res.json();
      if (data.reset_url) console.log("DEV reset link:", data.reset_url);
    } catch {}
    setSent(true);
  }

  return (
    <div className="login-scope">
      <main className="auth-full">
        <section className="auth-wrap" aria-label="Forgot password">
          <h1 className="auth-title">Forgot your password?</h1>
          {sent ? (
            <>
              <p style={{ textAlign: "center", color: "var(--ink-dim)" }}>
                If that email exists, we’ve sent a link to reset your password.
              </p>
              <p className="site-note">Check your inbox (and spam) for the message.</p>
            </>
          ) : (
            <form className="auth-form" onSubmit={onSubmit} noValidate>
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                className="auth-input"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="error-text" role="alert">{error}</p>}
              <button className="btn primary" type="submit">Send reset link</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
