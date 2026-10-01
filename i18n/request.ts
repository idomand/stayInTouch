import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import de from "./de.json";
import en from "./en.json";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/i18n/config";

// Typed as the English messages, so a key missing from de.json fails
// type-check — the repo has no test runner to catch it otherwise.
const messagesByLocale: Record<Locale, typeof en> = { en, de };

/**
 * The first supported language in an Accept-Language header, by preference
 * order ("de-DE,de;q=0.9,en;q=0.8" → "de"). Null when none is supported.
 */
function matchAcceptLanguage(header: string | null): Locale | null {
  if (!header) {
    return null;
  }
  const languages = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qParam ? Number(qParam.trim().slice(2)) : 1;
      return {
        language: tag.split("-")[0].toLowerCase(),
        quality: Number.isNaN(quality) ? 0 : quality,
      };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality);
  return languages.map(({ language }) => language).find(isLocale) ?? null;
}

/**
 * Locale for this request: the user's saved choice (cookie), else the
 * browser's language, else English. No locale in the URL.
 */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : (matchAcceptLanguage((await headers()).get("accept-language")) ??
      defaultLocale);

  return { locale, messages: messagesByLocale[locale] };
});
