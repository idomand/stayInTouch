# PostHog lessons — progress log

A step-by-step learning path for adding PostHog (analytics, feature flags, A/B tests) to this app. The full requirements are in `specs/posthog.md`; this file tracks **where we are** and **what we decided**, so a new session can continue.

**How we work:** each lesson is Concept → You do → Claude checks → Done when. The user writes the code (Claude guides and reviews), except where the user asks Claude to write it. The user commits after each code lesson.

**Branch:** `feat/posthog-analytics` (pushed). **PostHog project:** `stay-in-touch`, EU Cloud, id 332815. The PostHog MCP (claude.ai connector) is set up and works.

## Where we stopped (2026-11-13)

- **Done:** Lessons 0, 1, 2, 3, 4a, 4b (tests 1–4 and 6 pass; test 5 waits for 4c).
- **Next:** Lesson 4c — the settings selector, then run test 5 from 4b.
- Last commit: `8b6a8a4 feat(analytics): store analytics consent in a cookie and start PostHog from it` (4b not committed yet).

## Decisions made

| Topic                   | Decision                                                                                          | Why                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev vs prod data        | One PostHog project; test-account filter `$host is_not localhost:3000`, on by default             | Simpler than two projects                                                                                                                                                                                        |
| Proxy path              | `/friendship` (not `/ingest`)                                                                     | Ad blockers know `/ingest`, `/analytics`, `/posthog`                                                                                                                                                             |
| Proxy hosts             | Main rule uses `NEXT_PUBLIC_POSTHOG_HOST`; asset rules hard-code `eu-assets.i.posthog.com`        | One source for the region; assets host has no env var                                                                                                                                                            |
| `defaults`              | `"2026-08-30"`, pinned (not `"latest"`)                                                           | An `npm update` cannot change behaviour silently; marks localhost as test user                                                                                                                                   |
| Autocapture             | On, with `mask_all_text: true`                                                                    | Keep clicks/heatmaps; never send friend names (third-party personal data)                                                                                                                                        |
| `cookieless_mode`       | Not used                                                                                          | Decline must mean no tracking; Vercel Analytics already counts cookieless page views                                                                                                                             |
| `/flags` before consent | Kept for now (the SDK asks for flags even when opted out)                                         | User's choice. Privacy text (Lesson 12) must not promise "nothing is sent" before consent. Fix if wanted: `advanced_disable_feature_flags_on_first_load: !hasConsent` + `posthog.reloadFeatureFlags()` on accept |
| Consent storage         | Cookie `analyticsConsent=granted\|denied`, 1 year, written with `document.cookie`                 | The server must read it in Lesson 7                                                                                                                                                                              |
| Banner first paint      | `app/layout.tsx` reads the cookie and passes `initialConsent`; it is the `getServerSnapshot`      | No flash for returning visitors, no delay for new ones. Pages are dynamic already (i18n reads cookies)                                                                                                           |
| PostHog opt-in flag     | `opt_out_capturing_persistence_type: "cookie"`                                                    | In localStorage (default) it survived "clear cookies" and PostHog kept tracking while the banner asked again (test 6 failed). Residual: deleting only `analyticsConsent` by hand still leaves PostHog's flag     |
| Banner buttons          | Accept and Decline use the same `Button` variant                                                  | A weaker Decline is a dark pattern; EU regulators treat it as invalid consent                                                                                                                                    |
| Change notification     | Publish/subscribe (observer) pattern + `useSyncExternalStore`, copied from `lib/confettiStyle.ts` | Same pattern already in the repo. No shared helper yet (only 2 copies); extract `createChangeNotifier()` when a third appears                                                                                    |

## What is built

- `next.config.js` — fail-fast checks for `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST`; `/friendship` rewrites; `skipTrailingSlashRedirect`.
- `instrumentation-client.ts` — `posthog.init` via `/friendship`. Reads consent first: `granted` → capture on + `localStorage+cookie`; otherwise opted out + `memory`.
- `lib/analytics/analyticsConsentCookie.ts` — plain module (server + browser): cookie name, `ANALYTICS_CONSENT_VALUES`, `AnalyticsConsent`, `isAnalyticsConsent`. Lesson 7's "shared file" step is done.
- `Components/layout/AnalyticsConsentBanner.tsx` — fixed bottom banner, rendered in `app/layout.tsx`; i18n section `analyticsConsentBanner`.
- `lib/analytics/analyticsConsent.ts` (browser only) — `readAnalyticsConsent()`, `saveAnalyticsConsent(choice)` (writes cookie, turns PostHog on/off, notifies), `subscribeAnalyticsConsent()`, exports `AnalyticsConsent` and `ANALYTICS_CONSENT_VALUES`.

## Lessons learned (gotchas)

- **Restart `npm run dev`** after changing `instrumentation-client.ts` or `next.config.js`. Hot reload does not pick them up; the browser ran the old file.
- With `debug: true`, the console shows `[PostHog.js]` lines. `Persistence loaded memory` = no consent; `was not captured because capturing is disabled` = opted out. The `file:line` shows which version of the code ran.
- Event requests are `POST /friendship/i/v0/e/`. `/flags`, `config.js` and `static/*.js` are not events.
- PostHog sends events in batches every few seconds; wait, or navigate, before checking Network.
- `ph_debug` in localStorage comes from `debug: true` (development only).
- Git `core.autocrlf=true` makes Prettier warn on CRLF files like `package.json`; the committed content is fine.

## Remaining lessons

### Lesson 4b — Consent banner (next)

`Components/layout/ConsentBanner.tsx` (`"use client"`), rendered in `app/layout.tsx` next to `<Analytics />`. Shows when `readAnalyticsConsent()` is `null`; **Accept** and **Decline** equally prominent (`Components/ui/Button`); short text + link to `/privacy`. Uses `useSyncExternalStore(subscribeAnalyticsConsent, readAnalyticsConsent, getServerSnapshot)`. i18n keys `consentBanner.*` in `en.json` and `de.json`.

- **Open design question:** what `getServerSnapshot` returns. "No answer" → banner flashes for returning users. "Answered" → banner appears a moment late for new users. Third option: the server reads the cookie in `app/layout.tsx` and passes it as a prop.
- **Tests to run with the banner:**
  - Accept then Decline in the same tab: is the `ph_..._posthog` cookie removed and not written again? If not, add a `set_config` line on decline.
  - After Accept, PostHog stores its own `__ph_opt_in_out_<key>` in localStorage. If the user clears cookies only, does PostHog keep tracking? If yes, add `opt_out_capturing_persistence_type: "cookie"`.

### Lesson 4c — Settings selector

`Components/settings/AnalyticsConsentSelector.tsx`, modelled on `ConfettiStyleSelector`, on `/settings`. i18n keys in `settings`.

### Lesson 5 — First custom event

`lib/analytics.ts` with a typed `AnalyticsEvent` union and `trackClient()` (wraps `posthog.capture`, catches errors). Only `demo_started` in `app/demo/page.tsx`. Then build the first trend insight in the PostHog UI.

### Lesson 6 — Identity and auth events

`posthog.identify(uid)` after `establishSession()`, no person properties. `reset()` on logout and account delete. `sign_up` / `login` events in `lib/AuthContext.tsx`.

- **`posthog.reset()` also clears the consent flag.** With `opt_out_capturing_by_default`, a `reset()` on logout silently stops capturing for a user who accepted. Do `reset()` first, then `opt_in_capturing()` again if the cookie says `granted`.
- **Call `identify` only when consent is `granted`.** In memory mode each page load mints a new id, and identify would merge them all onto the person (PostHog warns about this). On accept while signed in, call `identify` then.

### Lesson 7 — Server events

`lib/analyticsServer.ts` (`server-only`, `posthog-node`, inside `after()`), only when the request's `analyticsConsent` cookie is `granted`. Calls in the Server Actions listed in spec requirement 6; not from `lib/contacts/core.ts`.

- The server cannot import `lib/analytics/analyticsConsent.ts` (it imports `posthog-js`). Move the cookie name and values to a small shared file both can import.

### Lesson 8 — Insights and a dashboard (PostHog UI)

Funnel visit → `sign_up` → `contact_added` → `talk_marked`; retention on `talk_marked`; web analytics; dashboard "Core funnel". Then ask the same through the MCP.

### Lesson 9 — Feature flags

`PostHogProvider` around the app; one harmless boolean flag; read it with a hook; override it for yourself.

### Lesson 10 — A/B test `welcome-cta`

Variants on `/welcome` (spec requirement 7); experiment in PostHog, 50/50, at least 2 weeks, no early stop. Low traffic: for learning, not a reliable result.

### Lesson 11 — Free extras (pick any)

Error tracking (already on), session replay (consent-gated, mask inputs), heatmaps (autocapture is on), a survey. Each needs a privacy-text line.

### Lesson 12 — Privacy text and docs

`privacy.*` keys in both languages (mention the `/flags` request before consent), fix `welcome.privacyNote` ("No tracking" is no longer true after Accept), the banner text has no purpose (user's choice; GDPR wants informed consent, so the privacy page must state the purpose), `CLAUDE.md` Analytics section, a note in `specs/architecture.md`, update `specs/posthog.md` (`/ingest` → `/friendship`, status).

## Before merging the branch

- Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to Vercel (Production and Preview). The fail-fast check in `next.config.js` fails the build without them.
