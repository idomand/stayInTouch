import "server-only";
import { sql } from "drizzle-orm";
import { getServerUser } from "@/lib/auth/getServerUser";
import { db } from "@/lib/db";

export type ContactNote = {
  id: string;
  body: string;
  createdAt: string;
};

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
 * The read shape for the contact list — not a raw table row. It carries the two
 * derived values the whole UI is built around (last talk and days until the next
 * one) plus the eagerly-loaded notes, so the client renders without extra reads.
 */
export type ContactListItem = {
  id: string;
  name: string;
  cadenceDays: number;
  friendEmail: string | null;
  /** Newest talk_events.talked_at, or null when never contacted. */
  lastTalkedAt: Date | null;
  /** cadence minus days elapsed; null (never talked) sorts first. */
  daysUntilNextTalk: number | null;
  /**
   * Days since the last talk, fractional; null when never talked. Computed
   * here, not in render, so server and client show the same label.
   */
  daysSinceLastTalk: number | null;
  notes: ContactNote[];
  /** Full talk history, newest first. */
  talkEvents: ContactTalkEvent[];
  /** In a contact_links row: talks are shared with the other user's contact. */
  isLinked: boolean;
  /** A link request sent from this contact is waiting for an answer. */
  hasPendingRequest: boolean;
};

/**
 * Every contact for the signed-in user, most overdue first. Ownership comes from
 * the server session, never the client. Two lateral joins keep it one round trip:
 * the newest talk event (using the (contact_id, talked_at DESC) index) and the
 * notes aggregated into a JSON array. Uses EXTRACT(EPOCH ...)/86400 — not
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
      t.talked_at    AS "lastTalkedAt",
      -- Cast to float8: Postgres 14+ EXTRACT returns numeric, which the driver
      -- would hand back as a string. double precision comes back as a JS number.
      (c.cadence_days - EXTRACT(EPOCH FROM (now() - t.talked_at)) / 86400)::double precision
                     AS "daysUntilNextTalk",
      (EXTRACT(EPOCH FROM (now() - t.talked_at)) / 86400)::double precision
                     AS "daysSinceLastTalk",
      COALESCE(n.notes, '[]'::json) AS notes,
      COALESCE(te.events, '[]'::json) AS "talkEvents",
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
    LEFT JOIN LATERAL (
      SELECT json_agg(
               json_build_object('id', nn.id, 'body', nn.body, 'createdAt', nn.created_at)
               ORDER BY nn.created_at
             ) AS notes
      FROM notes nn
      WHERE nn.contact_id = c.id
    ) n ON true
    LEFT JOIN LATERAL (
      SELECT json_agg(
               json_build_object('id', ee.id, 'talkedAt', ee.talked_at, 'createdByMe', ee.created_by = ${user.uid})
               ORDER BY ee.talked_at DESC
             ) AS events
      FROM talk_events ee
      WHERE ee.contact_id = c.id
    ) te ON true
    WHERE c.owner_id = ${user.uid}
    ORDER BY "daysUntilNextTalk" ASC NULLS FIRST
  `);

  return result.rows as unknown as ContactListItem[];
}
