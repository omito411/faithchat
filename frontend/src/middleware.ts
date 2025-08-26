// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAMES = ["fc_token", "token"]; // pick the one you set on login

export function middleware(req: NextRequest) {
  // Only guard /chat routes
  if (!req.nextUrl.pathname.startsWith("/chat")) {
    return NextResponse.next();
  }

  // Look for a token cookie
  const hasToken = COOKIE_NAMES.some((name) => !!req.cookies.get(name)?.value);

  if (!hasToken) {
    const loginUrl = new URL("/login", req.url);
    // Optional: send them back after login
    loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"], // applies to /chat and any nested paths
};
