"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const { data } = await axios.post(base + "/auth/register", { email, password });
      setToken(data.token);
      router.push("/chat");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full px-3 py-2 border rounded-xl"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 border rounded-xl"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="px-4 py-2 rounded-xl bg-neutral-900 text-white">Register</button>
      </form>
      <p className="text-sm text-neutral-600">
        Already have an account? <a className="underline" href="/login">Login</a>
      </p>
    </div>
  );
}
