import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { getServerUser } from "@/lib/auth/getServerUser";
import { db } from "@/lib/db";
import { talkEvents } from "@/lib/db/schema";

// Notes are parked (C1 in specs/app-review-fixes.md): no UI shows them, so the
// list no longer loads them. Restore this type and the join below with the UI.
// export type ContactNote = {
//   id: string;
//   body: string;
//   createdAt: string;
// };

export type ContactTalkEvent = {
  id: string;
  talkedAt: string;
  /**
   * True when the caller logged this talk. A boolean, not created_by: on a
   * linked contact that column holds the friend's uid, which the client has
   * no need to see.
   */
  createdByMe: boolean;
};

/**
 * The read shape for the contact list — not a raw table row. It carries only
 * what the first screen shows: the derived talk values and a talk count. The
 * talk history loads on demand (getTalkEventsForOwnedContact).
 */
export type ContactListItem = {
  id: string;
  name: string;
  cadenceDays: number;
  friendEmail: string | null;
  /** cadence minus days elapsed; null (never talked) sorts first. */
  daysUntilNextTalk: number | null;
  /**
   * Days since the last talk, fractional; null when never talked. Computed
   * here, not in render, so server and client show the same label.
   */
  daysSinceLastTalk: number | null;
  // notes: ContactNote[]; — parked, see ContactNote above.
  /** Number of talk events; the history itself loads when its dialog opens. */
  talkEventCount: number;
  /** In a contact_links row: talks are shared with the other user's contact. */
  isLinked: boolean;
  /** A link request sent from this contact is waiting for an answer. */
  hasPendingRequest: boolean;
};

/**
 * Every contact for the signed-in user, most overdue first. Ownership comes from
 * the server session, never the client. One round trip: a lateral join finds
 * the newest talk event (using the (contact_id, talked_at DESC) index), and a
 * subquery counts the events. Uses EXTRACT(EPOCH ...)/86400 — not
 * EXTRACT(DAY ...) which truncates and would break the one-decimal display.
 */
export async function getContactsForCurrentUser(): Promise<ContactListItem[]> {
  const user = await getServerUser();
  if (!user) {
    return [];
  }

  const result = await db.execute(sql`
    SELECT
      c.id,
      c.name,
      c.cadence_days AS "cadenceDays",
      c.friend_email AS "friendEmail",
      -- Cast to float8: Postgres 14+ EXTRACT returns numeric, which the driver
      -- would hand back as a string. double precision comes back as a JS number.
      (c.cadence_days - EXTRACT(EPOCH FROM (now() - t.talked_at)) / 86400)::double precision
                     AS "daysUntilNextTalk",
      (EXTRACT(EPOCH FROM (now() - t.talked_at)) / 86400)::double precision
                     AS "daysSinceLastTalk",
      -- COALESCE(n.notes, '[]'::json) AS notes,  -- parked, see ContactNote
      (SELECT count(*) FROM talk_events ec WHERE ec.contact_id = c.id)::int
                     AS "talkEventCount",
      EXISTS (
        SELECT 1 FROM contact_links l
        WHERE l.contact_a_id = c.id OR l.contact_b_id = c.id
      ) AS "isLinked",
      EXISTS (
        SELECT 1 FROM link_requests r
        WHERE r.from_contact_id = c.id AND r.status = 'pending'
      ) AS "hasPendingRequest"
    FROM contacts c
    LEFT JOIN LATERAL (
      SELECT talked_at
      FROM talk_events e
      WHERE e.contact_id = c.id
      ORDER BY e.talked_at DESC
      LIMIT 1
    ) t ON true
    -- Parked notes join (see ContactNote):
    -- LEFT JOIN LATERAL (
    --   SELECT json_agg(
    --            json_build_object('id', nn.id, 'body', nn.body, 'createdAt', nn.created_at)
    --            ORDER BY nn.created_at
    --          ) AS notes
    --   FROM notes nn
    --   WHERE nn.contact_id = c.id
    -- ) n ON true
    WHERE c.owner_id = ${user.uid}
    ORDER BY "daysUntilNextTalk" ASC NULLS FIRST
  `);

  return result.rows as unknown as ContactListItem[];
}

/**
 * The full talk history of one contact, newest first. The caller must have
 * checked ownership with getOwnedContact(uid, contactId) first; this function
 * trusts both ids.
 */
export async function getTalkEventsForOwnedContact(
  uid: string,
  contactId: string,
): Promise<ContactTalkEvent[]> {
  const rows = await db
    .select({
      id: talkEvents.id,
      talkedAt: talkEvents.talkedAt,
      createdBy: talkEvents.createdBy,
    })
    .from(talkEvents)
    .where(eq(talkEvents.contactId, contactId))
    .orderBy(desc(talkEvents.talkedAt));
  return rows.map((row) => ({
    id: row.id,
    talkedAt: row.talkedAt.toISOString(),
    createdByMe: row.createdBy === uid,
  }));
}
