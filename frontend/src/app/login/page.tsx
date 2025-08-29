"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import "./login.css"; // ✅ plain CSS import, safely scoped

function LoginInner() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/chat";
  const router = useRouter();
  const { setToken, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) router.replace(next);
  }, [token, next, router]);

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

      // flip navbar to “Sign out” (UI hint only; real auth is the httpOnly cookie)
      setToken("1");

      // optional: show in chat drawer footer
      localStorage.setItem("fc_name", email);
      localStorage.setItem("fc_email", email);

      window.location.href = next;
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-scope">
      <main className="auth-full">
        <section className="auth-wrap" aria-label="Sign in">
          <h1 className="auth-title">Sign In</h1>

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

            <div className="auth-row">
              <label className="auth-label" htmlFor="password">Password</label>
              <Link className="auth-link" href="/forgot">Forgot password?</Link>
            </div>
            <input
              className="auth-input"
              id="password"
              type="password"
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="auth-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            {error && <p role="alert" className="error-text">{error}</p>}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Login"}
            </button>

            <p className="auth-small">
              Don’t have an account?{" "}
              <Link className="auth-link" href="/register">Create account</Link>
            </p>
          </form>

          <p className="site-note">
            Built with ❤️ · KJV Scripture references only
          </p>
        </section>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="login-scope"><main className="auth-full" /></div>}>
      <LoginInner />
    </Suspense>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
