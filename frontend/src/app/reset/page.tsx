"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import "../login/login.css"; // reuse scoped look

export default function ResetPage() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [password, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, new_password: password }),
    });
    if (!res.ok) {
      try {
        const data = await res.json();
        setErr(data?.detail || "Reset failed");
      } catch {
        setErr("Reset failed");
      }
      return;
    }
    setOk(true);
  }

  return (
    <div className="login-scope">
      <main className="auth-full">
        <section className="auth-wrap" aria-label="Reset password">
          <h1 className="auth-title">Set a new password</h1>

          {ok ? (
            <>
              <p style={{ textAlign: "center", color: "var(--ink-dim)" }}>
                Your password has been updated. You can now sign in.
              </p>
              <a className="btn primary" href="/login" style={{ marginTop: 12, display: "inline-flex" }}>
                Go to Login
              </a>
            </>
          ) : (
            <form className="auth-form" onSubmit={onSubmit} noValidate>
              <label className="auth-label" htmlFor="password">New password</label>
              <input
                className="auth-input"
                id="password"
                type="password"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPw(e.target.value)}
                required
              />
              {err && <p className="error-text" role="alert">{err}</p>}
              <button className="btn primary" type="submit">Update password</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
