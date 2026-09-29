# Phase 7 — Real Migrations + Hardening

A standalone brief for Phase 7 of `specs/postgres-migration.md`. Read this file
alone to start work in a fresh session. It explains **why** each step exists, not
only what to do.

Branch: `chore/db-hardening` (created from `main` on 2026-09-29).

---

## Where we are

- The app runs on **Neon Postgres** through **Drizzle ORM**. Firebase is only used
  for login.
- Phases 1–6 are merged and live on production.
- Until now the rule was "there is no real data, so drop the database whenever it
  is convenient". Phase 7 ends that rule. After this phase, the database is treated
  as real: every schema change is a versioned file, and nothing is dropped.

Files that matter:

| File | What it is |
| --- | --- |
| `lib/db/schema/*.ts` | The tables, written in TypeScript (`contacts`, `notes`, `talk_events`) |
| `drizzle.config.ts` | drizzle-kit config. Reads `DATABASE_URL` from `.env.local`. Output folder: `lib/db/migrations/` (does not exist yet) |
| `package.json` | Has `db:push` and `db:studio`. No migration scripts yet |
| `lib/db/queries/guards.ts` | `requireUser()` and `getOwnedContact()` — the ownership check |
| `lib/actions/contacts.ts` | The 7 Server Actions (all contact/note writes) |
| `lib/db/queries/contacts.ts` | The one read query for the home page |

---

## Key ideas (read this first)

### 1. `push` vs. migrations

Drizzle has two ways to make the database match `lib/db/schema/`:

- **`drizzle-kit push`** (what we use today). It compares the schema files with the
  live database and changes the database directly. It writes **no file**. There is
  no history, nothing to review, and no way to replay the same change on another
  database. Fine while prototyping, dangerous with real data: if a change needs a
  table rewrite, push may drop and recreate it.
- **`drizzle-kit generate` + `drizzle-kit migrate`**. `generate` compares the
  schema files with the **previous migration files** (not the database) and writes
  a new numbered SQL file, e.g. `0001_add_x.sql`. You read it, commit it, and then
  `migrate` runs every file the database has not seen yet. Drizzle records which
  files ran in a table called `drizzle.__drizzle_migrations`.

Why this matters: the SQL files in git become the **single source of truth** for
the database shape. Any database (dev, prod, a new one) can be built by running
them in order, and every change is reviewed in a PR like normal code.

Once we switch, `db:push` must go. If someone runs `push`, the database changes
but no file is written, so the files and the database silently disagree. The next
`generate` then produces wrong SQL. Removing the script makes that mistake
impossible instead of relying on memory.

### 2. The baseline problem, and why we drop instead

The production tables were created by `push`, so the migrations table is empty.
The first generated file, `0000_*.sql`, will contain `CREATE TABLE contacts ...`.
Running `migrate` on the existing database would fail: "table already exists".

Two fixes exist: mark `0000` as already applied by hand (a "baseline"), or drop the
tables and let `migrate` build them from `0000`. **Decision: drop.** The database
has only test data, and a clean run proves the migration files can build the
schema from nothing.

### 3. Dev and prod share one database — that must change first

Today `.env.local` (your laptop) and Vercel (production) use the **same**
`DATABASE_URL`. So every test contact you add locally is in production, and any
`migrate` you run locally changes production at once.

Fix: a **Neon branch**. A Neon branch is a copy of the database that you can change
freely without touching the original (like a git branch, but for data). We create a
branch named `dev`, point `.env.local` at it, and leave Vercel on the main branch.
Result: you try every migration on `dev` first, then apply it to production on
purpose.

**Decision: production migrations are run manually** (`npm run db:migrate` with
the production URL) before merging a schema change. They are not run inside the
Vercel build: preview builds would run them too.

### 4. A Server Action is a public HTTP endpoint

A function marked `"use server"` can be called by anyone with a POST request,
with **any** arguments. The TypeScript types (`name: string`, `cadenceDays:
number`) exist only at compile time. At runtime nothing stops a caller from sending
`name: 42`, a 10 MB note, or `contactId: "hello"`. So every action must check its
input itself.

What is already correct: **ownership**. Every read and write is filtered by
`owner_id` from the server session, or goes through `getOwnedContact()`. No action
takes a user id from the client.

What is missing (found in the code on 2026-09-29):

| Gap | Effect today |
| --- | --- |
| `contactId` / `noteId` not checked as UUID | Postgres throws `invalid input syntax for type uuid` → user sees a 500 instead of "not found". Affects all 6 actions that take a `contactId`, and the 2 note actions |
| No length limits on `name`, note `body`, `friendEmail` | A caller can store megabytes |
| `cadenceDays` has no upper limit | The UI caps it (31 in `AddNewContact`, 60 in `UpdateContactForm`) but the server does not |
| `talkedAtMs` not checked | `NaN` → Postgres error (500). A future date → negative "days since last talk" |
| `name` not checked as a string | `.trim()` crashes on a number |
| `updateNote` / `deleteNote` return `ok: true` when no row matched | A wrong note id looks like success |

---

## Steps

Workflow: Claude makes the changes and runs the checks, then says the step is
ready and suggests a commit message. **The user makes all commits.** Every git
action other than commit (branch, push) needs explicit confirmation.

### Step 1 — Separate dev database ✅ done 2026-09-29

Neon branch `dev` created from production; `.env.local` points at its pooled URL.

1. **User:** in the Neon console, create a branch named `dev` from the main
   (production) branch. Copy its **pooled** connection string.
2. **User:** put that string in `.env.local` as `DATABASE_URL`. Do not change the
   Vercel value.
3. **Claude:** document the rule in `CLAUDE.md` and `specs/postgres-migration.md`:
   local work uses the `dev` branch; production changes only via a manual
   `db:migrate`.

Ready → `docs: separate the dev and production databases`

**Nothing may touch a database until this step is done.**

### Step 2 — Switch to versioned migrations

1. `package.json`: add `"db:generate": "drizzle-kit generate"` and
   `"db:migrate": "drizzle-kit migrate"`. **Remove `db:push`.**
2. Run `npm run db:generate` → creates `lib/db/migrations/0000_*.sql` plus a
   `meta/` folder. Read the SQL and check it matches the schema (tables, the
   `UNIQUE (owner_id, lower(name))` index, the `(contact_id, talked_at DESC)`
   index, the `cadence_days > 0` check, the cascading foreign keys). Both the SQL
   and `meta/` get committed.
3. **Dev database only:** drop the three tables (`talk_events`, `notes`,
   `contacts` — in that order, because of the foreign keys), then run
   `npm run db:migrate`. Claude shows the exact SQL and waits for confirmation
   before running it, because it deletes data.
4. Verify: the app runs on the fresh dev database; add a contact, a note, mark as
   talked.

Ready → `build(db): switch from drizzle-kit push to versioned migrations`

**Must check in this step:** how `process.loadEnvFile(".env.local")` in
`drizzle.config.ts` behaves when `DATABASE_URL` is already set in the shell.
Running migrate against production from a laptop depends on it: if the file
overwrites the shell value, a production run would silently hit `dev` instead.
Test it and, if needed, make the config keep an existing shell value.

### Step 3 — Validate Server Action input

Fix at the right layer:

- **`lib/db/queries/guards.ts`:** `getOwnedContact()` returns `null` when
  `contactId` is not a UUID. One change fixes all 6 call sites. Export a small
  `isUuid()` for the note ids.
- **`lib/actions/contacts.ts`:** extend the existing `validateFields()`:
  - `name`: must be a string; 1–100 characters after trim.
  - `cadenceDays`: whole number, 1–365 (above both UI limits, so the server never
    rejects what the UI allows).
  - `friendEmail`: optional; ≤ 254 characters; basic `x@y.z` shape.
  - note `body`: must be a string; 1–5000 characters after trim.
  - `talkedAtMs`: optional; a finite number; not more than one day in the future.
  - `updateNote` / `deleteNote`: check `noteId` with `isUuid()`, use
    `.returning()`, and return "not found" when no row changed.
- No new library (no Zod): 7 actions do not justify a dependency. Revisit if
  Phase 8 adds many more actions.

Ready → `fix(actions): validate Server Action input at the boundary`

### Step 4 — Production cutover + docs

1. **User:** drop the three tables on production and run `npm run db:migrate`
   with the production `DATABASE_URL`. Claude writes out the exact commands.
2. **User:** use the app normally and check the Neon dashboard for connection
   count and query times (first real serverless load on the pooled connection).
3. **Claude:** update `specs/postgres-migration.md` (Phase 7 done, Phase 8 next;
   the ground rule "drop the database freely" becomes "schema changes only through
   generated migrations") and `CLAUDE.md` (how to change the schema: edit
   `lib/db/schema/` → `db:generate` → review SQL → `db:migrate` on dev → commit →
   `db:migrate` on prod before merge).

Ready → `docs: record the migration workflow and Phase 7 hardening`

---

## Verification

- After every step: `npm run type-check` and `npm run build`. Paste real output.
- Step 2: `db:migrate` succeeds on an empty dev database, and the app works on it.
- Step 3: call each action with bad input and confirm a clean `{ ok: false }`, not
  a 500:
  - a `contactId` that is not a UUID;
  - a 10,000-character name;
  - `talkedAtMs: NaN`;
  - a real `noteId` sent with a different contact's `contactId`.
- Step 4: production works after the cutover; Google and email sign-in still work
  (sign-in does not touch Postgres, but the home page does).

## Decisions made

| Question | Answer |
| --- | --- |
| Keep production data? | No — only test data. Drop and rebuild from `0000`. |
| Dev and prod database | Currently the same; split with a Neon `dev` branch (Step 1). |
| How prod migrations run | Manually, before merging a schema change. Not in the Vercel build. |
| Validation library | None; hand-written checks in the existing helpers. |

## Open items

- The `loadEnvFile` behaviour above (Step 2).
- UI limits disagree with each other (`cadenceDays` max 31 on add, 60 on edit).
  Not part of this phase; the server limit of 365 covers both. Possible
  follow-up.
- Unrelated follow-ups still open: rename `middleware.ts` → `proxy.ts` (Next 16
  warning); remove the README's installable/offline PWA claims.
