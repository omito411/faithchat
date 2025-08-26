// app/api/register/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined, // store user metadata (optional)
        // You can also set emailRedirectTo for magic links here if needed
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If email confirmation is ON (default), session will be null until the user verifies.
    if (!data.session) {
      return NextResponse.json({
        ok: true,
        requiresVerification: true,
        message: "Check your email to verify your account.",
      });
    }

    // If confirmations are OFF, Supabase returns a session immediately — set cookies like login.
    const { access_token, refresh_token, expires_in } = data.session;
    const res = NextResponse.json({ ok: true, requiresVerification: false });

    res.cookies.set("fc_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expires_in,
    });

    res.cookies.set("fc_refresh", refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
