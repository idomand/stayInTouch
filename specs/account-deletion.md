# Spec for account deletion

## Summary

A user can delete their account from `/settings`. This removes the Firebase
user and every Postgres row tied to them, then signs them out. Before this,
deleting only the Firebase user would have left the rows behind (`owner_id` is
bare text with no FK).

## Functional Requirements

- A "Delete account" section at the bottom of `/settings` with a red button.
- The button opens a confirm dialog (Cancel / Delete). No re-sign-in.
- Server Action `deleteAccount()` in `lib/actions/account.ts`, in this order:
  1. One transaction:
     - delete `link_requests` where `to_email` = the user's email (pending,
       accepted and rejected), so their email leaves the database;
     - delete `invite_emails_sent` where `from_user_id` = uid (no FK);
     - delete `contacts` where `owner_id` = uid. The FK cascade removes their
       `notes`, `talk_events`, `contact_links` (both sides) and the
       `link_requests` sent from those contacts.
  2. `adminAuth.deleteUser(uid)`.
  3. Delete the session cookie.
- **Database first, Firebase second.** If the Firebase call fails, the user can
  still sign in and try again; the database part then deletes nothing. The
  reverse order could leave rows that nobody can delete.
- The client then signs out the same way as logout and goes to `/login`.
- Kept on purpose:
  - `talk_events` the user created on a linked friend's contact
    (`created_by` = uid). They are the friend's history; the uid is an opaque
    id. The friend's contact stays and becomes unlinked.
  - `email_opt_outs`. An opt-out must outlive the account, or the address could
    get invite emails again.
- No schema change and no migration.
- Privacy policy (`privacy.control`, en + de) describes deletion and what is kept.

## Possible Edge Cases

- Firebase `deleteUser` fails after the transaction: show
  `errors.accountDeleteFailed`; the user can retry.
- The user is open in a second tab or device: `getServerUser()` uses
  `verifySessionCookie(…, true)`, which rejects a deleted user, so the next
  request redirects to `/login`.
- A linked friend marks a talk while the deletion runs: the friend's insert
  fails on the FK and shows an error. Acceptable.
- Signing in again with the same Google account creates a new, empty account.

## Acceptance Criteria

- After deletion there is no `contacts` row with the uid, no `link_requests`
  row with the email as `to_email` or `from_email`, and no `invite_emails_sent`
  row with the uid.
- The Firebase user no longer exists.
- A linked friend keeps their contact (now unlinked) and its talk history.
- The user lands on `/login`, signed out.

## Open Questions

- None. Decided: simple confirm (no re-sign-in), and delete all requests
  addressed to the user's email.

## Testing Guidelines

No test framework in this repo. Check with `npm run type-check`,
`npm run build`, and a manual run on the `dev` database with two test accounts.
