# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working with the user

- Do not give compliments or open replies with praise ("Great question", "Good idea", "You're right"). Skip the flattery and answer.
- Do not agree by default. If the user proposes something and a better approach exists, say so and explain why — briefly and directly.
- Push back on suboptimal suggestions instead of implementing them silently. State the tradeoff, recommend the better option, and let the user decide. Agreeing to a worse approach to be accommodating is not helpful here.
- Being wrong is fine; being agreeable at the cost of correctness is not. When you disagree, lead with the disagreement, not with hedging.
- Do not commit. The user makes all commits. When a step is done and checked (`type-check` + Prettier + `build`), say it is ready and suggest a commit message.
- Whenever you run `npm run type-check` as part of final checks, also run Prettier on every file you touched (see "Formatting" below), before `build`. Other git actions (branch, push) still need explicit confirmation first.

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # production build
npm run start        # serve the production build
npm run type-check   # tsc --noEmit — the source of truth for correctness
npm run db:generate  # write a new migration SQL file from lib/db/schema/ (no DB access)
npm run db:migrate   # apply unapplied migrations to the DATABASE_URL database
npm run db:studio    # browse the database (dev, via .env.local)
npm run format       # prettier --write . (whole repo)
npm run format:check # prettier --check .
npm run lint         # eslint . (flat config)
```

There is no `db:push` on purpose — see "Changing the schema" below.

There is **no test framework** in this project. Lint is ESLint 9 with a flat config (`eslint.config.mjs`, using `eslint-config-next`): run `npm run lint` as an extra check, but `type-check` stays the gate. "Verify it works" means `npm run type-check` plus `npm run build`, and running the app.

**Formatting.** Prettier (`.prettierrc.json`, with `prettier-plugin-tailwindcss`, which also sorts Tailwind classes) formats the code. In final checks, run it on the files you touched, not the whole repo, so the diff stays yours:

```bash
npx prettier --write --ignore-unknown $(git diff --name-only --diff-filter=d HEAD) $(git ls-files --others --exclude-standard)
```

Then run `type-check` and `build` on the formatted result.

A `pre-push` git hook runs `tsc --noEmit` and aborts the push on any type error (wired up by the `postinstall` script setting `core.hooksPath`). Keep the build type-clean or pushes fail. Note `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`, so unused variables — an import or `const` you defined but never referenced — are hard errors, not warnings.

## Architecture

Next.js 16 **App Router** (`app/`) + React 19, TypeScript. Firebase Auth for identity; contact data in Neon Postgres through Drizzle. Deployed on Vercel. Path alias `@/*` maps to the repo root.

There is no service worker and no PWA plugin (`next-pwa` was removed: it was a webpack plugin and the build uses Turbopack). `public/manifest.json` exists, but the app is not an installable PWA today — don't design around a service worker. See item 2 in `specs/future-upgrades.md`.

Route files live in `app/` as `page.tsx`; `app/layout.tsx` is the root layout. Page/head metadata comes from `metadata`/`viewport` exports, not a `<Head>` component. `app/page.tsx` (home) is a Server Component. Any component using hooks, context, browser APIs, or event handlers needs the `"use client"` directive. Navigation hooks come from `next/navigation` (`useRouter`, `usePathname`), not `next/router`.

The reasoning behind the design (schema, auth, security, lessons learned) is in `specs/architecture.md`. Planned work is in `specs/future-upgrades.md`.

### Data model — the key thing to understand

Postgres is reached **only from the server** (`lib/db/index.ts` imports `server-only`). Schema is in `lib/db/schema/`: `contacts`, `notes`, `talk_events`, `link_requests`, `contact_links`. Types are inferred from the schema — no hand-written row types. `owner_id` is the Firebase uid (bare `text`, no FK).

- Reads: `lib/db/queries/contacts.ts` → `getContactsForCurrentUser()`, called from the `app/page.tsx` Server Component. `lastTalkedAt` and `daysUntilNextTalk` are computed in SQL, not stored; the overdue-first ordering comes from there.
- Writes: Server Actions in `lib/actions/contacts.ts` and `lib/actions/links.ts`. Each one calls `revalidatePath` for the pages it affects. There is no realtime listener. Shared input checks (`validateFields`, `isValidEmail`, `ActionResult`, …) live in `lib/actions/validation.ts` — a plain module, because a `"use server"` file may only export async functions.

**Linked users.** Two users can link one contact each; a talk marked on either contact is then recorded on both (`markAsTalked` inserts the second row through `contact_links` in the same transaction — the link row is the only permission for that cross-user write). Only talk events are shared; notes, names and cadence stay private.

- A request (`link_requests`) is addressed to an **email** and never resolved to a uid, so nothing reveals whether an email has an account. The addressee sees requests sent to their verified session email. After accept, the link (`contact_links`) is two contact ids; emails play no part.
- Invariants the database cannot express are enforced in `acceptLinkRequest`'s transaction: a contact is in at most one link (row locks), and two users have at most one link (advisory lock on the uid pair).
- Reads for `/settings` are in `lib/db/queries/links.ts`.
- **Invite emails.** `sendLinkRequest` emails the addressee through `lib/email/` (Resend, server-only, English only), the same email whether or not they have an account. The send runs in `after()` and is best-effort. The limit (3 per user per rolling 24 h) is counted in `invite_emails_sent`, under a per-user advisory lock. Opt-outs live in `email_opt_outs`; `/unsubscribe` and `POST /api/email/unsubscribe` are public and check an HMAC token from the link (`lib/email/optOut.ts`). Never opt anyone out on a GET.

**Security:** all users share one table, so the `owner_id` filter is the only thing keeping data apart. Every query and action must go through `lib/db/queries/guards.ts` (`requireUser()`, `getOwnedContact()`). Never trust an id from the client, and never take `owner_id` from a request body or URL.

`DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT_B64`, `RESEND_API_KEY`, `EMAIL_UNSUBSCRIBE_SECRET` and `APP_URL` are checked at module load, so all are needed for `npm run build`, not just at runtime.

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

`lib/Firebase.ts` holds the client Firebase app, `auth` and the Google `provider` — nothing else. `lib/AuthContext.tsx` wraps the app in `app/layout.tsx` and exposes `useAuth()`: Google popup sign-in plus email+password (sign up, sign in, resend verification, check verified, password reset). Consumers call `useAuth()!` with a non-null assertion and read `currentUser`. `AuthProvider` blocks rendering (shows a spinner) until the initial `onAuthStateChanged` resolves. Show auth errors through `authErrorMessage(error, t)` (same file), not raw Firebase codes.

Server identity uses Firebase **session cookies**. On login the client POSTs its ID token to `app/api/auth/session/route.ts`, which sets an httpOnly `session` cookie via `firebase-admin` (`lib/firebaseAdmin.ts`). Server code reads identity only through `getServerUser()` (`lib/auth/getServerUser.ts`), which returns `{ uid, email }` — the email lower-cased and always verified. `proxy.ts` (Next 16's name for middleware) gates `/` and `/settings` on cookie presence only; real verification happens on the server. Every new protected route must be added to its `matcher`.

Account deletion is `deleteAccount()` in `lib/actions/account.ts`, called through `useAuth().deleteAccount` (which then signs out like `logout`). It deletes every row tied to the user in one transaction, then the Firebase user. A new table keyed by uid or email must be added there.

`getServerUser()` is wrapped in React `cache()` (one verification per request), so call it freely. Logout (`DELETE /api/auth/session`) revokes the user's refresh tokens, which signs them out on every device. `requireUser()` / `requireUserWithEmail()` call `redirect("/login")` when there is no session, so don't wrap them in a `try/catch` — it would swallow the redirect.

**Email verification is required.** The session route returns 403 for an unverified email, so such a user is signed in on the client but has no cookie. Two consequences:

- Mint cookies only through `establishSession()` in `AuthContext`; it keeps `hasSession` in step.
- Redirect to `/` on `hasSession`, never on `currentUser`. A client-signed-in user without a cookie would bounce `/login` → `/` → proxy → `/login` in a loop. `hasSession` can also be stale (cookie revoked by a logout on another device, or expired), so `/login` calls `refreshSession()` before redirecting. `/login` shows `VerifyEmailNotice` when `currentUser && !currentUser.emailVerified`.

### Google Calendar

`lib/CalendarFunctions.ts` does **not** use the Calendar API or an OAuth token. It builds a `calendar.google.com/render?action=TEMPLATE` URL with prefilled fields and opens it in a new window. Any leftover `googleAccessToken` in localStorage is cleared on load — don't reintroduce a token-based flow without a deliberate reason.

### i18n — next-intl (English, German)

Every user-facing string goes through `t()` from `next-intl`: `useTranslations()` in components (client or server), `await getTranslations()` in async Server Components and actions. Both are called **without a namespace**, so there is one `t` per component and keys are full paths: `t("settings.title")`, `t("common.cancel")`. Text lives in `i18n/en.json` and `i18n/de.json`, one camelCase top-level section per component or page (`navBar`, `settings`), plus shared `common`, `errors`, `authErrors`. Developer-only text (console, thrown internal errors, DB values) stays English.

- **No locale in the URL.** `i18n/request.ts` picks the locale per request: the `NEXT_LOCALE` cookie (set by `setLocale` in `lib/actions/locale.ts` from `/settings`), else the `Accept-Language` header, else English. Supported locales are in `i18n/config.ts`. Because it reads cookies and headers, every page renders dynamically.
- **Type-check guards the keys.** `global.d.ts` types `t()` keys against `en.json`, and `i18n/request.ts` types `de.json` as `en.json`, so a wrong key or a key missing from German fails `npm run type-check`. Add every new key to both files.
- **Values go in whole templates** (`"Delete {name}"`), never concatenated parts; German word order differs. Inline markup uses `t.rich`.
- **Server Action errors** are translated on the server: validation returns an `ErrorMessage` key (short, inside `errors`) and actions return `actionError(...)` (`lib/actions/actionError.ts`), which adds the `errors.` prefix, so clients show `result.error` unchanged.
- **Auth errors** are keys too: `AuthContext` throws `AuthMessageError` with a short key inside `authErrors`, and callers pass their own `t` to `authErrorMessage(error, t)`, which adds the `authErrors.` prefix.

### Styling — Tailwind CSS v4

Styling is **Tailwind CSS v4**, utility classes composed with `twMerge` (`tailwind-merge`) so callers can override via a `className`/`extraClasses` prop. Reusable presentational components live in `Components/ui/` (e.g. `Button.tsx` with a `variant` prop, `Text.tsx` for typography primitives). Color tokens and custom animations are defined in `styles/globals.css` (`@theme`); use the named colors like `bg-blue1`, `hover:bg-blue3`, `text-grey3`.

The project previously used styled-components; that migration is complete and there is no styled-components code, `ThemeProvider`, or `styles/Theme.ts` left. Don't reintroduce styled-components.

### Component file convention

Components are flat single-file `Components/ComponentName.tsx` — no per-component folder, no `index.tsx` barrel. Reusable presentational components go in `Components/ui/`; feature components sit directly under `Components/`.
