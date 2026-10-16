import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { verifyOverdueReminderOptOutToken } from "@/lib/email/unsubscribeToken";

// node:crypto (token check) needs the Node.js runtime.
export const runtime = "nodejs";

/**
 * One-click unsubscribe (RFC 8058) from an overdue reminder's
 * List-Unsubscribe header: turns the setting off for that account. The signed
 * token is the only permission, so no sign-in is needed. POST only: link
 * scanners send GETs, and a GET must not change anything.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  if (!uid || !token || !verifyOverdueReminderOptOutToken(uid, token)) {
    return NextResponse.json(
      { error: "Invalid unsubscribe link." },
      { status: 400 },
    );
  }
  await db
    .update(userSettings)
    .set({ overdueRemindersSince: null, updatedAt: new Date() })
    .where(eq(userSettings.ownerId, uid));
  return NextResponse.json({ status: "ok" });
}
