# Future upgrades

Planned, not scheduled. Each needs its own spec (see `specs/template.md`) before
building. Background and constraints are in `docs/architecture.md`.

1. **`/settings` — the rest of it.** The page (formerly `/account`; the old URL
   redirects in `next.config.js`) holds a language selector (UI only), a
   "Notifications" section with the friend requests, and the NavBar shows Log Out
   only there. Still to build:
   - **Notifications and social:** a notifications list (e.g. "Bob accepted your
     request", "you and Alice talked"), and other social features built on links.
   - **Change password:** only for email+password accounts — hide it for Google
     sign-in (check `providerData` for `password`). Firebase requires a recent
     sign-in, so re-authenticate (`reauthenticateWithCredential`) before
     `updatePassword`; show errors through `authErrorMessage()`.
   - **Change language:** the selector exists (`Components/LanguageSelector.tsx`,
     local state only). Wiring it depends on the i18n work below. Store the choice
     per user (a cookie or a `user_settings` row).
2. **Account deletion.** There is no way to delete an account today, and deleting
   the Firebase user would leave its rows behind (`owner_id` has no FK). A
   "Delete account" section on `/settings`: re-authenticate, delete the user's
   `contacts` by `owner_id` (cascades to notes, talks, links and requests sent
   from them), cancel pending requests addressed to their email, then Firebase
   `deleteUser`, then revoke the session. Update the privacy page.
3. **A real PWA setup.** `next-pwa` is a webpack plugin and the build uses
   Turbopack, so it is inert and no service worker is generated. Replace it with a
   Turbopack-compatible approach (e.g. Serwist, or a hand-written service worker),
   check `public/manifest.json` and the icons, and decide what may be cached:
   never serve a signed-in page after sign-out. Then put the "installable" claim
   back in the README.
4. **Database pool on Vercel Fluid compute.** `lib/db/index.ts` keeps one
   module-level `Pool`. If Fluid compute is on (not checked), Vercel recommends
   `attachDatabasePool(pool)` from `@vercel/functions` so idle WebSocket
   connections close before an instance suspends.
5. **i18n (German).** `specs/i18n-german-translations.md` lives on the
   `70-add-i18n-and-german-translations` branch, not on `main`. It is stale (it
   says "Pages Router" and cites `pages/index.tsx`) and needs a correction pass
   first. Its acceptance criterion is "no user-facing English remains when German
   is selected", so add the auth screens to its surface list: `app/login/page.tsx`,
   `Components/EmailAuthForm.tsx`, `Components/VerifyEmailNotice.tsx`, and the
   error strings in `lib/AuthContext.tsx` (`AUTH_ERROR_MESSAGES`,
   `NOT_VERIFIED_MESSAGE`, `postSessionCookie`).
