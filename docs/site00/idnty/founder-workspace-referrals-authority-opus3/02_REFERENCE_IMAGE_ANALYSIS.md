# 02 · Reference image analysis

**Source:** the founder-supplied referrals dashboard composite (desktop + two phones + physical card mockup), attached to sprint `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.REFERRALS-AND-PARTNER-COMMERCE-AUTHORITY.OPUS3`. It was inspected at full resolution during this sprint. It is the **primary directional authority** for character and composition. It is **not** a source of data, rates or policy, and it is **not** cropped into production UI. No region of it appears in any board as a product asset.

## 1. What the reference contains

| Region | Content as drawn | Notes |
| --- | --- | --- |
| Desktop sidebar | SITE 00 / FOUNDER; OVERVIEW · FOUNDATIONS · REVIEWS · OPERATIONS · CORRESPONDENCE · **REFERRALS** (active, red) · SYSTEM; IDNTY DIGITAL FOUNDATION block at the bottom | Seven destinations. REFERRALS sits between CORRESPONDENCE and SYSTEM. |
| Desktop header | Index **05**, display headline **REFERRALS.**, subline PARTNERS · ATTRIBUTION · COMMISSIONS · GROWTH; red-glass pavilion image right | Index 05 conflicts with the existing numbering (CORRESPONDENCE is 05). See §4. |
| Metrics row | ACTIVE PARTNERS 12 (+2 this month) · REFERRED LEADS 28 · PENDING PAYOUTS $4,200 (3 payouts) · PAID OUT $12,650 (8 payouts), each with a red bar sparkline | All values are illustrative. Sparklines have no defined series. |
| PARTNERS panel | ALL IN ONE ENTERPRISES INC (strategic partner, ACTIVE, 28 referrals, selected), NOVA CREATIVE 16, SUMMIT WELLNESS 9, FIELD & EMBER 4 (INACTIVE); architectural thumbnails | AIO is shown ACTIVE with 28 referrals — not true. |
| COMMISSIONS / PAYOUTS | ATELIER BLOOM $1,800 PENDING · AIO $1,200 ELIGIBLE · NOVA CREATIVE $650 PAID | States are a useful vocabulary; amounts invented. |
| REFERRAL ACTIVITY | NEW REFERRAL · CLIENT CONVERTED · PAYOUT ISSUED · QUOTE SENT with relative times | Mix of referral and DF events. |
| PARTNER DETAILS | AIO, ACTIVE, 28 referred leads, 11 converted, $8,400 total commissions, $5,200 paid out; REFERRAL TERMS **15% COMMISSION RATE**, **30 DAYS COOKIE DURATION**; VIEW FULL DETAILS (red), MESSAGE PARTNER | The rate and window are explicitly rejected by the sprint. |
| CARD STUDIO | Card preview (SITE 00 PARTNER REFERRAL / ALL IN ONE ENTERPRISES INC + QR); CREATE CARD · COPY LINK · VIEW PAYOUTS | Card Studio as a first-class surface. |
| Phone 1 | Index 05 REFERRALS; PARTNERS · PAYOUTS · ACTIVITY; 2×2 metrics; RECENT ACTIVITY; bottom bar HOME · FOUNDATIONS · + · REVIEWS · SYSTEM | Bottom bar matches the locked OPUS1 bar. |
| Phone 2 | AIO partner page with image carousel (1/3), ACTIVE, STRATEGIC PARTNER; tabs OVERVIEW · CARD · PAYOUTS · ACTIVITY; card with QR; SHARE CARD · COPY LINK · DOWNLOAD | Partner-detail mobile composition. |
| Physical card | Tilted card on marble: SITE 00 / PARTNER REFFERAL / ALL IN ONE ENTERPRISES INC + QR | The word REFERRAL is misspelled on the card (“REFFERAL”). |

## 2. Characteristics preserved (authority)

1. **SITE 00 typography.** SITE 00 Display for headlines and numbers, Saira Semi Condensed for everything else; all application copy uppercase (verified per frame by the board renderer).
2. **White architectural environment**, black text, red as the single accent; red reserved for the active destination, items needing the founder, and the brand period.
3. **Index + display headline** page header with an approved environment photograph on the right (from the medium container width upward).
4. **Compact metric strip** (four to five cells) directly under the header.
5. **Partner registry** with architectural thumbnails, partner type, status mark and a large referral count on the right.
6. **Commissions / payouts list** with amount and a state chip on the right.
7. **Partner detail** with key numbers, terms block and two actions (primary + MESSAGE PARTNER).
8. **Referral activity** as a verb-led event list.
9. **Card Studio** with a live card preview and contextual actions (create · copy link · payouts).
10. **QR card previews** in the workspace and on the phone.
11. **Spatial desktop composition** (partners | money | detail) and **intentional mobile density** (2×2 metrics, list rows with large numbers).
12. **Locked mobile bottom bar** HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM.
13. **Phone partner page** with tabs and SHARE CARD / COPY LINK / DOWNLOAD.
14. **Physical card mockup** on a material surface.

## 3. Corrections applied (what the boards deliberately do differently)

| # | Reference | Correction | Why |
| --- | --- | --- | --- |
| C1 | 15% commission rate | No rate anywhere. Terms show `FD-R03 · NOT SET`; specimen amounts follow **EXAMPLE TERMS E-1 / E-2 · NOT A PROPOSED RATE** | Sprint: DO NOT ASSUME 15% COMMISSION. |
| C2 | 30-day cookie duration | No window. `FD-R07 · NOT SET`; attribution is server-held, not cookie-carried partner ids | Sprint: DO NOT ASSUME A 30-DAY ATTRIBUTION WINDOW; and partner ids must not be client-supplied evidence. Repository draft says 90 days (not enforced) — also not adopted. |
| C3 | AIO ACTIVE, 28 referrals, $8,400 commissions | AIO is **PLANNED · NOT ACTIVE**, 0 referrals, link NOT ISSUED, card DESIGN ONLY | No agreement, partner record or payment may be asserted. |
| C4 | Live-looking totals ($4,200, $12,650, 12 partners) | Small illustrative values computed from the specimen ledger, every page tagged *SPECIMEN · ILLUSTRATIVE VALUES · NO RATE PROPOSED* | No invented live financial data. |
| C5 | Sparklines | Removed; each metric shows its calculation text instead | No decorative charts; no series defined. |
| C6 | PENDING PAYOUTS / PAID OUT only | Ten-state commission lifecycle (TRACKED → … → PAID, ADJUSTED, REVERSED, DISPUTED) and RECORD PAYMENT ≠ SEND PAYMENT | REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID. |
| C7 | “PAYOUT ISSUED” event | “PAYOUT RECORDED” (paid outside SITE 00) | No payout provider exists (FD-R16). |
| C8 | Index 05 REFERRALS | **06 REFERRALS · 07 SYSTEM** in specimens; numbering left open as **FD-R20** | 05 is CORRESPONDENCE in the approved OPUS1 workspace. |
| C9 | GROWTH in subline | PARTNERS · ATTRIBUTION · COMMISSIONS · PAYOUTS | GROWTH has no defined data; analytics live in evidence-classed metrics. |
| C10 | Phone tabs OVERVIEW · CARD · PAYOUTS · ACTIVITY | Seven partner sections OVERVIEW · REFERRALS · COMMISSIONS · PAYOUTS · CARDS · TERMS · ACTIVITY (scrolling section row on phones) | Sprint requires all seven. |
| C11 | Card copy “PARTNER REFFERAL” | Card copy is SITE 00 · DIGITAL FOUNDATION + service line; back: SCAN TO BEGIN YOUR DIGITAL FOUNDATION · INTRODUCED BY <PARTNER> (all PROPOSED, FD-R13) | Fixes the misspelling; prospect-facing copy names the product, not the programme. |
| C12 | Real-looking QR | Deterministic non-scannable placeholder labelled **NOT VALID FOR PRINT** | No printer files with placeholder destinations. |
| C13 | Image carousel on phone partner page | Single architectural plate | No partner imagery exists; carousel would imply assets. |
| C14 | Fictional client names in money list | Retained as obviously fictional specimen names (NOVA CREATIVE, FIELD & EMBER, ATELIER BLOOM…) | Never “Anthony”; never real clients. |

## 4. Open questions raised by the reference

- **FD-R20** — destination index (05 as drawn vs 06 as specified here) and whether REFERRALS is a top-level destination or lives inside OPERATIONS.
- **FD-R14** — the mockup’s glossy, tilted, photo-bleed card is closest to **Territory A**; the founder chooses A / B / C.
- **FD-R11** — the reference shows client names in a partner-facing context (phone 2 activity). The partner portal masks them until decided.

## 5. Asset handling

The reference’s photographs (red-glass interiors, marble) are **not** extracted. Boards reuse only approved repository imagery:
`/site00-correspondence-studio/environment/cs-env-pavilion.webp`, `cs-env-doorway.webp`, `cs-env-red-glass-tall.webp`, and `/site00-correspondence-studio/fndatn-01/assets/01_invitation/hero-desktop.jpg`. Needs for print-resolution and partner-specific imagery are listed in doc 19 §6 and doc 33.
