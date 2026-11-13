import posthog from "posthog-js";
import { readAnalyticsConsent } from "@/lib/analytics/analyticsConsent";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (!posthogKey) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

// Until the user accepts, PostHog sends nothing and keeps its id in memory
// only. A user who accepted on an earlier visit starts tracked right away.
const hasConsent = readAnalyticsConsent() === "granted";

posthog.init(posthogKey, {
  defaults: "2026-08-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  opt_out_capturing_by_default: !hasConsent,
  // PostHog keeps its own opt-in flag. In localStorage (the default) it
  // survived "clear cookies" and kept tracking while our consent cookie was
  // gone. As a cookie, it is cleared together with ours.
  opt_out_capturing_persistence_type: "cookie",
  persistence: hasConsent ? "localStorage+cookie" : "memory",
  person_profiles: "identified_only",
  api_host: "/friendship",
  ui_host: "https://eu.posthog.com",
  mask_all_text: true,
});
