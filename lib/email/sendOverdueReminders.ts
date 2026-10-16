import "server-only";
import { eq, sql } from "drizzle-orm";
import type { UserRecord } from "firebase-admin/auth";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { adminAuth } from "@/lib/firebaseAdmin";
import { overdueReminderDelayHours } from "@/lib/ConstantsFile";
import { appUrl, resend } from "./client";
import { escapeHtml } from "./escapeHtml";
import { signOverdueReminderOptOut } from "./unsubscribeToken";

const FROM = "Stay-in-Touch <reminders@send.stay-in-touch.vip>";
/** Firebase getUsers() accepts at most 100 identifiers per call. */
const FIREBASE_BATCH_SIZE = 100;
/** Keeps sends under Resend's per-second rate limit. */
const SEND_INTERVAL_MS = 600;

type DueContact = {
  id: string;
  ownerId: string;
  name: string;
  cadenceDays: number;
  daysSinceLastTalk: number;
  /** When the contact turned red: last talk + cadence. */
  redSince: Date | string;
};

export type OverdueReminderResult = {
  sent: number;
  skipped: number;
  failed: number;
};

/**
 * The daily overdue reminder run. Emails the owner once per contact that has
 * been red for overdueReminderDelayHours, once per red period. A system job:
 * it reads across users on purpose, so it does not use guards.ts, and each
 * email goes only to the owner of its contact row.
 *
 * Due means: the owner turned reminders on; the contact has at least one talk
 * (never-talked contacts are skipped); the delay ended after the owner turned
 * reminders on (no backlog on opt-in); and no reminder was sent since the
 * contact went red. A new talk moves `redSince` forward, so the next red
 * period can send again.
 */
export async function sendOverdueReminders(): Promise<OverdueReminderResult> {
  const result = await db.execute(sql`
    SELECT
      c.id,
      c.owner_id AS "ownerId",
      c.name,
      c.cadence_days AS "cadenceDays",
      floor(EXTRACT(EPOCH FROM (now() - t.talked_at)) / 86400)::int
                     AS "daysSinceLastTalk",
      r.red_since AS "redSince"
    FROM contacts c
    JOIN user_settings s ON s.owner_id = c.owner_id
    JOIN LATERAL (
      SELECT talked_at
      FROM talk_events e
      WHERE e.contact_id = c.id
      ORDER BY e.talked_at DESC
      LIMIT 1
    ) t ON true
    CROSS JOIN LATERAL (
      SELECT t.talked_at + make_interval(days => c.cadence_days) AS red_since
    ) r
    WHERE s.overdue_reminders_since IS NOT NULL
      AND r.red_since + make_interval(hours => ${overdueReminderDelayHours}::int) <= now()
      AND r.red_since + make_interval(hours => ${overdueReminderDelayHours}::int)
            > s.overdue_reminders_since
      AND (c.overdue_reminder_sent_at IS NULL
           OR c.overdue_reminder_sent_at < r.red_since)
  `);
  const dueContacts = result.rows as unknown as DueContact[];
  const counts: OverdueReminderResult = { sent: 0, skipped: 0, failed: 0 };
  if (dueContacts.length === 0) {
    return counts;
  }

  const emailsByUid = await getVerifiedEmails([
    ...new Set(dueContacts.map((contact) => contact.ownerId)),
  ]);

  for (const contact of dueContacts) {
    const toEmail = emailsByUid.get(contact.ownerId);
    if (!toEmail) {
      counts.skipped++;
      continue;
    }
    if (counts.sent + counts.failed > 0) {
      await new Promise((resolve) => setTimeout(resolve, SEND_INTERVAL_MS));
    }
    try {
      await sendOneReminder(contact, toEmail);
      await db
        .update(contacts)
        .set({ overdueReminderSentAt: new Date() })
        .where(eq(contacts.id, contact.id));
      counts.sent++;
    } catch (error) {
      // Not marked as sent, so the next daily run tries again.
      console.error(
        `Overdue reminder for contact ${contact.id} failed:`,
        error,
      );
      counts.failed++;
    }
  }
  return counts;
}

/**
 * The current email of each uid, only when it is verified and the account is
 * enabled. Read from Firebase, not stored in Postgres, so a changed email is
 * picked up and a deleted account is skipped.
 */
async function getVerifiedEmails(uids: string[]): Promise<Map<string, string>> {
  const emailsByUid = new Map<string, string>();
  for (let start = 0; start < uids.length; start += FIREBASE_BATCH_SIZE) {
    const batch = uids.slice(start, start + FIREBASE_BATCH_SIZE);
    const { users } = await adminAuth.getUsers(batch.map((uid) => ({ uid })));
    users.filter(canReceiveReminders).forEach((user) => {
      emailsByUid.set(user.uid, user.email!.toLowerCase());
    });
  }
  return emailsByUid;
}

function canReceiveReminders(user: UserRecord): boolean {
  return Boolean(user.email) && user.emailVerified && !user.disabled;
}

function pluralDays(count: number): string {
  return count === 1 ? "1 day" : `${count} days`;
}

/** Throws on a failed send; the caller counts it and retries next run. */
async function sendOneReminder(
  contact: DueContact,
  toEmail: string,
): Promise<void> {
  const redSince = new Date(contact.redSince);
  const uid = encodeURIComponent(contact.ownerId);
  const token = encodeURIComponent(signOverdueReminderOptOut(contact.ownerId));
  const oneClickUrl = `${appUrl}/api/email/overdue-reminders/unsubscribe?uid=${uid}&token=${token}`;
  const settingsUrl = `${appUrl}/settings#notifications`;

  const summary = `It has been ${pluralDays(contact.daysSinceLastTalk)} since you last talked to ${contact.name}. You wanted to talk every ${pluralDays(contact.cadenceDays)}.`;
  const text = [
    summary,
    "",
    `Open Stay-in-Touch: ${appUrl}`,
    "",
    "You get this email because you turned on overdue reminders.",
    `Turn them off in Settings: ${settingsUrl}`,
  ].join("\n");
  const html = `<p>${escapeHtml(summary)}</p>
<p><a href="${escapeHtml(appUrl)}">Open Stay-in-Touch</a></p>
<p style="color:#666;font-size:12px">You get this email because you turned on overdue reminders.
<a href="${escapeHtml(settingsUrl)}">Turn them off in Settings</a>.</p>`;

  const { error } = await resend.emails.send(
    {
      from: FROM,
      to: toEmail,
      subject: `Time to talk to ${contact.name}`,
      text,
      html,
      headers: {
        "List-Unsubscribe": `<${oneClickUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
    // One key per contact and red period: if the cron runs twice, or the
    // update after a send fails, Resend drops the repeat instead of sending it.
    {
      idempotencyKey: `overdue-reminder/${contact.id}/${redSince.toISOString()}`,
    },
  );
  if (error) {
    throw new Error(
      `Resend rejected the overdue reminder: ${error.name}: ${error.message}`,
    );
  }
}
