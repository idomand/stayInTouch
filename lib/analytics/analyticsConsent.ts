import posthog from "posthog-js";
import {
  ANALYTICS_CONSENT_COOKIE,
  AnalyticsConsent,
  isAnalyticsConsent,
} from "./analyticsConsentCookie";
import { ONE_YEAR_SECONDS } from "../ConstantsFile";

/**
 * The user's analytics choice, and the PostHog switch that follows it. Browser
 * only: it reads `document.cookie` and drives posthog-js in the same click.
 *
 * The choice is a cookie, not localStorage, so the server can read it too
 * (server events must check consent). Storing the answer is strictly
 * necessary, so the cookie itself needs no consent.
 */

/** The saved choice, or null when there is none or it is not a valid value. */
export function readAnalyticsConsent(): AnalyticsConsent | null {
  // The server has no document; it must not guess a choice.
  if (typeof document === "undefined") {
    return null;
  }
  const prefix = `${ANALYTICS_CONSENT_COOKIE}=`;
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);
  return isAnalyticsConsent(value) ? value : null;
}

// Cookies have no change event (unlike localStorage's "storage" event), so
// saves notify subscribers directly. Other tabs see the choice on next load.
const listeners = new Set<() => void>();

/** Saves the choice for a year and turns PostHog on or off to match. */
export function saveAnalyticsConsent(choice: AnalyticsConsent) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${choice}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`;

  if (choice === "granted") {
    posthog.opt_in_capturing();
  } else {
    // Opting out also removes PostHog's storage (opt_out_persistence_by_default).
    // reset() then replaces the in-memory id, so a later accept starts fresh.
    posthog.opt_out_capturing();
    posthog.reset();
  }

  listeners.forEach((listener) => listener());
}

/** Subscribe API for `useSyncExternalStore`. */
export function subscribeAnalyticsConsent(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}
