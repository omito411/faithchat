export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const BASE = process.env.API_BASE_URL;
  if (!BASE) {
    return new Response(JSON.stringify({ error: "Missing API_BASE_URL" }), { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  const r = await fetch(`${BASE}/auth/reset`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") ?? "application/json" },
  });
}
