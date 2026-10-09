# Future upgrades

Planned, not scheduled. Each needs its own spec (see `specs/template.md`) before
building. Background and constraints are in `specs/architecture.md`.

1. **`/settings` — the rest of it.** The page (formerly `/account`; the old URL
   redirects in `next.config.js`) holds the language selector, a
   "Notifications" section with the friend requests, and the NavBar shows Log Out
   only there. Still to build:
   - **Notifications and social:** a notifications list (e.g. "Bob accepted your
     request", "you and Alice talked"), and other social features built on links.
   - **Change password:** only for email+password accounts — hide it for Google
     sign-in (check `providerData` for `password`). Firebase requires a recent
     sign-in, so re-authenticate (`reauthenticateWithCredential`) before
     `updatePassword`; show errors through `authErrorMessage()`.
2. **A real PWA setup.** There is no service worker. `next-pwa` was removed: it
   is a webpack plugin and the build uses Turbopack, so it never ran. Use a
   Turbopack-compatible approach (e.g. Serwist, or a hand-written service worker),
   check `public/manifest.json` and the icons, and decide what may be cached:
   never serve a signed-in page after sign-out. Then put the "installable" claim
   back in the README.
3. **Database pool on Vercel Fluid compute.** `lib/db/index.ts` keeps one
   module-level `Pool`. If Fluid compute is on (not checked), Vercel recommends
   `attachDatabasePool(pool)` from `@vercel/functions` so idle WebSocket
   connections close before an instance suspends.
4. **Language per account.** The language is a cookie today, so it is per
   browser and a new device starts from its browser language. Moving it to a
   `user_settings` row would make it follow the user. (The old
   `specs/i18n-german-translations.md` on the `70-add-i18n-and-german-translations`
   branch is superseded by the shipped i18n work.)
5. **Stable auth context value.** `AuthProvider` in `lib/AuthContext.tsx` builds
   a new `value` object on every render, so every `useAuth()` consumer
   re-renders with it (P6 in `specs/app-review-fixes.md`). A `useMemo` keyed on
   `[currentUser, hasSession]` was tried and reverted: the functions in the
   value are recreated each render, so that list was incomplete. The
   `react-hooks/preserve-manual-memoization` rule flagged it, and React Compiler
   would skip the component. Pick one:
   - wrap each function in `useCallback` with its real dependencies, then
     memoize the value on all of them; or
   - turn on React Compiler and let it memoize, with no manual `useMemo`.

   Any function in the value that reads `currentUser` or `hasSession` must list
   it as a dependency, or it reads a stale value.

   Then add `refreshSession` to the deps of the redirect effect in
   `app/login/page.tsx` and update its comment. It is left out today on
   purpose: `refreshSession` is a new function on every render, so listing it
   would re-run the effect, and re-mint the session cookie, on every render.
   Once the function is stable, listing it is safe and makes the deps honest.
