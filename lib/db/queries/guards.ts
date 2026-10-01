import "server-only";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/getServerUser";
import { db } from "@/lib/db";
import { contacts, type Contact } from "@/lib/db/schema";

/**
 * The ownership choke point. In Postgres every contact sits in one table and the
 * database returns any row you ask for — the only thing between one user and
 * another's data is the owner_id filter. Centralizing it here means the filter
 * cannot be forgotten at a call site: every write goes through requireUser() or
 * getOwnedContact(), never a bare id from the client.
 */

/**
 * The signed-in uid, or redirect to /login. A session can expire or be revoked
 * while the page is open; redirecting here, not throwing, means every Server
 * Action sends the user to sign in instead of failing with an unhandled error.
 * Pass the returned uid to getOwnedContact so a single write does not
 * re-verify the cookie per ownership check.
 */
export async function requireUser(): Promise<string> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }
  return user.uid;
}

/**
 * The signed-in uid and verified email, or redirect to /login (see
 * requireUser). For actions that match on the caller's email (link requests
 * are addressed to an email, not a uid).
 */
export async function requireUserWithEmail(): Promise<{
  uid: string;
  email: string;
}> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.email) {
    throw new Error("This account has no email address.");
  }
  return { uid: user.uid, email: user.email };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * True when `value` is a UUID string. Ids come from the client untyped; Postgres
 * throws on a malformed uuid, which would surface as a 500 instead of "not found".
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/**
 * The contact if it exists AND belongs to `uid`, else null. Pure DB check — the
 * caller supplies the uid from requireUser(). A null result is a 404/no-op for
 * the caller; never trust the id alone to grant access. A malformed id is null
 * too, without a query.
 */
export async function getOwnedContact(
  uid: string,
  contactId: string,
): Promise<Contact | null> {
  if (!isUuid(contactId)) {
    return null;
  }
  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.ownerId, uid)))
    .limit(1);
  return contact ?? null;
}
