// app/api/session/route.ts
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const BASE = process.env.API_BASE_URL;
  if (!BASE) {
    return new Response(JSON.stringify({ error: "Missing API_BASE_URL" }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const token = cookies().get("fc_token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const r = await fetch(`${BASE}/auth/whoami`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    cache: "no-store",
  });

  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}