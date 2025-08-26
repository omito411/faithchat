// app/api/login/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || "Invalid credentials" }, { status: 401 });
    }

    const { access_token, refresh_token, expires_in } = data.session;

    const res = NextResponse.json({ ok: true });

    // Access token (short-lived)
    res.cookies.set("fc_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expires_in, // seconds
    });

    // Refresh token (longer-lived)
    // Supabase refresh tokens are long-lived; set a sensible cap (e.g., 7 days)
    res.cookies.set("fc_refresh", refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
