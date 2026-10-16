# Future upgrades

Planned, not scheduled. Each needs its own spec (see `specs/template.md`) before
building. Background and constraints are in `specs/architecture.md`.

1. **`/profile` — the rest of it.** The page holds a "Notifications" section
   with the friend requests and the delete-account option, and the NavBar shows
   Log Out only there. `/settings` is public and holds only the language
   selector. Still to build on `/profile`:
   - **Notifications and social:** a notifications list (e.g. "Bob accepted your
     request", "you and Alice talked"), and other social features built on links.
   - **Change password:** only for email+password accounts — hide it for Google
     sign-in (check `providerData` for `password`). Firebase requires a recent
     sign-in, so re-authenticate (`reauthenticateWithCredential`) before
     `updatePassword`; show errors through `authErrorMessage()`.
2. **Database pool on Vercel Fluid compute.** `lib/db/index.ts` keeps one
   module-level `Pool`. If Fluid compute is on (not checked), Vercel recommends
   `attachDatabasePool(pool)` from `@vercel/functions` so idle WebSocket
   connections close before an instance suspends.
3. **Language per account.** The language is a cookie today, so it is per
   browser and a new device starts from its browser language. Moving it to a
   `user_settings` row would make it follow the user. (The old
   `specs/i18n-german-translations.md` on the `70-add-i18n-and-german-translations`
   branch is superseded by the shipped i18n work.)
4. **Stable auth context value.** `AuthProvider` in `lib/AuthContext.tsx` builds
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

5. **Don't block server-rendered pages on Firebase start-up.** Moved here from
   P1 (High) in `specs/app-review-fixes.md`. Until the Firebase client reports
   the auth state, `AuthProvider` (`lib/AuthContext.tsx`) shows only a spinner
   and renders no children. So server-rendered content, including the home list
   and the public pages (`/about`, `/privacy`, `/login`), waits for the
   Firebase script to download and resolve. Checked during the review: the
   server HTML for `/about` contains no page content at all, only the spinner.
   Server-rendered content must show without waiting for client auth start-up.
   - Edge case: a user whose JavaScript loads slowly must not see an
     authenticated page flash and then redirect.
   - It touches the auth flow, so it needs its own spec and its own branch.

6. **What happens when the timer is up.** Options 1 and 2 are done: the card
   turns red, and an opt-in email goes out once a contact has been red for over
   24 hours ("Overdue reminders" in `specs/architecture.md`; the switch is on
   `/settings`, stored in `user_settings`). Still open:
   - If the user and the friend are linked **and** both contacts have been red
     for over 48 hours, notify both of them. It can reuse the daily cron and
     `user_settings`. It shares state across users, so check it against the
     "only talk events are shared" rule before building.

7. **Calendar appointment indicator on the card.** When the user opens a Google
   Calendar appointment from a card, show an icon on that card. The icon starts
   with the date picked in the appointment form. The user can edit the date (the
   app cannot see the real calendar event: `lib/CalendarFunctions.ts` only opens
   a prefilled URL, with no API and no token). The icon goes away once the date
   has passed — compute that when reading, so no cleanup job is needed. Store
   the date per contact (a nullable column on `contacts`, or a small table).
   Opening the form does not mean the user saved the event, so the edit option
   should also allow clearing it.
8. **Maybe: turn notes back on.** Not decided. Notes are parked (C1 in
   `specs/app-review-fixes.md`): the `notes` table, `Notes.tsx`, `NoteItem.tsx`
   and the commented-out actions in `lib/actions/contacts.ts` still exist.
   Decide whether notes are wanted before writing a spec.
