import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { session } = data;
    if (!session) {
      return NextResponse.json({ error: "No session returned" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });

    // Access and refresh tokens
    const { access_token, refresh_token } = session;

    res.cookies.set("fc_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    res.cookies.set("fc_refresh", refresh_token ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
