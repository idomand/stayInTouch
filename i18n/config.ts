/**
 * Supported languages and the cookie that holds the user's choice. One source
 * of truth for the request config, the language action and the selector.
 */
export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Set only when the user picks a language; absent means "follow the browser". */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}
