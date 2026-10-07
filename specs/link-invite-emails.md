# Spec for link invite emails

## Context
Today `sendLinkRequest` (`lib/actions/links.ts`) stores a `link_requests` row
addressed to an email. The friend sees it only if they already use the app and
happen to open `/settings`. Goal: a friend without an account gets an email
inviting them to join Stay in Touch, and ends up linked.

## Key finding
The data model already supports non-users. A request is keyed by `to_email`
and never resolved to a uid. If the friend signs up later with that email and
verifies it, the pending request is already in their incoming list. **The only
missing piece is an email notification.** No schema change is needed for the core.

## Recommended design: always send the email; do not branch on "has account"
The proposed "if they have an account → in-app request, else → invite email"
needs a uid lookup by email. That reveals who uses the app (account
enumeration), which the current design deliberately prevents
(`linkRequests.ts` doc comment). Also, existing users get no notification
today either, so they benefit from the email too.

So: every link request sends one email, with the same wording for everyone:
"{name} wants to stay in touch with you on Stay in Touch. Sign in or create an
account with this email to accept." The sender's UI looks the same in both cases.

## Steps (high level)
1. **Email provider**: Resend (listed as "only worth revisiting for branded
   emails" in `specs/architecture.md`). Set up SPF/DKIM/DMARC on
   `stay-in-touch.vip`. New env var `RESEND_API_KEY`, checked at module load
   like `DATABASE_URL`. Update the architecture decision table.
2. **`lib/email/`** (server-only): a small `sendLinkInviteEmail()` helper.
   Plain English template, HTML-escape `fromName`, no sender free text.
3. **`sendLinkRequest`**: after the insert succeeds, send the email best-effort.
   A failed send logs `console.error` and does not fail the request (the row is
   the real invite; the email is a notification).
4. **Limit: 3 invite emails per user per rolling 24 h.**
   - Enforced on the server in `sendLinkRequest`, before the insert. Over the
     limit → `actionError({ key: "inviteLimitReached" })`, no row, no email.
   - Count from a small `invite_emails_sent` table (`from_user_id`,
     `created_at`, no FK), not from `link_requests`. Reason: `link_requests`
     rows cascade-delete with the contact, so "add contact → send → delete
     contact" would reset the count.
   - Race: two parallel sends could both pass the count. Do count + insert in
     one transaction with a per-user advisory lock (same pattern as
     `acceptLinkRequest`).
   - Existing checks still apply (no repeat to the same email, one pending per
     contact).
5. **Limit warning popup** in the link-request UI:
   - Before sending, a confirm popup: "Your friend will get an email. You can
     send 3 invites per day. {remaining} left today." Buttons: Send / Cancel.
   - Needs a read `getInvitesRemainingToday()` in `lib/db/queries/links.ts`
     so the popup shows the right number. At 0, the popup explains the limit
     and disables Send.
   - The popup is only UX; the server check is the real limit.
   - Reuse the existing modal/dialog component used by the link flow (check
     `Components/` before building a new one). Text in `en.json` + `de.json`.
6. **Landing flow**: email link → `/login?email=…` (prefill) with a note that
   they must use this exact email. After verify + sign-in, show the pending
   request (badge exists via `getPendingRequestCount`).
7. **Opt-out**: a "don't email me again" link (needs a small
   `email_opt_outs` table + migration). Required in practice for GDPR/
   German users and for deliverability. Also sent as a `List-Unsubscribe`
   header (see "Avoiding spam").
8. **Privacy policy update** (`app/privacy/page.tsx`, text in the `privacy`
   section of `i18n/en.json` + `de.json`). Changes needed:
   - `providers`: add Resend as a service provider (it processes the
     recipient's email and the sender's name).
   - `linking`: say that sending a link request emails the person, and that
     the sender's name and email appear in that email.
   - New paragraph for people who **don't** use the app: their email is stored
     only because a user entered it; they get at most a notice per request;
     they can opt out with one click, and we keep their email on an opt-out
     list only to honour that.
   - `data`: mention the opt-out list and the invite-count log.
   - Keep the "never marketing or spam" promise true: no reminder or
     follow-up emails beyond the one notice per request.
9. Docs: `specs/architecture.md` decision table (email row, Resend moves out
   of "abandoned directions").

## Avoiding spam (deliverability)
- **DNS auth on the domain** — SPF, DKIM (Resend gives the records), DMARC
  (start at `p=none` with a report address, move to `p=quarantine` once
  reports are clean). Gmail and Yahoo reject or spam-folder mail without these.
- **Send from a subdomain**, e.g. `invites@mail.stay-in-touch.vip`. Bad
  reputation then can't hurt the root domain.
- **One-click unsubscribe**: `List-Unsubscribe` + `List-Unsubscribe-Post`
  headers (RFC 8058). Gmail shows its own button, so people unsubscribe
  instead of pressing "Report spam".
- **Recognisable sender**: subject names the person ("Ido wants to stay in
  touch with you"); `Reply-To` = sender's email (the recipient already sees it).
- **Clean content**: short text, plain-text + HTML parts, one link to your own
  domain, no link shorteners, no images-only, no "free/offer" words.
- **Low, steady volume**: the 3/day limit keeps complaints low. Resend
  automatically stops sending to addresses that bounced or complained.
- **Watch it**: Resend dashboard (bounces, complaints) and Google Postmaster
  Tools for the domain. Before launch, test with mail-tester.com.

## Pros
- Small change: reuses the existing request/accept flow and invariants.
- Growth: every link request can bring in a new user.
- Fixes the current gap that existing users are never notified.
- Keeps the no-enumeration privacy property.

## Cons / risks
- First outbound email provider: cost, DNS setup, deliverability, a new secret.
- Spam/abuse vector; needs rate limits and opt-out.
- Email-binding friction: if the friend signs up with a different Google
  account/email, they never see the request. (A token-in-link alternative fixes
  this but makes "whoever has the link" the addressee — weaker security.
  Not recommended for v1.)
- `firebase-admin` is already in the request path; adding an external HTTP call
  makes the action slower. Acceptable; could move to `after()` from `next/server`.

## Decisions (confirmed by user)
- Always send the same email; no branching on account existence.
- Provider: Resend.
- Email language: English only (no i18n for the email template; in-app
  strings still go in `en.json` + `de.json`).
- Limit: 3 invite emails per user per day, explained in a confirm popup.
- Privacy policy is updated in the same change.

## Progress (branch `feat/link-invite-emails`)

### Done
| Commit | What |
|---|---|
| `409cd7d` | Tables `invite_emails_sent` and `email_opt_outs` (`lib/db/schema/inviteEmails.ts`, migration `0002_dazzling_glorian.sql`). **Applied to `dev` only.** |
| `61c743d` | `lib/email/`: `client.ts` (Resend client, env checks at load), `unsubscribeToken.ts` (HMAC sign/verify), `sendLinkInviteEmail.ts` (text + HTML, escaped, Reply-To, `List-Unsubscribe` headers, skips opted-out addresses). Dependency `resend`. |
| `7509698` | `sendLinkRequest`: per-user advisory lock + 24 h count + insert request and log row in one transaction; email sent with `after()`, failures only logged. `INVITE_LIMIT_PER_DAY` and `invitesInLastDay()` in `lib/db/queries/links.ts`; `getInvitesRemainingToday()` + action wrapper `getMyInvitesRemainingToday()`. Error key `errors.inviteLimitReached`. |
| `2fd8991` | `LinkContactDialog`: two steps (email → confirm with remaining count; Send disabled at 0). |
| `215ec37` | Landing: `/login?email=` prefills `EmailAuthForm` (`initialEmail` prop) and shows a note to use that exact email. The page is wrapped in `<Suspense>` for `useSearchParams`. |
| `8c257db` | Opt-out: `addEmailOptOut()` in `lib/email/optOut.ts` (token check + insert, shared). Server Action `optOutEmail` (`lib/actions/email.ts`) behind a confirm button on public `/unsubscribe`; one-click `POST /api/email/unsubscribe` (RFC 8058, GET → 405). Also `LinkContactDialog` made one step (see below). |
| `3137959` | NavBar badge follows accept/reject: `PendingRequestCountContext`, fed by `PendingRequestCountSync` on `/settings` after each revalidation. |

### Changes from the plan above
- **Sender domain:** `invites@send.stay-in-touch.vip`. That subdomain was already verified in Resend, so no new DNS records were needed. The root DMARC (`p=none`) covers it.
- **Two more env vars:** `EMAIL_UNSUBSCRIBE_SECRET` (signs opt-out links) and `APP_URL` (base for email links: `http://localhost:3000` locally). Both, plus `RESEND_API_KEY` (send-only key), are in `.env.local`. **They are not in Vercel yet.**
- **An opted-out address still uses one daily invite.** The behaviour is the same for every address, so the sender learns nothing.
- **No separate confirm step.** `LinkContactDialog` is one step: the email notice and the remaining count show under the email input, and "Send invite" sends at once. The count loads when the dialog opens. At 0, a red text (not the `ErrorWarning` popup) explains the limit and Send is disabled.
- **The opt-out page uses a confirm button.** A GET only shows the page, because link scanners open links. The one-click route accepts POST only.

### Left to do
- **Before merge (manual):** add the three env vars in Vercel (Production + Preview, `APP_URL=https://stay-in-touch.vip`). Migrate production (CLAUDE.md step 5). Run a mail-tester.com check.

## Verification
`npm run type-check`, `npm run build`; on `dev`: send a request to an address
with no account → email arrives → sign up with that email → request visible →
accept → talk marked on one side appears on both. Repeat for an existing user.
Check: 4th send in 24 h is refused and the popup shows 0 left; deleting a
contact does not reset the count; opt-out stops further emails; mail-tester
score before launch.
