export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const BASE = process.env.API_BASE_URL;
  if (!BASE) {
    return new Response(JSON.stringify({ error: "Missing API_BASE_URL" }), { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  try {
    const r = await fetch(`${BASE}/auth/forgot`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") ?? "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Bad Gateway", detail: String(e?.message ?? e) }), { status: 502 });
  }
}
