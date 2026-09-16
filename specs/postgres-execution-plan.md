# Postgres Migration — Execution Plan

The ordered task list for moving this app off Firebase and onto Neon Postgres.

The **what** and **why** live in `specs/firestore-to-postgres.md`. This file is
the **how** and the **in what order**. Read the other document first.

## Ground rules

- **No live data.** The database starts empty. There is no import step, no
  identity bridge, no dual-write and no parallel run.
- **Breaking changes are free** while the schema is moving. Prefer `drizzle-kit
  push` and dropping the database over writing careful migrations. Switch to
  generated migration files at Phase 6, when the app is real.
- **The gate is `npm run type-check` plus `npm run build`.** There is no test
  framework and no working lint in this repo. A `pre-push` hook runs
  `tsc --noEmit` and aborts on any error. Note `noUnusedLocals` and
  `noUnusedParameters` are on, so an unused import is a hard error.
- **One phase, one branch, one or more commits.** Each phase ends with a working
  app. Do not start a phase before the previous one builds and runs.
- **Secrets are never committed.** Add every new variable to `.env.local` and to
  the Vercel project settings, and document only the *name* here.

## Hosting constraints — verified

Route Handlers, Server Actions, Server Components and a Neon connection all work
on the **Vercel Hobby** free plan. Three things to plan around:

- **Hobby is non-commercial only.** A portfolio project qualifies. No ads, no
  payments.
- **Preview deployments get a new URL per deployment**, and Google OAuth rejects
  unregistered callback URLs. Solved by the wildcard preview subdomain in
  Phase 0.1.
- **Neon free tier:** 0.5 GB storage and 100 CU-hrs/month per project, scale to
  zero. Far beyond what this app needs — it stores text rows. Cold starts after
  idle are the accepted trade.

The domain `stay-in-touch.vip` is already owned, so the only cost is its annual
renewal. Everything else — Vercel Hobby, Neon free, Resend free — is $0.

## Phase overview

| Phase | Goal | App still works on Firebase? |
| --- | --- | --- |
| 0 | Close open decisions | yes |
| 0.1 | Domain, DNS and email verified | yes |
| 1 | Neon + Drizzle connected | yes |
| 2A | Better Auth works as an API | yes, no UI change |
| 2B | Auth screens; Firebase Auth gone from the client | auth switched, data still Firestore |
| 3 | Tables exist | yes |
| 4 | Data layer on Postgres | switched, feature by feature |
| 5 | Firebase deleted | no — fully on Postgres |
| 6 | Real migrations + hardening | — |
| 7 | Linked users | — |

---

## Phase 0 — Close the open decisions

No code.

### Answered

- [x] **Dummy data — dropped.** `addDummyData` and the three sample contacts are
      deleted, not ported. New accounts start empty, so the empty state becomes a
      real UI case to design.
- [x] **Not Google-only.** Email and password must work from the start. This
      replaced Auth.js with **Better Auth** — see Round 5 in the design doc for
      why Auth.js cannot do credentials properly.
- [x] **Neon free tier confirmed.** 0.5 GB storage and 100 CU-hrs per month per
      project, scale to zero. Far more than this app needs; compute hours are the
      only real limit and idle costs nothing.

- [x] **Google stays as a second provider**, alongside email/password.

- [x] **Domain: `stay-in-touch.vip`, already owned.** This unblocks **Resend**
      (3,000 emails/month, 100/day) as the email provider, gives the app a real
      production URL instead of `*.vercel.app`, and — see Phase 0.1 — also solves
      the Google OAuth preview-URL problem. Brevo is no longer needed.

### Still open — these block Phase 2

- [ ] **Check whether a real build still emits `public/sw.js`.** `next-pwa` is
      pinned at `5.6.0`, a webpack plugin for Next 12, while `next.config.js`
      enables Turbopack. Run a build and look. The answer decides whether the
      service-worker work in Phase 2B is real or moot.

**Done when:** that is answered, and Phase 0.1 below is finished.

---

## Phase 0.1 — Wire up `stay-in-touch.vip`

Do this first. DNS propagation and Resend's domain review can each take hours to
a day, and both block Phase 2A.

### Decide where DNS lives

Everything below is DNS records on one domain. Pick one home for them:

- **Vercel nameservers** — Vercel manages DNS, and Resend's records get added in
  Vercel's DNS panel. Fewest places to look.
- **Registrar nameservers** — you add both Vercel's site records and Resend's
  email records at the registrar.

Either works. They coexist: Vercel's records point the *website*, Resend's point
*email*. They do not conflict.

### Vercel

- [ ] Add `stay-in-touch.vip` as a domain on the Vercel project and follow the
      records Vercel shows. Do not copy an IP from any document — use what the
      dashboard gives you.
- [ ] Decide apex vs `www` and redirect one to the other. Pick one canonical
      host; `BETTER_AUTH_URL` and the OAuth callbacks must match it exactly.
- [ ] **Add a wildcard preview domain** — e.g. `*.preview.stay-in-touch.vip` —
      and assign it to preview deployments. This is what makes preview sign-in
      possible: Google can then have one stable registered callback instead of a
      new unregistered URL per deployment.

### Resend

- [ ] Create the Resend account and add the domain.
- [ ] **Send from a subdomain, not the apex** — e.g. `send.stay-in-touch.vip`.
      This keeps the sending reputation separate from the website's domain, so a
      bad email run cannot hurt the site. Resend recommends it.
- [ ] Add the DKIM `TXT` and return-path `MX` records Resend generates.
- [ ] Add an `SPF` record, and a `DMARC` record at `_dmarc.stay-in-touch.vip`
      (start at `p=none` to observe before enforcing).
- [ ] Send a test email to a Gmail address **and** an Outlook address. Check the
      spam folder in both, not just the inbox.

**Deliverability note, honestly:** `.vip` is a newer, cheap TLD, and some spam
filters weight those more suspiciously than a `.com`. Correct SPF, DKIM and
DMARC matter more here than they would on an old domain. This is not a blocker
and it is not a reason to buy a second domain — but if verification emails land
in spam during testing, this is the first thing to suspect, not a bug in the
code.

### Application config

- [ ] `BETTER_AUTH_URL` per environment — `http://localhost:3000` locally,
      `https://stay-in-touch.vip` in production. One hardcoded value breaks one
      of the two.
- [ ] Add `metadataBase: new URL("https://stay-in-touch.vip")` to the `metadata`
      export in `app/layout.tsx`. It has none today, which is harmless while the
      app has no absolute URLs but starts to matter once emails link back in.
- [ ] `public/manifest.json` needs no change — its `start_url`, `scope` and
      icon paths are all relative. Verified.

**Done when:** the site loads over HTTPS on `stay-in-touch.vip`, Resend shows
the domain verified, and a test email reaches a real inbox.

---

## Phase 1 — Neon and Drizzle

Goal: the app can run one SQL query. Nothing else changes.

Branch: `feat/postgres-setup`

- [ ] Create a Neon project. Copy the **pooled** connection string, not the
      direct one — Vercel serverless functions will exhaust a normal pool.
- [ ] Add `DATABASE_URL` to `.env.local` and to Vercel. `.env.local` is already
      in `.gitignore` — confirmed.
- [ ] `npm i drizzle-orm @neondatabase/serverless ws` and
      `npm i -D drizzle-kit @types/ws`.
- [ ] Create `lib/db/index.ts` — **one** shared client, exported once. Every
      query in the app goes through it. Do not create a client per module.
- [ ] **Use the WebSocket driver, not the HTTP one.** Build the client from
      `Pool` + `drizzle-orm/neon-serverless`, not `drizzle-orm/neon-http`. The
      HTTP driver supports `db.batch()` but **not** interactive
      `db.transaction()`, and Phase 7 needs real transactions for link accept and
      talk-event propagation. Switching later means rewriting the client and
      every import. Verify the current capability matrix in Drizzle's docs first
      — driver support changes.
- [ ] Create `drizzle.config.ts` pointing at `lib/db/schema/`.
- [ ] Fail fast on missing config: throw at module load if `DATABASE_URL` is
      unset, with a message naming the variable.

**Files:** `lib/db/index.ts`, `drizzle.config.ts`, `.env.local`, `package.json`

**Done when:** a temporary Server Component or Route Handler runs
`SELECT now()` and renders the result. Delete the temporary code before
committing. `npm run type-check` and `npm run build` both pass.

---

## Phase 2A — Better Auth, server side

Goal: auth works as an API. No UI yet.

Splitting 2A from 2B matters: six screens built on an unverified backend means
debugging two layers at once. Prove the server first.

Branch: `feat/better-auth`

### 2A.1 Library and schema

- [ ] `npm i better-auth`.
- [ ] Create `lib/auth.ts` — the Better Auth server instance, with the Drizzle
      adapter pointed at the Phase 1 client, `emailAndPassword` enabled, and
      Google as a social provider — kept alongside, per Phase 0.
- [ ] Generate the schema with the Better Auth CLI into `lib/db/schema/auth.ts`.
      **Generate it, do not hand-write it.** Commit the generated file.
- [ ] Note the generated table names. They are singular (`user`, `session`,
      `account`, `verification`) where the app's tables are plural. Confirm the
      exact names — Phase 3's foreign keys must point at them.
- [ ] Push to Neon and inspect the tables in the Neon SQL editor. Read them. The
      point of self-hosting is that these are yours.
- [ ] Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` to `.env.local` and Vercel.
      `BETTER_AUTH_URL` **must differ per environment** — one hardcoded value
      breaks either local development or production.

### 2A.2 Email

- [ ] `npm i resend`. Add `RESEND_API_KEY` to `.env.local` and Vercel.
- [ ] Set the from-address to the verified subdomain, e.g.
      `Stay in Touch <noreply@send.stay-in-touch.vip>`. Sending from an
      unverified address fails silently at the provider, not in your code.
- [ ] Wire `sendVerificationEmail` and `sendResetPassword` in the Better Auth
      config. Without these, sign-up appears to work and then strands the user
      with no way in.
- [ ] Test both end to end against a real inbox — including the spam folder —
      before moving on.

### 2A.3 Google provider

- [ ] Create a Google OAuth client in Google Cloud Console.
- [ ] Register the callback URLs. With the domain in place these are stable:
      `http://localhost:3000/api/auth/callback/google` and
      `https://stay-in-touch.vip/api/auth/callback/google`, plus the preview
      wildcard host from Phase 0.1 if preview sign-in is wanted. Confirm the
      exact callback path against Better Auth's docs — it is set by the library,
      not chosen by you.
- [ ] Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- [ ] Add `stay-in-touch.vip` to the OAuth consent screen's authorized domains.

### 2A.4 Route handler

- [ ] `app/api/auth/[...all]/route.ts` — the Better Auth handler.
- [ ] `lib/auth-client.ts` — the client instance.

**Files:** `lib/auth.ts`, `lib/auth-client.ts`, `lib/db/schema/auth.ts`,
`app/api/auth/[...all]/route.ts`

**Done when:** a `curl` or REST client can sign up, sign in and fetch the
session; the verification email arrives in a real inbox and the link works; and
the `user` and `session` tables show the rows. **No UI yet.** Verify the backend
before building six screens on top of it.

---

## Phase 2B — The auth screens

Goal: the UI catches up with 2A, and Firebase Auth is gone from the client.

Branch: `feat/auth-screens`

### 2B.1 Context swap

- [ ] Rewrite `lib/AuthContext.tsx` over Better Auth's session hook. Keep the
      `useAuth()` shape and the `currentUser` field so the 12 consumers do not
      all change at once.
- [ ] Keep the existing behaviour of blocking render with `<Result />` until the
      session resolves — `CLAUDE.md` documents that contract and components rely
      on `currentUser` being settled at mount.

### 2B.2 Screens

Firebase's Google popup needed none of these. All are new UI:

- [ ] Sign up (email, password, confirm) — new route
- [ ] Sign in — replaces the current `app/login/page.tsx` entirely
- [ ] Forgot password → request reset — new route
- [ ] Reset password (token from the email link) — new route
- [ ] "Check your inbox" / verification pending state
- [ ] "Sign in with Google" button, kept alongside the email form
- [ ] Password rules and clear errors for "email already in use", "wrong
      password", "unverified email"

Build these with the existing `Components/ui/` primitives (`Button`, `Text`,
`Dialog`) and the Tailwind theme colors (`blue1`, `blue3`, `grey3`). Do not add
a form library — no existing form uses one.

### 2B.3 Fix the identity-shape breakages

Found by audit. Three distinct problems, not one:

- [ ] **`Components/MainForm.tsx:31` reads `currentUser?.displayName`.** Better
      Auth's user field is `name`. This fails silently as `undefined` rather than
      as a type error if the context type is loosened during the swap.
- [ ] **`lib/CalenderFunctions.ts:35` imports Firebase `auth` directly** and
      reads `auth.currentUser?.displayName`. It is not an auth file and a grep
      for `useAuth` will miss it. Pass the display name in as an argument instead
      of reaching for global auth state.
- [ ] The nine files that read `currentUser.uid` **and** `currentUser.email`
      together are left alone in this phase — they still talk to Firestore.
      Phase 4 removes their need for identity entirely.

### 2B.4 Service worker and auth

- [ ] Only if Phase 0 found that a service worker is actually generated:
      exclude `/api/auth/*` and the auth routes from runtime caching. A cached
      HTML page can otherwise be served to a signed-out user after sign-out, and
      that risk did not exist before — Firebase re-evaluated auth state on every
      mount from the client SDK.
- [ ] Verify sign-out in an **installed** PWA, not only a browser tab.

**Files:** `lib/AuthContext.tsx`, `app/login/page.tsx` and the new auth route
pages, `Components/NavBar.tsx`, `Components/MainForm.tsx`,
`lib/CalenderFunctions.ts`, `next.config.js`

**Watch out:** `useAuth()` has 12 consumers. Grep for it and check every call
site, not just the ones that break the build. The Better Auth user id is a
different value from the Firebase uid, and the field is `id`, not `uid`.

**i18n note:** these screens are new user-facing text, and
`specs/i18n-german-translations.md` requires every string to go through a
translation layer. The agreed order is **auth first, i18n after** — the current
login page is being deleted, so translating it now is wasted work. Add these
screens to the i18n spec's surface list.

**Done when:** you can sign up, verify by email, sign out, sign in again with
both email and Google, reset a forgotten password, and the session survives a
refresh and a PWA restart. The contact list still renders from Firestore
throughout.

---

## Phase 3 — Create the app tables

Goal: the schema exists in Neon. No app code reads it yet.

Branch: `feat/postgres-schema`

- [ ] `lib/db/schema/contacts.ts` — `contacts`, with the unique functional index
      on `(owner_id, lower(name))` and the index on `owner_id`.
- [ ] Point `owner_id` at whatever Better Auth generated in Phase 2A — the table
      is `user`, singular, not `users`. Same for `linked_user_id` and, later,
      `talk_events.created_by`. The DDL in the design doc writes `users(id)`;
      adjust it once and consistently.
- [ ] `lib/db/schema/notes.ts` — `notes`, cascade delete from `contacts`.
- [ ] `lib/db/schema/talkEvents.ts` — `talk_events`, with the composite index
      `(contact_id, talked_at DESC)`.
- [ ] `lib/db/schema/index.ts` — re-export everything for the client and for
      `drizzle.config.ts`.
- [ ] Export inferred types (`typeof contacts.$inferSelect`). Do **not**
      hand-write row types.
- [ ] Push to Neon and confirm in the Neon SQL editor that constraints and
      indexes exist — not just the tables.

**Do not create `link_requests` yet.** It belongs to Phase 7.

**Files:** `lib/db/schema/*.ts`

**Done when:** the tables exist, and a manual `INSERT` of a duplicate contact
name for the same owner is **rejected** by the database. Test that explicitly —
it is the whole point of the index.

---

## Phase 4 — Move the data layer

Goal: the app reads and writes Postgres. This is the largest phase. Do it one
feature at a time, keeping the app working after each step.

Branch: `feat/postgres-data-layer`

### 4.1 The ownership helper — do this first

- [ ] Create `lib/db/queries/guards.ts` with a helper every caller uses, e.g.
      `getOwnedContact(contactId)`, which reads the session server-side and
      filters by `owner_id`.

This exists so the ownership filter cannot be forgotten. Every later step in
this phase goes through it. Writing the features first and adding the guard
afterwards is how one query ends up unfiltered.

### 4.2 Read path

- [ ] `lib/db/queries/contacts.ts` — the contact list query: `LEFT JOIN LATERAL`
      onto the newest `talk_events` row, `days_until_next_talk` computed with
      `EXTRACT(EPOCH FROM ...) / 86400`, ordered `ASC NULLS FIRST`.
- [ ] Replace `utils/hooks/useSnapshotData.ts` with a Server Component read.
      Realtime goes away here — this is the decided trade.
- [ ] **Every route page is currently `"use client"`.** Reading on the server
      means `app/page.tsx` stops being a client component. Replace its
      `useEffect` → `router.push("/login")` guard with a server-side `redirect()`
      or middleware. This is an improvement — the current pattern renders an
      empty page and then flashes — but it is a structural change to each page,
      not a swapped data call.
- [ ] Handle the new `NULL` case in the UI: a contact with no talk events has
      never been contacted. The old model could not express this, so no existing
      component handles it.

### 4.3 Write path — Server Actions

One action per operation, each revalidating the contact list path:

- [ ] `addContact` — drop `checkIfContactExists` entirely; catch the unique
      violation from the database and return the "name taken" result.
- [ ] `updateContact`
- [ ] `deleteContact`
- [ ] `markAsTalked` — inserts a `talk_events` row. Does **not** write a
      `"Talked on:"` note any more.
- [ ] `addNote`, `updateNote`, `deleteNote` — single-row operations now.

### 4.4 Clean up the old model

- [ ] Delete `types/ContactItemType.ts` and `types/NoteType.ts`; use the
      inferred Drizzle types.
- [ ] Update every component that reads `timeFromLastTalk`, `notesArray`,
      `contactId` or `time`. Grep first — the known set is `ContactItem`,
      `ContactDetails`, `Notes`, `AddNewContact`, `UpdateContactForm`,
      `MoreOptionsDropdown`, `AppointmentForm` and `lib/CalenderFunctions.ts`.
- [ ] `friendEmail` becomes nullable. Remove the `|| ""` and the
      `if (!oldContactData.friendEmail)` fix-up.
- [ ] Delete `addDummyData` and the `Dummy_Data` array. Do not port them.
- [ ] Delete the **"add demo data" button** in `app/about/page.tsx:16-24` and
      the copy around it. Dropping dummy data is not just deleting the helper —
      a page has a button wired to it.
- [ ] Design the **empty state** for a new account. Until now every account had
      three seeded contacts, so an empty contact list has never been rendered and
      no component handles it.

**Done when:** every screen works against Postgres and `lib/Firebase.ts` is
imported nowhere except the auth code already removed in Phase 2B.

---

## Phase 5 — Remove Firebase

Branch: `chore/remove-firebase`

- [ ] Delete `lib/Firebase.ts` and `utils/hooks/useSnapshotData.ts`.
- [ ] `npm uninstall firebase`.
- [ ] Remove every `NEXT_PUBLIC_FIREBASE_*` variable from `.env.local` and from
      Vercel.
- [ ] Grep for `firebase` across the repo, case-insensitively. Check
      `next.config.js`, the PWA config and `CLAUDE.md`.
- [ ] Update `CLAUDE.md`: the "Data model" and "Auth" sections describe
      Firestore and are now wrong. This is not optional — it is the file that
      tells future contributors how the app works.
- [ ] Delete the Firebase project in the console, last.

**Done when:** `npm run build` passes with no Firebase dependency present.

---

## Phase 6 — Real migrations and hardening

The app is now real. Stop dropping the database.

- [ ] Switch from `drizzle-kit push` to `drizzle-kit generate` + `migrate`.
      Commit the generated SQL files.
- [ ] Add a `db:generate` and `db:migrate` script to `package.json`.
- [ ] Validate Server Action input at the boundary. A Server Action is a public
      HTTP endpoint; its arguments are untrusted.
- [ ] Re-check every query for the `owner_id` filter. Grep for `db.select`,
      `db.update` and `db.delete` and confirm each one is scoped or goes through
      the guard.
- [ ] Confirm connection counts and query times on the Neon dashboard under
      normal use.

---

## Phase 7 — Linked users

Only start this once Phases 1–6 are done and deployed.

- [ ] `link_requests` table, with the `link_request_status` enum, the
      `no_self_link` check and the partial unique index on the sorted pair.
- [ ] Add `linked_user_id` to `contacts` if it was not added in Phase 3.
- [ ] Server Actions: `sendLinkRequest`, `acceptLinkRequest`,
      `rejectLinkRequest`, `unlink`.
- [ ] Accepting runs in a **transaction**: set the status, link both contact
      rows, and create the other side's contact if it does not exist.
- [ ] Extend `markAsTalked` to propagate, in a transaction, using the mutual-link
      join. Verify it inserts zero rows when there is no link.
- [ ] UI for incoming and outgoing requests.

**Answer before building:** the three Round 3 questions — re-sending after a
rejection, what the addressee sees in a request, and whether accepting creates a
missing contact.

**Verify explicitly:** a link shares the talk event and nothing else. Notes must
never cross the link, and each side keeps its own `cadence_days`.

---

## Risks

| Risk | Handling |
| --- | --- |
| A query without an `owner_id` filter leaks another user's data | The Phase 4.1 guard, built before any feature; the Phase 6 grep as a second pass |
| Vercel serverless exhausts the connection pool | Use Neon's **pooled** connection string from Phase 1 |
| Losing realtime updates is worse than expected | Revisit only after the app runs. Polling is the cheap next step; Supabase Realtime is the expensive one |
| `useAuth()` consumers break in Phase 2B | Keep the existing `useAuth()` contract; grep all 12 call sites before editing |
| Neon free tier changes or the project sleeps | Confirmed in Phase 0; cold starts are acceptable for a portfolio app |
| Verification and reset emails land in spam or never send | Phase 0.1: verify `send.stay-in-touch.vip` early, set SPF/DKIM/DMARC, and test against Gmail **and** Outlook before Phase 2A is called done |
| `.vip` is a newer TLD and gets weighted more suspiciously by spam filters | Correct SPF, DKIM and DMARC. If test emails land in spam, suspect this before suspecting the code |
| `BETTER_AUTH_URL` or the OAuth callback does not match the canonical host | Pick apex **or** `www` once in Phase 0.1 and redirect the other. A mismatch breaks sign-in with an opaque provider error |
| Phase 2B is much bigger than the old Google-only plan | Six new screens replace one popup button. Budget for it; it is the cost of owning auth |
| Better Auth's table names are singular and clash with the app's plural ones | Decide once in Phase 2A.1, before any foreign key is written in Phase 3 |
| The HTTP Neon driver is picked by habit, then Phase 7 needs transactions | Use `drizzle-orm/neon-serverless` from Phase 1. Switching later rewrites the client and every import |
| The service worker serves a cached signed-in page after sign-out | Phase 2B.4. First confirm in Phase 0 whether a service worker is generated at all |
| `next-pwa@5.6.0` is a webpack plugin for Next 12, and the repo builds with Turbopack | Pre-existing, **out of scope**. Confirm which situation you are in; do not fix it inside this migration |
| The i18n spec is stale — it says "Pages Router" and cites `pages/index.tsx` | It was written after the App Router migration. Correct it before anyone builds from it. Not this migration's job, but do not build from it as-is |
| Six new auth screens land after i18n and break "no English text remains" | Agreed order is auth first, i18n after. Add the screens to the i18n spec's surface list |
