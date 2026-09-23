import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS } from "@/lib/auth/session";

// firebase-admin needs the Node.js runtime; it does not run on Edge.
export const runtime = "nodejs";

/**
 * Exchange a Firebase ID token for an httpOnly session cookie. The client POSTs
 * a fresh ID token after sign-in; the server verifies it and mints the cookie
 * that every Server Component and Server Action then reads via getServerUser().
 */
export async function POST(request: NextRequest) {
  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof idToken !== "string" || idToken.length === 0) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
    return NextResponse.json({ status: "ok" });
  } catch {
    // A rejected token is the caller's problem, not a server error.
    return NextResponse.json({ error: "Invalid ID token." }, { status: 401 });
  }
}

/** Clear the session cookie on logout. */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ status: "ok" });
}
