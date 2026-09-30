# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working with the user

- Do not give compliments or open replies with praise ("Great question", "Good idea", "You're right"). Skip the flattery and answer.
- Do not agree by default. If the user proposes something and a better approach exists, say so and explain why — briefly and directly.
- Push back on suboptimal suggestions instead of implementing them silently. State the tradeoff, recommend the better option, and let the user decide. Agreeing to a worse approach to be accommodating is not helpful here.
- Being wrong is fine; being agreeable at the cost of correctness is not. When you disagree, lead with the disagreement, not with hedging.
- Do not commit. The user makes all commits. When a step is done and checked (`type-check` + `build`), say it is ready and suggest a commit message. Other git actions (branch, push) still need explicit confirmation first.

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # production build
npm run start        # serve the production build
npm run type-check   # tsc --noEmit — the source of truth for correctness
npm run db:generate  # write a new migration SQL file from lib/db/schema/ (no DB access)
npm run db:migrate   # apply unapplied migrations to the DATABASE_URL database
npm run db:studio    # browse the database (dev, via .env.local)
```

There is no `db:push` on purpose — see "Changing the schema" below.

There is **no test framework** and **no working lint** in this project (the `next lint` script was removed — Next 16 dropped `next lint` and ESLint 9 needs a flat config the repo doesn't have). "Verify it works" means `npm run type-check` plus `npm run build`, and running the app.

A `pre-push` git hook runs `tsc --noEmit` and aborts the push on any type error (wired up by the `postinstall` script setting `core.hooksPath`). Keep the build type-clean or pushes fail. Note `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`, so unused variables — an import or `const` you defined but never referenced — are hard errors, not warnings.

## Architecture

Next.js 16 **App Router** (`app/`) + React 19, TypeScript. Firebase Auth for identity; contact data in Neon Postgres through Drizzle. Deployed on Vercel. Path alias `@/*` maps to the repo root.

`next-pwa` is installed but inert: it is a webpack plugin and the build uses Turbopack, so no service worker is generated. The app is not an installable PWA today — don't design around a service worker.

Route files live in `app/` as `page.tsx`; `app/layout.tsx` is the root layout. Page/head metadata comes from `metadata`/`viewport` exports, not a `<Head>` component. `app/page.tsx` (home) is a Server Component. Any component using hooks, context, browser APIs, or event handlers needs the `"use client"` directive. Navigation hooks come from `next/navigation` (`useRouter`, `usePathname`), not `next/router`.

The migration plan and its status live in `specs/postgres-migration.md`.

### Data model — the key thing to understand

Postgres is reached **only from the server** (`lib/db/index.ts` imports `server-only`). Schema is in `lib/db/schema/`: `contacts`, `notes`, `talk_events`. Types are inferred from the schema — no hand-written row types. `owner_id` is the Firebase uid (bare `text`, no FK).

- Reads: `lib/db/queries/contacts.ts` → `getContactsForCurrentUser()`, called from the `app/page.tsx` Server Component. `lastTalkedAt` and `daysUntilNextTalk` are computed in SQL, not stored; the overdue-first ordering comes from there.
- Writes: Server Actions in `lib/actions/contacts.ts`. Each one calls `revalidatePath("/")`. There is no realtime listener.

**Security:** all users share one table, so the `owner_id` filter is the only thing keeping data apart. Every query and action must go through `lib/db/queries/guards.ts` (`requireUser()`, `getOwnedContact()`). Never trust an id from the client, and never take `owner_id` from a request body or URL.

`DATABASE_URL` and `FIREBASE_SERVICE_ACCOUNT_B64` are checked at module load, so both are needed for `npm run build`, not just at runtime.

**Dev and prod are separate databases.** `.env.local` points at the Neon `dev` branch; Vercel points at the production (default) branch. Local work, including every drizzle-kit command, runs against `dev`. Production schema changes happen only through a manual `db:migrate` run with the production `DATABASE_URL`, before the schema change is merged — never from the Vercel build.

**Changing the schema.** The SQL files in `lib/db/migrations/` (plus `meta/`) are the source of truth for the database shape. Never change a database's shape any other way — no `drizzle-kit push`, no hand-run `ALTER` — or the files and the database drift and the next `generate` writes wrong SQL. The workflow:

1. Edit `lib/db/schema/`.
2. `npm run db:generate` → read the new `NNNN_*.sql`. Watch for data loss: renames, type changes, a `NOT NULL` column without a default.
3. `npm run db:migrate` → applies it to `dev`. Check the app.
4. Commit the schema change, the SQL file and `meta/` together.
5. Before merging: migrate production from the laptop. Copy the **direct** (non-pooled) production URL from Neon → Connect, then in PowerShell:
   ```powershell
   $env:DATABASE_URL = (Get-Clipboard).Trim()
   $dbHost = ([uri]$env:DATABASE_URL).Host; "Target: $dbHost"
   if ($dbHost -like "ep-raspy-wildflower-*") { npm run db:migrate } else { "Wrong host - not migrating" }
   Remove-Item Env:DATABASE_URL
   ```
   A shell `DATABASE_URL` wins over `.env.local`, so this reaches production — and a leftover one would silently send later local commands there too, hence `Remove-Item`. drizzle-kit can exit without a message on failure; only `[✓] migrations applied successfully!` means success. Confirm in the Neon SQL Editor with `SELECT * FROM drizzle.__drizzle_migrations`.

Drizzle has no down migrations: undo a change with a new forward migration. Never paste a connection string into chat, docs or a command line; it contains the password.

### Auth

`lib/Firebase.ts` holds the client Firebase app, `auth` and the Google `provider` — nothing else. `lib/AuthContext.tsx` wraps the app in `app/layout.tsx` and exposes `useAuth()`: Google popup sign-in plus email+password (sign up, sign in, resend verification, check verified, password reset). Consumers call `useAuth()!` with a non-null assertion and read `currentUser`. `AuthProvider` blocks rendering (shows a spinner) until the initial `onAuthStateChanged` resolves. Show auth errors through `authErrorMessage(error)` (same file), not raw Firebase codes.

Server identity uses Firebase **session cookies**. On login the client POSTs its ID token to `app/api/auth/session/route.ts`, which sets an httpOnly `session` cookie via `firebase-admin` (`lib/firebaseAdmin.ts`). Server code reads identity only through `getServerUser()` (`lib/auth/getServerUser.ts`). `middleware.ts` gates `/` on cookie presence only; real verification happens on the server.

**Email verification is required.** The session route returns 403 for an unverified email, so such a user is signed in on the client but has no cookie. Two consequences:
- Mint cookies only through `establishSession()` in `AuthContext`; it keeps `hasSession` in step.
- Redirect to `/` on `hasSession`, never on `currentUser`. A client-signed-in user without a cookie would bounce `/login` → `/` → middleware → `/login` in a loop. `/login` shows `VerifyEmailNotice` when `currentUser && !currentUser.emailVerified`.

### Google Calendar

`lib/CalenderFunctions.ts` does **not** use the Calendar API or an OAuth token. It builds a `calendar.google.com/render?action=TEMPLATE` URL with prefilled fields and opens it in a new window. Any leftover `googleAccessToken` in localStorage is cleared on load — don't reintroduce a token-based flow without a deliberate reason.

### Styling — Tailwind CSS v4

Styling is **Tailwind CSS v4**, utility classes composed with `twMerge` (`tailwind-merge`) so callers can override via a `className`/`extraClasses` prop. Reusable presentational components live in `Components/ui/` (e.g. `Button.tsx` with a `variant` prop, `Text.tsx` for typography primitives). Color tokens and custom animations are defined in `styles/globals.css` (`@theme`); use the named colors like `bg-blue1`, `hover:bg-blue3`, `text-grey3`.

The project previously used styled-components; that migration is complete and there is no styled-components code, `ThemeProvider`, or `styles/Theme.ts` left. Don't reintroduce styled-components.

### Component file convention

Components are flat single-file `Components/ComponentName.tsx` — no per-component folder, no `index.tsx` barrel. Reusable presentational components go in `Components/ui/`; feature components sit directly under `Components/`.
