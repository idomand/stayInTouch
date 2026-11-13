/**
 * The analytics consent cookie: its name and allowed values. A plain module
 * (no posthog-js, no server-only), so both the server (`app/layout.tsx`,
 * later server events) and the browser (`analyticsConsent.ts`) can import it.
 */

export const ANALYTICS_CONSENT_COOKIE = "analyticsConsent";
export const ANALYTICS_CONSENT_VALUES = ["granted", "denied"] as const;
export type AnalyticsConsent = (typeof ANALYTICS_CONSENT_VALUES)[number];

export function isAnalyticsConsent(value: unknown): value is AnalyticsConsent {
  return ANALYTICS_CONSENT_VALUES.includes(value as AnalyticsConsent);
}
