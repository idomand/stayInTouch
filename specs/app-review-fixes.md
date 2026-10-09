# Spec for app-review-fixes

## Summary

A full review of the app on 2026-10-09 found defects in five areas: code, UI, accessibility, translations and performance. This spec lists them and says what "fixed" means. The server side (actions, ownership guards, queries, auth, email opt-out) is sound, and no security issues were found. Most findings are in client components, shared UI primitives and the message files.

Work happens on branch `fix/small-fixes`, in this order. Each step is its own commit:

1. Shared UI primitives (Button, ErrorWarning, Text, global focus style)
2. Keyboard and screen-reader access
3. Translations
4. Form behaviour
5. Rendering performance
6. Comment out the notes feature, and drop the notes join and talk history from the home query
7. Low-priority cleanup

P1 (stop blocking server-rendered pages on Firebase start-up) is out of this spec. It gets its own spec and its own branch, because it touches the auth flow.

Severity: **High** = a user-facing bug, or a group of users is blocked. **Med** = a clear defect with limited impact. **Low** = cleanup.

## Functional Requirements

### Code and behaviour

- **C1 (High) Notes are unreachable.** Commit `b7fbe94` ("style: update AddNewContact") removed the Notes button from the contact row. The Notes components, the note Server Actions, the `notes`/`noteItem` messages and the notes join in the contacts query are still there, but nothing uses them. Users cannot see the notes they wrote. **Decision:** park the feature. Comment out the Notes components' use, the note Server Actions and the notes join in the contacts query. Delete nothing. Keep the `notes` and `noteItem` message keys (JSON cannot hold comments); they are exempt from the "no unused keys" rule. `deleteAccount` still deletes notes, and the privacy text still describes them.
- **C2 (High) Shared Button defaults to submit.** The shared Button sets no button type, so the browser default ("submit") applies. Inside a form, any Button submits it. Today this makes the Notes "Cancel" button save the note instead of cancelling. The shared Button must default to a plain button. Submitting must be opt-in.
- **C3 (Med) Talks can be recorded twice.** "Mark as talked" has no in-flight guard. A double click records two talks, and two more on a linked friend's contact. While the request runs, the control must be disabled.
- **C4 (Med) Forms clear input on error.** When the server rejects a name (for example, "name taken"), the add-contact and edit-contact forms clear the name field. They must keep what the user typed.
- **C5 (Med) Stale form values.** The appointment dialog calculates its suggested date once, so after "mark as talked" it still suggests the old date. The edit-contact dialog resets name and cadence on close, but not email. Each dialog must show current contact data every time it opens.
- **C6 (Med) Error auto-hide is copied six times.** The error auto-hide logic appears in six components and never clears its timer. Errors become inline and stay until the next submit or edit (see U3), so remove the timers. Where an error must still clear itself, use one shared mechanism that clears its timer on change and on unmount.
- **C7 (Med) Number fields cannot be emptied.** The cadence inputs turn an empty field into 0. A user must be able to delete the value and type a new one. Validation runs on submit.
- **C8 (Med) Duplicate element ids.** Every contact row's edit form, and the add form, use the element id `time`. Ids must be unique on the page.
- **C9 (Low) Possible hydration mismatch.** The contact row reads the current time during render, so server and client can render different labels near a day boundary.
- **C10 (Low) Dead code in the appointment flow.** The appointment dialog has an error state that nothing sets, and a form with no submit. The calendar helper is async but awaits nothing, its result is ignored, and the event time is fixed at 19:00. Remove the dead parts.
- **C11 (Low) Easter egg breaks the logging rule.** The easter egg writes to the console with `console.log`, which the project rules forbid, and ships its ASCII art to every user. **Decision:** delete the easter egg completely: the console output, the ASCII art and the clickable "Hi" span. The greeting stays as plain text (see T2).
- **C12 (Low) Broken PWA manifest.** The manifest points to an icon that does not exist (`/icons/maskable.png`) and uses one relative icon path. It also gives a PNG the wrong MIME type, has a trailing space in `theme_color`, and sets `name` to "Stay_in_Touch". **Decision:** keep the manifest and fix it: only existing icons, absolute paths, correct MIME types, no trailing space, `name` "Stay-in-Touch".
- **C13 (Low) Unused dependencies.** `react-modal`, `@types/react-modal` and `react-use` are installed but never used. `next-pwa` does nothing under Turbopack. ESLint is installed with no config. `next.config.js` has a commented-out block. **Decision:** uninstall `react-modal`, `@types/react-modal`, `react-use` and `next-pwa`, remove the `next-pwa` wrapper from `next.config.js`, and delete the commented-out block. ESLint stays: a flat config (`eslint.config.mjs`) and `npm run lint` were added after this review, so it works now.
- **C14 (Low) Outdated comments.** Comments in `formClasses.ts` and `Spinner.tsx` refer to files that no longer exist.
- **C15 (Low) Repeated styles.** The card style on the settings, about and privacy pages appears six times. The dropdown item style appears five times. Use one shared definition for each.

### Accessibility

- **A1 (High) No focus outline.** A global rule removes the focus outline from every element. Keyboard focus must be visible on every interactive element.
- **A2 (High) "Mark as talked" is an icon only.** It cannot be focused and has no accessible name. It must be a real button, with a translated label that says what it does and names the contact.
- **A3 (High) The "more options" menu needs a mouse.** The trigger has no accessible name and does not report open or closed. The items cannot be focused. The menu must work with Tab, Enter or Space, and Escape. It must report its state and return focus to the trigger when it closes.
- **A4 (High) Errors are silent and hide too fast.** The floating error is not announced to screen readers. It uses a heading element, its icon has no text alternative, and it disappears after 2 seconds. Errors must be announced and must not be headings. With inline errors (U3), each error uses `role="alert"` and stays until the next submit or edit.
- **A5 (Med) Low colour contrast.** Several colour pairs fail WCAG AA: pure red text on white or on light red, green text on white, and white text on the bright green "Add contact" button. **Decision:** darken the existing red and green token values in `styles/globals.css` until all text reaches AA. Do not add separate text-only tokens. The "Add contact" button gets darker as a result.
- **A6 (Med) Dialogs are not labelled.** The dialog close button is the letter "X" with no accessible name. Dialogs are not linked to their title.
- **A7 (Med) Unlabelled controls.** The "last time we spoke" date field has no label. The accept-request radio options are not grouped with a legend. (The "Hi" easter egg span, which a keyboard cannot reach, is removed by C11.)
- **A8 (Low) Headings, titles and link text.** Pages have several top-level headings. The nav brand is a heading. Only Settings sets a page title. The About page uses "here" as link text.

### UI

- **U1 (Med) Forced capitalisation.** CSS capitalisation on headings, error messages and contact names upper-cases every word. Examples: "No Contacts Yet", "A Contact With This Name Already Exists.", German "Noch Keine Kontakte", and "van der Berg" shown as "Van Der Berg". Show text as written.
- **U2 (Med) Delete confirmation says too little.** The delete-contact confirmation only asks "Are you sure?". It must say that talk history and any link are deleted too. The delete button must look destructive, matching Delete Account.
- **U3 (Med) Two error styles.** Some screens use a floating error box and others use inline red text. **Decision:** inline everywhere. The error shows next to the form or control that caused it. Remove the floating error box.
- **U4 (Low) "Link request pending" looks disabled.** The menu entry looks disabled but is a link to Settings. Make its purpose clear.
- **U5 (Low) Hard-coded footer year.** The footer copyright year is fixed at 2026. Calculate it from the current date.

### Translations

- **T1 (High) No plural forms.** Day counts have no plural forms, so users see "Talk in 1 days", "Didn't talk for 1 days" and "Sprechen in 1 Tagen". Every count message needs proper singular and plural forms in English and German.
- **T2 (Med) Sentences built from parts.** The greeting ("Hi" + name) and the outgoing-request line ("Your contact" + name + arrow + email + "waiting", with English quotation marks and a leading-space trick in the JSON) are glued together from pieces. Each must be one whole message with placeholders.
- **T3 (Med) English and German disagree.** For `common.enterName`, English says "Enter Name" and German says "Name des Freundes".
- **T4 (Med) Outdated About text.** `about.howTo4` says adding an email links you and syncs calendars and counters. Linking now works through link requests. Rewrite it in both languages.
- **T5 (Med) Mixed terms.** The section title says "Friend requests" and everything else says "link request". The same split exists in German. The brand appears as both "Stay in Touch" and "Stay-in-Touch". **Decision:** use "link request" everywhere (and the matching German term), and spell the brand "Stay-in-Touch" everywhere, including emails and the manifest.
- **T6 (Low) English wording.** Fix these:
  - "Last Time We Have Spoken" → "Last time we spoke"
  - "Didn't talk for {days} days" → "Last talk {days} days ago" (with plural forms, see T1). The number is days since the last talk, not days overdue.
  - "Make Appointment with: {name}"
  - "Change Talk Every X Days:"
  - "Login page" as a nav label
  - "Log Out" and "Log out" both used
  - Random Title Case
  - "Email" capitalised mid-sentence
- **T7 (Low) German wording.** "Sprechen in {days} Tagen" reads awkwardly. Gender use is inconsistent: generic "Freund" in the app, gender-inclusive wording in the privacy text. **Decision:** use neutral nouns ("Kontakt", "Person") instead of "Freund", in the app and in the privacy text. Some strings use "..." and others use "…"; use "…" everywhere.
- **T8 (Low) Untranslated or unused strings.** Two email placeholders, the dialog "X" and the calendar event title are not translated. Remove unused message keys, except the `notes` and `noteItem` sections (kept for C1).

### Performance

- **P1 (High) Pages wait for Firebase.** Until the Firebase client reports the auth state, the auth provider shows only a spinner. Server-rendered content, including the home list and the public pages, waits for the Firebase script to download and resolve. Server-rendered content must show without waiting for client auth start-up. **Decision:** out of scope here. It gets its own spec and branch, because it touches the auth flow.
- **P2 (High) Every contact row mounts its dialogs up front.** Each row mounts about six hidden dialogs, including a full inline date picker. Dialog content must mount only while the dialog is open.
- **P3 (Med) The home query sends too much.** Every load of the home page sends every note (unused today) and the full talk history of every contact, and both grow without limit. Send only what the first screen shows. **Decision:** drop the notes join (C1) and the talk history from the home query. Load a contact's history when its history dialog opens. `lastTalkedAt` and `daysUntilNextTalk` already come from SQL, so the list needs no history.
- **P4 (Med) A server call on every navigation.** The nav bar calls a Server Action on every route change to refresh the request badge. Each call costs a Firebase session check and a database query, even on public pages. Fetch on sign-in and after related actions only.
- **P5 (Low) Session cookie re-minted on every load.** The cookie is minted again on every full page load. This is intended, but measure the cost and write it down.
- **P6 (Low) Avoidable re-renders.** The dialog re-attaches its click listener on every render. The auth context value is a new object on every render, so every consumer re-renders.

## Possible Edge Cases

- Changing the Button default affects every Button. Check every consumer: dialog close, all confirmation dialogs, login, email verification, delete account and scroll-to-top. Only the Notes form relied on the submit default, and that is the bug.
- Plural rules apply to 0, 1 and many, and to negative or fractional day values from the overdue calculation. Check what the label shows at exactly 0 and at 1.
- Two errors in quick succession must both be readable. The second replaces the first and is announced again, even if the text is the same.
- A contact whose name is in lower case, or has particles ("van", "de"), must render exactly as entered in both languages.
- With the notes feature commented out, existing notes stay in the database. The privacy text and the account-deletion flow must still describe and delete them.
- The history dialog loads its data when it opens. It must show a loading state, an inline error if the load fails, and talks recorded since the page loaded.
- Lazy-mounted dialogs must still reset their fields on reopen and show current contact data (see C5).
- When the badge stops refetching on navigation, it must still update after accept, reject and sign-out.
- German strings are longer. Check that the dropdown, the contact row and error messages don't overflow at phone width.

## Acceptance Criteria

- Every High and Med item above is fixed, or has a recorded decision to defer with a reason. P1 is deferred to its own spec.
- On `/`, `/settings` and `/login`, a keyboard-only user can reach and use every control and always sees where focus is.
- Screen readers announce errors. Every icon-only control has a translated accessible name.
- All text colour pairs meet WCAG AA contrast.
- No message reads "1 days" or "1 Tagen". No user-facing sentence is built by joining translated pieces.
- English and German message files have the same keys and matching meaning. No unused keys remain, except `notes` and `noteItem`.
- Errors show inline only. No floating error box remains.
- The home page query sends no notes and no talk history.
- Text in the UI matches its message exactly: CSS does not change capitalisation.
- Double-clicking "mark as talked" records exactly one talk.
- When the server rejects a form, the user's input stays.
- With 50 contacts, the home page does not mount hidden dialog content or date pickers.
- Navigating between pages makes no Server Action call for the request badge.
- The PWA manifest references only icons that exist, with correct types.
- `npm run type-check` and `npm run build` pass after every step.

## Decisions

Answered on 2026-10-09. Details are in each item above.

- **Notes (C1):** comment out, do not delete. Keep the message keys. Drop the notes join from the home query.
- **Error style (U3, A4):** inline only, with `role="alert"`.
- **Easter egg (C11):** delete completely.
- **Talk history (P3):** load when the history dialog opens.
- **Terminology (T5):** "link request". Brand: "Stay-in-Touch".
- **German tone (T7):** neutral nouns ("Kontakt", "Person").
- **P1 scope:** its own spec and branch.
- **Contrast (A5):** darken the existing tokens.
- **Cleanup (C12, C13):** fix the manifest; uninstall `next-pwa`, `react-modal`, `@types/react-modal` and `react-use`. ESLint stays (it now has a working flat config).
- **Wording (T6):** "Last talk {days} days ago" / "Letztes Gespräch vor {days} Tagen".
- **Footer (U5):** year from the current date.

## Open Questions

None.

## Testing Guidelines

This repo has no test framework (see CLAUDE.md), so there is no `./tests` folder to add to. Each step is checked with `npm run type-check`, `npm run build` and these manual checks in the running app:

- Keyboard only: tab through `/`, `/settings` and `/login`; open and close every menu and dialog; mark a contact as talked.
- Screen reader (NVDA or VoiceOver): trigger a server error and confirm it is announced.
- Switch the language to German: check day counts 0, 1 and 2, the greeting, the outgoing-request line and capitalisation.
- Double-click "mark as talked": the talk history shows one new entry.
- Add a contact with a name that already exists: the error shows and the name field keeps its value.
- Open a contact's history after marking it as talked: the new talk is listed.
- Lighthouse on `/` (accessibility and performance), before step 1 and after steps 1, 2 and 5. Record the scores in the PR.
