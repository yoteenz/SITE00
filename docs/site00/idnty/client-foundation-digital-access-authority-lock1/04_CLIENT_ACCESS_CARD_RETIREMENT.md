# 04 — Client Access Card Retirement

**Decision L-05: retired from V1.** The founder determined the card does not add enough over the home screen and email.

## Removed from active scope

| Removed | Where it lived in OPUS1 | Now |
|---|---|---|
| DOWNLOAD / GENERATE ACCESS CARD CTA | CF-35, sidebar and drawer utility, come-back panel | removed from specimens, registry and handoff |
| PNG export, share image, PDF export | OPUS1 `11` outputs, AH07 | removed |
| Client access card QR | OPUS1 `12`, CF-34, AH09 | removed. No `?card=` parameter on `/foundation/return` |
| Card preview | CF-34, M09, D11 | removed |
| Card regeneration / card-specific revocation | OL-C06, AH10 | removed. **General** secure-link revocation stays (G-12) |
| Card issuance lifecycle, identifier service, tables (`df_access_cards`) | G-11, OPUS1 `29` §24 | **G-11 RETIRED**; table no longer proposed |
| Card print specs, wallet-like UI | OPUS1 `11`, AH08 | removed (OD-06 closed) |
| Card email attachments, card onboarding prompts | — | none will be created |
| Card toasts (saved / shared / save failed) | OL-C08–C10 | removed |
| Reentry state "THIS CARD WAS REPLACED" | OPUS1 `13` state 8 | becomes **"THIS LINK WAS REPLACED"** (general link revocation) |

## Kept (not card-specific, still mandatory)

Verified email reentry, httpOnly sessions, expiry, reauthentication, sensitive-record step-up, token rotation and revocation, token-free `start_url`, no unauthenticated access to private records (`06`).

## Historical record (not deleted)

| Archived item | Location | Label |
|---|---|---|
| Boards M09, D11, AH06, AH07, AH08, AH09, AH10 (PNG) | `../client-foundation-experience-living-portal-opus1/boards/archive/retired-access-card/` | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS |
| Card specimen source (`cf-access.js` @ 282168cbb) | same folder, `cf-access.RETIRED-SOURCE.txt` (a `.txt` file, so nothing can import it) | same |
| OPUS1 `11` and `12` full text | `../client-foundation-experience-living-portal-opus1/archive/` | same |
| Placeholder icon / splash board (old AH05) | `boards/archive/superseded-placeholder-icon/` | SUPERSEDED by approved icon and launch |

The archive is excluded from the active board manifest (it is listed under `retired`). The validator fails if any active specimen, board or handoff contains a card CTA, QR, card route or card component.

## Not affected

Product B (partner referral business cards, referral QR codes, referral card studio) and product C (SITE 00 business cards) are unchanged. Their QR and print requirements are theirs, and none of this retirement applies to them.
