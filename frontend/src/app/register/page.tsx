"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import "./register.css"; // ✅ page-scoped (via .register-scope prefix)

function RegisterInner() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/chat";
  const router = useRouter();
  const { token, setToken } = useAuth();

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPw]     = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string>("");

  // If already logged in, redirect away
  useEffect(() => {
    if (token) router.replace(next);
  }, [token, next, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        let msg = "Registration failed";
        try { msg = (await res.json())?.error || msg; } catch {}
        throw new Error(msg + ` (${res.status})`);
      }

      // UI hint for navbar (real auth is httpOnly cookie)
      setToken("1");

      // Save display name/email for chat drawer footer
      if (name.trim()) localStorage.setItem("fc_name", name.trim());
      localStorage.setItem("fc_email", email);

      window.location.href = next;
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-scope">
      <main className="auth-full">
        <section className="auth-wrap" aria-label="Create account">
          <h1 className="auth-title">Create your account</h1>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <label htmlFor="name" className="auth-label">
              Name <span className="muted">(optional)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="auth-input"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="auth-row">
              <label htmlFor="password" className="auth-label">Password</label>
            </div>

            <div className="input-with-trailing">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                className="auth-input"
                placeholder="Choose a strong password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPw(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye"
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                onClick={() => setShowPw(v => !v)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {error && <p role="alert" className="error-text">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>

            <p className="auth-small">
              Already have an account?{" "}
              <Link className="auth-link" href="/login">Sign in</Link>
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
    <Suspense fallback={<div className="register-scope"><main className="auth-full" /></div>}>
      <RegisterInner />
    </Suspense>
  );
}
