"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/db/queries/guards";
import { userSettings } from "@/lib/db/schema";
import { actionError } from "@/lib/actions/actionError";
import type { ActionResult } from "@/lib/actions/validation";

/**
 * Turns overdue reminder emails on or off for the caller. Turning on stores
 * the current time, so only contacts that become due from now on are emailed.
 */
export async function setOverdueReminders(
  enabled: unknown,
): Promise<ActionResult> {
  const uid = await requireUser();
  if (typeof enabled !== "boolean") {
    return actionError({ key: "invalidInput" });
  }

  const since = enabled ? new Date() : null;
  await db
    .insert(userSettings)
    .values({ ownerId: uid, overdueRemindersSince: since })
    .onConflictDoUpdate({
      target: userSettings.ownerId,
      set: { overdueRemindersSince: since, updatedAt: new Date() },
    });

  revalidatePath("/settings");
  return { ok: true };
}
