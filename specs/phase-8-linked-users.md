# Phase 8 — Linked Users

A standalone brief for Phase 8 of `specs/postgres-migration.md`. Read this file
alone to start work in a fresh session. It explains **why** each step exists, not
only what to do.

Branch: `feat/linked-users` (created from `main` on 2026-09-30).

---

## Current status — resume here

| Step | Status |
| --- | --- |
| 1. Schema + migration `0001` (dev) | ✅ applied on `dev` (production: in Step 5) |
| 2. Server identity email + request/link actions | ✅ `lib/actions/links.ts`; DB rules tested on `dev`; end-to-end test in Step 4 |
| 3. `markAsTalked` propagation + read queries | ⬜ |
| 4. UI: link action, `/account`, NavBar badge | ⬜ |
| 5. Production migration + docs | ⬜ |

---

## The feature in one paragraph

Bob has a contact "Alice". Alice is also a user. Bob sends her a **link request**
from that contact. Alice sees it on `/account` and accepts, choosing which of her
contacts is Bob (or creating one). From then on, when either of them clicks
"talked", the talk is recorded on **both** contacts, so both timers reset. A link
shares **only talk events**. Notes, cadence and names stay private to each side.

## Decisions (made 2026-09-30)

| Question | Answer |
| --- | --- |
| How is a link stored? | A `contact_links` table: one row per link, both contact ids as FKs `ON DELETE CASCADE`. Half-links are impossible. |
| Re-send after a reject? | Yes. Only one *pending* request per contact at a time; rejected rows stay as history. |
| What does the addressee see? | The requester's display name and email only. |
| Accept when the addressee has no contact for the requester? | A dialog: link to an existing (unlinked) contact, or create a new one prefilled with the requester's name and cadence 7. |
| Where does the UI live? | A new protected route `/account` with a "Friend requests" section only, plus a pending-count badge in `NavBar`. |

---

## Key ideas (read this first)

### 1. Requests target an email, not a user id

There is no users table: identity lives in Firebase. So Bob addresses a request
to an **email** (default: the contact's `friend_email`).

The first plan looked the email up with `adminAuth.getUserByEmail()` and stored
the addressee's uid. That leaks who uses the app. The send reply can be made
neutral, but Bob's "outgoing requests" list would still show the request only
when the email has an account. Anyone could type emails and watch the list.

**Decision: store the email, not a uid.** `link_requests.to_email` holds the
normalized (trimmed, lower-case) address. Every request is stored and listed the
same way, whether or not that email has an account. The addressee's incoming
list is `WHERE to_email = <my verified email>`. Side effect: a request to someone
who signs up later is waiting for them when they do.

This is safe because **every session belongs to a verified email**: the session
route refuses to mint a cookie otherwise (Phase 6). So "my email" from the
session is proof of owning that address.

Cost: if the addressee changes their email, a pending request to the old address
no longer reaches them. Acceptable; the sender can send again.

### 2. The server needs the caller's email

`getServerUser()` returns `{ uid }` today. The verified session cookie already
carries the `email` claim, so it will return `{ uid, email }`. That is a change to
a shared helper; its three callers (`app/page.tsx`, `queries/contacts.ts`,
`queries/guards.ts`) read only `uid`, so it is backward compatible. `requireUser()`
keeps returning the uid; a new `requireUserWithEmail()` returns both.

The requester's **display name** for the snapshot comes from
`adminAuth.getUser(uid).displayName` (fallback: the email), fetched once when
sending.

### 3. "A contact is in at most one link"

`contact_links` has `contact_a_id < contact_b_id` (one row per pair, no mirrored
duplicate) and `UNIQUE (contact_a_id, contact_b_id)`. A single contact appearing
in two links spans both columns, which a plain unique index cannot express.

**Decision: enforce it in the accept transaction.** Lock both contact rows with
`SELECT … FOR UPDATE`, check neither is in a link, then insert. Two concurrent
accepts on the same contact serialize on the lock, so the check cannot race.
`sendLinkRequest` also refuses a contact that is already linked, for a clear early
error.

**Also: one link per pair of users** (added 2026-09-30). Per-contact rules alone
would let Bob link two of his contacts ("Alice", "Alice (work)") to two of
Alice's. The link row holds contact ids, not user ids, so no constraint can
express it. The accept transaction checks it by joining `contact_links` to both
contacts' `owner_id`, under `pg_advisory_xact_lock` on the sorted uid pair so two
accepts for the same pair cannot race. `sendLinkRequest` refuses a second
pending request to the same email.

### 4. Propagation is one statement

`markAsTalked` inserts the talk on the clicked contact, then:

```sql
INSERT INTO talk_events (contact_id, created_by, talked_at)
SELECT CASE WHEN l.contact_a_id = $1 THEN l.contact_b_id ELSE l.contact_a_id END,
       $uid, $talkedAt
FROM contact_links l
WHERE l.contact_a_id = $1 OR l.contact_b_id = $1;
```

Zero rows when there is no link, one when there is, so no `if`. Both inserts run
in one transaction with the same `talked_at`. `created_by` = the clicker, which
is why that column exists. This writes a row on **another user's** contact; that
is allowed only through a link row, only in this server code.

Only the "talked" button propagates. A backdated date typed in the add/edit form
stays on your own contact (it corrects your record, it is not a shared event).

### 5. Security rules still hold

Every action takes ids from the client and proves ownership on the server:

- Send: `getOwnedContact(uid, contactId)`.
- Accept / reject: the request's `to_email` must equal the caller's session
  email, and the status must still be `pending`.
- Accept with an existing contact: `getOwnedContact(uid, chosenContactId)`.
- Unlink: the link must contain a contact owned by the caller.
- Reads on `/account`: incoming by the caller's email, outgoing by the caller's
  uid. Never show the other side's notes, cadence or history.

---

## Schema (migration `0001`)

```
link_requests  id uuid PK
               · from_user_id text              (requester uid)
               · from_contact_id uuid → contacts ON DELETE CASCADE
               · from_name text · from_email text  (snapshot shown to the addressee)
               · to_email text                  (normalized)
               · status link_request_status     ('pending' | 'accepted' | 'rejected')
               · created_at timestamptz · responded_at timestamptz NULL
               CHECK (to_email <> from_email)
               UNIQUE (from_contact_id) WHERE status = 'pending'
               INDEX (to_email) WHERE status = 'pending'

contact_links  id uuid PK
               · contact_a_id uuid → contacts ON DELETE CASCADE
               · contact_b_id uuid → contacts ON DELETE CASCADE
               · created_at timestamptz
               CHECK (contact_a_id < contact_b_id)
               UNIQUE (contact_a_id, contact_b_id)
               INDEX (contact_b_id)   -- lookups by either side; a_id is covered by the unique index
```

Deleting a contact removes its link and its requests (cascade). The other side's
contact stays; it is simply no longer linked.

**Crossed requests** (Bob → Alice and Alice → Bob both pending): when Alice sends,
if a pending request from Bob to her email already exists, the action tells her
to accept that one instead. That tells her nothing new; it is in her incoming
list anyway.

---

## Steps

Workflow: Claude makes the changes and runs the checks, then says the step is
ready and suggests a commit message. **The user makes all commits.** Every other
git action needs explicit confirmation. Schema workflow as in `CLAUDE.md`
("Changing the schema").

### Step 1 — Schema + migration `0001`

1. `lib/db/schema/linkRequests.ts` and `contactLinks.ts`, exported from
   `schema/index.ts`; inferred types.
2. `npm run db:generate` → read `0001_*.sql` against the schema above.
3. `npm run db:migrate` on `dev` (check the target host first). Additive only —
   no existing table changes.

Ready → `feat(db): add link_requests and contact_links tables`

### Step 2 — Identity email + request/link actions

1. `getServerUser()` → `{ uid, email }`; `requireUserWithEmail()` in `guards.ts`.
   Verify all three existing callers still type-check and behave.
2. `lib/actions/links.ts` (`"use server"`), reusing `isUuid`, `getOwnedContact`,
   the email check and the `ActionResult` shape from `lib/actions/contacts.ts`
   (move the shared bits to a small helper module if both files need them):
   - `sendLinkRequest(contactId, email)` — owned, not linked, no pending request
     on this contact, not your own email, crossed-request check. Neutral reply.
   - `acceptLinkRequest(requestId, target)` — `target` is `{ contactId }` or
     `{ newContact: { name, cadenceDays } }`. One transaction: re-check pending +
     addressee, optionally create the contact, lock both contacts, check neither
     is linked, insert the link, set `accepted` + `responded_at`.
   - `rejectLinkRequest(requestId)` — addressee only; `rejected`.
   - `cancelLinkRequest(requestId)` — sender only, pending only; delete the row.
   - `unlinkContact(contactId)` — owned contact; delete its link row.
   - Each calls `revalidatePath("/")` and `revalidatePath("/account")`.

Ready → `feat(links): add link request and unlink server actions`

### Step 3 — Propagation + reads

1. `markAsTalked` → transaction with the propagation insert (idea 4).
2. `getContactsForCurrentUser()` → add `isLinked` (boolean) and
   `hasPendingRequest`. `ContactTalkEvent` already carries `createdBy`, so the UI
   can show "logged by your friend" when it is not the caller.
3. `lib/db/queries/links.ts`: `getIncomingRequests()` (by session email),
   `getOutgoingRequests()` (by uid, with the contact name),
   `getPendingRequestCount()`, and the caller's unlinked contacts for the accept
   dialog.

Ready → `feat(links): propagate talks across links and read link state`

### Step 4 — UI

1. `MoreOptionsDropdown`: "Link with friend" (dialog, email prefilled from
   `friendEmail`) when not linked; "Unlink" (confirm dialog) when linked; show
   "request pending" state. A small linked marker on `ContactItem`.
2. `app/account/page.tsx` (Server Component, `getServerUser()` → redirect) with
   a "Friend requests" section: incoming (Accept → dialog: pick an unlinked
   contact or create one prefilled; Reject) and outgoing (Cancel).
3. `NavBar`: link to `/account` with the pending count. `NavBar` is a client
   component rendered on public pages too, so the count comes from a small
   server action called on mount and on route change — not from the root
   layout, which would make every page dynamic.
4. `proxy.ts`: add `/account` to the matcher.
5. Errors from these actions are shown in the UI (not only `console.error`).

Ready → `feat(links): add friend requests page and link actions to contacts`

### Step 5 — Production + docs

1. Migrate production (`CLAUDE.md` block) **before merging**. The change is
   additive, so the live code keeps working in between.
2. Test with two real accounts on production: send, accept (both paths), talk
   from each side, unlink, reject + re-send, delete a linked contact.
3. Update `specs/postgres-migration.md` (Phase 8 done) and `CLAUDE.md` (the new
   tables, the email-addressed requests, propagation). Delete this brief.

Ready → `docs: record linked users (Phase 8)`

---

## Verification

- After every step: `npm run type-check` and `npm run build`. Paste real output.
- Step 1: `0001` applies on `dev`; `drizzle.__drizzle_migrations` has 2 rows.
- Step 2–3, with two accounts on `dev` (e.g. a Google account and an
  email+password account):
  - request to an email with no account → same reply and same outgoing entry as
    to a real user;
  - accept with an existing contact, and with a new one;
  - talk from each side → both contacts reset; `created_by` shows who clicked;
  - a second link on an already-linked contact is refused;
  - reject, then re-send → works; two pending on one contact → refused;
  - delete a linked contact → the other side is unlinked, nothing breaks;
  - ids that are not UUIDs, or belong to someone else → clean `{ ok: false }`.
- Step 4: `/account` without a cookie → redirect to `/login`; public pages stay
  static in the build output.

## Open items

- Re-send spam: a sender can re-send after every reject. Acceptable now; a block
  or a cooldown is a later addition.
- A request to an email whose owner later changes address is lost (idea 1).
- Accepted/rejected request history is deleted with the sender's contact
  (cascade). Fine for now; switch to `SET NULL` if history ever matters.
