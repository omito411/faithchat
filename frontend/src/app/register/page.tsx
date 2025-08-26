"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./register.css";

function RegisterInner() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/chat";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(""); // for “check your email” message

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.error || `Registration failed (${res.status})`);
      }

      // If email confirmation is ON, the route returns requiresVerification: true
      if (data?.requiresVerification) {
        setNotice("Please check your inbox and verify your email to finish creating your account.");
      } else {
        // immediate session → go to next target (e.g., /chat)
        window.location.href = next;
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page container">
      <section className="register-card">
        <h1 className="register-title">Create your account</h1>

        <form className="register-form" onSubmit={onSubmit} noValidate>
          {/* Name (optional) */}
          <label className="register-label" htmlFor="name">Name (optional)</label>
          <input
            className="register-input"
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
          <label className="register-label" htmlFor="email">Email</label>
          <input
            className="register-input"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {/* Password */}
          <label className="register-label" htmlFor="password">Password</label>
          <div className="register-input-wrap">
            <input
              className="register-input"
              id="password"
              type="password"
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
            {/* decorative eye icon */}
            <svg className="register-eye" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5c5.5 0 9.5 5 9.5 7s-4 7-9.5 7S2.5 14 2.5 12 6.5 5 12 5zm0 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
            </svg>
          </div>

          {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
          {notice && <p role="status" style={{ color: "#1f3a77" }}>{notice}</p>}

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          <hr className="register-sep" />

          <p className="register-muted">
            Already have an account?{" "}
            <Link className="register-link-strong" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>

      <p className="register-footnote">
        Built with ❤️ • NKJV Scripture references only • Spurgeon quotes when helpful
      </p>
    </main>
  );
}

export default function Page() {
  // Suspense fixes the Next.js prerender warning for useSearchParams()
  return (
    <Suspense fallback={<main className="register-page container" />}>
      <RegisterInner />
    </Suspense>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
