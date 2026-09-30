"use server";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  getOwnedContact,
  isUuid,
  requireUser,
  requireUserWithEmail,
} from "@/lib/db/queries/guards";
import { contactLinks, contacts, linkRequests } from "@/lib/db/schema";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  type ActionResult,
  isUniqueViolation,
  isValidEmail,
  validateFields,
} from "@/lib/actions/validation";

/**
 * Link requests and links (Phase 8). A request is addressed to an email, never
 * resolved to a uid, so nothing here reveals whether an email has an account;
 * the addressee is whoever holds that verified email in their session. An
 * accepted link joins two contact ids — emails play no part after that.
 */

const CONTACT_NOT_FOUND: ActionResult = { ok: false, error: "Contact not found." };
const REQUEST_NOT_FOUND: ActionResult = { ok: false, error: "Request not found." };
const INVALID_EMAIL: ActionResult = { ok: false, error: "Email is invalid." };
const NAME_TAKEN: ActionResult = {
  ok: false,
  error: "A contact with this name already exists.",
};

/** Accept by linking an existing contact, or by creating a new one. */
export type AcceptLinkTarget =
  | { contactId: string }
  | { newContact: { name: string; cadenceDays: number } };

function revalidateLinkPages() {
  revalidatePath("/");
  revalidatePath("/account");
}

/** Link rows that include any of these contacts, on either side. */
function linksTouching(contactIds: string[]) {
  return or(
    inArray(contactLinks.contactAId, contactIds),
    inArray(contactLinks.contactBId, contactIds),
  );
}

export async function sendLinkRequest(
  contactId: string,
  email: string,
): Promise<ActionResult> {
  const { uid, email: myEmail } = await requireUserWithEmail();
  const contact = await getOwnedContact(uid, contactId);
  if (!contact) {
    return CONTACT_NOT_FOUND;
  }
  if (typeof email !== "string") {
    return INVALID_EMAIL;
  }
  const toEmail = email.trim().toLowerCase();
  if (!isValidEmail(toEmail)) {
    return INVALID_EMAIL;
  }
  if (toEmail === myEmail) {
    return { ok: false, error: "You cannot send a link request to yourself." };
  }

  const [existingLink] = await db
    .select({ id: contactLinks.id })
    .from(contactLinks)
    .where(linksTouching([contact.id]))
    .limit(1);
  if (existingLink) {
    return { ok: false, error: "This contact is already linked." };
  }

  // Both checks only reveal the caller's own requests, or ones already in the
  // caller's incoming list — never whether the email has an account.
  const [pendingToSameEmail] = await db
    .select({ id: linkRequests.id })
    .from(linkRequests)
    .where(
      and(
        eq(linkRequests.fromUserId, uid),
        eq(linkRequests.toEmail, toEmail),
        eq(linkRequests.status, "pending"),
      ),
    )
    .limit(1);
  if (pendingToSameEmail) {
    return {
      ok: false,
      error: "You already have a pending request to this email.",
    };
  }
  const [crossed] = await db
    .select({ fromName: linkRequests.fromName })
    .from(linkRequests)
    .where(
      and(
        eq(linkRequests.fromEmail, toEmail),
        eq(linkRequests.toEmail, myEmail),
        eq(linkRequests.status, "pending"),
      ),
    )
    .limit(1);
  if (crossed) {
    return {
      ok: false,
      error: `${crossed.fromName} already sent you a request. Accept it on your Account page.`,
    };
  }

  // The addressee sees only this name and email — a snapshot taken now.
  let fromName = myEmail;
  try {
    const record = await adminAuth.getUser(uid);
    fromName = record.displayName?.trim() || myEmail;
  } catch (error) {
    console.error("Could not read the sender's display name:", error);
  }

  try {
    await db.insert(linkRequests).values({
      fromUserId: uid,
      fromContactId: contact.id,
      fromName,
      fromEmail: myEmail,
      toEmail,
    });
  } catch (error) {
    // link_requests_one_pending_per_contact
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "This contact already has a pending request.",
      };
    }
    throw error;
  }

  revalidateLinkPages();
  return { ok: true };
}

export async function acceptLinkRequest(
  requestId: string,
  target: AcceptLinkTarget,
): Promise<ActionResult> {
  const { uid, email } = await requireUserWithEmail();
  if (!isUuid(requestId)) {
    return REQUEST_NOT_FOUND;
  }
  if (typeof target !== "object" || target === null) {
    return { ok: false, error: "Invalid input." };
  }

  let chosenContactId: string | null = null;
  let newContact: { name: string; cadenceDays: number } | null = null;
  if ("contactId" in target) {
    if (!isUuid(target.contactId)) {
      return CONTACT_NOT_FOUND;
    }
    chosenContactId = target.contactId;
  } else if ("newContact" in target) {
    const invalid = validateFields(target.newContact);
    if (invalid) {
      return { ok: false, error: invalid };
    }
    newContact = {
      name: target.newContact.name.trim(),
      cadenceDays: target.newContact.cadenceDays,
    };
  } else {
    return { ok: false, error: "Invalid input." };
  }

  let result: ActionResult;
  try {
    result = await db.transaction(async (tx): Promise<ActionResult> => {
      // Every check runs before the first write, so an early return leaves
      // nothing behind.
      const [request] = await tx
        .select()
        .from(linkRequests)
        .where(
          and(
            eq(linkRequests.id, requestId),
            eq(linkRequests.toEmail, email),
            eq(linkRequests.status, "pending"),
          ),
        )
        .for("update");
      if (!request || request.fromUserId === uid) {
        return REQUEST_NOT_FOUND;
      }

      // One link per pair of users. The link row holds contact ids, not user
      // ids, so no constraint can express this; the advisory lock serializes
      // accepts for the same pair so the check below cannot race.
      const pairKey = [uid, request.fromUserId].sort().join(":");
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${pairKey}))`);
      const pairLinks = await tx.execute(sql`
        SELECT 1
        FROM contact_links l
        JOIN contacts ca ON ca.id = l.contact_a_id
        JOIN contacts cb ON cb.id = l.contact_b_id
        WHERE (ca.owner_id = ${uid} AND cb.owner_id = ${request.fromUserId})
           OR (ca.owner_id = ${request.fromUserId} AND cb.owner_id = ${uid})
        LIMIT 1
      `);
      if (pairLinks.rows.length > 0) {
        return {
          ok: false,
          error: `You are already linked with ${request.fromName}.`,
        };
      }

      // "A contact is in at most one link": lock both contacts (in id order, so
      // two concurrent accepts cannot deadlock), then check neither is linked.
      const lockIds = chosenContactId
        ? [request.fromContactId, chosenContactId]
        : [request.fromContactId];
      const locked = await tx
        .select({ id: contacts.id, ownerId: contacts.ownerId })
        .from(contacts)
        .where(inArray(contacts.id, lockIds))
        .orderBy(contacts.id)
        .for("update");
      if (!locked.some((row) => row.id === request.fromContactId)) {
        return REQUEST_NOT_FOUND;
      }
      if (
        chosenContactId &&
        !locked.some((row) => row.id === chosenContactId && row.ownerId === uid)
      ) {
        return CONTACT_NOT_FOUND;
      }
      const [alreadyLinked] = await tx
        .select({ id: contactLinks.id })
        .from(contactLinks)
        .where(linksTouching(lockIds))
        .limit(1);
      if (alreadyLinked) {
        return { ok: false, error: "One of these contacts is already linked." };
      }

      let myContactId = chosenContactId;
      if (!myContactId && newContact) {
        const [created] = await tx
          .insert(contacts)
          .values({ ownerId: uid, ...newContact })
          .returning({ id: contacts.id });
        myContactId = created.id;
      }
      if (!myContactId) {
        return { ok: false, error: "Invalid input." };
      }

      // Lower-case uuid strings sort like Postgres uuids, matching the
      // contact_a_id < contact_b_id check.
      const [contactAId, contactBId] = [myContactId, request.fromContactId].sort();
      await tx.insert(contactLinks).values({ contactAId, contactBId });
      await tx
        .update(linkRequests)
        .set({ status: "accepted", respondedAt: new Date() })
        .where(eq(linkRequests.id, request.id));
      return { ok: true };
    });
  } catch (error) {
    // contacts_owner_name_unique, when creating the new contact.
    if (isUniqueViolation(error)) {
      return NAME_TAKEN;
    }
    throw error;
  }

  if (result.ok) {
    revalidateLinkPages();
  }
  return result;
}

export async function rejectLinkRequest(
  requestId: string,
): Promise<ActionResult> {
  const { email } = await requireUserWithEmail();
  if (!isUuid(requestId)) {
    return REQUEST_NOT_FOUND;
  }
  const updated = await db
    .update(linkRequests)
    .set({ status: "rejected", respondedAt: new Date() })
    .where(
      and(
        eq(linkRequests.id, requestId),
        eq(linkRequests.toEmail, email),
        eq(linkRequests.status, "pending"),
      ),
    )
    .returning({ id: linkRequests.id });
  if (updated.length === 0) {
    return REQUEST_NOT_FOUND;
  }
  revalidateLinkPages();
  return { ok: true };
}

/** The sender withdraws a request that is still pending. */
export async function cancelLinkRequest(
  requestId: string,
): Promise<ActionResult> {
  const uid = await requireUser();
  if (!isUuid(requestId)) {
    return REQUEST_NOT_FOUND;
  }
  const deleted = await db
    .delete(linkRequests)
    .where(
      and(
        eq(linkRequests.id, requestId),
        eq(linkRequests.fromUserId, uid),
        eq(linkRequests.status, "pending"),
      ),
    )
    .returning({ id: linkRequests.id });
  if (deleted.length === 0) {
    return REQUEST_NOT_FOUND;
  }
  revalidateLinkPages();
  return { ok: true };
}

/** Either side ends a link from their own contact. Both contacts stay. */
export async function unlinkContact(contactId: string): Promise<ActionResult> {
  const uid = await requireUser();
  const contact = await getOwnedContact(uid, contactId);
  if (!contact) {
    return CONTACT_NOT_FOUND;
  }
  const deleted = await db
    .delete(contactLinks)
    .where(linksTouching([contact.id]))
    .returning({ id: contactLinks.id });
  if (deleted.length === 0) {
    return { ok: false, error: "This contact is not linked." };
  }
  revalidateLinkPages();
  return { ok: true };
}
