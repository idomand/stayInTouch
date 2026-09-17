# Firestore to Postgres Migration — Design and Decisions

A record of the planning conversation: the questions, the answers, the reasons
and the decisions.

This document explains **what** is being built and **why**. The ordered task
list for actually building it is in `specs/postgres-execution-plan.md`, which is
the authority on sequencing.

## Status

**Planning complete. No code written yet.** One open question blocks nothing but
should be answered early (apex vs `www`). Start at Phase 0.1 — the domain — in
the execution plan.

## How to read this document

It is a conversation record, so it is chronological and later rounds override
earlier ones. Superseded decisions are struck through or marked, not deleted,
so the reasoning survives.

| Round | What it settles                                                                     |
| ----- | ----------------------------------------------------------------------------------- |
| 1     | Can it be done, should it be done, the general steps                                |
| 2     | Project context: portfolio, free tier, learning goal. Neon and Drizzle chosen       |
| 3     | Four requirements: leave Firebase entirely, event table, linked users, no live data |
| 4     | **The agreed schema**, with the reasoning behind every column                       |
| 5     | Auth revisited: Better Auth over Auth.js. Dummy data dropped. Neon tier confirmed   |
| 6     | **Feasibility audit** against the real codebase and the free tiers. Six findings    |

If you only read two sections: **Round 4** (the schema) and **Round 6** (what
will bite you).

## Starting point

- Next.js app hosted on Vercel.
- Today it is frontend only. The backend is Firebase (Auth + Firestore).
- Goal: move the backend into Next.js and replace Firestore with PostgreSQL.

## Round 1 — general questions

### Can it be done?

Yes. Next.js is a full-stack framework. It offers three backend tools:

- **Route Handlers** (`app/api/.../route.ts`) — REST-style API endpoints.
- **Server Actions** — server functions called from components. Good for writes.
- **Server Components** — query the database while rendering. Good for reads.

### Is it recommended?

It depends on the reason.

Good reasons:

- The data is relational (joins, transactions, complex queries). Firestore is weak here.
- Firestore costs grow with reads and writes.
- One stack and less lock-in to Google.

Reasons for caution:

- **Real-time.** Firestore has live listeners built in. Postgres does not.
- **Auth.** Firebase Auth is separate from Firestore. Moving the database does
  not require moving auth. Decide the two separately.
- **Data model.** Turning documents into tables (or `jsonb` columns) is usually
  the hardest part.
- **Opportunity cost.** If the current setup works, "one stack" alone may not
  justify the risk.

**Vercel warning:** serverless functions can open too many database connections
and exhaust a normal Postgres pool. Use a serverless-friendly provider with
connection pooling (Neon, Supabase, Vercel Postgres). This is not optional.

### Steps (general version)

1. Pick a Postgres host and an ORM (Drizzle or Prisma).
2. Design the relational schema from the Firestore collections.
3. Create one shared database client. Use the pooled connection string.
4. Write a script that copies data from Firestore (Admin SDK) to Postgres.
5. Move reads and writes to Route Handlers, Server Actions or Server
   Components, one feature at a time.
6. Decide on auth separately.
7. Plan real-time explicitly if the app uses it.
8. Run both databases in parallel (dual-write) and check the data matches.
9. Test, switch over, and watch connection counts and query speed.

## Round 2 — project context

The app is a **personal portfolio project**. Two constraints:

- Keep everything on **free tiers**.
- **Learn full-stack development**, not only frontend.
- Firebase Auth stays for now. _(Changed in Round 3 — auth also moves off Firebase.)_

### How the answer changes

The answer becomes **yes, do it**.

- There are no users or revenue at risk, so migration risk mostly disappears.
- The migration is the learning goal, so the effort is not a cost.
- Designing a schema, writing queries, managing connections and running
  migrations is exactly the frontend-to-full-stack gap. Firestore hides that work.
- Skip the heavy cutover work (dual-write, parallel run). Build it and switch.
  _(Round 3 goes further: there is no live data, so there is no data migration
  at all.)_

### What is Neon?

A hosted, serverless PostgreSQL provider with a free tier.

- Built for serverless. It has built-in pooling and an HTTP driver, so it works
  well on Vercel.
- Can scale to zero (sleeps when idle), which helps stay free.
- It is standard Postgres. SQL and schema skills transfer anywhere.
- Vercel Postgres runs on Neon.
- Alternative: **Supabase** (Postgres plus auth, storage and real-time).
- Free-tier limits change. Check Neon's pricing page before starting.

### What is Drizzle?

A TypeScript ORM. You write queries in TypeScript with full type safety.

```sql
SELECT * FROM projects WHERE user_id = '123' ORDER BY created_at DESC;
```

becomes:

```ts
await db
  .select()
  .from(projects)
  .where(eq(projects.userId, "123"))
  .orderBy(desc(projects.createdAt));
```

Why Drizzle for this project:

- It stays close to SQL, so it teaches real SQL. Prisma hides more.
- It is light and works well with Neon and Vercel.
- The schema lives in TypeScript and Drizzle generates the SQL migration files.
- Prisma is the fallback if Drizzle feels too low-level.

### Real-time without Firestore

First question: is it needed? Most portfolio apps do not need it.

Options, from simplest to most work:

1. **Refetch after a change** — e.g. `revalidatePath` after a Server Action.
   Enough for most apps.
2. **Polling** — the client asks for new data every few seconds.
3. **Server-Sent Events (SSE)** — one-way server-to-client stream, native in browsers.
4. **WebSockets** — two-way. Vercel functions cannot keep a socket open, so this
   needs a separate service (Pusher, Ably, Supabase Realtime).
5. **Supabase instead of Neon** — built-in subscriptions similar to Firestore.
   Choose this from the start only if real-time is central.

Recommendation: start with option 1.

### Keeping Firebase Auth

> **Superseded by Round 3.** Firebase Auth is being removed too. Kept here as a
> record of the option that was rejected.

Firebase Auth keeps working when Firestore is removed. The new work is verifying
the token on the server:

1. The client signs in with Firebase and gets an ID token.
2. The client sends the token to a Route Handler or Server Action.
3. The server verifies it with the **Firebase Admin SDK** and reads the user id.
4. The server uses that id as `user_id` in Postgres queries.

Firebase owns identity. Postgres owns the data.

## Round 3 — three new requirements

### 1. Leave Firebase completely, including auth

The goal is no Firebase at all. Identity moves into Postgres next to the data.

The goal is **not** to write auth by hand. Use a library and own the tables.

> **The library choice changed in Round 5.** This round picked Auth.js with
> Google-only sign-in. Round 5 rejects that and picks Better Auth with
> email/password. Kept here as a record.

- ~~Choice: Auth.js (NextAuth v5) with the Drizzle adapter.~~
- ~~Keep Google as the only sign-in provider; no password storage to secure.~~
- ~~Adding email/password later is a separate, optional step.~~

Because there is no live data (see point 4), there is nothing to map from
Firebase uids to new user ids. Everyone signs up again and gets a fresh row.

### 2. An event table instead of a timestamp column

_(Named `last_talked` in this round. Renamed to `talk_events` in Round 4 — see
the naming rule there.)_

Today one number on the contact holds the last talk time, and the app writes a
cosmetic `"Talked on: <date>"` note beside it.

Replace both with an **event table**. Every click of "I talked to them" inserts
a row. Nothing is overwritten.

- The old `timeFromLastTalk` column is **removed**. The value becomes the newest
  row in the event table for that contact.
- `timeUntilNextTalk` stays a derived value, now computed from that newest row.
- The auto-generated `"Talked on: <date>"` note is **deleted**. That information
  is the event table's job. Notes go back to being only what the user wrote.
- A contact with no rows yet has never been talked to. The UI must handle that
  case, which the current model cannot even express.

Why this is better: it gives a real history ("we talk every 9 days on average"),
it is append-only so nothing is lost, and undoing a mistaken click becomes
deleting one row.

### 3. Linked users (future refactor, design for it now)

Bob has a contact for Alice. Alice is also a user, and has a contact for Bob.
When Bob marks that he talked to Alice, **Alice's timer resets too**.

Scope of a link — decided:

- A link shares **only the "last talked" event**. Nothing else.
- Notes are **private** and are never shared. They are one user's private record
  about a person.
- `time` (the check-in cadence) stays private per side. Bob may want every 7
  days, Alice every 30. The link does not force them to agree.

This needs a friend-request flow, not just a link column:

1. Bob sends a link request from his contact for Alice.
2. The request sits as **pending**.
3. Alice sees incoming requests and can **accept** or **reject**.
4. On accept, the two contact rows are linked and talk events propagate both ways.
5. Either side can **unlink** later.

Open questions for when this is built:

- Can a user re-send a request that was rejected? Suggest: yes, but rate-limited
  or only after the other side clears it, so reject is not a way to be pestered.
- What does Alice see in the request? Suggest: only Bob's name and email, never
  his notes.
- If Alice has no contact for Bob, does accepting create one? Suggest: yes,
  created with a default cadence, otherwise there is nothing to link to.

### 4. No live data — build the database from scratch

There are **no real active users**. Nothing in Firestore needs to be kept.

This removes most of the risk and a whole phase of work:

- **No migration script.** Do not write a Firestore → Postgres copy job. Create
  the Postgres schema and start empty. _(Round 5: the dummy-data seeding is
  dropped too, so a new account really is empty.)_
- **No identity bridge.** No `firebase_uid` column, no mapping from old ids to
  new ones. Everyone signs in again and gets a new row.
- **Breaking changes are free.** Field names, types and table shapes can change
  at any point without a data fix-up. Rename things to what they should have
  been called. Drop and recreate the database instead of writing a careful
  migration when the schema is still moving.
- **Switch, do not run in parallel.** No dual-write and no comparison phase.
- **The old Firestore project is simply deleted** once the app runs on Postgres.

One consequence worth naming: the "we talk every 9 days on average" history that
the event table enables starts empty. Nobody loses anything, because that
history does not exist today either — Firestore only ever kept the single most
recent value.

## Round 4 — the schema in detail

### Current Firestore structure, for reference

There is no user collection and no nesting. Firestore holds **one root-level
collection per user**, named by string concatenation: `` `${email}${uid}` ``.
That string is rebuilt at 8 call sites in `lib/Firebase.ts` and
`utils/hooks/useSnapshotData.ts`. Each document is one contact:

| Field              | Type                        | Notes                                                     |
| ------------------ | --------------------------- | --------------------------------------------------------- |
| `name`             | string                      | unique per user, case-insensitive, checked in the browser |
| `time`             | number                      | check-in cadence in days                                  |
| `timeFromLastTalk` | number                      | epoch ms of the last talk                                 |
| `friendEmail`      | string                      | optional; only prefills a Google Calendar guest           |
| `notesArray`       | array of `{ noteId, data }` | embedded, not a subcollection                             |

`contactId` and `timeUntilNextTalk` exist only on the client and are never
written.

### Target schema — final

The auth library owns the identity tables; their shape is generated, not written
by us. **Round 5 changed the library to Better Auth**, whose generated tables are
`user`, `session`, `account` and `verification` — singular. The DDL below still
writes `REFERENCES users(id)`; point those foreign keys at the real generated
table name once the CLI has run.

The app owns the four tables below.

```sql
CREATE TABLE contacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  cadence_days   integer NOT NULL DEFAULT 7 CHECK (cadence_days > 0),
  friend_email   text,
  linked_user_id text REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);


CREATE UNIQUE INDEX contacts_owner_name_unique
  ON contacts (owner_id, lower(name));
CREATE INDEX contacts_owner_idx ON contacts (owner_id);




CREATE TABLE notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE INDEX notes_contact_idx ON notes (contact_id);




CREATE TABLE talk_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  talked_at  timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE INDEX talk_events_contact_talked_idx
  ON talk_events (contact_id, talked_at DESC);




CREATE TYPE link_request_status AS ENUM ('pending', 'accepted', 'rejected');


CREATE TABLE link_requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id         text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requester_contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status               link_request_status NOT NULL DEFAULT 'pending',
  created_at           timestamptz NOT NULL DEFAULT now(),
  responded_at         timestamptz,
  CONSTRAINT no_self_link CHECK (requester_id <> addressee_id)
);


CREATE UNIQUE INDEX one_pending_request_per_pair
  ON link_requests (
    LEAST(requester_id, addressee_id),
    GREATEST(requester_id, addressee_id)
  )
  WHERE status = 'pending';
```

### Why each decision was made

**`uuid` primary keys, not `serial`.** Sequential integers leak how much data
exists and let anyone guess a neighbouring id. Contact ids will appear in URLs
and in requests between linked users, so they should be unguessable.
`gen_random_uuid()` is built into Postgres 13+; no extension needed.

**`owner_id` replaces the collection-per-user design.** Ownership stops being
data hidden inside a collection name and becomes a normal, queryable, indexable
column. Because the key is `users.id` and not an email, changing your Google
email no longer orphans your data — which it does today.

**`ON DELETE` is decided per foreign key, not once.** `owner_id` cascades: a
deleted user's contacts are meaningless. `linked_user_id` sets null: if Alice
deletes her account, Bob keeps his contact card and his private notes, and only
loses the link.

**`time` → `cadence_days`.** Three reasons: `time` is a Postgres data type and
would need quoting forever; `time` does not say what it measures; the unit
belongs in the name. Breaking changes are free right now, so rename it.

**`friend_email` is nullable, and `NULL` — not `""`.** `NULL` means "there is no
email". An empty string means "the email is the empty string", which is false.
This also deletes the defensive `if (!oldContactData.friendEmail)` fix-up in
`updateContact`.

**`UNIQUE (owner_id, lower(name))` replaces `checkIfContactExists`.** Today the
rule lives in client code that downloads every contact and regex-matches in
JavaScript, so two tabs submitting "Mom" at once both succeed. As a functional
unique index the rule is enforced by the database, per user, case-insensitively,
and the race is not unlikely — it is impossible. About 20 lines of code delete.

**`notes` is a separate table because the "many" side holds the foreign key.**
Updating one note becomes `UPDATE notes SET body = $1 WHERE id = $2` instead of
read-document → rebuild array → write whole document back. The hand-rolled
`noteId` (`lastElement.noteId + 1`) reuses ids after a delete and then edits the
wrong note; a database-generated key is never reused.

**`talk_events`, not `last_talked`.** A table name describes what _one row_ is.
This table holds many talks, so naming it `last_talked` would suggest one row
per contact — exactly the wrong mental model. Name it after the event and derive
"last" with a query.

**Two timestamps on `talk_events`.** `talked_at` is when the conversation
happened and may be backdated by the user. `created_at` is when the row was
written and never changes. They are usually equal but answer different
questions; `created_at` is the audit trail.

**`created_by` on `talk_events`.** Once linking exists, a row on Bob's contact
may have been created by Alice clicking on her side. This records who clicked.

**The composite index `(contact_id, talked_at DESC)`.** Every read is "for this
contact, the newest event". Filter column first, sort column second, so the
newest row is already first and nothing is sorted at read time.

**`status` is an `ENUM`.** A `text` column would happily store `'penging'` and
silently break the UI filter.

**The partial unique index on `link_requests`.** `LEAST`/`GREATEST` sort the two
user ids into a consistent order, so Bob→Alice and Alice→Bob produce the same
key and crossed requests are rejected. `WHERE status = 'pending'` limits the
rule to live requests, so rejected and accepted rows stay as history and a new
request can be sent later.

### How the app reads the data

The main screen — every contact, most overdue first:

```sql
SELECT
  c.id,
  c.name,
  c.cadence_days,
  t.talked_at AS last_talked_at,
  c.cadence_days - EXTRACT(EPOCH FROM (now() - t.talked_at)) / 86400
    AS days_until_next_talk
FROM contacts c
LEFT JOIN LATERAL (
  SELECT talked_at, created_by
  FROM talk_events e
  WHERE e.contact_id = c.id
  ORDER BY e.talked_at DESC
  LIMIT 1
) t ON true
WHERE c.owner_id = $1
ORDER BY days_until_next_talk ASC NULLS FIRST;
```

- `LEFT JOIN` (not `JOIN`) keeps contacts with no events. They come back with
  `NULL`, which correctly means "never talked to" — a state the current model
  cannot express.
- `LATERAL` runs the subquery once per contact and can reference `c.id`, so it
  returns every column of the newest event, not just the timestamp. It also uses
  the composite index directly.
- Use `EXTRACT(EPOCH FROM ...) / 86400`, **not** `EXTRACT(DAY FROM ...)`, which
  truncates to whole days and would break the one-decimal display.
- `NULLS FIRST` puts never-contacted people at the top.

Propagating a talk event to a linked user, inside one transaction:

```sql
INSERT INTO talk_events (contact_id, created_by) VALUES ($contactId, $userId);


INSERT INTO talk_events (contact_id, created_by)
SELECT other.id, $userId
FROM contacts mine
JOIN contacts other
  ON other.owner_id = mine.linked_user_id
 AND other.linked_user_id = mine.owner_id
WHERE mine.id = $contactId;
```

The second statement inserts zero rows when there is no mutual link and one row
when there is, so no `if` is needed. The transaction guarantees both sides reset
or neither does.

### The security change — the most important consequence

In Firestore, data was partitioned by collection name and guarded by Firestore
security rules. The database itself refused to hand Bob's collection to Alice.

In Postgres, **every contact sits in one table and the database will return any
row you ask for.** The only thing between Alice and Bob's data is the
`WHERE owner_id = ...` in the query.

Rules:

1. Never trust an id that came from the client. It names a row; it does not
   prove the caller may see it.
2. Every query carries an ownership filter taken from the **server-side
   session**, never from a request body or URL parameter.
3. The same applies to writes:
   `UPDATE contacts SET ... WHERE id = $1 AND owner_id = $2`. Zero rows updated
   means 404.

Because this must hold at every call site, it belongs in a shared helper — e.g.
`getOwnedContact(session, contactId)` — that every caller uses. A rule that
depends on each future caller remembering it will eventually be forgotten, and
neither `tsc` nor a test will catch it.

### Drizzle mapping

The schema is written in TypeScript; Drizzle generates the SQL migrations.

```ts
export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cadenceDays: integer("cadence_days").notNull().default(7),
    friendEmail: text("friend_email"),
    linkedUserId: text("linked_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contacts_owner_name_unique").on(
      table.ownerId,
      sql`lower(${table.name})`,
    ),
    index("contacts_owner_idx").on(table.ownerId),
  ],
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
```

- The database uses `snake_case`, TypeScript uses `camelCase`. The string
  argument is the real column name; the object key is what application code
  uses. Drizzle maps between them.
- `$inferSelect` generates the types from the schema, so `ContactItemType` is
  deleted. The type and the table can no longer drift apart.

### What changes, in one table

| Today (Firestore)                                     | Target (Postgres)                                |
| ----------------------------------------------------- | ------------------------------------------------ |
| One collection per user, named `` `${email}${uid}` `` | One `contacts` table with an `owner_id` column   |
| Keyed on a mutable email                              | Keyed on a permanent `users.id`                  |
| Unique name checked in the browser                    | `UNIQUE (owner_id, lower(name))` in the database |
| `notesArray` embedded in the document                 | `notes` table, one row per note                  |
| Hand-rolled `noteId` that can be reused               | Database-generated primary key                   |
| `timeFromLastTalk`, one overwritten number            | `talk_events`, append-only history               |
| Cosmetic `"Talked on:"` notes                         | Real event rows                                  |
| No relationships between users                        | `link_requests` + `linked_user_id`               |
| Access controlled by Firestore rules                  | Access controlled by our own `WHERE owner_id`    |
| Multi-step writes with no transaction                 | Transactions, all-or-nothing                     |

## Round 5 — auth revisited, and the Phase 0 answers

### Dummy data: dropped

`addDummyData` and the three sample contacts ("Mom", "Your best friend", "Heidi
Klum") are **deleted**, not ported. New accounts start with an empty contact
list, so the empty state becomes a real UI case that must be designed.

### Auth: Better Auth, not Auth.js

Google-only sign-in is rejected. Email and password must work from the start.

That single requirement disqualifies Auth.js:

- Its `Credentials` provider is an escape hatch, not a feature. The docs
  discourage it.
- It forces the JWT session strategy, so the database adapter stops storing
  sessions — the opposite of the "own your tables" goal.
- It ships no password hashing, no email verification, no password reset and no
  rate limiting. Building on it means hand-writing exactly the security-critical
  parts this project decided not to hand-write.

**Choice: Better Auth, self-hosted, with the Drizzle adapter.**

- Email and password are first-class: hashing (scrypt), email verification,
  password reset and rate limiting are in the library.
- Sessions are rows in your Postgres, not opaque JWTs.
- Its CLI generates the schema into your own files, so the tables stay readable
  and version-controlled.
- Social providers are still supported, so Google can be kept alongside.

**Not** Neon's _Managed_ Better Auth, even though it is on the free tier.
Managed auth hides the tables again — Firebase's exact failure mode, and the one
this project exists to escape. It also adds Neon lock-in, which cuts against the
"less lock-in" reason for leaving Google. Adopt it later as a convenience if
ever; do not start there.

**Consequence — a new external dependency.** Email/password needs transactional
email for verification and reset links. This was not in the plan before. A
provider must be chosen before auth is built.

**Consequence — table names.** Better Auth's generated tables are singular
(`user`, `session`, `account`, `verification`) where the app's are plural
(`contacts`, `notes`). Confirm the exact names from the CLI output, and point
the `owner_id` / `linked_user_id` / `created_by` foreign keys at whatever it
generates. The DDL below writes `users(id)`; adjust it to match.

### Neon free tier, confirmed

Checked against Neon's pricing page:

- 100 projects, **0.5 GB storage** and **100 CU-hrs per month** per project.
- Up to 2 CU (8 GB RAM), unlimited team members.
- Scale to zero when idle, which is what keeps it free.
- Also included: Managed Better Auth, 5 GB object storage (beta), Functions
  (beta).

  0.5 GB is far more than this app needs — the data is text rows. The real limit
  is compute hours, and scale-to-zero plus a portfolio-level traffic makes that a
  non-issue. Cold starts after idle are the accepted trade.

## Round 6 — feasibility audit

Checked against the actual codebase and the Vercel Hobby / Neon free tiers.
Five findings change the plan.

### A. The Neon HTTP driver cannot do transactions — pick the right driver

`@neondatabase/serverless` ships two drivers, and Drizzle wraps them separately:

- `drizzle-orm/neon-http` — HTTP. One round trip per query, no cold pool. It
  supports `db.batch()` but **not** interactive `db.transaction()`.
- `drizzle-orm/neon-serverless` — WebSocket `Pool`. Slightly heavier, supports
  **full transactions**.

This plan needs transactions in two places: accepting a link (set status, link
both contact rows, maybe create the other contact) and propagating a talk event
to a linked user. Both must be all-or-nothing.

**Decision: use the WebSocket driver (`drizzle-orm/neon-serverless`) from the
start.** Switching later means rewriting the client and every import. Verify the
current capability matrix in Drizzle's docs before writing the client — driver
support changes.

### B. Transactional email needs a domain — resolved

Email/password auth cannot ship without verification and reset emails, and every
free provider that sends to _arbitrary_ recipients requires a **verified sending
domain**. `*.vercel.app` cannot be verified, because we do not control its DNS.

**Resolved: the domain `stay-in-touch.vip` is already owned.** That settles it:

- **Email provider: Resend** — 3,000 emails/month, 100/day on the free tier.
  Brevo was the no-domain fallback and is no longer needed.
- **Send from a subdomain**, `send.stay-in-touch.vip`, not the apex. This keeps
  email reputation separate from the website's domain, so a bad send cannot hurt
  the site.
- **The app gets a real URL**, which also fixes the Vercel preview problem in
  finding F: a wildcard preview host such as `*.preview.stay-in-touch.vip` gives
  Google OAuth one stable registered callback instead of a new unregistered URL
  per deployment.
- **Everything else stays $0.** Vercel Hobby, Neon free, Resend free. The only
  cost is the domain's annual renewal, already paid.

One honest caveat: `.vip` is a newer, cheap TLD, and some spam filters weight
those more suspiciously than an established `.com`. Correct SPF, DKIM and DMARC
matter more here than they would on an old domain. This is not a blocker, and
not a reason to buy a second domain — but if verification emails land in spam
during testing, suspect this before suspecting the code.

**Start DNS and domain verification first.** Propagation and Resend's review can
each take hours to a day, and they block all auth work. See Phase 0.1 in the
execution plan.

### C. The service worker risk — resolved: there is no service worker

> **Resolved 2026-09-16 by running a real build.** No service worker is
> generated, so the risk described below does not exist. The reasoning is kept
> as a record of what was checked and why.

~~The app is an installable PWA via `next-pwa` with `register: true` and
`skipWaiting: true`. A service worker that caches HTML will happily serve a
cached, authenticated page after sign-out, and can cache auth API responses.
Auth routes and `/api/auth/*` must be excluded from caching explicitly. This was
never a risk before, because Firebase auth state lived in the client SDK and was
re-evaluated on every mount.~~

**What a build actually produces.** `next-pwa` is pinned at `5.6.0`, a
**webpack** plugin last published for Next 12. `next.config.js` sets
`turbopack: {}`, and Next 16 builds with Turbopack. `next-pwa` works by
injecting a `webpack()` function into the Next config, and Turbopack never calls
it. The plugin is inert, and it fails silently — the build prints no warning.

A clean build — `rm -f public/sw.js`, `rm -rf .next`, `npm run build` — emitted
no `public/sw.js`, no `workbox-*.js` and no registration script in
`.next/static`. The single `serviceWorker` string in the client bundle belongs
to Firebase Auth's own worker messaging code. The exact commands are in Phase 0
of the execution plan.

Two consequences:

- **Phase 2B.4 is dropped.** There is no cache to exclude the auth routes from,
  and no installed PWA to test sign-out in.
- **The app is not an installable PWA today.** `app/layout.tsx` still links
  `/manifest.json`, but Chrome requires a service worker with a fetch handler
  before it offers the install prompt, and there is none. `next-pwa` is dead
  weight in `package.json`, and `CLAUDE.md`'s description of the app as an
  installable PWA via `next-pwa` is wrong. Fixing or removing the PWA setup
  stays **out of scope** for this migration — but do not design around a service
  worker that does not exist.

### D. The i18n spec collides with the new auth screens

`specs/i18n-german-translations.md` is unbuilt, and its acceptance criterion is
"no user-facing English text remains when German is selected". Email/password
auth adds six screens plus validation and error copy — all user-facing text.

Order matters:

- **i18n first, then auth** — the auth screens are built translated from day
  one. No rework, but i18n ships against a login page that is about to be
  deleted.
- **Auth first, then i18n** — i18n has six more screens to cover, and its
  estimate grows.

**Recommendation: auth first.** The current `app/login/page.tsx` is a
Google-only page that Phase 2B replaces entirely, so translating it is wasted
work. Add the auth screens to the i18n spec's surface list instead.

Also note the i18n spec is **stale**: it says "the app is small, Pages Router"
and references `pages/index.tsx`, but it was written after the App Router
migration. Its "Open Questions" section reasons from a router the app no longer
uses. It needs a correction pass before anyone builds from it.

### E. The `currentUser` change is wider than the user id

`useAuth()` has 12 consumers. Three distinct breakages, not one:

1. **Nine files read `currentUser.uid` _and_ `currentUser.email` together** to
   rebuild the collection name. All of them collapse to "the server already
   knows who you are" — the components stop needing identity at all.
2. **`Components/MainForm.tsx:31` reads `currentUser?.displayName`.** Better
   Auth's user has `name`, not `displayName`. A silent `undefined`, not a type
   error, if the context type is loosened during the swap.
3. **`lib/CalenderFunctions.ts:35` imports Firebase `auth` directly** and reads
   `auth.currentUser?.displayName`. It is not an auth file and will be missed by
   a grep for `useAuth`.

Two more consequences:

- **`app/about/page.tsx` has an "add demo data" button** wired to
  `addDummyData`. Dropping dummy data means deleting that button and its copy,
  not just the helper.
- **Every route page is `"use client"`.** `app/page.tsx` guards itself with
  `useEffect` → `router.push("/login")`, which flashes an empty page on every
  load. Moving reads to Server Components should replace that with a server-side
  `redirect()`. That is an improvement, but it is a structural change to every
  page, not a swap of a data call.

### F. Vercel Hobby — confirmed workable, with two frictions

Route Handlers, Server Actions, Server Components and a Postgres connection all
work on the free Hobby plan. Two things to plan around:

- **Hobby is non-commercial only.** A portfolio project qualifies. Do not put
  ads or payments on it.
- **Preview deployments get a new URL per deployment.** Google OAuth rejects
  callback URLs that are not registered. _Resolved by finding B:_ assign a
  wildcard preview host on the owned domain and register that once.

`BETTER_AUTH_URL` must be set per environment — `http://localhost:3000` locally,
`https://stay-in-touch.vip` in production. A single hardcoded value will break
one of the two. The same applies to the OAuth callback: pick apex **or** `www`
as the canonical host and redirect the other, because a mismatch fails with an
opaque provider error rather than a useful one.

## Decisions

| Concern        | Choice                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Database       | Neon (PostgreSQL)                                                                                                   |
| ORM            | Drizzle                                                                                                             |
| Auth           | Better Auth, self-hosted, + Drizzle adapter. Email/password first-class. Not Neon Managed Better Auth. No Firebase. |
| Driver         | `drizzle-orm/neon-serverless` (WebSocket). The HTTP driver cannot do transactions, and this plan needs them.        |
| Domain         | `stay-in-touch.vip`, already owned. Canonical host for the app and OAuth callbacks.                                 |
| Email          | Resend, sending from `send.stay-in-touch.vip`.                                                                      |
| Google         | Kept as a second provider alongside email/password.                                                                 |
| i18n order     | Auth screens first, i18n after. The current login page is being deleted.                                            |
| Dummy data     | Dropped. New accounts start empty.                                                                                  |
| Realtime       | None — refetch after mutation                                                                                       |
| Existing data  | None. No users to preserve, so no migration script and no identity bridge.                                          |
| Cutover        | Start on an empty database and switch. No dual-write, no parallel run.                                              |
| Notes          | Own table, private, never shared                                                                                    |
| Talk events    | Own append-only `talk_events` table; the timestamp column is removed                                                |
| Linked users   | Shares the talk event only; needs a pending/accepted/rejected request flow                                          |
| Primary keys   | `uuid` with `gen_random_uuid()`, not `serial`                                                                       |
| Timestamps     | `timestamptz`, never epoch milliseconds                                                                             |
| Access control | Every query filters by `owner_id` from the server session, through one shared helper                                |

## Build order

Two things drive the order: DNS takes real-world time and blocks auth, and
linked users depends on everything else. So domain first, linked users last.

The full step-by-step version lives in `specs/postgres-execution-plan.md`, which
is the authority. This list is the shape of it.

| #   | Phase                    | What it delivers                                                                                                                                            |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Decisions                | One question left: apex or `www`.                                                                                                                           |
| 0.1 | Domain and DNS           | `stay-in-touch.vip` on Vercel, `send.stay-in-touch.vip` verified with Resend, wildcard preview host. Start here — it blocks auth and takes real-world time. |
| 1   | Neon and Drizzle         | One shared client on the **WebSocket** driver.                                                                                                              |
| 2A  | Better Auth, server side | Sign-up, sign-in and session work as an API. Verification email lands in a real inbox. No UI.                                                               |
| 2B  | Auth screens             | Six new screens, the `useAuth()` swap, and the three identity-shape fixes. Firebase Auth leaves the client.                                                 |
| 3   | App tables               | `contacts`, `notes`, `talk_events`. Empty — no import step.                                                                                                 |
| 4   | Data layer               | Ownership guard first, then reads, then writes, then delete the old model.                                                                                  |
| 5   | Remove Firebase          | Uninstall, strip env vars, update `CLAUDE.md`, delete the Firebase project.                                                                                 |
| 6   | Real migrations          | Stop dropping the database. Generate and commit migration files.                                                                                            |
| 7   | Linked users             | `link_requests`, the request flow, and talk-event propagation.                                                                                              |

While the schema is still moving (phases 3–5), prefer dropping and recreating
the database over writing careful migrations. There is no data to protect. That
stops at phase 6.

## Open questions

1. **`linked_user_id` vs a `contact_links` table.** The draft has each contact
   row point at a user, and a mutual link is "both sides point at each other".
   Nothing structurally prevents a half-link where only one side points. A
   separate `contact_links` table holding the pair would make that impossible,
   at the cost of one more table and one more join. Start simple, revisit at
   phase 7. This is a known soft spot, not an oversight.
2. **Apex or `www` as the canonical host?** Everything else — `BETTER_AUTH_URL`,
   the OAuth callbacks, the email links — must match whichever is chosen.
   Decide once, redirect the other.
3. ~~**Does a real build still produce `public/sw.js`?**~~ **Answered: no.** A
   clean Turbopack build emits no service worker, so the PWA caching work in
   Round 6C is moot and Phase 2B.4 is dropped. See Round 6C.
4. The three link-request questions in Round 3 are still suggestions, not
   decisions. They do not block anything before phase 7.

## Next step

Wire up `stay-in-touch.vip`: attach it to Vercel, verify
`send.stay-in-touch.vip` with Resend, and add the wildcard preview host. This is
Phase 0.1 in the execution plan and it blocks all auth work — DNS propagation
and Resend's review can each take a day, so start it before anything else.
