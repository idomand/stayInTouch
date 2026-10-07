"use server";
import { addEmailOptOut } from "@/lib/email/optOut";
import { actionError } from "@/lib/actions/actionError";
import type { ActionResult } from "@/lib/actions/validation";

/**
 * Confirm button on /unsubscribe. No sign-in check: the signed token from the
 * email is the only permission, so a person without an account can opt out.
 */
export async function optOutEmail(
  email: string,
  token: string,
): Promise<ActionResult> {
  if (!(await addEmailOptOut(email, token))) {
    return actionError({ key: "unsubscribeLinkInvalid" });
  }
  return { ok: true };
}
