// app/api/logout/route.ts
import { NextResponse } from "next/server";

function clearCookies(res: NextResponse) {
  res.cookies.set("fc_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("fc_refresh", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

// used by your NavBar's signOut() (POST fetch)
export async function POST() {
  return clearCookies(NextResponse.json({ ok: true }));
}

// lets you also link directly to /api/logout
export async function GET(req: Request) {
  return clearCookies(NextResponse.redirect(new URL("/login", req.url)));
}
