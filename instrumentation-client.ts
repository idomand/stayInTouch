import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (!posthogKey) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}
posthog.init(posthogKey, {
  defaults: "2026-08-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  opt_out_capturing_by_default: true,
  persistence: "memory",
  person_profiles: "identified_only",
  api_host: "/friendship",
  ui_host: "https://eu.posthog.com",
  mask_all_text: true,
});
