# 21 · QR validation and link contract

Boards: R31 (validation fail / pass / mobile + contract table), R10 (link + QR panel), R32 (public entry states). Components RF-036, RF-072, RF-076, RF-080.

## 1. Link contract
| Rule | Requirement |
| --- | --- |
| L-01 Route | `https://site00.com/invite/<code>` — the **existing** `/invite/:code` route (`InvitationEntryPage`). No new `/r/` route, no `?ref=` |
| L-02 Code | ≥ 96 bits of entropy, base64url; existing `newPersonalizedInvitationCode` (16 bytes) qualifies. Shared-office codes like `aio-office-inv001` are human-readable and **must be replaced** before print |
| L-03 Opacity | The code reveals nothing: no partner name, number, id, campaign or date |
| L-04 Resolution | Server-side only; the response carries the partner **display name** for “INTRODUCED BY”, never ids, terms, email or status reasons |
| L-05 Lifecycle | ACTIVE · PAUSED (partner suspended) · REVOKED · EXPIRED — each has a public page state; none error |
| L-06 Durability | Codes persist in `site00_invitation_codes` (unique) before any card is printed |
| L-07 Admin identifiers | Never appear in public URLs, QR payloads, filenames or the public entry page |
| L-08 Authentication | Possessing a referral URL is **never** partner authentication and never opens the portal |
| L-09 Rate limiting | Resolution and visit endpoints rate-limited per IP bucket; abuse logged without storing raw IPs in attribution rows |
| L-10 CORS | The existing public invitation API uses `CORS *`; restrict to SITE 00 origins before launch (G-RF-14) |

## 2. QR contract
| Rule | Requirement |
| --- | --- |
| Q-01 Payload | Exactly the L-01 URL; no secrets, tokens, emails, partner ids or tracking parameters |
| Q-02 Generation | `renderInvitationQrSvg` (EC H, vector) on the server after validation |
| Q-03 Placeholder | Before validation, a deterministic **non-scannable** pattern labelled NOT VALID FOR PRINT |
| Q-04 Print | Size, quiet zone and contrast per doc 20 §4 |

## 3. Validation checklist (RO-07)
| # | Check | Pass condition | Specimen |
| --- | --- | --- | --- |
| V-1 | URL IS HTTPS | Scheme https | PASS |
| V-2 | CODE RESOLVES TO <PARTNER> | Resolves, status ACTIVE, partner matches the card | PASS |
| V-3 | TARGET IS DIGITAL FOUNDATION ENTRY | Final landing is `/invite/:code` → DF activation | PASS |
| V-4 | PRODUCTION ORIGIN (NOT STAGING) | Host on the production allowlist | **FAIL · STAGING** (default) / PASS (`os=ok`) |
| V-5 | NO ADMIN PATH · NO SECRET IN PAYLOAD | Payload matches L-01 exactly | PASS |
| V-6 | SCANNED ON A REAL PHONE | A device scan recorded by the founder | NOT RECORDED |

Any failure keeps the card **NOT PRINTABLE**, with the banner *THE CODE POINTS AT STAGING. PRINT EXPORT STAYS BLOCKED UNTIL A PRODUCTION URL VALIDATES AND A DEVICE SCAN IS RECORDED.* Validation results are stored with time, actor, payload hash and environment. Revalidation is required after any code, domain or template change.

## 4. Public entry states (RF-080)
| State | Copy (headline) | Primary action | Attribution |
| --- | --- | --- | --- |
| VALID | INTRODUCED BY <PARTNER> · BEGIN YOUR DIGITAL FOUNDATION. | BEGIN → | Server context created |
| INVALID | THIS REFERRAL LINK IS NOT RECOGNISED · YOU CAN STILL BEGIN. (*no referral will be recorded*) | BEGIN WITHOUT A REFERRAL | None |
| REVOKED | THIS REFERRAL CARD IS NO LONGER ACTIVE · YOU CAN STILL BEGIN. | BEGIN WITHOUT A REFERRAL | None |
| PAUSED | (same as REVOKED, no partner reason shown) | BEGIN WITHOUT A REFERRAL | None |
| TEST | STAGING TEST LINK · TEST ENTRY · NOT FOR CLIENTS. (STAGING TEST · NOT FOR PRINT band) | CONTINUE (TEST) | Test environment only |

None of these states shows terms, rates, or partner status reasons.
