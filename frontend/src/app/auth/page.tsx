"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // ✅ Your Supabase client

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
        if (signUpError) throw signUpError;
        alert("Check your email to confirm your account");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        window.location.href = "/"; // redirect to chat
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-2xl font-semibold">
          <span>📖</span>
          <span>FaithChat</span>
        </div>
        <p className="text-sm text-neutral-600 mt-1">
          NKJV-only answers. Spurgeon when apt.
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-2 bg-neutral-100 rounded-full p-1 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full text-sm ${
              mode === "login" ? "bg-white shadow font-medium" : "text-neutral-600"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full text-sm ${
              mode === "signup" ? "bg-white shadow font-medium" : "text-neutral-600"
            }`}
          >
            Sign up
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 p-3 outline-none focus:ring-2 focus:ring-faith-gold"
              />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-3 outline-none focus:ring-2 focus:ring-faith-gold"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-3 outline-none focus:ring-2 focus:ring-faith-gold"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-faith-red text-white font-medium hover:opacity-95"
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "login" ? "Log in" : "Create account"}
          </button>

          <p className="text-xs text-neutral-500 text-center">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </form>
      </div>
    </main>
  );
}
