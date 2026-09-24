# Session handoff — 2026-09-23

Latest state before a session restart (to reconnect the Neon MCP). Read this first
on resume. This supersedes nothing in the specs by itself — it points at the
approved plan and records the decisions made in this session.

## The decision that changed the direction

The existing specs (`specs/firestore-to-postgres.md`,
`specs/postgres-execution-plan.md`) were built to **remove Firebase entirely** and
replace it with **Better Auth** (Google + email/password), Resend email, a verified
sending domain, and a Google OAuth console setup.

**That end goal is now dropped.** The new end goal:

> **Keep Firebase as the auth provider. Add email+password as a second login option
> alongside the existing Google sign-in. Move only the contact _data_ from Firestore
> to Neon Postgres.**

Rationale: Firebase Auth already does email+password natively
(`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`,
`sendPasswordResetEmail`, `sendEmailVerification`), so "keep Firebase + add
email/password" needs **none** of the Better Auth machinery. This is simpler and
lower-risk, and still fully serves the learning goal (schema, SQL, Server Actions,
connection management). Auth and data were always separable.

## What this drops from the old specs

- **Better Auth** — not built. Firebase owns identity.
- **Resend + `send.stay-in-touch.vip` + DKIM/DMARC/SPF** — off the critical path.
  Firebase sends its own verification/reset emails. The `.vip` deliverability risk
  disappears. Keep only as a later "branded emails" nicety.
- **Google OAuth client in Google Cloud Console + wildcard preview domain** — not
  needed. Firebase handles Google OAuth.
- **`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`** — replaced by a Firebase service
  account secret (for the Admin SDK).
- Kept and still useful: the `stay-in-touch.vip` domain and the `fra1` Vercel
  function region already configured.

## The one architectural pillar

Postgres can only be reached from the server (`lib/db/index.ts` imports
`server-only`). The server must know **who** the user is to fill `owner_id`. All
Firebase identity today is client-side — there is no `firebase-admin`, no server
session. So the data layer needs a **server-side Firebase identity layer**, built
with **Firebase session cookies**:

1. On login (Google or email/password), the client gets a Firebase ID token and
   POSTs it to a route handler.
2. The handler calls `firebase-admin` `createSessionCookie()` and sets an httpOnly
   cookie.
3. Server Components and Server Actions read the cookie, call `verifySessionCookie()`
   to get the uid — through **one shared helper**, `getServerUser()`.
4. Logout clears the cookie.

Because Firebase is now permanent, this layer is the **real architecture, not a
throwaway bridge**. The login provider is irrelevant below this line.
`owner_id = Firebase uid` (stable; not email). New secret:
`FIREBASE_SERVICE_ACCOUNT_B64` (base64 service-account JSON — name only, never the
value).

## Approved plan and build order

Full plan file (approved this session):
`C:\Users\idoma\.claude\plans\please-read-specs-and-happy-hearth.md`

Order — DB migration first (the spine), email+password is an independent add-on:

| Phase | What | Status |
| ----- | ---- | ------ |
| 1 | Neon + Drizzle client | **done** (pre-existing) |
| 2 | **Postgres schema** — `contacts`, `notes`, `talk_events` | **next — not started** |
| 3 | Firebase server identity (firebase-admin + session cookies) | pending |
| 4 | Postgres data layer (guard → reads → writes → clean up old model) | pending |
| 5 | Remove Firestore data access only (keep Firebase Auth) | pending |
| 6 | Email+password login (Firebase provider + screens) | pending |
| 7 | Real migrations + hardening | pending |
| 8 | Linked users | pending |

## Current repo state (verified this session)

- `lib/db/index.ts` — shared Neon client, `neon-serverless` (WebSocket/Pool)
  driver, `server-only`, fail-fast on `DATABASE_URL`, dev-reload pool reuse. Ready.
- `drizzle.config.ts` — points at `./lib/db/schema` (empty), `out: ./lib/db/migrations`,
  loads `.env.local` via `process.loadEnvFile`.
- `lib/db/schema/` — **empty**. No tables yet.
- Deps present: `drizzle-orm ^0.45.2`, `drizzle-kit ^0.31.10`,
  `@neondatabase/serverless ^1.1.0`, `ws ^8.21.3`, `server-only ^0.0.1`,
  `firebase 11.10.0`. **Not** installed: `better-auth`, `firebase-admin`.
- No `db:*` npm scripts yet.
- `lib/Firebase.ts` — `auth` + `provider` (line 27-28, KEEP) are cleanly separable
  from `getFirestore()` (line 29) and the contact CRUD below it (to be removed in
  Phase 5). All data functions take `(userId, userEmail, ...)` and build the
  `` `${email}${uid}` `` Firestore collection name.
- `useAuth()` has 12 consumers; 9 read `uid`+`email` together. `MainForm.tsx:31`
  reads `displayName`; `lib/CalenderFunctions.ts:35` reads `auth.currentUser` directly.
- Branch: **on `main`, clean.** No Phase 2 branch cut yet.

## Blocked on: Neon MCP connection

Decision this session: connect **Neon's official MCP server** so schema
push/verify runs from chat instead of handing SQL back. As of this handoff the MCP
is **not connected** (a tool scan found no Neon tools — newly added MCP servers
only load at session start, hence the restart).

To connect (user's terminal):
```
claude mcp add --transport http neon https://mcp.neon.tech/mcp
```
(OAuth in browser. If `http` errors, try `--transport sse https://mcp.neon.tech/sse`,
or local: `claude mcp add neon -- npx -y @neondatabase/mcp-server-neon start <NEON_API_KEY>`.)
Verify with `claude mcp list`, then **restart the session**.

## Next actions on resume

1. Confirm the Neon MCP tools are registered (ask me to re-scan).
2. **Get go-ahead to cut the branch** `feat/postgres-schema` off updated `main`
   (git workflow rule: every git action needs explicit confirmation; no code on
   `main`).
3. Write Phase 2 files: `lib/db/schema/contacts.ts`, `notes.ts`, `talkEvents.ts`,
   `index.ts` (barrel + inferred types), and add `db:push` / `db:studio` scripts.
   `owner_id` / `created_by` are `text` Firebase uids with **no FK** (no users
   table). Unique functional index `(owner_id, lower(name))`; composite index
   `(contact_id, talked_at DESC)`.
4. Push to Neon; verify indexes/constraints exist and a duplicate
   `(owner_id, lower(name))` insert is rejected. Run `type-check` + `build`.

## Open (non-blocking) decisions

- **Email templates** — default to Firebase's built-in emails; branded later.
- **Email+password ordering** — after the data layer, per "start with DB changes";
  can be pulled forward (no dependency on the DB work).

## Also outstanding

The two old spec files still describe the Better Auth end state and should be
revised (or given a superseding round) to match this direction, so a future
contributor doesn't build the wrong thing.
