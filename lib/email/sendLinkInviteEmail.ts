import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailOptOuts } from "@/lib/db/schema";
import { appUrl, resend } from "./client";
import { signEmail } from "./unsubscribeToken";

const FROM = "Stay in Touch <invites@send.stay-in-touch.vip>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The one notice a link request sends. Same text whether or not the address
 * has an account, so nothing reveals who uses the app. English only. Skips
 * opted-out addresses silently — the sender is never told.
 *
 * Throws on a failed send; the caller treats the email as best-effort.
 */
export async function sendLinkInviteEmail({
  fromName,
  fromEmail,
  toEmail,
}: {
  fromName: string;
  fromEmail: string;
  /** Normalized: trimmed, lower-case. */
  toEmail: string;
}): Promise<void> {
  const [optedOut] = await db
    .select({ email: emailOptOuts.email })
    .from(emailOptOuts)
    .where(eq(emailOptOuts.email, toEmail))
    .limit(1);
  if (optedOut) {
    return;
  }

  const recipient = encodeURIComponent(toEmail);
  const token = encodeURIComponent(signEmail(toEmail));
  const loginUrl = `${appUrl}/login?email=${recipient}`;
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${recipient}&token=${token}`;
  const oneClickUrl = `${appUrl}/api/email/unsubscribe?email=${recipient}&token=${token}`;

  const sender = fromName === fromEmail ? fromEmail : `${fromName} (${fromEmail})`;
  const text = [
    `${sender} wants to stay in touch with you on Stay in Touch.`,
    "",
    `Sign in or create an account with ${toEmail} to accept:`,
    loginUrl,
    "",
    "You got this email because someone entered your address in Stay in Touch.",
    `Don't want these emails? ${unsubscribeUrl}`,
  ].join("\n");
  const html = `<p>${escapeHtml(sender)} wants to stay in touch with you on Stay in Touch.</p>
<p>Sign in or create an account with <strong>${escapeHtml(toEmail)}</strong> to accept:<br>
<a href="${escapeHtml(loginUrl)}">Open Stay in Touch</a></p>
<p style="color:#666;font-size:12px">You got this email because someone entered your address in Stay in Touch.
<a href="${escapeHtml(unsubscribeUrl)}">Don't email me again</a>.</p>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    replyTo: fromEmail,
    subject: `${fromName} wants to stay in touch with you`,
    text,
    html,
    headers: {
      "List-Unsubscribe": `<${oneClickUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (error) {
    throw new Error(`Resend rejected the invite email: ${error.name}: ${error.message}`);
  }
}
