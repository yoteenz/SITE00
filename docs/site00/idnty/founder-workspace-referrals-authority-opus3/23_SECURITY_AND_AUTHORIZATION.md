# 23 · Security and authorization

## 1. Actors and permissions
| Action | Founder (admin) | Second reviewer (FD-R18, optional) | Partner (portal) | Prospect / client | System (engine) |
| --- | --- | --- | --- | --- | --- |
| View REFERRALS workspace | ✓ | ✓ (read) | — | — | — |
| Create / edit partner | ✓ | — | — | — | — |
| Invite / revoke access | ✓ | — | — | — | — |
| Create / edit terms version | ✓ | approve (if required) | view own active | — | — |
| Issue / revoke link | ✓ | — | — | — | — |
| Validate QR / record device scan | ✓ | — | — | — | runs checks |
| Export print package | ✓ (gate) | — | — | — | — |
| Resolve code / begin | — | — | — | ✓ (public) | ✓ |
| Write attribution | — | — | — | — | ✓ (once) |
| Correct attribution | ✓ (reason) | approve (if required) | — | — | — |
| Transition commission (evidence) | — | — | — | — | ✓ |
| Approve / adjust commission | ✓ | approve above threshold | — | — | — |
| Record / reverse payment | ✓ | (recorder ≠ approver if required) | — | — | — |
| View own referrals / earnings | — | — | ✓ (masked) | — | — |

## 2. Server-side enforcement
1. Every `/api/admin/referrals/*` route calls `requireAdminFounder`. Preview bypasses (`TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW`, `isCloudMobilePreviewDev`) **must not** apply to mutating referral or financial routes.
2. Every `/api/partner/*` route resolves the partner from the session, never from a parameter. Queries are filtered by that partner id, and RLS policies enforce the same filter (doc 25 §5).
3. Client-side permission checks (RF-006) are cosmetic. Every mutation is re-checked on the server.
4. All writes are idempotent (doc 27 F-07).

## 3. Attribution integrity
- A partner id supplied by the client is ignored and logged as a tamper signal (E13).
- Codes are high-entropy and opaque (doc 21 L-02/L-03). Resolution and visit endpoints are rate-limited.
- The referral context cookie contains only an opaque, server-mapped id: httpOnly, Secure, SameSite=Lax, and no partner data.
- Attribution is write-once per artifact; corrections are logged with a reason.

## 4. Data protection
| Data | Where it may appear | Never |
| --- | --- | --- |
| Partner email / phone / notes | Founder workspace | Cards, public entry, other partners, client view, search results for non-founders |
| Terms (rate, basis, window) | Founder workspace; the partner's own TERMS view | Cards, public entry, client view |
| Banking / payee details | Encrypted payee store (outside the workspace UI) | Workspace tables, cards, notifications, logs, client records |
| Payment method | Type + last four | Full numbers anywhere |
| Client identity | Founder workspace | Partner portal (masked), public entry |
| Visit metadata | Coarse traffic class; dedupe bucket | Raw IP in attribution rows |
| Secrets (API keys, webhook secrets) | Environment only | UI, QR, logs, docs. Raw secret values are never displayed |

## 5. Public surfaces
- `/invite/:code` shows the partner display name only.
- The public invitation API currently responds with `CORS *`. Restrict it to SITE 00 origins (G-RF-14).
- No admin identifiers in public URLs, QR payloads or filenames.

## 6. Retention (proposed; confirm with counsel or the accountant)
| Data | Retention |
| --- | --- |
| Financial events and records | ≥ 7 years |
| Visit-level records | 13 months, then aggregated |
| Rate-limit counters | 24 hours |
| Revoked partner portal sessions | Removed immediately |

## 7. Threats considered
| Threat | Mitigation |
| --- | --- |
| Code guessing / enumeration | Entropy, rate limits, generic invalid page |
| Partner self-referral to farm commissions | FD-R09 disqualification; founder approval |
| Forged partner id in requests | Ignored; server resolution only |
| Replay of payment webhooks | Signature verification (existing) + persistent idempotency (gap: today an in-memory Set) |
| Insider error (double payment) | Idempotency key payout + reference; reconciliation |
| Printed cards with staging URLs | Gate V-4 + TEST band |
| Portal account takeover | Short sessions, magic-link expiry, revocation, sign-in alerts |
| Information leak via notifications or search | Founder-only scopes; no amounts of other partners |
