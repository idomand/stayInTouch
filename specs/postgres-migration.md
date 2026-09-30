# Firestore → Postgres Migration — Unified Plan

The single source of truth for moving this app's **contact data** off Firestore
and onto Neon Postgres, while **keeping Firebase as the auth provider**.

This file supersedes and replaces three earlier documents, now deleted:
`firestore-to-postgres.md` (design), `postgres-execution-plan.md` (execution) and
`session-handoff-2026-09-23.md` (the direction change). Their still-relevant
content — the schema reasoning, the security model, the build order — is folded in
here; their superseded content (Better Auth, Resend, Auth.js) is summarized once
under _Abandoned directions_ so nobody rebuilds it.

> **App Router migration** is a separate, completed piece of work. Its record
> lives in `specs/pages-to-app-router.md` and is not part of this plan.

---

## The plan in one paragraph

Keep Firebase Auth. Add email+password as a second login option beside the
existing Google sign-in. Move only the contact **data** from Firestore to Neon
Postgres, reached exclusively from the server through Drizzle. Server-side
identity comes from Firebase **session cookies** verified by `firebase-admin`, so
`owner_id` is a Firebase uid. There is no live user data to preserve, so the
database starts empty — no migration script, no dual-write, no identity bridge.

## Status at a glance

Verified against the code on 2026-09-30, not against the old docs.

| Phase | What | Status |
| ----- | ---- | ------ |
| 1 | Neon + Drizzle client (WebSocket driver) | ✅ done |
| 2 | Postgres schema — `contacts`, `notes`, `talk_events` | ✅ done |
| 3 | Firebase server identity — `firebase-admin` + session cookies | ✅ done |
| 4 | Postgres data layer — guard → reads → writes → server-gated home | ✅ done |
| 5 | Remove dead Firestore data access (keep Firebase Auth) | ✅ done |
| 6 | Email+password login (Firebase provider + screens) | ✅ done |
| 7 | Real migrations + hardening | ✅ done |
| 8 | Linked users | ✅ done |

**App still works throughout.** The data layer already runs on Postgres; Firebase
still owns identity. Phase 5 is dead-code removal, not a rewrite.

---

## Why this direction (and why not the old one)

Auth and data were always separable. Firebase Auth does email+password natively
(`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`,
`sendPasswordResetEmail`, `sendEmailVerification`), so "keep Firebase + add
email/password" needs **none** of the machinery the first plan assumed. Moving the
database does not require moving auth.

The learning goal — schema design, real SQL, Server Actions, connection
management, ownership/security in a shared table — is fully served by the data
migration alone. It does not need a hand-owned auth stack.

### Abandoned directions (do not rebuild)

The first plan aimed to remove Firebase entirely and replace it with **Better
Auth** (Google + email/password), backed by **Resend** email on a verified
`send.stay-in-touch.vip` sending domain, with a Google OAuth client in Google
Cloud Console. All of that is **dropped**:

- **Better Auth** — not built. Firebase owns identity.
- **Resend + DKIM/DMARC/SPF sending domain** — off the critical path. Firebase
  sends its own verification/reset emails. Keep only as a later "branded emails"
  nicety.
- **Google OAuth client + wildcard preview domain** — not needed; Firebase
  handles Google OAuth.
- **`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`** — replaced by
  `FIREBASE_SERVICE_ACCOUNT_B64` (base64 service-account JSON for the Admin SDK;
  name only, never the value).
- **Auth.js** — was considered before Better Auth; also moot.

Kept from the earlier setup and still useful: the `stay-in-touch.vip` domain and
the `fra1` Vercel function region (matches the Neon `eu-central-1` project).

---

## Architecture — the implemented shape

### The one pillar: server-side Firebase identity

Postgres is reachable only from the server (`lib/db/index.ts` imports
`server-only`). The server must know **who** the caller is to fill or filter
`owner_id`. Firebase auth state is client-side, so a server identity layer bridges
the two, built on Firebase **session cookies**:

1. On login (Google, or email+password with a verified email) the client gets a fresh
   Firebase ID token and POSTs it to `app/api/auth/session/route.ts`.
2. The handler calls `adminAuth.createSessionCookie()` and sets an httpOnly
   `session` cookie. (`lib/firebaseAdmin.ts`, `lib/auth/session.ts`.)
3. Server Components and Server Actions read the cookie and call
   `verifySessionCookie(cookie, true)` through **one shared helper**,
   `getServerUser()` (`lib/auth/getServerUser.ts`), which returns `{ uid }` or
   `null`. `checkRevoked = true` rejects a signed-out or disabled user.
4. Logout `DELETE`s the cookie, then signs out the client SDK.
5. `proxy.ts` (formerly `middleware.ts`) gates `/` on cookie **presence** (full verification needs the
   Admin SDK, which cannot run on Edge) and redirects to `/login` before render.

`owner_id` = Firebase uid (stable; not the mutable email). This layer is permanent
architecture — the login provider is irrelevant below it.

### The data model

`lib/db/schema/` — five tables (the last two since Phase 8), inferred types
exported (no hand-written row types). Foreign keys point at `contacts`, not at a
users table: **identity stays in Firebase, so `owner_id` / `created_by` /
`from_user_id` are bare `text` Firebase uids with no FK.**

```
contacts     id uuid PK · owner_id text · name text · cadence_days int (>0, default 7)
             · friend_email text NULL · created_at timestamptz
             UNIQUE (owner_id, lower(name)) · INDEX (owner_id)

notes        id uuid PK · contact_id uuid → contacts ON DELETE CASCADE
             · body text · created_at · updated_at ($onUpdate)
             INDEX (contact_id)

talk_events  id uuid PK · contact_id uuid → contacts ON DELETE CASCADE
             · talked_at timestamptz · created_by text · created_at timestamptz
             INDEX (contact_id, talked_at DESC)

link_requests id uuid PK · from_user_id text · from_contact_id uuid → contacts
             ON DELETE CASCADE · from_name · from_email (snapshot) · to_email text
             · status link_request_status (pending/accepted/rejected)
             · created_at · responded_at NULL
             CHECK (to_email <> from_email)
             UNIQUE (from_contact_id) WHERE pending · INDEX (to_email) WHERE pending

contact_links id uuid PK · contact_a_id / contact_b_id uuid → contacts
             ON DELETE CASCADE · created_at
             CHECK (contact_a_id < contact_b_id) · UNIQUE (a, b) · INDEX (b)
```

Two derived values are computed in SQL, never stored: `lastTalkedAt` (newest
`talk_events` row) and `daysUntilNextTalk` (`cadence_days - elapsed`). The
overdue-first ordering the whole UI is built around comes from these.

### Why the schema is shaped this way

- **`uuid` PKs, not `serial`.** Ids appear in URLs and (later) in link requests;
  sequential ints leak volume and let neighbours be guessed. `gen_random_uuid()`
  is built into Postgres 13+.
- **`owner_id` column, not a collection name.** Ownership becomes queryable and
  indexable. Keyed on the permanent uid, not the email, so changing your Google
  email no longer orphans data — which the Firestore `${email}${uid}` model did.
- **`cadence_days`, not `time`.** `time` is a Postgres type (needs quoting
  forever) and does not say what it measures. The unit belongs in the name.
- **`friend_email` nullable, `NULL` not `""`.** `NULL` means "no email"; `""`
  would mean "the email is the empty string". Deletes the old `|| ""` fix-up.
- **`UNIQUE (owner_id, lower(name))` in the DB.** Replaces the old browser-side
  `checkIfContactExists` that downloaded every contact and regex-matched in JS —
  two tabs submitting "Mom" both won. The DB makes the race impossible.
- **`notes` is its own table.** The "many" side holds the FK, so editing one note
  is `UPDATE notes SET body=$1 WHERE id=$2`, not read-doc → rebuild array → write
  whole doc. DB-generated ids are never reused (the old `noteId` was).
- **`talk_events`, append-only.** A table name describes one row; this holds many
  talks, so "last talked" is derived with a query, not a `last_talked` column.
  Two timestamps: `talked_at` (when the conversation happened, may be backdated)
  and `created_at` (when the row was written, the audit trail). `created_by`
  records who clicked — it matters once linking (Phase 8) lets the other side
  click.
- **Index `(contact_id, talked_at DESC)`.** Every read is "for this contact, the
  newest event". Filter column first, sort DESC second → newest row served off
  the index, no read-time sort.

### The security model — the most important consequence

In Firestore, data was partitioned by collection name and guarded by Firestore
rules. In Postgres, **every contact sits in one table and the DB returns any row
you ask for.** The only thing between one user and another's data is the
`WHERE owner_id = ...` filter.

Rules, enforced through one choke point (`lib/db/queries/guards.ts`):

1. Never trust an id from the client — it names a row, it does not prove access.
2. Every query carries an ownership filter from the **server session**
   (`getServerUser()`), never from a request body or URL.
3. Writes too: `... WHERE id = $1 AND owner_id = $2`. Zero rows means 404/no-op.

`requireUser()` returns the verified uid once; `getOwnedContact(uid, contactId)`
returns the row only if it belongs to that uid. Every Server Action goes through
them.

### Realtime

Dropped. The old `onSnapshot` live listener is replaced by a Server Component read
plus `revalidatePath("/")` after each mutation. Polling is the cheap next step if
this ever proves too coarse.

---

## Done phases — what shipped

### Phase 1 — Neon + Drizzle (done 2026-09-17)

- Neon project in `eu-central-1` (Frankfurt), pooled connection string.
- Vercel function region set to `fra1` to match; no `vercel.json`, the dashboard
  value is authoritative.
- `lib/db/index.ts` — one shared client on the **WebSocket driver**
  (`drizzle-orm/neon-serverless` + `Pool`), `server-only`, fail-fast on
  `DATABASE_URL`, dev-reload pool reuse. The HTTP driver was rejected: it cannot
  run the interactive transactions Phases 6/8 need.
- `drizzle.config.ts` loads `.env.local` via `process.loadEnvFile` (drizzle-kit
  does not read `.env.local` on its own). `db:push` / `db:studio` scripts added.

Findings that later phases inherit:

- A module-load throw makes `DATABASE_URL` a **build-time** requirement — Next
  imports route modules during "Collecting page data". So it must be set in Vercel
  before any deploy that imports the client, and a contributor without it cannot
  `npm run build`. Same contract now applies to `FIREBASE_SERVICE_ACCOUNT_B64`
  (`lib/firebaseAdmin.ts` throws at module load).
- `ws` is only needed on older Node; Node 22+/24 has a native `WebSocket`. It is
  installed anyway so the client behaves identically across Node versions — do not
  "clean it up" without checking the Vercel Node setting.

### Phase 2 — Schema (done)

`lib/db/schema/{contacts,notes,talkEvents,index}.ts` as described above, pushed to
Neon with `db:push`. `link_requests` deliberately not created — it belongs to
Phase 8.

### Phase 3 — Firebase server identity (done)

- `lib/firebaseAdmin.ts` — Admin SDK from `FIREBASE_SERVICE_ACCOUNT_B64`, app
  reused across invocations.
- `app/api/auth/session/route.ts` — `POST` mints the cookie, `DELETE` clears it;
  `runtime = "nodejs"` (Admin SDK is not Edge-safe).
- `lib/auth/session.ts` — shared cookie name and 5-day lifetime.
- `lib/auth/getServerUser.ts` — the single verifier.
- `lib/AuthContext.tsx` — `loginWithGoogle` awaits `postSessionCookie` before any
  navigation; `onAuthStateChanged` refreshes the cookie on load (fire-and-forget);
  `logout` clears cookie then client session and navigates to `/login`.

Deployment notes worth keeping: `firebase-admin` pulls in ESM `jose`, which broke
`require()` in the Vercel bundle. Fixed by pinning Vercel Node to 24.x and forcing
CommonJS `jose@5.10.0` (commits `59e4cf9`, `037592f`). Re-check this if
`firebase-admin`, `jose`, or the Vercel Node version changes.

### Phase 4 — Data layer (done, merged PR #78)

- `lib/db/queries/guards.ts` — the ownership helper, built first.
- `lib/db/queries/contacts.ts` — `getContactsForCurrentUser()`: two `LEFT JOIN
  LATERAL`s (newest talk event via the composite index; notes and events
  aggregated to JSON) in one round trip. `daysUntilNextTalk` uses
  `EXTRACT(EPOCH …)/86400` cast to `double precision` — not `EXTRACT(DAY …)`
  (truncates) and not left as `numeric` (the driver returns a string). Ordered
  `ASC NULLS FIRST` so never-contacted people sort to the top.
- `lib/actions/contacts.ts` — Server Actions `addContact`, `updateContact`,
  `deleteContact`, `markAsTalked`, `addNote`, `updateNote`, `deleteNote`. Each
  calls `requireUser()`/`getOwnedContact()`, validates input, catches the unique
  violation (`23505`) as "name taken", and `revalidatePath("/")`. `addContact` and
  `updateContact` run in transactions (contact + optional seed talk event + note).
  No more `"Talked on:"` note — that is a `talk_events` row now.
- `app/page.tsx` — server-rendered, `getServerUser()` → `redirect("/login")`, then
  renders `MainForm` + `ContactList` from the query. Replaced the old client
  `useEffect` → `router.push` that flashed an empty page.
- The `about` "add demo data" button and `addDummyData` wiring were removed here.

---

## Remaining phases

Ground rules for every phase below:

- **The database is real (since Phase 7).** Schema changes only through generated
  migrations: edit `lib/db/schema/` → `db:generate` → review the SQL →
  `db:migrate` on `dev` → commit → `db:migrate` on production before merge. No
  `db:push`, no dropping tables. The exact steps are in `CLAUDE.md` ("Changing
  the schema").
- **The gate is `npm run type-check` + `npm run build`** and running the app.
  There is no test framework and no working lint. A `pre-push` hook runs
  `tsc --noEmit` and aborts on any error. `noUnusedLocals`/`noUnusedParameters`
  are on — an unused import is a hard error.
- **One phase, one branch, merged to `main` per phase.** Branch from an updated
  `main` (sequential, not stacked). The user commits per sub-task; Claude does
  not commit and reports when each sub-task is ready. Every other git action
  needs explicit confirmation first.
- **Merging to `main` deploys to production.** A schema change must already be
  migrated on production when its code merges, so write migrations that the
  currently deployed code also survives (e.g. add a nullable column first).
- **Secrets are never committed.** Add each new variable to `.env.local` and to
  Vercel; document only the name here.

### Phase 5 — Remove dead Firestore data access (done 2026-09-29)

Branch: `chore/remove-firestore-data`

The data layer already runs on Postgres, so the Firestore CRUD in `lib/Firebase.ts`
is **orphaned** — the only importer is `lib/AuthContext.tsx`, which uses just
`auth` and `provider`. This phase deletes dead code; it does not rewire anything.

- [x] In `lib/Firebase.ts` keep the app init, `auth` and `provider`. Delete the
      `getFirestore()` `db` export, every Firestore helper (`addContactToFirestore`,
      `updateContact`, `deleteContact`, `deleteNote`, `updateNote`,
      `checkIfContactExists`, `addLastTalkNote`), `addDummyData`, the `Dummy_Data`
      array, and the now-unused `ContactItemType` / `NoteType` imports.
- [x] Delete `types/ContactItemType.ts` and `types/NoteType.ts` if nothing else
      references them (grep first — after the edit above the only referrer is
      `Firebase.ts` itself).
- [x] Keep Firebase Auth. Do **not** uninstall `firebase` or remove
      `NEXT_PUBLIC_FIREBASE_*` — auth still uses them.
- [x] Rewrite the stale Firestore architecture in `CLAUDE.md`, `README.md` and
      `.claude/agents/component-builder.md` (they still described the
      `${email}${uid}` collections and the deleted `useSnapshotData` hook).

**Done when:** `grep -ri "firestore"` across the repo returns nothing outside
comments, `useAuth()` and Google sign-in still work, and `type-check` + `build`
pass.

### Phase 6 — Email+password login (done 2026-09-29)

Branch: `feat/email-password-login`

Firebase Auth already supports this natively — no new backend, no email provider.
The work is client screens plus wiring the existing session-cookie POST. The
Email/Password provider is enabled in the Firebase console; Email link
(passwordless) is not.

- [x] Extend `AuthContext`: `signUpWithEmail` (also sets `displayName` from a
      Name field), `signInWithEmail`, `sendPasswordReset`, `resendVerification`,
      `checkVerified`. Sign-in paths await the session cookie before navigation,
      same as `loginWithGoogle`. `authErrorMessage()` maps Firebase error codes
      to user-facing text.
- [x] Screens, built with `Components/ui/` primitives and the Tailwind theme
      colors (`blue1`, `blue3`, `grey3`) — no form library (none exists today):
  - [x] Sign up (name, email, password, confirm) + "verify your email" pending
        state (`Components/VerifyEmailNotice.tsx`).
  - [x] Sign in — email form (`Components/EmailAuthForm.tsx`) beside the kept
        "Sign in with Google" button, all on `/login`.
  - [x] Forgot password → request reset.
  - [x] Clear errors for "email already in use", "wrong password", "unverified
        email".
- [x] Email verification is **required**, enforced on the server:
      `POST /api/auth/session` runs `verifyIdToken` and returns 403 when
      `email_verified` is not true, so an unverified user never gets a cookie.
      Google accounts arrive verified.
- [x] `postSessionCookie` checks `response.ok` and throws a readable error; a
      failed mint used to be silent and bounce the user off `/`.
- [x] `/login` redirects on `hasSession` (cookie known to be set in this tab),
      not on `currentUser`. A client-signed-in user without a cookie —
      unverified, expired cookie, or cookie still being minted — used to loop
      `/login` → `/` → middleware → `/login`.
- [x] Firebase's default email templates are fine; branded templates are a later
      nicety.

**Done when:** you can sign up, receive the verification email, sign in with both
email and Google, reset a forgotten password, and the session survives a refresh
and a browser restart.

### Phase 7 — Real migrations + hardening (done 2026-09-30)

Branch: `chore/db-hardening`. The app is real now — stop dropping the database.

- [x] **Separate dev and prod databases.** Neon branch `dev` (from `production`,
      no expiry); `.env.local` points at it, Vercel at `production`.
- [x] **Versioned migrations.** `db:generate` / `db:migrate` added, `db:push`
      removed. `lib/db/migrations/0000_fuzzy_leader.sql` + `meta/` committed.
      Both branches had their `push`-made tables dropped and rebuilt from `0000`;
      each has one row in `drizzle.__drizzle_migrations` (hash checked on prod).
- [x] **Ownership re-audit.** Only three files import `db`
      (`queries/contacts.ts`, `queries/guards.ts`, `actions/contacts.ts`); every
      read and write is scoped by the session uid or goes through
      `getOwnedContact()`.
- [x] **Server Action input validation.** `getOwnedContact()` returns `null` for
      a non-UUID id (fixes all 6 callers); `isUuid()` guards note ids;
      `validateFields()` / `validateNoteBody()` limit name (1–100), cadence
      (1–365), email (≤ 254, `x@y` — as loose as the browser's check), note body
      (1–5000) and the "last talked" date (valid, ≤ 1 day ahead);
      `updateNote` / `deleteNote` return "Note not found." when no row matched.
      No validation library.
- [ ] **Neon Monitoring under normal use** (connections, query times on
      `production`). Carried over — needs real use over time, not a code change.

Findings worth keeping:

- `process.loadEnvFile(".env.local")` does not override a variable already set
  in the shell. That is what lets a production `db:migrate` run from the laptop —
  and why a leftover shell `DATABASE_URL` is dangerous.
- `lib/db/index.ts` cached the dev pool on `globalThis` without its URL, so a
  `npm run dev` started before `.env.local` changed kept writing to the old
  database (production). The cache now stores the URL and replaces the pool on a
  change.
- drizzle-kit `migrate` can exit with no message when it fails. Only
  `[✓] migrations applied successfully!` means success; check the migrations
  table.
- The production database password was reset on 2026-09-30 after being pasted
  in a chat. Vercel's `DATABASE_URL` is marked Sensitive, so read connection
  strings from Neon → Connect.

Follow-ups, done 2026-09-30 on branch `chore/small-fixes`:

- [x] The "last talked" pickers stop at today: `DatePickerComponent` takes an
      optional `maxDate` (default +90 days, still used by the appointment form).
- [x] One cadence limit, `maxCadenceDays = 60` in `lib/ConstantsFile.ts`, used by
      both forms and the server check (was 31 / 60 / 365).
- [x] `middleware.ts` → `proxy.ts` (Next 16 name; function `proxy`).
- [x] README no longer claims an installable/offline PWA; it says PWA is planned.
- Note errors in the UI → moved to _Future upgrades_.

### Phase 8 — Linked users (done 2026-09-30)

Branch: `feat/linked-users`. Migration `0001` applied to `dev` and production.

Bob has a contact for Alice; Alice is also a user. When Bob marks that he talked to
Alice, **Alice's timer resets too**. A link shares **only the talk event** — notes
stay private, and each side keeps its own `cadence_days`.

**Decisions (2026-09-30):**

| Question | Answer |
| --- | --- |
| How is a link stored? | A **`contact_links` table**, one row per link, both contact ids as FKs `ON DELETE CASCADE`. Not a `linked_user_id` column: that allows half-links (one side deleted, the other still "linked") and puts cleanup in code. The table makes that impossible; the cost is one join. |
| Can a rejected request be sent again? | **Yes.** Only one *pending* request per contact at a time (partial unique index); rejected rows stay as history. |
| How many links between two people? | **One.** Enforced in the accept transaction (advisory lock on the uid pair + a join on both contacts' owners); no constraint can express it because the link row holds contact ids. |
| What does the addressee see? | The requester's **display name and email only** — never notes, cadence or talk history. |
| Accepting when the addressee has no contact for the requester? | **Choose in the accept dialog:** link to an existing contact, or create a new one prefilled with the requester's name and the default cadence (7). No silent auto-create — name matching is unreliable. |
| Where do requests live in the UI? | A new protected route **`/account`**, "Friend requests" section only in this phase, plus a pending-count badge in `NavBar`. The rest of `/account` is in _Future upgrades_. |

What shipped:

- [x] **Schema (migration `0001`, additive):** `link_requests` and
      `contact_links` (see _The data model_). Tested on `dev` inside a rolled-back
      transaction: every constraint refuses what it should, and deleting either
      contact removes its link and requests.
- [x] **Requests are addressed to an email, never resolved to a uid.** Resolving
      would make the sender's outgoing list show only emails that have an
      account — revealing who uses the app. The addressee sees requests sent to
      their verified session email (`getServerUser()` now returns `{ uid, email }`;
      `requireUserWithEmail()` in `guards.ts`). The email only finds the person;
      after accept, the link is two contact ids and emails play no part.
- [x] **Server Actions** in `lib/actions/links.ts`: `sendLinkRequest`,
      `acceptLinkRequest`, `rejectLinkRequest`, `cancelLinkRequest`,
      `unlinkContact`, `getMyPendingRequestCount`. Accept is one transaction
      with every check before the first write: pending + addressed to the
      caller's email; one link per pair of users (advisory lock); both contacts
      locked in id order and not already linked; then the optional new contact,
      the link, and `accepted`. Shared validation moved to
      `lib/actions/validation.ts`.
- [x] **`markAsTalked` propagation:** one transaction; an `INSERT … SELECT`
      through `contact_links` writes the same talk (same time, `created_by` = the
      clicker) on the linked contact. Only the "talked" button propagates — dates
      typed in the add/edit forms stay on your own contact.
- [x] **Reads:** `isLinked` / `hasPendingRequest` on each contact;
      `lib/db/queries/links.ts` for the incoming/outgoing lists, the badge count
      and the contacts that can still be linked.
- [x] **UI:** protected `/account` (in the `proxy.ts` matcher) with the "Friend
      requests" section (`FriendRequests`, `AcceptLinkDialog`); "Link with
      friend" / "Unlink" in the contact menu (`LinkContactDialog`); a link icon on
      linked contacts; "logged by your friend" in the talk history; an Account
      link with a badge in `NavBar`.
- [x] **Tested** with two real accounts on `dev`: send, accept (both paths), talk
      from each side, unlink, reject + re-send, request to an email with no
      account, delete a linked contact, second link between the same pair.

Known limitations: after accepting or rejecting on `/account`, the NavBar badge
updates on the next navigation. A sender may re-send after every reject (no
cooldown). A pending request is lost if the addressee changes their email.
Request history is deleted with the sender's contact (cascade).

---

## Decisions

| Concern        | Choice |
| -------------- | ------ |
| Database       | Neon (PostgreSQL), `eu-central-1`, pooled connection |
| ORM            | Drizzle, WebSocket driver (`neon-serverless`) — HTTP driver can't do transactions |
| Auth provider  | **Firebase, kept.** Google today; email+password added in Phase 6. No Better Auth. |
| Server identity| Firebase session cookies verified by `firebase-admin`, through one `getServerUser()` |
| `owner_id`     | Firebase uid, bare `text`, no FK — identity is not in Postgres |
| Region         | Vercel `fra1` to match Neon `eu-central-1` |
| Domain         | `stay-in-touch.vip` (kept; email-sending domain no longer needed) |
| Email          | Firebase's built-in verification/reset emails. No Resend. |
| Email verification | Required; the session route refuses to mint a cookie for an unverified email |
| Realtime       | None — Server Component read + `revalidatePath` after mutation |
| Existing data  | None at cutover (no migration script, no identity bridge, no dual-write). Real from Phase 7 on. |
| Schema changes | Generated migrations only (`db:generate` → `db:migrate`); production migrated manually before merge, not in the Vercel build |
| Environments   | Neon branch `dev` for local work, `production` for Vercel |
| Primary keys   | `uuid` / `gen_random_uuid()`, not `serial` |
| Timestamps     | `timestamptz`, never epoch ms |
| Talk events    | Own append-only `talk_events` table; no `last_talked` column, no "Talked on:" note |
| Notes          | Own table, private, never shared across a link |
| Linked users   | Shares the talk event only; pending/accepted/rejected requests; links in a `contact_links` table (Phase 8) |
| Access control | Every query filters by `owner_id` from the server session, via `lib/db/queries/guards.ts` |

## Open questions

1. ~~**Email verification gate (Phase 6)**~~ — resolved: required, enforced in
   the session route. Linking (Phase 8) matches users by email, so an
   unconfirmed email must not be usable.
2. ~~**`linked_user_id` vs a `contact_links` table (Phase 8)**~~ — resolved
   2026-09-30: `contact_links` table.
3. ~~**The three Phase 8 link-request questions**~~ — resolved 2026-09-30: re-send
   after reject is allowed; the addressee sees name and email only; accepting
   opens a dialog to pick or create the contact. See Phase 8.

## Notes on the PWA (out of scope)

`next-pwa@5.6.0` is a webpack plugin for Next 12; the repo builds with Turbopack,
which never calls it, so it is inert and **no service worker is generated**
(verified by a clean build 2026-09-16). Consequences: there is no cache that could
serve a signed-in page after sign-out, and the app is not actually an installable
PWA today despite the `manifest.json` link. (`CLAUDE.md` was corrected in
Phase 5, `README.md` on 2026-09-30.) Fixing the PWA setup is **out of scope for
this migration** — it is listed under _Future upgrades_; until then, do not design
around a service worker that does not exist.

## Future upgrades

Planned, not scheduled. Each needs its own brief before building.

1. **`/account` — the rest of it.** Phase 8 creates the route with the friend
   requests section only. Later sections:
   - **Notifications and social:** a notifications list (e.g. "Bob accepted your
     request", "you and Alice talked"), and other social features built on
     links.
   - **Change password:** only for email+password accounts — hide it for Google
     sign-in (check `providerData` for `password`). Firebase requires a recent
     sign-in, so re-authenticate (`reauthenticateWithCredential`) before
     `updatePassword`; show errors through `authErrorMessage()`.
   - **Change language:** depends on the i18n work (see _i18n interaction_
     below). Store the choice per user (a cookie or a `user_settings` row).
2. **Show note errors in the UI.** `Notes.tsx` and `NoteItem.tsx` send action
   errors only to `console.error`, so a rejected note (e.g. > 5000 characters,
   "Note not found.") fails silently. Show them like `AddNewContact` does
   (`ErrorWarning`).
3. **A real PWA setup.** `next-pwa` is inert under Turbopack (see above).
   Replace it with a Turbopack-compatible approach (e.g. Serwist, or a
   hand-written service worker), check `public/manifest.json` and the icons,
   and decide what may be cached: never serve a signed-in page after sign-out.
   Then put the "installable" claim back in the README.

## i18n interaction (out of scope here, flagged)

`specs/i18n-german-translations.md` is unbuilt and its acceptance criterion is "no
user-facing English remains when German is selected". The Phase 6 auth screens are
new user-facing text — add them to that spec's surface list when it is picked up:
`app/login/page.tsx`, `Components/EmailAuthForm.tsx`,
`Components/VerifyEmailNotice.tsx`, and the error strings in `lib/AuthContext.tsx`
(`AUTH_ERROR_MESSAGES`, `NOT_VERIFIED_MESSAGE`, `postSessionCookie`). The spec is
not on `main` (it lives on the i18n branch). It is also stale (it says "Pages Router" and cites `pages/index.tsx`, both
untrue after the App Router migration) and needs a correction pass before anyone
builds from it.
