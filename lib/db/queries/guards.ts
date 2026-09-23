import "server-only";
import { and, eq } from "drizzle-orm";
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

/** The signed-in uid, or throw. Use when there is no contact id to check yet. */
export async function requireUser(): Promise<string> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  return user.uid;
}

/**
 * The contact if it exists AND belongs to the caller, else null. A null result
 * is a 404/no-op for the caller — never trust the id alone to grant access.
 */
export async function getOwnedContact(
  contactId: string,
): Promise<Contact | null> {
  const user = await getServerUser();
  if (!user) {
    return null;
  }
  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.ownerId, user.uid)))
    .limit(1);
  return contact ?? null;
}
