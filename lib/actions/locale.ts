"use server";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE_NAME } from "@/i18n/config";

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
    cookieStore.delete(LOCALE_COOKIE_NAME);
    return;
  }
  if (!isLocale(choice)) {
    throw new Error("Unsupported locale.");
  }
  cookieStore.set(LOCALE_COOKIE_NAME, choice, {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    path: "/",
  });
}
