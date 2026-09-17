# Spec for Pages Router to App Router Migration

## Summary

Convert the Next.js routing from the **Pages Router** (`pages/`) to the **App Router** (`app/`). The app is Next.js 16 + React 19, deployed as a PWA. The public behavior — the same four routes, the same auth-gated home page, the same look — must not change. This is a structural migration, not a feature change.

Routes to preserve:

- `/` — auth-gated home (MainForm + ContactDetails), redirects to `/login` when signed out
- `/login` — Google sign-in, redirects to `/` when signed in
- `/about` — static content plus a "Demo" button that seeds data
- `/privacy` — static content

Cross-cutting pieces to migrate:

- `pages/_app.tsx` → `app/layout.tsx` (root layout wrapping `AuthProvider` and the shared `Layout` chrome)
- `pages/_document.tsx` → the `<html>`/`<body>` shell in the root layout plus a `metadata`/`viewport` export for the manifest link and `theme-color`
- All `next/router` usage (`useRouter`, `router.push`, `router.pathname`) → `next/navigation` (`useRouter`, `usePathname`)
- The `<Head><title>` in `_app.tsx` → a `metadata` export
- Add the `"use client"` directive to every component that uses hooks, browser APIs, context, or event handlers

## Functional Requirements

- Every existing route (`/`, `/login`, `/about`, `/privacy`) resolves at the same URL and renders the same content after the migration.
- The home page keeps its auth gate: signed-out users are redirected to `/login`; the page renders `MainForm` and `ContactDetails` only when a user is present.
- The login page redirects a signed-in user to `/`.
- `AuthProvider` still wraps the whole app and continues to block rendering with the spinner until the initial `onAuthStateChanged` resolves, so `useAuth()!` stays safe for consumers.
- The shared chrome (`NavBar`, `Footer`, `ScrollToTopButton`, `Layout`) still wraps every page.
- The footer's active-link highlighting keeps working (currently driven by `router.pathname`, to be driven by `usePathname()`).
- The `<title>` "Stay-in-Touch", the PWA manifest link, and the `theme-color` meta remain present in the rendered HTML.
- The PWA still installs and the service worker still registers; `next-pwa` continues to work under the App Router build.
- `npm run type-check` passes and `npm run build` succeeds after the migration.
- No `pages/` directory remains (or, if kept temporarily, it must not create duplicate/conflicting routes).

## Possible Edge Cases

- **Client vs server components.** Every file touching `useAuth`, `useState`, `useEffect`, `useRouter`, `usePathname`, `localStorage`, or `onClick` must be a client component. Missing a `"use client"` directive causes a build error or a runtime crash. `AuthContext`, `Layout`'s interactive children, `Footer`, `NavBar`, and all four route components are candidates.
- **`next/router` vs `next/navigation` API differences.** `usePathname()` replaces `router.pathname`; `useRouter().push` exists in both but comes from a different import. Any leftover `next/router` import breaks the build under App Router.
- **Redirect timing.** The current redirects run in `useEffect` after mount. Under App Router the same pattern works in client components, but confirm there is no flash of protected content and no redirect loop between `/` and `/login`.
- **`next-pwa` and App Router.** Confirm the plugin builds cleanly with `app/`. Service worker registration and the `manifest.json` link must survive the move out of `_document.tsx`.
- **`theme-color` and manifest.** These move from `_document.tsx` to the metadata/viewport exports; verify they still appear in the served HTML head.
- **Styling systems.** Global CSS import (`@/styles/globals.css`) moves to the root layout. Confirm Tailwind v4 styles still load. If any styled-components remain (project is mid-migration), App Router SSR needs a style registry — verify whether any component still uses styled-components before assuming none do.
- **Metadata duplication.** Avoid setting `<title>` in two places once the `metadata` export exists.
- **Firebase client init.** Firebase must only initialize on the client; ensure no route accidentally becomes a server component that imports client-only Firebase code at module load.

## Acceptance Criteria

- `app/` contains the root layout and all four routes; the app runs with no `pages/` route files (except any intentionally retained non-route files).
- All four URLs load and behave identically to before: content, auth gating, and redirects.
- Footer active-link state highlights the current route.
- Page title, manifest link, and `theme-color` are present in the served HTML.
- The PWA installs and the service worker registers in a production build.
- `npm run type-check` passes with no errors (the repo's `noUnusedLocals`/`noUnusedParameters` are strict).
- `npm run build` completes successfully.
- Manual smoke test of sign-in, sign-out, the `/about` Demo button, and navigation across all routes passes.

## Open Questions

- Should the migration be done route-by-route with both routers coexisting temporarily, or as a single cutover? (App Router and Pages Router can coexist during a transition, but the same path cannot be defined in both.)
- Do we want to adopt App Router conveniences now — `loading.tsx`, `error.tsx`, `not-found.tsx` — or keep the migration strictly like-for-like and add those later?
- Should route-level auth gating stay in client-side `useEffect` redirects, or is moving toward a more idiomatic App Router pattern in scope?
- Is removing the leftover styled-components references from `CLAUDE.md`/deps part of this task, or a separate cleanup?

## Testing Guidelines

This repo has **no test framework** (see `CLAUDE.md`); the verification gate is `npm run type-check` plus `npm run build` plus running the app. If a test setup is added as part of this work, cover these cases without going too heavy:

- `/` redirects to `/login` when signed out and renders `MainForm` + `ContactDetails` when signed in.
- `/login` redirects to `/` when a user is already signed in.
- Footer active-link state reflects the current path via `usePathname()`.
- The root layout renders `AuthProvider` and the shared chrome around page content.
- The served HTML head includes the title, the manifest link, and the `theme-color` meta.
