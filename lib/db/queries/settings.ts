import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";

/**
 * True when the user turned on overdue reminder emails. No row means the
 * default, off. The caller passes its own session uid.
 */
export async function getOverdueRemindersEnabled(
  uid: string,
): Promise<boolean> {
  const [row] = await db
    .select({ since: userSettings.overdueRemindersSince })
    .from(userSettings)
    .where(eq(userSettings.ownerId, uid))
    .limit(1);
  return row?.since != null;
}
