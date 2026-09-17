# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working with the user

- Do not give compliments or open replies with praise ("Great question", "Good idea", "You're right"). Skip the flattery and answer.
- Do not agree by default. If the user proposes something and a better approach exists, say so and explain why — briefly and directly.
- Push back on suboptimal suggestions instead of implementing them silently. State the tradeoff, recommend the better option, and let the user decide. Agreeing to a worse approach to be accommodating is not helpful here.
- Being wrong is fine; being agreeable at the cost of correctness is not. When you disagree, lead with the disagreement, not with hedging.

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # production build
npm run start        # serve the production build
npm run type-check   # tsc --noEmit — the source of truth for correctness
```

There is **no test framework** and **no working lint** in this project (the `next lint` script was removed — Next 16 dropped `next lint` and ESLint 9 needs a flat config the repo doesn't have). "Verify it works" means `npm run type-check` plus `npm run build`, and running the app.

A `pre-push` git hook runs `tsc --noEmit` and aborts the push on any type error (wired up by the `postinstall` script setting `core.hooksPath`). Keep the build type-clean or pushes fail. Note `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`, so unused variables — an import or `const` you defined but never referenced — are hard errors, not warnings.

## Architecture

Next.js 16 **App Router** (`app/`) + React 19, TypeScript, Firebase (Auth + Firestore), deployed as an installable PWA via `next-pwa`. Path alias `@/*` maps to the repo root.

Route files live in `app/` as `page.tsx`; `app/layout.tsx` is the root layout (the old `_app.tsx` + `_document.tsx`). Page/head metadata comes from `metadata`/`viewport` exports, not a `<Head>` component. Any component using hooks, context, browser APIs, or event handlers needs the `"use client"` directive; the four route pages, `AuthContext`, `NavBar`, `Footer`, and `ScrollToTopButton` all carry it. Navigation hooks come from `next/navigation` (`useRouter`, `usePathname`), not `next/router`.

### Data model — the key thing to understand

There is no server code. The client talks to Firestore directly, and **each user's contacts live in their own collection named by concatenating email + uid**: `` `${userEmail}${userId}` ``. This string is rebuilt at every call site (see `lib/Firebase.ts`, `utils/hooks/useSnapshotData.ts`) rather than centralized — match that pattern or refactor all sites together. A contact is a `ContactItemType` (`types/ContactItemType.ts`); notes are an embedded `notesArray` on the contact document, not a subcollection.

Two derived fields are computed on the client and are **not stored** in Firestore: `contactId` (the Firestore doc id, attached after read) and `timeUntilNextTalk` (days until the next check-in, `time - (now - timeFromLastTalk)/oneDay`). The overdue-first ordering the whole app is built around comes from this computation in `utils/hooks/useSnapshotData.ts`, which subscribes via `onSnapshot` for realtime updates.

### Auth

`lib/AuthContext.tsx` wraps the app in `app/layout.tsx` and exposes `useAuth()` (Google popup sign-in via Firebase). Consumers call `useAuth()!` with a non-null assertion and read `currentUser`. `AuthProvider` blocks rendering (shows a spinner) until the initial `onAuthStateChanged` resolves, so `currentUser` is settled by the time children mount.

### Google Calendar

`lib/CalenderFunctions.ts` does **not** use the Calendar API or an OAuth token. It builds a `calendar.google.com/render?action=TEMPLATE` URL with prefilled fields and opens it in a new window. Any leftover `googleAccessToken` in localStorage is cleared on load — don't reintroduce a token-based flow without a deliberate reason.

### Styling — Tailwind CSS v4

Styling is **Tailwind CSS v4**, utility classes composed with `twMerge` (`tailwind-merge`) so callers can override via a `className`/`extraClasses` prop. Reusable presentational components live in `Components/ui/` (e.g. `Button.tsx` with a `variant` prop, `Text.tsx` for typography primitives). Color tokens and custom animations are defined in `styles/globals.css` (`@theme`); use the named colors like `bg-blue1`, `hover:bg-blue3`, `text-grey3`.

The project previously used styled-components; that migration is complete and there is no styled-components code, `ThemeProvider`, or `styles/Theme.ts` left. Don't reintroduce styled-components.

### Component file convention

Components are flat single-file `Components/ComponentName.tsx` — no per-component folder, no `index.tsx` barrel. Reusable presentational components go in `Components/ui/`; feature components sit directly under `Components/`.
