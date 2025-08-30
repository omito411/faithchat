export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Freq = "once" | "monthly";

function sanitizeAmount(v: unknown): number {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) throw new Error("amount_eur must be a number");
  if (n < 1) throw new Error("amount_eur must be at least 1");
  if (n > 100_000) throw new Error("amount_eur is too large"); // €100k ceiling
  return n;
}

function sanitizeFreq(v: unknown): Freq {
  return v === "monthly" ? "monthly" : "once";
}

export async function POST(req: Request) {
  const BASE = process.env.API_BASE_URL;
  if (!BASE) {
    return new Response(JSON.stringify({ error: "Missing API_BASE_URL" }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  // Parse body
  let incoming: any;
  try {
    incoming = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  // Validate & shape payload we forward upstream
  let body: { amount_eur: number; frequency: Freq };
  try {
    body = {
      amount_eur: sanitizeAmount(incoming?.amount_eur),
      frequency: sanitizeFreq(incoming?.frequency),
    };
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Invalid input" }), {
      status: 422,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  // Add timeout + request id
  const requestId = crypto.randomUUID();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12_000); // 12s timeout

  try {
    const upstream = await fetch(`${BASE}/donate/create-intent`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "x-request-id": requestId,
        // Optional: forward hints that some backends use for risk/tax
        "x-forwarded-for": req.headers.get("x-forwarded-for") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      // never cache a PI init
      cache: "no-store",
    });

    clearTimeout(t);

    const contentType = upstream.headers.get("content-type") ?? "application/json";
    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    });
  } catch (err: any) {
    clearTimeout(t);
    const isTimeout = err?.name === "AbortError";
    return new Response(
      JSON.stringify({
        error: isTimeout ? "Upstream timeout" : "Bad Gateway",
        requestId,
      }),
      {
        status: isTimeout ? 504 : 502,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      }
    );
  }
}