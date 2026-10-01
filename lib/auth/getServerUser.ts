import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
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
export type ServerUser = {
  uid: string;
  /**
   * Lower-cased email from the verified session. Always a verified address: the
   * session route refuses to mint a cookie for an unverified one. Null only for
   * an account without an email, which this app does not create.
   */
  email: string | null;
};

/**
 * Wrapped in React cache() so one request verifies the cookie once:
 * checkRevoked makes each verification a network call to Firebase, and a page
 * plus its queries would otherwise repeat it (four times on /settings).
 */
export const getServerUser = cache(async (): Promise<ServerUser | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    // checkRevoked = true so a signed-out or disabled user is rejected.
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email?.toLowerCase() ?? null };
  } catch {
    return null;
  }
});
