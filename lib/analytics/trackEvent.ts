import posthog from "posthog-js";

/**
 * Every custom event the app sends, with its properties. A typo in a name or
 * a missing property fails type-check instead of creating a new event.
 * Properties never carry personal data (no names, emails, ids or note text).
 */
export type AnalyticsEvent = { name: "demo_started" };

/**
 * Sends a custom event from the browser. The only caller of `posthog.capture`.
 * While the user is opted out, PostHog drops the event itself, so there is no
 * consent check here. Never throws: analytics must not break the app.
 */
export function trackClient(event: AnalyticsEvent) {
  const { name, ...properties } = event;
  try {
    posthog.capture(name, properties);
  } catch (error) {
    console.error("Could not send analytics event:", error);
  }
}
