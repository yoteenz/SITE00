# 06 — Secure Reentry Contract

Retiring the card removes **none** of the security work. G-09 and G-12 remain blocking (`09`).

## Entry points → one canonical foundation

| Entry | URL | Resolution |
|---|---|---|
| Invitation / first email link | `/foundation/:token` | server exchanges the token for a session (httpOnly, Secure, SameSite=Lax), then `replaceState` to `/foundation/return`. The token leaves the address bar, history and any later home-screen save |
| Home-screen shortcut | `/foundation/return?src=home` | session valid → same `FoundationClient`, session-authorised payload, current state. Session missing or expired → **CONFIRM IT'S YOU** (email) |
| Later emails (after G-09) | `/foundation/return?src=email&e=<event>` | same as the home screen. The email itself is the recovery channel |
| Bookmark (desktop) | `/foundation/return` | same |

Every path lands on **the same artifact**: same intake, same quote versions, same project. Nobody repeats intake, creates a new project, scans a code or needs a card. `/foundation/return` never opens a generic SITE 00 homepage.

## Session contract

| Item | Rule |
|---|---|
| Cookie | `df_session`: httpOnly, Secure, SameSite=Lax, Path=/; opaque random id; server-side record `{artifact_id, created_at, last_seen_at, expires_at, step_up_until}` |
| Lifetime | 30 days rolling (OD-09), revocable from the founder workspace and by "SIGN OUT ON THIS DEVICE" |
| Reauthentication | on expiry, on sign-out, on token rotation, on a different-artifact conflict (WRONG IDENTITY) |
| Step-up | sensitive record detail requires an email confirmation within the session; 30 min idle |
| Email link | single use, 15 min |
| Email code | 6 digits, 10 min, 5 tries. Needed because iOS home-screen apps have their own cookie jar and links open in Safari |
| Rate limits | per IP and per email on challenge creation; per session on code entry |
| Enumeration | identical responses whether or not an email matches; masked email shown only inside a session |
| Token hardening (G-12) | store `public_token` hashed; rotate on demand (old links → **LINK REPLACED** state); expire unused invitation tokens (founder-configurable); CORS restricted to site00.com; ARCHIVED artifacts serve no payload |
| Manifest / shortcut | `start_url` never contains a token. Icons are static and identical for every client |
| Private records | never served without a valid session; sensitive ones only with step-up |

## Reentry states (12, unchanged except state 8)

| # | State | Headline |
|---|---|---|
| 1 | session | WELCOME BACK |
| 2 | expired | YOUR SESSION ENDED |
| 3 | verify | CONFIRM IT'S YOU |
| 4 | sent | CHECK YOUR EMAIL |
| 5 | linkexpired | THAT LINK EXPIRED |
| 6 | invalid | WE DON'T RECOGNIZE THAT LINK |
| 7 | notfound | NOTHING FOUND |
| 8 | revoked | **THIS LINK WAS REPLACED** (was: "this card was replaced") |
| 9 | wrongid | ANOTHER FOUNDATION IS OPEN |
| 10 | unavailable | BACK SHORTLY |
| 11 | retry | PLEASE WAIT |
| 12 | success | YOU'RE BACK IN |

Boards: M10–M12, AH14, D12, TP09, TL09.

## Launch interplay

The launch veil (`07`) shows while the session resolves. A failed restore cross-fades to state 2 or 3, never to an empty portal or the homepage.
