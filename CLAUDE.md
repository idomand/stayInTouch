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
npm run lint         # ESLint (eslint-config-next)
npm run type-check   # tsc --noEmit — the source of truth for correctness
```

There is **no test framework** in this project. "Verify it works" means `npm run type-check` plus `npm run lint`, and running the app.

A `pre-push` git hook runs `tsc --noEmit` and aborts the push on any type error (wired up by the `postinstall` script setting `core.hooksPath`). Keep the build type-clean or pushes fail. Note `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`, so unused variables — including a styled-component `const` you defined but didn't render — are hard errors, not warnings.

## Architecture

Next.js 16 **Pages Router** (not App Router) + React 19, TypeScript, Firebase (Auth + Firestore), deployed as an installable PWA via `next-pwa`. Path alias `@/*` maps to the repo root.

### Data model — the key thing to understand

There is no server code. The client talks to Firestore directly, and **each user's contacts live in their own collection named by concatenating email + uid**: `` `${userEmail}${userId}` ``. This string is rebuilt at every call site (see `lib/Firebase.ts`, `utils/hooks/useSnapshotData.ts`) rather than centralized — match that pattern or refactor all sites together. A contact is a `ContactItemType` (`types/ContactItemType.ts`); notes are an embedded `notesArray` on the contact document, not a subcollection.

Two derived fields are computed on the client and are **not stored** in Firestore: `contactId` (the Firestore doc id, attached after read) and `timeUntilNextTalk` (days until the next check-in, `time - (now - timeFromLastTalk)/oneDay`). The overdue-first ordering the whole app is built around comes from this computation in `utils/hooks/useSnapshotData.ts`, which subscribes via `onSnapshot` for realtime updates.

### Auth

`lib/AuthContext.tsx` wraps the app in `_app.tsx` and exposes `useAuth()` (Google popup sign-in via Firebase). Consumers call `useAuth()!` with a non-null assertion and read `currentUser`. `AuthProvider` blocks rendering (shows a spinner) until the initial `onAuthStateChanged` resolves, so `currentUser` is settled by the time children mount.

### Google Calendar

`lib/CalenderFunctions.ts` does **not** use the Calendar API or an OAuth token. It builds a `calendar.google.com/render?action=TEMPLATE` URL with prefilled fields and opens it in a new window. Any leftover `googleAccessToken` in localStorage is cleared on load — don't reintroduce a token-based flow without a deliberate reason.

### Styling — mid-migration, two systems coexist

The project is migrating from **styled-components to Tailwind CSS v4** (this is the active branch's purpose). Expect both in the tree:

- **Legacy:** styled-components with a `defaultTheme` (`styles/Theme.ts`) provided via `ThemeProvider` in `_app.tsx`. Components define `styled.*` blocks inlined at the bottom of the same file and read theme values like `theme.blue1`, `theme.grey3`, `theme.typeScale.*`, `theme.devices.break1`. `ContactItem.tsx` is a representative legacy component.
- **New:** Tailwind utility classes composed with `twMerge` (`tailwind-merge`). New/refactored components live in `Components/ui/` (e.g. `Button.tsx` with a `variant` prop). The Tailwind theme mirrors the old color names (`bg-blue1`, `hover:bg-blue3`, etc.).

When touching a component, prefer moving it to Tailwind rather than extending its styled-components. The theme color names are intentionally shared across both systems, so a value like `blue1` means the same thing in either.

### Component file convention

Components are flat single-file `Components/ComponentName.tsx` — no per-component folder, no `index.tsx` barrel. Legacy files keep their styled-component `const`s inlined below the component (not exported). `Components/Common/` is the exception: it holds shared, exported styled primitives imported by others.
