# Spec for site-footer

branch: feature/site-footer
figma_component (if used): none

## Summary

Add a global site footer to the app and use it as the home for secondary
navigation. The footer holds two links for now: a new **Privacy** page and the
existing **About** page. The About link is **moved** out of the header (`NavBar`)
into the footer — it must not appear in both places. The Privacy page is a new
route that, for this iteration, renders only a title (no privacy content yet).

The footer renders on every page, since it belongs in the shared `Layout` that
wraps all routes.

## Functional Requirements

- Add a `Footer` component rendered globally via `Components/ui/Layout.tsx`, so
  it appears on all pages (home, about, login, privacy).
- The footer contains two links:
  - **About** → `/about` (the existing page).
  - **Privacy** → `/privacy` (new page).
- Remove the **About** link from the header (`Components/NavBar.tsx`). After this
  change the header no longer links to `/about`; only the footer does.
- Add a new route `pages/privacy/index.tsx` that renders a page title only
  (e.g. an `H1` reading "Privacy"). No further privacy copy in this iteration.
- Footer links use the existing `Components/ui/Link.tsx` component for styling
  consistency with the rest of the app.
- Footer styling uses Tailwind CSS (the project's current styling system), not
  styled-components.
- The footer sits at the bottom of the page content, after `children`, within
  the `Layout` `main` element.

## Figma Design Reference (only if referenced)

- File: n/a
- Component name: n/a
- Key visual constraints: match existing color theme (`blue1`, `blue3`, etc.)
  and the look of existing `Link` navigation items. Keep it simple and readable.

## Possible Edge Cases

- The About link must be removed from the header and not duplicated — verify it
  renders in exactly one place.
- Active-link state: the footer `Link` should reflect the current route the same
  way the header links do (the `isLinkActive` prop pattern), so the current page
  is indicated.
- The footer must render for both logged-in and logged-out users (the About link
  in the header was ungated, so gating must not be introduced by the move).
- Footer must not overlap the sticky header or the `ScrollToTopButton`.
- The Privacy page must be reachable directly by URL (`/privacy`), not only via
  the footer link.

## Acceptance Criteria

- A footer is visible on every page.
- The footer shows working **About** and **Privacy** links.
- Clicking **About** navigates to the existing about page; clicking **Privacy**
  navigates to the new privacy page.
- The header (`NavBar`) no longer shows an About link.
- Visiting `/privacy` shows a page with only a title.
- `npm run type-check` passes and `npm run build` succeeds.

## Open Questions

- Should the footer also show static content such as a copyright line or the
  app name, or links only for now? (Assumed: links only.)
- Preferred footer link order — About then Privacy, or Privacy then About?
  (Assumed: About, then Privacy.)
- Exact title text for the Privacy page — "Privacy" vs "Privacy Policy"?
  (Assumed: "Privacy".)

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create
meaningful tests for the following cases, without going too heavy:

> Note: this repo currently has no test framework configured (see CLAUDE.md).
> If tests are in scope, the framework must be added first; otherwise verify via
> `npm run type-check`, `npm run build`, and running the app.

- Footer renders and contains both the About and Privacy links pointing at
  `/about` and `/privacy`.
- The header (`NavBar`) does not render an About link.
- The `/privacy` route renders its title.
- Active-link state resolves to the correct link for the current route.
