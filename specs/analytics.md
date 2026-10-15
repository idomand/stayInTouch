# Spec for analytics (Vercel Web Analytics)

## Summary

Add analytics so we can see how people use the app: which pages they visit, where they come from, and how often they sign up and use the core features.

We use **Vercel Web Analytics**, not Google Analytics (GA4). The app already runs on Vercel, and Vercel Analytics sets no cookies and stores no personal data, so **no cookie banner is needed**, even for EU (German) users. GA4 would need an opt-in consent banner (GDPR and the German TDDDG), Google Consent Mode v2, and a Firebase/GA property.

Build this on its own branch, e.g. `feat/vercel-analytics`.

### Firebase console

No work needed. Vercel Analytics does not use Firebase. Leave Google Analytics **disabled** in Firebase → Project settings → Integrations, and do not add a `measurementId` to `lib/Firebase.ts`.

### Vercel dashboard (manual)

The Vercel MCP cannot do these steps. `update_project` has no Web Analytics setting, and the analytics API returns `403 forbidden` for scope `idomands-projects`. The Vercel CLI is not installed.

1. Vercel dashboard → project `stay-in-touch` → **Analytics** tab → **Enable** Web Analytics. The next production deploy starts collecting data.
2. On the same tab, check the plan limits. **Custom events (sign-ups, core actions) may need the Pro plan.** On Hobby we may get page views only.
3. Optional: enable **Speed Insights** (Core Web Vitals). This is not part of this spec.

## Functional Requirements

1. **Package.** Install `@vercel/analytics` with an exact version.
2. **Page views.** In `app/layout.tsx`, render `<Analytics />` from `@vercel/analytics/next` next to `<ServiceWorkerRegistration />`.
3. **One typed source of truth for events.** Add a new `lib/analytics.ts` with a union type, so no caller can send free-form data:

   ```ts
   type AnalyticsEvent =
     | { name: "sign_up"; method: "google" | "email" }
     | { name: "login"; method: "google" | "email" }
     | { name: "contact_added" }
     | { name: "talk_marked"; shared: boolean }
     | { name: "talk_event_added" }
     | { name: "link_request_sent" }
     | { name: "link_accepted" }
     | { name: "account_deleted" };
   ```

   Add two thin wrappers:
   - `trackClient(event)`, which wraps `track` from `@vercel/analytics`.
   - `trackServer(event)`, which wraps `track` from `@vercel/analytics/server`, in a `server-only` file (e.g. `lib/analyticsServer.ts`).

   Both catch errors and log them with `console.error`. Analytics must never break an action.

4. **Auth events (client)** in `lib/AuthContext.tsx`:
   - `loginWithGoogle`: use `getAdditionalUserInfo(credential)?.isNewUser` to send `sign_up` or `login`, with method `google`.
   - `signUpWithEmail`: send `sign_up`, method `email`.
   - `signInWithEmail`: send `login`, method `email`, after `establishSession` succeeds.
5. **Core action events (server).** Call `trackServer` only on the success path, after the transaction commits:
   - `addContact`, `markAsTalked`, `addTalkEvent` in `lib/actions/contacts.ts`
   - `sendLinkRequest`, `acceptLinkRequest` in `lib/actions/links.ts`
   - `deleteAccount` in `lib/actions/account.ts`

   We track these on the server because the event then fires only on a real success, and ad blockers cannot drop it.

6. **Privacy text.** `/privacy` now says "no analytics … no third-party tracking of any kind" (`privacy.noTracking` in `i18n/en.json` and `i18n/de.json`). That becomes false. Rewrite `privacy.noTrackingTitle` and `privacy.noTracking` in both languages. Proposed English:
   - Title: "Analytics"
   - Text: "We use Vercel Web Analytics to count page visits and a few anonymous actions (like 'contact added'). It uses no cookies, does not track you across sites, and never receives your name, email, contacts or notes."

   Also add Vercel Web Analytics to `privacy.providers`.

7. **Docs.** Add a short "Analytics" section to `CLAUDE.md`: events go only through the helpers in `lib/analytics.ts`, and events never carry personal data. Add a note to `specs/architecture.md`.

No change is needed in `public/sw.js`. The analytics script and beacons live under `/_vercel/insights/`, and the beacons are POSTs, which the worker does not intercept.

## Possible Edge Cases

- **Ad blockers** can block the client script. Page views and client events (sign-up, login) will be under-counted. Server events still arrive.
- **Preview and local deploys** do not count. Analytics reports production only. Locally, `<Analytics />` only logs in debug mode.
- **A failed analytics call** must never fail or slow down a user action. The wrappers catch every error.
- **Google sign-in can be a sign-up.** Use `isNewUser` to tell them apart, or new Google users count as logins.
- **Email sign-up before verification.** `sign_up` fires when the account is created, not when the email is verified. Some sign-ups will never verify. That is fine, but read the numbers with this in mind.
- **No personal data in events.** No names, emails, contact ids, note text or uids. The union type is the guard. Never widen it to `Record<string, string>`.

## Acceptance Criteria

- Web Analytics is enabled in the Vercel dashboard, and production page views appear there.
- Each event in the union fires once per successful action, and never on a failed one.
- No event property contains personal data.
- `/privacy` in English and German describes the analytics correctly.
- No cookie is set by analytics (check DevTools → Application → Cookies).
- `npm run type-check`, Prettier on touched files, `npm run lint` and `npm run build` all pass.

## Open Questions

- Are custom events available on our Vercel plan (Hobby), or only page views? Check in the dashboard before building step 5.
- Should the Vercel MCP be re-authorized with analytics access, so Claude can query page views and events?
- Should we also build the database stats below?
- Should we track PWA installs (`appinstalled` browser event → a `pwa_installed` event)?

### Product metrics from the database (possible follow-up)

Most useful product numbers are already in Postgres and need **no tracking at all**. A few SQL queries, or a small admin-only stats page, could show:

- **Activation:** % of new users who add a first contact, then mark a first talk, within 7 days.
- **Retention:** weekly active users (users with a `talk_events` row in the last 7 days).
- **Health:** average contacts per user; % of contacts overdue.
- **Linking adoption:** link requests sent vs accepted.
- **Invite email → sign-up:** add `?utm_source=invite_email` to the link in `lib/email/sendLinkInviteEmail.ts`. Vercel Analytics shows UTM sources at no extra cost.

## Verification

There is no test framework in this repo, so verify by hand:

1. `npm run type-check`, Prettier on touched files, `npm run lint`, `npm run build`.
2. `npm run dev` and open the browser console. `<Analytics />` logs `[Vercel Web Analytics]` page views in debug mode. Client events log too.
3. After deploy: Vercel → Analytics shows page views within minutes. Sign up, add a contact and mark a talk, then check the **Events** panel (if the plan includes it).
4. Check `/privacy` in English and German.
