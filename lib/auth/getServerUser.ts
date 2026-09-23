import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * The single source of server-side identity. Every Server Component and Server
 * Action that needs to know who the caller is — to fill or filter `owner_id` —
 * goes through this. Returns null when there is no valid session, so callers
 * redirect or 404 instead of trusting a client-supplied id.
 *
 * Never trust a uid that came from the client: it names a row, it does not prove
 * the caller may see it. This is the only place that turns the cookie into one.
 */
export async function getServerUser(): Promise<{ uid: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    // checkRevoked = true so a signed-out or disabled user is rejected.
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
