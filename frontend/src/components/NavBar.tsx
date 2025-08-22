"use client";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="bg-ink-900/40 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white">FaithChat</Link>
        <nav className="flex gap-4">
          <Link href="/chat" className="text-sm text-white/80 hover:text-white">Chat</Link>
          <Link href="/donate" className="text-sm text-white/80 hover:text-white">Donate</Link>
          <Link href="/login" className="text-sm text-white/80 hover:text-white">Login</Link>
        </nav>
      </div>
    </header>
  );
}
