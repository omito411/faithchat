import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { session } = data;
    if (!session) {
      return NextResponse.json({ ok: true, message: "Check your email to confirm." }, { status: 200 });
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });

    const { access_token, refresh_token } = session;

    res.cookies.set("fc_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });

    res.cookies.set("fc_refresh", refresh_token ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
