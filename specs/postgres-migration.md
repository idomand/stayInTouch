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

Verified against the code on 2026-09-25, not against the old docs.

| Phase | What | Status |
| ----- | ---- | ------ |
| 1 | Neon + Drizzle client (WebSocket driver) | ✅ done |
| 2 | Postgres schema — `contacts`, `notes`, `talk_events` | ✅ done |
| 3 | Firebase server identity — `firebase-admin` + session cookies | ✅ done |
| 4 | Postgres data layer — guard → reads → writes → server-gated home | ✅ done |
| 5 | Remove dead Firestore data access (keep Firebase Auth) | ⬜ next |
| 6 | Email+password login (Firebase provider + screens) | ⬜ not started |
| 7 | Real migrations + hardening | ⬜ not started |
| 8 | Linked users | ⬜ not started |

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

1. On login (Google today; email+password in Phase 6) the client gets a fresh
   Firebase ID token and POSTs it to `app/api/auth/session/route.ts`.
2. The handler calls `adminAuth.createSessionCookie()` and sets an httpOnly
   `session` cookie. (`lib/firebaseAdmin.ts`, `lib/auth/session.ts`.)
3. Server Components and Server Actions read the cookie and call
   `verifySessionCookie(cookie, true)` through **one shared helper**,
   `getServerUser()` (`lib/auth/getServerUser.ts`), which returns `{ uid }` or
   `null`. `checkRevoked = true` rejects a signed-out or disabled user.
4. Logout `DELETE`s the cookie, then signs out the client SDK.
5. `middleware.ts` gates `/` on cookie **presence** (full verification needs the
   Admin SDK, which cannot run on Edge) and redirects to `/login` before render.

`owner_id` = Firebase uid (stable; not the mutable email). This layer is permanent
architecture — the login provider is irrelevant below it.

### The data model

`lib/db/schema/` — three tables, inferred types exported (no hand-written row
types). Foreign keys point at `contacts`, not at a users table: **identity stays
in Firebase, so `owner_id` / `created_by` are bare `text` Firebase uids with no
FK.**

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

- **No live data.** DB starts empty; breaking changes are free until Phase 7.
  Prefer `db:push` and dropping the database over careful migrations until then.
- **The gate is `npm run type-check` + `npm run build`** and running the app.
  There is no test framework and no working lint. A `pre-push` hook runs
  `tsc --noEmit` and aborts on any error. `noUnusedLocals`/`noUnusedParameters`
  are on — an unused import is a hard error.
- **One phase, one branch, merged to `main` per phase.** Branch from an updated
  `main` (sequential, not stacked). Commit per sub-task. Every git action needs
  explicit confirmation first.
- **Merging to `main` deploys to production.** Acceptable per phase because the DB
  is empty and no user can be locked out mid-migration.
- **Secrets are never committed.** Add each new variable to `.env.local` and to
  Vercel; document only the name here.

### Phase 5 — Remove dead Firestore data access (next)

Branch: `chore/remove-firestore-data`

The data layer already runs on Postgres, so the Firestore CRUD in `lib/Firebase.ts`
is **orphaned** — the only importer is `lib/AuthContext.tsx`, which uses just
`auth` and `provider`. This phase deletes dead code; it does not rewire anything.

- [ ] In `lib/Firebase.ts` keep the app init, `auth` and `provider`. Delete the
      `getFirestore()` `db` export, every Firestore helper (`addContactToFirestore`,
      `updateContact`, `deleteContact`, `deleteNote`, `updateNote`,
      `checkIfContactExists`, `addLastTalkNote`), `addDummyData`, the `Dummy_Data`
      array, and the now-unused `ContactItemType` / `NoteType` imports.
- [ ] Delete `types/ContactItemType.ts` and `types/NoteType.ts` if nothing else
      references them (grep first — after the edit above the only referrer is
      `Firebase.ts` itself).
- [ ] Keep Firebase Auth. Do **not** uninstall `firebase` or remove
      `NEXT_PUBLIC_FIREBASE_*` — auth still uses them.

**Done when:** `grep -ri "firestore"` across the repo returns nothing outside
comments, `useAuth()` and Google sign-in still work, and `type-check` + `build`
pass.

### Phase 6 — Email+password login

Branch: `feat/email-password-login`

Firebase Auth already supports this natively — no new backend, no email provider.
The work is client screens plus wiring the existing session-cookie POST.

- [ ] Extend `AuthContext`: `signUpWithEmail`, `signInWithEmail`,
      `sendPasswordReset`, `sendVerification`. Each awaits `postSessionCookie`
      before navigation, same as `loginWithGoogle`.
- [ ] Screens, built with `Components/ui/` primitives and the Tailwind theme
      colors (`blue1`, `blue3`, `grey3`) — no form library (none exists today):
  - [ ] Sign up (email, password, confirm) + "verify your email" pending state.
  - [ ] Sign in — email form beside the kept "Sign in with Google" button.
  - [ ] Forgot password → request reset.
  - [ ] Clear errors for "email already in use", "wrong password", "unverified
        email".
- [ ] Decide whether to **require** email verification before access, or allow in
      with a nudge. (Open — see below.)
- [ ] Firebase's default email templates are fine; branded templates are a later
      nicety.

**Done when:** you can sign up, receive the verification email, sign in with both
email and Google, reset a forgotten password, and the session survives a refresh
and a browser restart.

### Phase 7 — Real migrations + hardening

Branch: `chore/db-hardening`. The app is real now — stop dropping the database.

- [ ] Switch from `drizzle-kit push` to `drizzle-kit generate` + `migrate`; commit
      the generated SQL. Add `db:generate` / `db:migrate` scripts.
- [ ] Re-grep every `db.select` / `db.update` / `db.delete` and confirm each is
      scoped by `owner_id` or goes through the guard.
- [ ] Confirm Server Action input validation at the boundary (a Server Action is a
      public HTTP endpoint; its arguments are untrusted).
- [ ] Confirm connection counts and query times on the Neon dashboard under normal
      use — the first real serverless load on the pooled connection.

### Phase 8 — Linked users

Branch: `feat/linked-users`. Only after 1–7 are done and deployed.

Bob has a contact for Alice; Alice is also a user. When Bob marks that he talked to
Alice, **Alice's timer resets too**. A link shares **only the talk event** — notes
stay private, and each side keeps its own `cadence_days`.

- [ ] `link_requests` table: `link_request_status` enum (`pending`/`accepted`/
      `rejected`), `no_self_link` check, and a partial unique index on the sorted
      pair (`LEAST`/`GREATEST`, `WHERE status = 'pending'`) so crossed requests
      collapse and rejected/accepted rows survive as history.
- [ ] Add `linked_user_id text` to `contacts` (FK to nothing — a uid, like
      `owner_id`; `ON DELETE SET NULL` semantics enforced in code).
- [ ] Server Actions `sendLinkRequest`, `acceptLinkRequest`, `rejectLinkRequest`,
      `unlink`. Accept runs in a **transaction**: set status, link both rows, and
      create the other side's contact if missing.
- [ ] Extend `markAsTalked` to propagate in a transaction via the mutual-link join
      — it inserts zero rows when there is no link, one when there is, so no `if`
      is needed.
- [ ] UI for incoming and outgoing requests.

**Answer before building:** can a rejected request be re-sent (suggest: yes, but
rate-limited or only after the other side clears it)? what does the addressee see
(suggest: only name and email, never notes)? does accepting create a missing
contact (suggest: yes, with a default cadence)?

**Known soft spot:** a per-contact `linked_user_id` allows a half-link where only
one side points. A separate `contact_links` table holding the pair would make that
impossible, at the cost of one more table and join. Start simple; revisit here.

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
| Realtime       | None — Server Component read + `revalidatePath` after mutation |
| Existing data  | None. No migration script, no identity bridge, no dual-write. |
| Primary keys   | `uuid` / `gen_random_uuid()`, not `serial` |
| Timestamps     | `timestamptz`, never epoch ms |
| Talk events    | Own append-only `talk_events` table; no `last_talked` column, no "Talked on:" note |
| Notes          | Own table, private, never shared across a link |
| Linked users   | Shares the talk event only; needs a pending/accepted/rejected request flow (Phase 8) |
| Access control | Every query filters by `owner_id` from the server session, via `lib/db/queries/guards.ts` |

## Open questions

1. **Email verification gate (Phase 6):** require verification before access, or
   allow in with a nudge to verify?
2. **`linked_user_id` vs a `contact_links` table (Phase 8):** the known half-link
   soft spot above. Decide at Phase 8.
3. **The three Phase 8 link-request questions** (re-send after reject, what the
   addressee sees, whether accept creates a missing contact) — suggestions above,
   not yet decided. They block nothing before Phase 8.

## Notes on the PWA (out of scope)

`next-pwa@5.6.0` is a webpack plugin for Next 12; the repo builds with Turbopack,
which never calls it, so it is inert and **no service worker is generated**
(verified by a clean build 2026-09-16). Consequences: there is no cache that could
serve a signed-in page after sign-out, and the app is not actually an installable
PWA today despite the `manifest.json` link. `CLAUDE.md` still calls it an
installable PWA — that is wrong. Fixing or removing the PWA setup is **out of scope
for this migration**; just do not design around a service worker that does not
exist.

## i18n interaction (out of scope here, flagged)

`specs/i18n-german-translations.md` is unbuilt and its acceptance criterion is "no
user-facing English remains when German is selected". The Phase 6 auth screens are
new user-facing text — add them to that spec's surface list when it is picked up.
That spec is also stale (it says "Pages Router" and cites `pages/index.tsx`, both
untrue after the App Router migration) and needs a correction pass before anyone
builds from it.
