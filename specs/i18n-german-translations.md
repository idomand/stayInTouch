# Spec for i18n-german-translations

figma_component (if used): none

## Summary

Add internationalization (i18n) to the app and provide a full **German**
translation for every piece of user-facing text, alongside the existing English.
Today all copy is hardcoded English inside components and pages. This work
extracts that copy into translation resource files (one per language), routes it
through a translation lookup, and lets the app render in either English or German.

The app must ship with a way to select the language and must remember the choice
across sessions. English stays the default. No text should remain hardcoded in a
component after this change — everything the user can read goes through the
translation layer.

Scope is text only. This iteration does **not** cover localized date/number
formatting, currency, pluralization rules beyond what German plainly needs, or
right-to-left layout.

## Functional Requirements

- Introduce an i18n layer with two locales: `en` (default) and `de`.
- Store all UI strings in per-locale resource files (e.g. `en` and `de`
  dictionaries), grouped by area/namespace so they are easy to find and maintain.
- Replace every hardcoded English string in the app with a lookup from the
  translation layer. The known text-bearing surfaces to cover include, at minimum:
  - Pages: home (`pages/index.tsx`), about, privacy, login.
  - Navigation and chrome: `NavBar`, `Footer`.
  - Contact flows: `MainForm`, `AddNewContact`, `UpdateContactForm`,
    `ContactItem`, `ContactDetails`, `MoreOptionsDropdown`.
  - Notes: `Notes`, `NoteItem`.
  - Scheduling: `AppointmentForm`, `DatePickerComponent`.
  - Feedback and states: `ErrorWarning`, `Spinner`, `Dialog`, and any empty-state
    or loading text.
  - Any button labels, placeholders, aria-labels, titles, and toast/alert text.
- Provide a language switcher control the user can reach from the app chrome
  (e.g. in `NavBar` or `Footer`) that toggles between English and German.
- Persist the selected language so it survives reloads and app restarts (the app
  is an installable PWA), using client storage consistent with how the app
  already persists client state.
- The German translation must be complete: no English fallback text should be
  visible when German is selected, except deliberate proper nouns (e.g. the app
  name).
- The `<html lang>` attribute must reflect the active language.

## Figma Design Reference (only if referenced)

- File: n/a
- Component name: n/a
- Key visual constraints: the language switcher must fit the existing header/
  footer styling (Tailwind, theme color names such as `blue1`, `blue3`). German
  strings are often longer than English — layouts must not clip or overflow when
  the longer German copy is shown.

## Possible Edge Cases

- **Longer German text** overflowing buttons, nav items, or fixed-width elements —
  layouts must flex to accommodate it.
- **Missing translation key**: if a key is absent from a locale, behavior must be
  defined (recommended: fall back to English and make the gap detectable rather
  than render a raw key or blank).
- **Interpolated values** (names, dates, counts inside sentences) — German word
  order differs from English, so strings with embedded values must be translated
  as whole templates, not concatenated fragments.
- **Persisted language on first load**: before the stored preference is read, the
  app must not flash the wrong language or an untranslated key.
- **PWA caching**: a language change must take effect without needing to clear the
  service worker cache; verify switching works in the installed PWA, not only in
  the browser tab.
- **Pages Router data plumbing**: the app is client-only (Firebase direct). The
  chosen approach must not force server-side rendering or `getStaticProps` on
  pages that currently have none, unless that is explicitly accepted.
- **`react-datepicker` and third-party widgets**: any user-visible text they emit
  (month names, etc.) should follow the selected language, or the limitation is
  documented as out of scope.

## Acceptance Criteria

- The app can be viewed entirely in German and entirely in English.
- A language switcher is visible and changes the language on the spot.
- The chosen language persists across reload and PWA restart.
- English is the default for a first-time user.
- No user-facing English text remains when German is selected (proper nouns
  excepted).
- `<html lang>` matches the active language.
- `npm run type-check` passes and `npm run build` succeeds.

## Open Questions

- **Library vs. lightweight in-house layer.** The app is small, Pages Router, and
  fully client-side. Two viable paths:
  - `next-i18next` / `react-i18next` — the conventional Pages Router choice, but
    it typically wants `serverSideTranslations` in `getStaticProps`/`getServerSideProps`,
    which the pages don't currently use.
  - A minimal in-house translation context + `useTranslation` hook reading JSON
    dictionaries — no per-page data plumbing, fits the client-only model, less
    dependency weight.
  Recommendation: the **in-house context** unless URL-based locale routing
  (`/de/...`) is a requirement. (Assumed: in-house, no locale in the URL.)
- Should the language be reflected in the URL (`/de/about`) or kept as app state
  only? (Assumed: app state only, no locale routing.)
- Should first-time language be auto-detected from the browser (`navigator.language`)
  or always start English? (Assumed: always start English.)
- Where should the language switcher live — `NavBar` or `Footer`? (Assumed:
  `NavBar`.)
- Is localized date formatting in scope now, or a follow-up? (Assumed: follow-up;
  text only for this iteration.)

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create
meaningful tests for the following cases, without going too heavy:

> Note: this repo currently has no test framework configured (see CLAUDE.md).
> If tests are in scope, the framework must be added first; otherwise verify via
> `npm run type-check`, `npm run build`, and running the app in both languages.

- Every key present in the English dictionary also exists in the German
  dictionary (no missing translations), and vice versa (no orphan keys).
- The translation lookup returns the German string when `de` is active and the
  English string when `en` is active.
- A missing key falls back to English rather than rendering the raw key.
- Switching language updates rendered text and updates the persisted preference.
- On load, the persisted preference is applied and `<html lang>` matches it.
- An interpolated string renders values correctly in both languages.
