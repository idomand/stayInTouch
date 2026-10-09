# Architecture — why it is built this way

The _what_ (files, commands, the schema-change workflow) is in `CLAUDE.md`. This
file keeps the _why_: the reasoning behind the design, the directions we dropped,
and the lessons that cost time to learn. Read it before changing the schema, the
auth layer or the database setup.

The app moved its contact data from Firestore to Neon Postgres in 2026-09
(8 phases, finished 2026-09-30). Firebase stayed as the auth provider. The full
phase-by-phase plan is in git history as `specs/postgres-migration.md`.

---

## The shape in one paragraph

Firebase Auth owns identity (Google and email+password). Contact data lives in
Neon Postgres, reached only from the server through Drizzle. The server learns
who the caller is from a Firebase **session cookie** verified by
`firebase-admin`, so `owner_id` is a Firebase uid. There is no realtime: Server
Components read, Server Actions write and call `revalidatePath`.

## Decisions

| Concern            | Choice                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Database           | Neon (PostgreSQL), `eu-central-1`, pooled connection                                                                                            |
| ORM                | Drizzle, WebSocket driver (`neon-serverless`) — the HTTP driver can't run transactions                                                          |
| Auth provider      | Firebase. Google and email+password.                                                                                                            |
| Server identity    | Firebase session cookies verified by `firebase-admin`, through one `getServerUser()`                                                            |
| `owner_id`         | Firebase uid, bare `text`, no FK — identity is not in Postgres                                                                                  |
| Region             | Vercel `fra1`, to match Neon `eu-central-1`                                                                                                     |
| Domain             | `stay-in-touch.vip`                                                                                                                             |
| Email              | Firebase sends verification and reset emails. Resend sends the one notice per link request, from `invites@send.stay-in-touch.vip`, English only |
| Invite limit       | 3 invite emails per user per rolling 24 h, counted in `invite_emails_sent`                                                                      |
| Email opt-out      | `email_opt_outs` table; HMAC-signed link, confirm page + RFC 8058 one-click POST                                                                |
| Email verification | Required; the session route refuses to mint a cookie for an unverified email                                                                    |
| Realtime           | None — Server Component read + `revalidatePath` after each write                                                                                |
| Schema changes     | Generated migrations only; production migrated by hand before merge, never from the Vercel build                                                |
| Environments       | Neon branch `dev` for local work, `production` for Vercel                                                                                       |
| Primary keys       | `uuid` / `gen_random_uuid()`, not `serial`                                                                                                      |
| Timestamps         | `timestamptz`, never epoch ms                                                                                                                   |
| Talk events        | Own append-only `talk_events` table; no `last_talked` column                                                                                    |
| Notes              | Own table, private, never shared across a link                                                                                                  |
| Linked users       | Share the talk event only; links in a `contact_links` table                                                                                     |
| Access control     | Every query filters by `owner_id` from the server session, via `lib/db/queries/guards.ts`                                                       |

## Abandoned directions — do not rebuild

The first plan removed Firebase entirely. All of this was dropped:

- **Better Auth** (and before it, **Auth.js**) — not needed. Firebase Auth does
  email+password natively, and moving the database never required moving auth.
- **A Google OAuth client** in Google Cloud Console — Firebase handles Google
  sign-in.
- **`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`** — replaced by
  `FIREBASE_SERVICE_ACCOUNT_B64`.

## Server identity

Firebase auth state lives in the browser, but Postgres is reachable only from the
server, which must know the uid to fill or filter `owner_id`. Session cookies
bridge the two:

1. On login (Google, or email+password with a verified email) the client POSTs a
   fresh ID token to `app/api/auth/session/route.ts`, which sets an httpOnly
   `session` cookie.
2. Server code verifies it only through `getServerUser()`, with
   `checkRevoked = true` so a signed-out or disabled user is rejected. It is
   wrapped in React `cache()`: before that, `/settings` verified the cookie four
   times per render, each a network call.
3. Logout revokes the user's refresh tokens. Clearing the cookie alone left a
   copied cookie valid for its full 5 days.
4. `proxy.ts` checks only that the cookie **exists**. Full verification needs the
   Admin SDK, which can't run on Edge.
5. The cookie is minted again on every full page load (the `onAuthStateChanged`
   handler in `AuthContext`), so it never expires while the user keeps using
   the app. It runs after render, fire-and-forget, so it does not delay the
   page. Cost per full load:
   - In the browser: `getIdTokenResult()` (local), plus `getIdToken(true)` — one
     call to Google's token service — only when the token is older than 4 min.
   - One POST to `/api/auth/session`, which runs `verifyIdToken` (local check
     against cached Google public keys; a key fetch only when the cache expires)
     and `createSessionCookie` (one call to Google's Identity Toolkit).
   - Client-side navigation does not trigger it; only a full load does.

   Timing is not yet measured. To measure: DevTools → Network, reload `/`
   signed in, and read the duration of `POST /api/auth/session` (and of the
   `securetoken.googleapis.com` request when present). Record it here.

## Why the schema is shaped this way

- **`uuid` keys, not `serial`.** Ids appear in URLs and link requests; sequential
  ints leak volume and let neighbours be guessed.
- **An `owner_id` column, keyed on the uid.** Ownership becomes queryable and
  indexable. The old Firestore model keyed on `${email}${uid}`, so changing your
  Google email orphaned your data.
- **`cadence_days`, not `time`.** `time` is a Postgres type (needs quoting
  forever) and doesn't say what it measures.
- **`friend_email` is `NULL`, not `""`, when missing.** `NULL` means "no email";
  `""` would mean "the email is the empty string".
- **`UNIQUE (owner_id, lower(name))` in the database.** The old browser-side
  duplicate check let two tabs both add "Mom". The constraint makes the race
  impossible; actions catch error `23505` as "name taken".
- **`notes` is its own table.** Editing one note is one `UPDATE`, not
  read-whole-document → rebuild array → write. Ids are never reused.
- **`talk_events` is append-only.** "Last talked" is derived by a query, not
  stored. `talked_at` is when the talk happened (may be backdated); `created_at`
  is when the row was written; `created_by` is who clicked, which matters once a
  linked friend can click.
- **Index `(contact_id, talked_at DESC)`.** Every read is "newest event for this
  contact", served straight off the index.
- **Derived values in SQL.** `lastTalkedAt` and `daysUntilNextTalk` are computed
  in the query, never stored. `daysUntilNextTalk` uses `EXTRACT(EPOCH …)/86400`
  cast to `double precision` — `EXTRACT(DAY …)` truncates, and a `numeric`
  arrives from the driver as a string. Sorted `ASC NULLS FIRST` so never-contacted
  people come first.

## Security model

In Firestore, data was split by collection and guarded by rules. In Postgres,
**every user's contacts share one table and the database returns any row you ask
for.** The `owner_id` filter is the only wall between users. So:

1. Never trust an id from the client — it names a row, it doesn't prove access.
2. Every query filters by the uid from the **server session**, never from a
   request body or URL.
3. Writes too: `… WHERE id = $1 AND owner_id = $2`. Zero rows means not found.

`requireUser()` and `getOwnedContact()` in `lib/db/queries/guards.ts` are the one
choke point. `getOwnedContact()` returns `null` for a non-UUID id, which protects
every caller at once.

## Linked users

When Bob marks that he talked to Alice, Alice's timer resets too. Only the talk
event is shared; notes, names and cadence stay private.

| Question                              | Answer                                                                                                                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How is a link stored?                 | A `contact_links` table, both contact ids as FKs `ON DELETE CASCADE`. A `linked_user_id` column would allow half-links (one side deleted, the other still "linked") and push cleanup into code. The cost is one join. |
| Can a rejected request be sent again? | Yes. Only one _pending_ request per contact (partial unique index); rejected rows stay as history.                                                                                                                    |
| How many links between two people?    | One. Enforced in the accept transaction (advisory lock on the uid pair), because the link row holds contact ids and no constraint can express it.                                                                     |
| What does the addressee see?          | The requester's display name and email only.                                                                                                                                                                          |
| Accepting with no matching contact?   | The accept dialog lets you pick an existing contact or create one. No silent auto-create — name matching is unreliable.                                                                                               |

Requests are addressed to an **email and never resolved to a uid**. Resolving
would let the sender see which emails have an account. The addressee sees
requests sent to their verified session email; after accept, the link is two
contact ids and emails play no part.

The NavBar badge is a client component that loads its count on navigation.
Accept and reject keep the user on `/settings`, so that page pushes its fresh
`incoming.length` into `PendingRequestCountContext` after each revalidation.

Known limitations: a sender may re-send after every reject (no cooldown); the
daily invite limit is the only brake. A pending request is lost if the addressee
changes their email. Request history is deleted with the sender's contact.

## Link invite emails

Every link request sends one email to the addressee (`lib/email/`, Resend). The
plan in `specs/link-invite-emails.md` has the full reasoning; the parts that
shape the code:

- **Same email for everyone.** No branch on "has an account": that needs a uid
  lookup by email, which would reveal who uses the app. Existing users also had
  no notification before, so they gain from it too.
- **The email is best-effort.** It is sent with `after()` once the transaction
  commits. A failed send is logged and the request still stands: the row is the
  real invite.
- **The limit is counted in its own table.** `link_requests` rows are deleted
  with the sender's contact, so "add contact → send → delete contact" would reset
  a count taken from there. `invite_emails_sent` has no FK for the same reason.
  Count and insert run in one transaction under a per-user advisory lock, so two
  parallel sends cannot both pass.
- **An opted-out address still uses one daily invite,** and the sender is never
  told. The behaviour is the same for every address.
- **Opt-out never happens on GET.** Link scanners open links. `/unsubscribe`
  shows a confirm button; the `List-Unsubscribe` URL accepts POST only. The
  link carries an HMAC of the address (`EMAIL_UNSUBSCRIBE_SECRET`), so only the
  recipient can opt that address out, and no sign-in is needed.
- **Sender subdomain.** `send.stay-in-touch.vip` was already verified in Resend;
  bad reputation there cannot hurt the root domain.

## Account deletion

`deleteAccount()` in `lib/actions/account.ts`, from `/settings` (simple confirm,
no re-sign-in). Spec: `specs/account-deletion.md`.

- **Database first, Firebase second.** One transaction deletes the requests
  addressed to the user's email, their `invite_emails_sent` rows and their
  contacts (the cascade removes notes, talks, links and sent requests). Then
  `adminAuth.deleteUser`. If Firebase fails, the user can sign in and retry;
  the reverse order could leave rows nobody can delete.
- **Kept on purpose.** Talk events the user created on a linked friend's
  contact are the friend's history (`created_by` is an opaque uid).
  `email_opt_outs` must outlive the account, or the address could get invite
  emails again.
- Other devices are signed out because `verifySessionCookie(…, true)` rejects
  a deleted user.

## Lessons learned

- **`DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT_B64`, `RESEND_API_KEY`,
  `EMAIL_UNSUBSCRIBE_SECRET` and `APP_URL` are build-time requirements.** All
  throw at module load, and Next imports route modules while collecting page
  data. Set them in Vercel before any deploy that imports them.
- **`firebase-admin` and `jose`.** `firebase-admin` pulls in ESM-only `jose`,
  which broke `require()` in the Vercel bundle. Fixed by pinning Vercel Node to
  24.x, forcing CommonJS `jose@5.10.0` (commits `59e4cf9`, `037592f`) and
  `serverExternalPackages: ["firebase-admin"]` in `next.config.js`. Re-check when
  `firebase-admin`, `jose` or the Vercel Node version changes.
- **`ws` looks unused but isn't removable blindly.** Node 22+ has a native
  `WebSocket`; `ws` keeps the client the same across Node versions. Check the
  Vercel Node setting before removing it.
- **`process.loadEnvFile(".env.local")` doesn't override a variable already set in
  the shell.** That is what lets a production migration run from the laptop — and
  why a leftover shell `DATABASE_URL` silently sends later commands to production.
- **The dev pool cache must know its URL.** `lib/db/index.ts` caches the pool on
  `globalThis` for dev reloads. Without the URL in the cache, a `npm run dev`
  started before `.env.local` changed kept writing to the old database
  (production).
- **drizzle-kit `migrate` can exit with no message on failure.** Only
  `[✓] migrations applied successfully!` means success; confirm in
  `drizzle.__drizzle_migrations`.
- **Never paste a connection string into a chat.** The production password was
  reset on 2026-09-30 after that happened. Vercel's `DATABASE_URL` is marked
  Sensitive, so read connection strings from Neon → Connect.
- **Neon monitoring** (connections, query times on `production`) still needs
  checking under real use.
