# 28 — Security and Privacy Review

The scope is the client experience designed here plus the existing client API surface it depends on. Findings marked **EXISTING** describe the current code (read-only audit). Findings marked **DESIGN** describe this authority.

## Risks

| ID | Finding | Kind | Severity | Mitigation (owner) |
|---|---|---|---|---|
| R-01 | `/foundation/:token` is a non-expiring bearer capability that grants read and write to the whole client record (contact email, phone, intake, quote, acceptance, ownership) | EXISTING | **High** | G-09 + G-12: exchange for a session on first use, remove the token from the address bar, add rotation and revocation, store it hashed. Never print, share, log or embed it (DESIGN rules below) |
| R-02 | CORS `Access-Control-Allow-Origin: *` on the artifact API | EXISTING | Medium | restrict to site00.com origins (G-12) |
| R-03 | No rate limiting on token lookups | EXISTING | Medium | per-IP limits; tokens are 192-bit, so guessing is impractical, but limits also protect `/foundation/return` |
| R-04 | ARCHIVED artifacts: UI closed, API still serves the payload; POST behaviour unverified | EXISTING | Medium | reject reads/writes for ARCHIVED except a closed stub (G-12) |
| R-05 | Home-screen icon / manifest could capture the token URL (iOS saves the current URL when no manifest exists) | DESIGN | High → mitigated | static manifest `start_url=/foundation/return?src=home`; token removed from the address bar after the session exchange |
| R-06 | Access card QR could become a master key | DESIGN | High → mitigated | card id only, hashed, revocable, grants nothing; email verification still required (`12`) |
| R-07 | Access card image metadata / share payload leaks | DESIGN | Medium → mitigated | metadata stripped; share image-only; fixed file names |
| R-08 | Account enumeration via reentry | DESIGN | Medium → mitigated | identical responses, masked email never shown on public pages |
| R-09 | Magic link phishing / forwarding | DESIGN | Medium | 15-min single-use links, code alternative, "IF YOU DIDN'T ASK FOR THIS, IGNORE IT" |
| R-10 | Shared device | DESIGN | Medium | sign out on this device; 30-day session; step-up for sensitive records; WRONG IDENTITY state |
| R-11 | Sensitive record exposure | DESIGN | Medium → mitigated | verified view (step-up), passwords never stored or shown |
| R-12 | Payment state spoofing via redirect | EXISTING (safe) | — | webhook-only confirmation retained; gates in `17` |
| R-13 | Raw card data | DESIGN | — | Stripe hosted checkout only; no card fields in the portal |
| R-14 | Push permission abuse | DESIGN | — | no permission prompt; push not offered |
| R-15 | Internal data leakage into the client portal | DESIGN | Medium → mitigated | CLIENT_SAFE projections and an event allow-list; INTERNAL_ONLY tasks / notes / commissions never projected (`X06`) |

## Access levels

| Level | Entry | Sees | Cannot see |
|---|---|---|---|
| Public entry | `/foundation/return`, card scan without session | SITE 00 identity, email form | any client data |
| Personalized access | `/foundation/:token` (today) | intake, proposal, status | sensitive record detail (after G-10) |
| Verified session | email link / code → httpOnly cookie | everything except sensitive detail | sensitive record detail |
| Sensitive record view | step-up (30 min idle) | domain / email / security record detail | passwords (never stored) |
| Recovery | email to the address on the lead | new session | — |
| Logout | menu | returns to public entry | — |

## Privacy

- **noindex** is kept on every `/foundation/*` page (exists). The manifest does not change indexing.
- The email address is masked in the UI (`M•••@…`) and shown only inside a session.
- The access card shows the business name and a reference only. The business name is client-chosen public information. The card never shows the person's name or email.
- Analytics may record `card_id_hash`, but never the token, entered emails or codes.
- Boards use a fictional client (Northline Transport LLC). No real client data and no "Anthony" demo data appear in any board or document.

## Verdict

Sound as a design. **Not shippable for access-card or home-screen reentry until G-09 and G-12 land.** Families F (home screen) and G (access card) depend on the session architecture, and shipping them on the bearer token alone would violate §15 of the sprint.
