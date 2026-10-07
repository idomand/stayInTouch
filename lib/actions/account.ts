"use server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { requireUserWithEmail } from "@/lib/db/queries/guards";
import { contacts, inviteEmailsSent, linkRequests } from "@/lib/db/schema";
import { adminAuth } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { actionError } from "@/lib/actions/actionError";
import type { ActionResult } from "@/lib/actions/validation";

/**
 * Deletes the caller's account: every row tied to them, then the Firebase user.
 *
 * Deleting contacts cascades to their notes, talk events, links (both sides)
 * and the requests sent from them. Kept on purpose: talk events the user
 * created on a linked friend's contact (the friend's history) and
 * `email_opt_outs` (an opt-out must outlive the account).
 *
 * Database first, Firebase second: if Firebase fails, the user can still sign
 * in and retry, and the database part then deletes nothing. The reverse order
 * could leave rows nobody can delete.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const { uid, email } = await requireUserWithEmail();

  await db.transaction(async (tx) => {
    await tx.delete(linkRequests).where(eq(linkRequests.toEmail, email));
    await tx
      .delete(inviteEmailsSent)
      .where(eq(inviteEmailsSent.fromUserId, uid));
    await tx.delete(contacts).where(eq(contacts.ownerId, uid));
  });

  try {
    await adminAuth.deleteUser(uid);
  } catch (error) {
    console.error("Could not delete the Firebase user:", error);
    return actionError({ key: "accountDeleteFailed" });
  }

  // Other devices are signed out too: verifySessionCookie rejects a deleted
  // user, so their next request has no session.
  (await cookies()).delete(SESSION_COOKIE_NAME);
  return { ok: true };
}
