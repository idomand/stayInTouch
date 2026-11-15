import posthog from "posthog-js";
import { readAnalyticsConsent } from "./analyticsConsent";

/**
 * Links this browser's events to the signed-in user. Only the Firebase uid,
 * never an email or name. Call only with consent: while opted out every page
 * load gets a new anonymous id, and identify would merge them all into one
 * person. Calling again with the same uid does nothing. Never throws.
 */
export function identifyUser(uid: string) {
  try {
    posthog.identify(uid);
  } catch (error) {
    console.error("Could not identify analytics user:", error);
  }
}

/**
 * Starts a new anonymous id on sign-out, so the next person on this browser is
 * not merged into the last one. reset() also clears PostHog's consent state,
 * which turns capturing off (we opt out by default), so opt in again when the
 * cookie says the user accepted. Never throws.
 */
export function resetAnalyticsUser() {
  try {
    posthog.reset();
    if (readAnalyticsConsent() === "granted") {
      // null: the user did not just accept, so no `$opt_in` event.
      posthog.opt_in_capturing({ captureEventName: null });
    }
  } catch (error) {
    console.error("Could not reset analytics user:", error);
  }
}
