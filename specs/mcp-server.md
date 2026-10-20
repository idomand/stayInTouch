# Spec for MCP server

## Summary

Let users drive the app from an AI agent through an MCP server: "mark that I
talked to Bob", "add a new friend named David". The server exposes a few app
actions as MCP tools.

**This work is the MVP only.** It targets agents that accept a custom header
(Claude Code, Cursor, the MCP Inspector). Phase 2 (regular claude.ai and ChatGPT
users, which needs OAuth) is described at the end for later. It is **not** built
now and starts only with explicit approval.

Decisions:

- **Remote MCP inside the Next app**: `/api/mcp`, Streamable HTTP, on Vercel. It
  reuses the database, guards and validation directly, and phase 2 builds on it.
- **Personal access tokens** for auth: `Authorization: Bearer <TOKEN>`.
- **Three tools**: `find_contacts`, `mark_as_talked`, `add_contact`.
- **Lookup by name.** Contact names are unique per user, case-insensitively
  (index `contacts_owner_name_unique` on `(owner_id, lower(name))`). An exact
  case-insensitive match is always one contact, so there is no "pick one of
  several" flow. On a miss, the tool writes nothing and suggests similar names
  from the caller's own contacts.
- **Every lookup is scoped to the caller's uid.** The agent can never see,
  suggest or change another user's contacts.

## The key constraint

Every Server Action gets the user from the session cookie: `requireUser()` →
`getServerUser()` (`lib/db/queries/guards.ts`, `lib/auth/getServerUser.ts`). An
MCP request has a bearer token and no cookie. So the logic is split:

- **Core functions take a `uid`.** They hold the logic and the ownership checks.
- **Two thin entry points supply the uid**: Server Actions (from the cookie) and
  MCP tools (from the token).

Core functions must never call `requireUser()` or `getServerUser()`.
`requireUser()` throws `redirect("/login")`, which breaks a route handler
response, and `getServerUser()` reads a cookie an MCP call does not have.

### User scoping — the security rule for the whole feature

- The uid comes only from the verified token (`authInfo.extra.uid`). No tool
  takes a uid, owner or email input.
- Every query a tool runs filters by `owner_id = uid`: the name lookup, the
  similar-name suggestions, `find_contacts` and the writes.
- `getOwnedContactByName(uid, name)` lives in `lib/db/queries/guards.ts`, next to
  `getOwnedContact`, so the owner filter stays in one choke point.

## Functional Requirements

### Step 1 — Refactor to a uid-based core (no behaviour change)

- New `lib/contacts/core.ts` (`server-only`, a plain module, not `"use server"`):
  - `addContactForUser(uid, input)` → `{ ok: true, contactId }` or
    `{ ok: false, error: ErrorMessage }` (an untranslated key).
  - `markAsTalkedForUser(uid, contactId, timeZone)` → `{ ok: true, inserted }`
    or an error key. `inserted: false` is the same-day no-op.
  - `insertSharedTalkEvent` moves here (also used by `addTalkEvent`).
- `addContact` and `markAsTalked` in `lib/actions/contacts.ts` become:
  `requireUser()` → core → `actionError(...)` on error → `revalidatePath("/")`.
  Their signatures and return types stay the same.
- `getContactsForUser(uid)` in `lib/db/queries/contacts.ts`;
  `getContactsForCurrentUser()` calls it.

### Step 2 — Personal access tokens

- Table `api_tokens`: `id uuid`, `owner_id text`, `name text`,
  `token_hash text unique`, `token_prefix text` (for display), `created_at`,
  `last_used_at` (nullable).
- Token: `sit_` + 32 random bytes, base64url. Only its **SHA-256** is stored (the
  token has high entropy, so a slow hash adds nothing). Shown to the user once.
- Revoke = delete the row. At most 5 tokens per user (`ConstantsFile.ts`).
- `lib/auth/apiToken.ts`: create, hash, and `verifyApiToken(raw)` → uid or null.
  Verify looks the hash up, then calls `adminAuth.getUser(uid)` and rejects a
  disabled user or an unverified email (the cookie path rejects these too), then
  updates `last_used_at`.
- Actions `createApiToken(name)` and `revokeApiToken(id)`; query
  `getApiTokens()`. All through `requireUser()` and the `owner_id` filter.
- `deleteAccount` deletes the user's `api_tokens` rows in its transaction.
- Schema change through the normal flow: `db:generate` → read the SQL →
  `db:migrate` on dev.

### Step 3 — Settings UI

- `Components/settings/ApiTokens.tsx` on `/settings`, for signed-in users only
  (same gating as email notifications).
- Create a token with a name; show it once with a copy button. List name,
  prefix, created and last used. Revoke with a confirm.
- A connect hint with the real token filled in, and a copy button:
  `claude mcp add --transport http stay-in-touch <APP_URL>/api/mcp --header "Authorization: Bearer <TOKEN>"`.
  Not an env-var form (`${STAY_IN_TOUCH_TOKEN}`): PowerShell expands it to an
  empty string inside double quotes, and Claude Code documents `${VAR}`
  expansion in headers only for `.mcp.json`, not for `claude mcp add`. A note
  says the token is saved in Claude Code's settings on that computer.
- A note that signing out does not revoke tokens.
- All text in `i18n/en.json` and `i18n/de.json` (new `apiTokens` section).

### Step 4 — MCP endpoint

- Dependencies: `mcp-handler`, `@modelcontextprotocol/sdk`, `zod`. Stateless
  Streamable HTTP; no Redis.
- `app/api/[transport]/route.ts` with `basePath: "/api"`, served at `/api/mcp`.
  Wrapped in `withMcpAuth(…, { required: true })`. No token, a bad token or a
  revoked token → 401.
- `proxy.ts` matcher stays `["/", "/profile"]`. `/api/mcp` must not be
  cookie-gated.
- Tool errors are English text: the `ErrorMessage` key is translated with
  next-intl `createTranslator({ locale: "en", messages: en })`, so the existing
  `errors` strings are reused. Returned as tool errors (`isError: true`), not 500s.
- No `revalidatePath` in tools: pages read cookies and render dynamically.
- The route never logs the `Authorization` header.

| Tool             | Input                                                                                 | Behaviour                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `find_contacts`  | `query?: string`                                                                      | The caller's contacts, filtered by a case- and accent-insensitive substring; no query = all. Returns id, name, cadenceDays, daysSinceLastTalk (rounded), daysUntilNextTalk, `status` (`never` / `overdue` / `ok`), isLinked. **No `friendEmail`.** Most overdue first, at most 50. Read-only. |
| `mark_as_talked` | `name: string`, `timeZone?: string` (IANA)                                            | `getOwnedContactByName` (exact, case-insensitive, SQL `lower()`) → `markAsTalkedForUser`. Returns "recorded" or "already marked today", and says when the talk was also shared with a linked friend. On a miss: no write, up to 5 similar names from the caller's contacts.                   |
| `add_contact`    | `name`, `cadenceDays` (1–60), `friendEmail?`, `lastTalkedAt?` (ISO date), `timeZone?` | `addContactForUser`. The description tells the agent to ask the user for the cadence and never invent values. Returns the new id.                                                                                                                                                             |

Tool annotations: `find_contacts` is `readOnlyHint: true`; the writes are
`destructiveHint: false`.

### Step 5 — Docs

- `CLAUDE.md`: an "MCP server" section — the route, token auth, the core vs
  action split, and the rule that tools call core functions with the uid from
  `authInfo`.
- `specs/architecture.md`: the reasoning — why remote, why hashed tokens, why
  lookup by name.
- `/privacy` (en + de): contact names reach the AI provider the user connects.
  Wording is the owner's call.

Each step is its own commit.

## Possible Edge Cases

Lookup and isolation:

- "bob" with a stored "Bob" → exact case-insensitive match, marked.
- "Bob" with a stored "Bob Smith" → no write; "Bob Smith" is suggested; the agent
  confirms and calls again.
- No similar names → "no contact named Bob"; the agent may offer `add_contact`.
- Another user has "Bob" and the caller does not → not found. The other user's
  contact is never matched or suggested.
- The name is matched with SQL `lower()`, not JS `toLowerCase()`, so it matches
  exactly what the unique index treats as equal (`ß`, `İ`). Input is trimmed.

Writes:

- Marked twice on the same day → `inserted: false`, reported, no duplicate.
- Linked contact → the talk is also written to the friend's contact
  (`insertSharedTalkEvent`), same as the button. Nothing from the friend's side
  is returned.
- Duplicate name on `add_contact`, also from parallel calls → `nameTaken` (unique
  index plus `isUniqueViolation`).
- `lastTalkedAt` is a date. It is stored at local noon in `timeZone`, like the
  history dialog, so the day does not shift; noon UTC without a zone. Future
  dates are rejected by `validateTalkedAt`.
- No `timeZone` → UTC for the "once per day" check. Near midnight a second mark
  can be added or skipped. Accepted for the MVP; follow-up: store the user's
  zone in `user_settings`.
- No `note` input: notes are parked (C1) and no UI shows them, so a note saved by
  the agent would be invisible.

Auth and accounts:

- Revoked token or deleted account → 401.
- Disabled Firebase user or unverified email with a live token → 401.
- Logout ("signed out everywhere") does not revoke tokens. The tokens UI says so.
- Account deletion deletes DB rows first, so tokens die before the Firebase user.

Platform:

- `package.json` forces `jose@5.10.0` for `firebase-admin`. After adding the MCP
  packages, run `npm ls jose`; a package that needs jose 6 would silently get 5.
  Check the `zod` major the SDK expects too.
- `api_tokens` needs the manual production `db:migrate` before the PR merges.
  Dev tokens do not work on production (separate databases).
- Vercel deployment protection blocks `/api/mcp` on preview URLs. Test on
  localhost.
- No realtime: an open app tab shows an MCP change only after a reload or
  navigation. The talk effect does not play.
- The service worker caches only `/_next/static/*`; agents do not go through it.
- No new env variable, so no new build-time requirement.
- No analytics events for MCP. If added later: no names, ids or emails.

## Acceptance Criteria

- The app UI behaves exactly as before step 1: add contact, mark as talked
  (effect plays, second click the same day is a no-op), mark on a linked contact
  (both sides), add a past talk.
- A signed-in user can create, copy, list and revoke tokens on `/settings`, in
  English and German. Deleting the account removes their tokens.
- With a valid token, an agent can find contacts, mark a talk by name and add a
  contact.
- No token, a revoked token, or a disabled user → 401.
- With user A's token, nothing of user B's is found, suggested or changed.
- `npm run type-check`, Prettier on touched files, `npm run lint` and
  `npm run build` pass.

## Open Questions

- `/privacy` wording for data sent to the user's AI provider.
- Token expiry: none in the MVP (manual revoke, "last used" shown). Revisit if
  needed.

## Testing Guidelines

The repo has no test framework. Verify by hand:

1. `npm run type-check`, Prettier on touched files, `npm run lint`,
   `npm run build`.
2. After step 1, the UI regression list in the acceptance criteria.
3. MCP Inspector: `npx @modelcontextprotocol/inspector` →
   `http://localhost:3000/api/mcp` with `Authorization: Bearer <TOKEN>`. Check
   401 cases and each tool.
4. Isolation: accounts A and B; only B has a contact "Zed". With A's token,
   `mark_as_talked("Zed")` and `find_contacts("Zed")` return nothing, and B's
   history is unchanged.
5. Claude Code end to end: "mark that I talked to Bob", "add a friend named
   David" (the agent asks for the cadence), and "Bob" vs "Bob Smith". Confirm in
   the app.

## Phase 2 (future — not part of this work)

> Out of scope now. Nothing here is built, installed or migrated as part of the
> MVP. It starts only after the MVP ships and with explicit approval.

claude.ai and ChatGPT connect only to remote MCP servers that use **OAuth 2.1**;
normal users cannot paste a token. The MVP endpoint and tools stay; only the
auth layer grows.

1. **Discovery:** `/.well-known/oauth-protected-resource` (RFC 9728) and
   authorization server metadata (RFC 8414). 401s carry `WWW-Authenticate` with
   the resource metadata URL.
2. **Authorization server — recommendation: a minimal one in the app**, because
   identity is Firebase and the app already has the session and the token table.
   - Client registration: Dynamic Client Registration (RFC 7591) and/or Client
     ID Metadata Documents. Check what each client needs at that time.
   - `/oauth/authorize`: requires the Firebase session, shows a consent screen
     (i18n), issues a one-time code. PKCE S256 only.
   - `/oauth/token`: code → short-lived access token + refresh token. Reuses
     `api_tokens` (adds `kind`, `client_id`, `expires_at`) so verification and
     revoking keep working.
   - Alternative: a managed provider (WorkOS AuthKit, Stytch, Auth0). Less
     security code to own, but a second identity system to map onto Firebase
     uids. Decide at the start of phase 2.
3. **Sign-in flow:** `/login` today always goes to `/`. It needs a safe return
   URL (same origin only, no open redirect) and must keep the `hasSession` rules
   so an unverified user does not loop. Add `/oauth/authorize` to the `proxy.ts`
   matcher.
4. **Hardening:** a Vercel WAF rate-limit rule on `/api/mcp` and `/oauth/*`
   (today an agent loop could create many contacts), token scopes
   (`contacts:read`, `contacts:write`). Decide whether logout revokes OAuth
   grants (recommendation: no; revoke on `/settings`).
5. **Distribution:** claude.ai custom connectors and ChatGPT developer-mode
   connectors work once OAuth is live. Directory listings need a review, a
   privacy policy and tool annotations. Check current requirements then.
6. **More tools:** `add_talk_event` (past date), `list_overdue`,
   `update_contact`, `delete_talk_event` (undo a wrong mark).
