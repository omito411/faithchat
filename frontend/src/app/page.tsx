import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">📖 FaithChat</h1>
      <p className="text-neutral-700">
        Ask anything about faith, life, or the Bible — and receive Scripture-based answers grounded in Baptist doctrine.
      </p>
      <div className="flex gap-3">
        <Link
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90"
          href="/chat"
        >
          Open Chat
        </Link>
        <Link
          className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100"
          href="/login"
        >
          Login
        </Link>
      </div>
    </section>
  );
}
