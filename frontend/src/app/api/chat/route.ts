// app/api/chat/route.ts
import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL; // e.g. https://your-railway-app.up.railway.app

export async function POST(req: Request) {
  if (!BASE) {
    return new Response(
      JSON.stringify({ error: "Missing API_BASE_URL env var" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // forward the incoming JSON body to your backend
  const payload = await req.json();

  // read auth cookie set by /api/login (fc_token)
  const token = cookies().get("fc_token")?.value;

  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    // no CORS needed here—this is server-to-server
  });

  // pipe backend response through unchanged
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "application/json";
  return new Response(text, { status: res.status, headers: { "content-type": contentType } });
}
