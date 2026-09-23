import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Server-authoritative gate for protected routes. The home page reads and
 * redirects on the server too, but that redirect is rendered inside the client
 * AuthProvider and degrades to a client-side navigation. This runs before render
 * and issues a real redirect when the session cookie is absent. It only checks
 * presence — full verification stays in getServerUser (needs the Admin SDK,
 * which cannot run in middleware).
 */
export function middleware(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Only the home page holds protected data today; /login, /about and /privacy
  // are public.
  matcher: ["/"],
};
