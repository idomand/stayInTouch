import "server-only";
import { getTranslations } from "next-intl/server";
import type { ActionResult, ErrorMessage } from "@/lib/actions/validation";

/**
 * A failed ActionResult with its message in the caller's language. Every
 * Server Action builds its errors here, so clients keep showing
 * `result.error` as-is. Separate from validation.ts, which stays a plain
 * module with no server-only imports.
 */
export async function actionError({
  key,
  values,
}: ErrorMessage): Promise<Extract<ActionResult, { ok: false }>> {
  const t = await getTranslations();
  return { ok: false, error: t(`errors.${key}`, values) };
}
