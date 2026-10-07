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
2. **A real PWA setup.** `next-pwa` is a webpack plugin and the build uses
   Turbopack, so it is inert and no service worker is generated. Replace it with a
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
