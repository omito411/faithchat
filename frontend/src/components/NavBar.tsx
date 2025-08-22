"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function NavBar() {
  const { token, clearToken } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">FaithChat</Link>
        <nav className="flex gap-3 items-center">
          <Link href="/chat" className="text-sm">Chat</Link>
          {token ? (
            <button onClick={clearToken} className="text-sm px-3 py-1 rounded-xl border">Logout</button>
          ) : (
            <Link href="/login" className="text-sm px-3 py-1 rounded-xl border">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
