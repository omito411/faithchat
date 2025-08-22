import Link from "next/link";

import Button from "@/components/Button";
import Coverflow from "@/components/Coverflow";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="curve-bottom bg-brand-500">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-3xl md:text-5xl font-bold text-white">FaithChat</h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Ask anything about faith, life, or the Bible — NKJV‑only answers with clear explanation and a Spurgeon insight.
          </p>
          <div className="mt-6 flex gap-3">
            <Button href="/chat">Open Chat</Button>
            <Button href="/donate" variant="outline">Donate</Button>
          </div>
        </div>
      </section>

      {/* COVERFLOW */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">Explore</h2>
        <Coverflow />
      </section>
    </>
  );
}
