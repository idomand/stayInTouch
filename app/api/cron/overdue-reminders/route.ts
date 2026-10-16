import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { sendOverdueReminders } from "@/lib/email/sendOverdueReminders";

// firebase-admin and node:crypto need the Node.js runtime.
export const runtime = "nodejs";

// Fail fast at module load, same contract as the other required env vars.
// Vercel sends it as a Bearer token on every cron call.
const cronSecret = process.env.CRON_SECRET;
if (!cronSecret) {
  throw new Error(
    "CRON_SECRET is not set. Add it to .env.local and to the Vercel project settings.",
  );
}
const expectedAuthorization = Buffer.from(`Bearer ${cronSecret}`);

function isAuthorized(request: NextRequest): boolean {
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return (
    actual.length === expectedAuthorization.length &&
    timingSafeEqual(actual, expectedAuthorization)
  );
}

/**
 * Daily overdue reminder run, called by the Vercel cron in vercel.json. Only
 * Vercel (or someone with CRON_SECRET) may call it.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const result = await sendOverdueReminders();
  return NextResponse.json(result);
}
