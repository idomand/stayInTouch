import "server-only";
import { sql } from "drizzle-orm";
import { getServerUser } from "@/lib/auth/getServerUser";
import { db } from "@/lib/db";

export type ContactNote = {
  id: string;
  body: string;
  createdAt: string;
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
  notes: ContactNote[];
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
      COALESCE(n.notes, '[]'::json) AS notes
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
    WHERE c.owner_id = ${user.uid}
    ORDER BY "daysUntilNextTalk" ASC NULLS FIRST
  `);

  return result.rows as unknown as ContactListItem[];
}
