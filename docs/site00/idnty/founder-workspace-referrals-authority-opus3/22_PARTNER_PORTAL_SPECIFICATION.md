# 22 · Partner portal specification

Boards: R35 (mobile home + access states), R36 (my card), R37 (earnings + terms), R38 (desktop). Components RF-081…RF-085.

## 1. Position
A **separate, partner-facing surface** at `/partner`. It is not part of the founder workspace, does not share its navigation, and never exposes founder data. It exists only after FD-R11 (disclosure) and FD-R12 (access method) are decided. Until then partners receive statements from the founder directly.

## 2. Access states
| State | Meaning | Portal | Links / cards |
| --- | --- | --- | --- |
| INVITED | Invitation recorded, not yet sent or accepted | No access | None issued |
| ACTIVATION PENDING | Invitation accepted; identity, terms acceptance or payee documentation incomplete | TERMS + profile only | None issued |
| ACTIVE | Terms signed and founder-approved | Full | ACTIVE |
| SUSPENDED | Paused by founder | Read-only | Paused; prospects begin unattributed |
| REVOKED | Access removed | None (sessions ended) | Revoked |
| ARCHIVED | Relationship ended; records kept | None | Retired |

**Authentication (FD-R12 options):**
- Supabase magic link with a PARTNER role claim;
- invitation-code activation followed by magic link;
- founder-issued credential (the unlinked `PARTNER_ACCESS` type in `site00_access_credentials`).

Whichever is chosen:
- **a referral URL or QR never authenticates**;
- sessions are short-lived and revocable;
- every query is scoped by `partner_id` server-side and by RLS policies (today the tables have RLS with no policies).

## 3. Views
| View | Mobile (390) | Desktop (1440) |
| --- | --- | --- |
| HOME | WELCOME BACK · <partner> · PARTNER SINCE <month>; summary (REFERRALS · PAID CLIENTS · PENDING · PAID OUT); YOUR REFERRALS (masked, state chips); YOUR CARD; SUPPORT | Three columns: summary + referrals · card · support |
| MY CARD | Front + back; SHARE CARD · COPY REFERRAL LINK · DOWNLOAD DIGITAL CARD; *PRINTED CARDS ARE ORDERED BY SITE 00 AFTER QR VERIFICATION*; LINK (masked) + STATUS | Card stage \| share + link |
| EARNINGS | PENDING · APPROVED · PAID ALL TIME · NEXT PAYOUT (PLANNED, estimated); COMMISSIONS (masked client, date, state); PAYOUT HISTORY (method type only) | Two columns |
| TERMS | Current version + effective date; compensation *AS AGREED WITH SITE 00 (FD-R01–R03)*; what counts (FD-R04); refunds (FD-R06); payout timing (FD-R05) | Same |

Navigation:
- Mobile: four-tab bottom bar HOME · MY CARD · EARNINGS · TERMS, with brand `SITE 00 / PARTNER`.
- Desktop: top navigation.

## 4. Privacy masking (FD-R11)
- **Client labels:** initials + industry only (`TRANSPORTATION · F•••• & E••••`) until the founder decides otherwise and the client consents.
- **Never shown:** client emails, quote contents, payment details, other partners, founder notes, attribution evidence internals, or exception reasons.
- **Amounts:** shown only for the partner's own commissions once terms are active. Before that, the EARNINGS view is hidden.

## 5. Actions a partner can take
Share card · copy link · download digital card · contact SITE 00 (opens email to the founder) · view terms. Partners **cannot**:
- create links, change cards or order prints;
- edit terms or see other partners;
- request payment, or change attribution.

## 6. Security notes
- Rate-limit sign-in; lock out after repeated failures; notify the founder on new device sign-in (optional).
- Content Security Policy: no third-party scripts in the portal.
- Downloads are generated server-side with the partner's own validated link only.
