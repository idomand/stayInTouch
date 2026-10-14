import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Server-authoritative gate for protected routes (Next 16 "proxy", formerly
 * middleware). The home page reads and redirects on the server too, but that
 * redirect is rendered inside the client AuthProvider and degrades to a
 * client-side navigation. This runs before render and issues a real redirect
 * when the session cookie is absent. It only checks presence — full
 * verification stays in getServerUser.
 *
 * A visitor without a cookie on "/" gets the public landing page instead of a
 * redirect, so the URL stays "/" and first-time visitors learn what the app is
 * before being asked to sign in.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.rewrite(new URL("/welcome", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Protected routes; /login, /welcome, /about, /privacy, /faq and /settings
  // are public. Add every new protected route here.
  matcher: ["/", "/profile"],
};
