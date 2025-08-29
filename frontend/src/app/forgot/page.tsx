"use client";

import { useState } from "react";
import "../login/login.css"; // reuse the scoped styles

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null); // optional helper

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDevLink(null);

    try {
      const res = await fetch("/api/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Try to parse JSON (backend may return text on errors)
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || data?.error || "Something went wrong");

      // DEV: backend returns { reset_url } — go there immediately
      if (data?.reset_url) {
        // instant redirect to /reset?token=...
        window.location.assign(data.reset_url);
        return; // stop here; we’re navigating
      }

      // PROD: no reset_url → show confirmation
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    }
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

              <button className="btn btn-primary" type="submit">Send reset link</button>

              {/* Optional: show dev link as a button if you want */}
              {devLink && (
                <a className="btn" href={devLink} style={{ marginTop: 8 }}>
                  Open reset page
                </a>
              )}
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
