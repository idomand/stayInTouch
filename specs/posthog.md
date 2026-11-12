# Spec for PostHog (product analytics, consent, A/B tests)

## Status

- **Planned.** Branch `feat/posthog-analytics`.
- Takes over requirements 3–5 of `specs/analytics.md` (typed events, auth events, server events). Vercel Web Analytics stays for page views for now.
- Background on the ideas (funnels, activation, experiments): `specs/product-growth-engineering.md`.

## Summary

Add PostHog so we can track the core funnel (visit → sign-up → first contact → first talk), see retention, and run A/B tests with feature flags.

PostHog stores an id on the device, so under TDDDG/GDPR it needs **consent**. PostHog runs fully only after the user clicks **Accept** in a consent banner. Before that, and after **Decline**, nothing is captured and nothing is stored on the device except the choice itself.

Data goes to **PostHog EU Cloud**, through a reverse proxy on our own domain (`/ingest`), so ad blockers drop fewer events.

### PostHog dashboard (manual)

1. Sign up at posthog.com, choose **EU Cloud**, create a project `stay-in-touch`.
2. Project settings → note the **project API key** (starts `phc_`). It is public by design (it goes into the browser), not a secret.
3. Project settings → turn **off** "Autocapture" for now (we track named events only), and leave **session replay off** (follow-up).
4. For each environment, add to Vercel env (Production and Preview) and `.env.local`:
   - `NEXT_PUBLIC_POSTHOG_KEY` = `<PROJECT_API_KEY>`
   - `NEXT_PUBLIC_POSTHOG_HOST` = `https://eu.i.posthog.com`

### Setup with the wizard

The user runs `npx -y @posthog/wizard@latest` in their own terminal (it needs a browser login), on this branch, choosing EU. Then we review `git diff`:

- **Keep:** the `posthog-js` (and `posthog-node`) packages, `instrumentation-client.ts`, the `/ingest` rewrites and `skipTrailingSlashRedirect` in `next.config.js`, the env vars.
- **Change:** pin exact versions; merge the rewrites with the existing Firebase `/__/auth` rewrite; replace the wizard's `posthog.init` options with the ones in requirement 2.
- **Revert:** any `posthog.capture` or `posthog.identify` call the wizard added in app code. Events go only through requirement 4.

## Functional Requirements

1. **Config fails fast.** `next.config.js` throws if `NEXT_PUBLIC_POSTHOG_KEY` or `NEXT_PUBLIC_POSTHOG_HOST` is missing, like `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
2. **Init with capture off.** In `instrumentation-client.ts`:
   - `api_host: "/ingest"`, `ui_host: "https://eu.posthog.com"`
   - `opt_out_capturing_by_default: true`, `persistence: "memory"` (nothing on the device)
   - `person_profiles: "identified_only"`
   - App Router page views: `capture_pageview: "history_change"` (or the wizard's `defaults` value)
   - If the `analyticsConsent` cookie is already `granted`, opt in at start.
   - Check these option names against the current posthog-js docs when building.
3. **Consent.**
   - The choice is a first-party cookie `analyticsConsent=granted|denied` (1 year, `SameSite=Lax`, not httpOnly). It is strictly necessary, so it needs no consent. A cookie, not localStorage, so the server can read it (requirement 6).
   - One small module (e.g. `lib/analyticsConsent.ts`) reads and writes the cookie and calls PostHog: accept → `opt_in_capturing()` + `set_config({ persistence: "localStorage+cookie" })`; decline → `opt_out_capturing()` + `reset()`.
   - `Components/layout/ConsentBanner.tsx` (`"use client"`), rendered in `app/layout.tsx` next to `<Analytics />`. Shown on every page until a choice is made, `/demo` included. **Accept** and **Decline** are equally prominent (`Components/ui/Button`). Short text with a link to `/privacy`.
   - `/settings`: `Components/settings/AnalyticsConsentSelector.tsx` to change the choice at any time, like `TalkEffectSelector`.
   - Text in `i18n/en.json` and `i18n/de.json` (`consentBanner`, plus keys in `settings`).
4. **Typed client events.** `lib/analytics.ts`:

   ```ts
   type AnalyticsEvent =
     | { name: "sign_up"; method: "google" | "email" }
     | { name: "login"; method: "google" | "email" }
     | { name: "demo_started" }
     | { name: "contact_added" }
     | { name: "talk_marked"; shared: boolean }
     | { name: "talk_event_added" }
     | { name: "link_request_sent" }
     | { name: "link_accepted" }
     | { name: "account_deleted" };
   ```

   `trackClient(event)` wraps `posthog.capture`, and catches and logs errors with `console.error`. It is a no-op while opted out (PostHog does that).

5. **Identity** in `lib/AuthContext.tsx`:
   - After `establishSession()` succeeds: `posthog.identify(uid)`, with **no** person properties (no email, no name).
   - `logout` and `deleteAccount`: `posthog.reset()` after the event.
   - `loginWithGoogle`: `getAdditionalUserInfo(credential)?.isNewUser` → `sign_up` or `login`, method `google`. `signUpWithEmail` → `sign_up` (email). `signInWithEmail` → `login` (email), after `establishSession` succeeds.
   - `app/demo/page.tsx`: `demo_started` once on mount.
   - `account_deleted`: client side, before `reset()`.
6. **Server events.** `lib/analyticsServer.ts` (`server-only`):
   - `trackServer(uid, event)` uses `posthog-node` with `flushAt: 1`, inside `after()`, then `await client.shutdown()`. It never slows or fails the action; all errors are caught.
   - Sends only when the request's `analyticsConsent` cookie is `granted`.
   - Called only on the success path, after the transaction: `addContact`, `markAsTalked` (not on the same-day no-op), `addTalkEvent` in `lib/actions/contacts.ts`; `sendLinkRequest`, `acceptLinkRequest` in `lib/actions/links.ts`.
   - **Not** from `lib/contacts/core.ts`: MCP calls have no consent cookie, so MCP actions are not tracked.
   - `talk_marked.shared` needs `insertSharedTalkEvent` to return whether it wrote the linked row.
7. **First experiment: `welcome-cta`.**
   - `PostHogProvider` from `posthog-js/react` wraps the app (client = the initialised `posthog`), so components can use `useFeatureFlagVariantKey`.
   - `app/welcome/page.tsx` (or a small client component inside it): variant `control` = current buttons (`/login` primary); variant `test` = "Try the demo" primary. Not loaded or no consent → control.
   - Hypothesis: _Because many `/welcome` visitors leave without clicking, we believe making "Try the demo" the main button will raise sign-ups. Primary metric: `sign_up`. Secondary: `demo_started`. Guardrail: activation (`contact_added` within 7 days)._
   - Created in PostHog → Experiments, 50/50 split, run at least 2 full weeks, no early stop.
8. **Privacy text.** Rewrite `privacy.noTrackingTitle`, `privacy.noTracking` and `privacy.providers` in both languages: PostHog (EU), only with consent, which actions are counted, never names, emails, contacts or notes; how to change the choice on `/settings`.
9. **Docs.** `CLAUDE.md` Analytics section: PostHog with consent; events only through `lib/analytics.ts` / `lib/analyticsServer.ts`; the distinct id is the Firebase uid; event properties never carry personal data. Short note in `specs/architecture.md`.

No change is needed in `public/sw.js`: it ignores POSTs and only caches `/_next/static/*`.

## Possible Edge Cases

- **No consent yet.** Flags may not load → everyone sees control. Only consented users count in the experiment. Results are biased toward people who accept analytics.
- **Consent given after sign-in.** Call `identify(uid)` on accept if a user is signed in, or the session stays anonymous.
- **Two users on one device.** `reset()` on logout keeps them apart.
- **Decline after accept.** `opt_out_capturing()` + `reset()` stops capture and clears the stored PostHog id.
- **Ad blockers.** The `/ingest` proxy helps; some events still drop. Server events are not affected.
- **Flicker** on `/welcome` while flags load. Accepted for the first test; server-side bootstrap is a follow-up.
- **Low traffic.** The experiment will likely not reach significance. It is for learning the tools.
- **Email sign-up before verification.** `sign_up` fires at account creation; some never verify.
- **Local dev events** go to the same project. Use a separate PostHog project for dev, or filter by host.

## Acceptance Criteria

- Before a choice, and after Decline: no capture requests to `/ingest`, and no `ph_*` cookie or localStorage key.
- After Accept: page views and the events above arrive in PostHog Activity, once per successful action, never on a failed one.
- A signed-in user's person in PostHog has the uid as id and no email or name.
- The choice can be changed on `/settings`; the banner does not show again after a choice.
- Overriding `welcome-cta` for yourself in PostHog shows the test variant.
- `/privacy`, the banner and the settings text are correct in English and German.
- Prettier on touched files, `npm run type-check`, `npm run lint` and `npm run build` pass.

## Open Questions

- Separate PostHog project for dev and preview, or one project filtered by host?
- GDPR erasure: delete the PostHog person on account deletion? Needs a PostHog personal API key (a secret) on the server.
- Remove Vercel Web Analytics once PostHog numbers look right?

## Testing Guidelines

There is no test framework in this repo, so verify by hand (see Acceptance Criteria) with DevTools → Network and Application, and PostHog → Activity.
