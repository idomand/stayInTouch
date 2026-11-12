"use server";
import { cookies } from "next/headers";
import { isLocale, APP_LANGUAGE_COOKIE } from "@/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Save the app language for this browser, or "auto" to follow the browser's
 * language again. No sign-in check: the cookie only affects the caller's own
 * browser. Setting a cookie in a Server Action makes Next re-render the
 * current page, so the new language shows without a manual refresh.
 */
export async function setLocale(choice: string): Promise<void> {
  const cookieStore = await cookies();
  if (choice === "auto") {
    cookieStore.delete(APP_LANGUAGE_COOKIE);
    return;
  }
  if (!isLocale(choice)) {
    throw new Error("Unsupported locale.");
  }
  cookieStore.set(APP_LANGUAGE_COOKIE, choice, {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    path: "/",
  });
}
