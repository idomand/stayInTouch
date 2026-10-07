import "server-only";
import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";
import { getServerUser } from "@/lib/auth/getServerUser";
import { db } from "@/lib/db";
import { contacts, inviteEmailsSent, linkRequests } from "@/lib/db/schema";

/**
 * Reads for the /settings "Friend requests" section. Incoming requests are found
 * by the caller's verified session email (requests are addressed to an email);
 * outgoing ones by the caller's uid. The addressee only ever gets the sender's
 * name and email snapshot — never notes, cadence or talk history.
 */

export type IncomingLinkRequest = {
  id: string;
  fromName: string;
  fromEmail: string;
  createdAt: Date;
};

export type OutgoingLinkRequest = {
  id: string;
  toEmail: string;
  /** The caller's own contact the request was sent from. */
  contactName: string;
  createdAt: Date;
};

/** A contact the caller could pick when accepting a request. */
export type LinkableContact = {
  id: string;
  name: string;
};

const pendingStatus = eq(linkRequests.status, "pending");

export async function getIncomingRequests(): Promise<IncomingLinkRequest[]> {
  const user = await getServerUser();
  if (!user?.email) {
    return [];
  }
  return db
    .select({
      id: linkRequests.id,
      fromName: linkRequests.fromName,
      fromEmail: linkRequests.fromEmail,
      createdAt: linkRequests.createdAt,
    })
    .from(linkRequests)
    .where(and(eq(linkRequests.toEmail, user.email), pendingStatus))
    .orderBy(desc(linkRequests.createdAt));
}

export async function getOutgoingRequests(): Promise<OutgoingLinkRequest[]> {
  const user = await getServerUser();
  if (!user) {
    return [];
  }
  return db
    .select({
      id: linkRequests.id,
      toEmail: linkRequests.toEmail,
      contactName: contacts.name,
      createdAt: linkRequests.createdAt,
    })
    .from(linkRequests)
    .innerJoin(contacts, eq(contacts.id, linkRequests.fromContactId))
    .where(
      and(
        eq(linkRequests.fromUserId, user.uid),
        eq(contacts.ownerId, user.uid),
        pendingStatus,
      ),
    )
    .orderBy(desc(linkRequests.createdAt));
}

/** Pending requests addressed to the caller — the NavBar badge. */
export async function getPendingRequestCount(): Promise<number> {
  const user = await getServerUser();
  if (!user?.email) {
    return 0;
  }
  const [row] = await db
    .select({ value: count() })
    .from(linkRequests)
    .where(and(eq(linkRequests.toEmail, user.email), pendingStatus));
  return row?.value ?? 0;
}

/** Invite emails a user may trigger per rolling 24 hours. */
export const INVITE_LIMIT_PER_DAY = 3;

/** The user's invite log rows from the last 24 hours. */
export function invitesInLastDay(uid: string) {
  return and(
    eq(inviteEmailsSent.fromUserId, uid),
    gt(inviteEmailsSent.createdAt, sql`now() - interval '24 hours'`),
  );
}

/** For the confirm popup; the real limit is enforced in sendLinkRequest. */
export async function getInvitesRemainingToday(): Promise<number> {
  const user = await getServerUser();
  if (!user) {
    return 0;
  }
  const [row] = await db
    .select({ value: count() })
    .from(inviteEmailsSent)
    .where(invitesInLastDay(user.uid));
  return Math.max(0, INVITE_LIMIT_PER_DAY - (row?.value ?? 0));
}

/** The caller's contacts that are not in a link yet, for the accept dialog. */
export async function getLinkableContacts(): Promise<LinkableContact[]> {
  const user = await getServerUser();
  if (!user) {
    return [];
  }
  return db
    .select({ id: contacts.id, name: contacts.name })
    .from(contacts)
    .where(
      and(
        eq(contacts.ownerId, user.uid),
        sql`NOT EXISTS (
          SELECT 1 FROM contact_links l
          WHERE l.contact_a_id = ${contacts.id} OR l.contact_b_id = ${contacts.id}
        )`,
      ),
    )
    .orderBy(asc(sql`lower(${contacts.name})`));
}
