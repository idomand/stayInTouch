# PostHog lessons — progress log

A step-by-step learning path for adding PostHog (analytics, feature flags, A/B tests) to this app. The full requirements are in `specs/posthog.md`; this file tracks **where we are** and **what we decided**, so a new session can continue.

**How we work:** each lesson is Concept → You do → Claude checks → Done when. The user writes the code (Claude guides and reviews), except where the user asks Claude to write it. The user commits after each code lesson.

**Branch:** `feat/posthog-analytics` (pushed). **PostHog project:** `stay-in-touch`, EU Cloud, id 332815. The PostHog MCP (claude.ai connector) is set up and works.

## Where we stopped (2026-11-15)

- **Done:** Lessons 0–5. Lesson 5: `trackClient()` in `lib/analytics/trackEvent.ts`, `demo_started` in `app/demo/page.tsx`, saved trend insight "Demo starts" (unique users, daily).
- **Next:** Lesson 6 — identity and auth events.
- Last commit: `e336912 feat(analytics): add typed trackClient and send demo_started`.

## Decisions made

| Topic                      | Decision                                                                                          | Why                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev vs prod data           | One PostHog project; test-account filter `$host is_not localhost:3000`, on by default             | Simpler than two projects                                                                                                                                                                                        |
| Proxy path                 | `/friendship` (not `/ingest`)                                                                     | Ad blockers know `/ingest`, `/analytics`, `/posthog`                                                                                                                                                             |
| Proxy hosts                | Main rule uses `NEXT_PUBLIC_POSTHOG_HOST`; asset rules hard-code `eu-assets.i.posthog.com`        | One source for the region; assets host has no env var                                                                                                                                                            |
| `defaults`                 | `"2026-08-30"`, pinned (not `"latest"`)                                                           | An `npm update` cannot change behaviour silently; marks localhost as test user                                                                                                                                   |
| Autocapture                | On, with `mask_all_text: true`                                                                    | Keep clicks/heatmaps; never send friend names (third-party personal data)                                                                                                                                        |
| `cookieless_mode`          | Not used                                                                                          | Decline must mean no tracking; Vercel Analytics already counts cookieless page views                                                                                                                             |
| `/flags` before consent    | Kept for now (the SDK asks for flags even when opted out)                                         | User's choice. Privacy text (Lesson 12) must not promise "nothing is sent" before consent. Fix if wanted: `advanced_disable_feature_flags_on_first_load: !hasConsent` + `posthog.reloadFeatureFlags()` on accept |
| Consent storage            | Cookie `analyticsConsent=granted\|denied`, 1 year, written with `document.cookie`                 | The server must read it in Lesson 7                                                                                                                                                                              |
| Banner first paint         | `app/layout.tsx` reads the cookie and passes `initialConsent`; it is the `getServerSnapshot`      | No flash for returning visitors, no delay for new ones. Pages are dynamic already (i18n reads cookies)                                                                                                           |
| PostHog opt-in flag        | `opt_out_capturing_persistence_type: "cookie"`                                                    | In localStorage (default) it survived "clear cookies" and PostHog kept tracking while the banner asked again (test 6 failed). Residual: deleting only `analyticsConsent` by hand still leaves PostHog's flag     |
| PostHog storage on decline | `opt_out_persistence_by_default: true`; no `persistence` switch in our code                       | Without it, Decline stopped events but left `ph_<key>_posthog` and `_cpm` cookies (with the id). With it, PostHog removes its storage on opt-out and restores it on opt-in                                       |
| Banner buttons             | Accept and Decline use the same `Button` variant                                                  | A weaker Decline is a dark pattern; EU regulators treat it as invalid consent                                                                                                                                    |
| Change notification        | Publish/subscribe (observer) pattern + `useSyncExternalStore`, copied from `lib/confettiStyle.ts` | Same pattern already in the repo. No shared helper yet (only 2 copies); extract `createChangeNotifier()` when a third appears                                                                                    |

## What is built

- `next.config.js` — fail-fast checks for `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST`; `/friendship` rewrites; `skipTrailingSlashRedirect`.
- `instrumentation-client.ts` — `posthog.init` via `/friendship`. Reads consent first: `granted` → capture on; otherwise opted out. `opt_out_persistence_by_default: true` makes PostHog remove and stop writing its storage while opted out, so there is no `persistence` switch in our code.
- `Components/settings/AnalyticsConsentSelector.tsx` — on `/settings` for everyone (not only signed-in users); server reads the cookie for `initialConsent`; nothing checked when there is no answer.
- `lib/analytics/analyticsConsentCookie.ts` — plain module (server + browser): cookie name, `ANALYTICS_CONSENT_VALUES`, `AnalyticsConsent`, `isAnalyticsConsent`. Lesson 7's "shared file" step is done.
- `Components/layout/AnalyticsConsentBanner.tsx` — fixed bottom banner, rendered in `app/layout.tsx`; i18n section `analyticsConsentBanner`.
- `lib/analytics/analyticsConsent.ts` (browser only) — `readAnalyticsConsent()`, `saveAnalyticsConsent(choice)` (writes cookie, turns PostHog on/off, notifies), `subscribeAnalyticsConsent()`, exports `AnalyticsConsent` and `ANALYTICS_CONSENT_VALUES`.

## Lessons learned (gotchas)

- **Restart `npm run dev`** after changing `instrumentation-client.ts` or `next.config.js`. Hot reload does not pick them up; the browser ran the old file.
- With `debug: true`, the console shows `[PostHog.js]` lines. `was not captured because capturing is disabled` = opted out. The `file:line` shows which version of the code ran.
- Event requests are `POST /friendship/i/v0/e/`. `/flags`, `config.js` and `static/*.js` are not events.
- PostHog sends events in batches every few seconds; wait, or navigate, before checking Network.
- `ph_debug` in localStorage comes from `debug: true` (development only).
- Git `core.autocrlf=true` makes Prettier warn on CRLF files like `package.json`; the committed content is fine.
- `reactStrictMode: true` runs effects twice in dev, so a `useEffect` event is sent twice locally (28 `demo_started` from 2 users on 2026-11-13). Production sends it once. Read dev counts as "it arrives", not as numbers.
- An insight shows 0 for local data because the test-account filter hides `localhost:3000`. Turn the filter off to check dev events.
- Page-load events (`demo_started`) count every reload: use **Unique users**, not Total count.

## Remaining lessons

### Lesson 6 — Identity and auth events (next)

`posthog.identify(uid)` after `establishSession()`, no person properties. `reset()` on logout and account delete. `sign_up` / `login` events in `lib/AuthContext.tsx`.

- **`posthog.reset()` also clears the consent flag** (confirmed in posthog-js 1.447.3 source, `_reset` → `consent.reset()`). With `opt_out_capturing_by_default`, a `reset()` on logout silently stops capturing for a user who accepted. `resetAnalyticsUser()` in `lib/analytics/identity.ts` does `reset()`, then `opt_in_capturing({ captureEventName: null })` if the cookie says `granted` (null: no fake `$opt_in` event).
- **6a built (2026-11-15):** `identifyUser` / `resetAnalyticsUser` in `lib/analytics/identity.ts`. One effect in `AuthProvider` identifies on `consent === "granted" && hasSession && uid`, covering both orders. `finishSignOut()` resets (logout and account delete). Consent banner moved to `fixed top-1/3`. **Next: 6b** — `sign_up` / `login` events.
- **Call `identify` only when consent is `granted`.** While opted out nothing is stored, so each page load mints a new id, and identify would merge them all onto the person (PostHog warns about this). On accept while signed in, call `identify` then.

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
