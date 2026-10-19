# 29 · Founder approval register

Policy decisions **FD-R01–R09, FD-R16, FD-R17** are **DECIDED** as of **2026-10-19** (Sprint `P0.SITE00.IDNTY.REFERRAL-COMMISSION-POLICY.FOUNDER-DECISION-LOCK1`). Other rows remain **OPEN** until the founder decides. Composer reads this file before every phase (doc 32 P0).

**Authoritative policy pack:** `docs/site00/idnty/referral-commission-policy-founder-lock1/`

## 1. Policy decisions FD-R01 … FD-R20
| ID | DECISION | OPTIONS | WHY IT MATTERS | UNTIL DECIDED | REPOSITORY TODAY | BLOCKS | STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FD-R01 | Compensation type | PERCENT of basis · FIXED fee per qualifying client · PARTNER-SPECIFIC structure | Shapes the commission engine inputs, terms editor (RO-05) and every calculation breakdown. | — | Commission rules null in invitationSystem; no live engine. | Phase 6 | **DECIDED — FIXED fee per qualifying client (no percentage commissions).** |
| FD-R02 | Commission basis | Collected revenue · gross · fixed DF line items | Determines qualifying purchase; must be integer minor units. | — | `base_price_minor` 50000 for DF base; add-ons separate. | Phase 6 | **DECIDED — $500 IDNTY Digital Foundation base package only; add-ons and pass-through excluded.** |
| FD-R03 | Rate or amount | Per-partner fixed fee (founder-set) | Turns eligibility into money; engine must enforce cap. | — | None live. **Rejected:** reference 15%, proposed $75, any amount > $50. | Phase 6 | **DECIDED — Standard $25 · Established $35 · Strategic up to $50 · AIO $50 · universal cap $50 (USD minor units).** |
| FD-R04 | Eligibility trigger | Verified payment · post-hold · delivery | CONVERTED vs ELIGIBLE. | — | `commissionStatusFromPaymentEvidence` unused; webhook gaps (doc 26). | Phase 6 | **DECIDED — Verified base-package payment + 14-day hold + founder approval; intake/quote/checkout alone insufficient.** |
| FD-R05 | Payout timing and minimum | Monthly · on approval · threshold | Payout workspace scheduling. | — | `payout_live:false`; record-only. | Phase 8 | **DECIDED — Monthly, target 15th; no minimum; manual external payment; founder approval required.** |
| FD-R06 | Refund, chargeback and clawback rule | Reverse · pro-rata · net · no clawback | ADJUSTED vs REVERSED. | — | Refund/dispute handling incomplete in webhooks. | Phase 6 | **DECIDED — Reverse unpaid on full pre-payout refund; post-paid auditable adjustment + founder review; no automated bank clawback.** |
| FD-R07 | Attribution window | Days for valid touch → artifact | Resolver window check. | — | Draft 90 days not enforced. **Rejected:** 30-day cookie from reference imagery. | Phase 4 | **DECIDED — 90 days; durable attachment at artifact creation.** |
| FD-R08 | Touch model with multiple partners | First · last · manual review | Collision handling. | — | Draft MANUAL_REVIEW not enforced. | Phase 4 | **DECIDED — Manual founder review; no auto-switch; one commission per qualifying purchase.** |
| FD-R09 | Existing client, self-referral and related parties | Disqualify · preserve · review | Fraud and fairness. | — | Draft rules not enforced. | Phase 4 | **DECIDED — No commission for existing-client repeat-only; self/duplicate disqualified; related-party → founder review.** |
| FD-R10 | Payee documentation, tax and caps | W-9 · 1099 · annual cap | US payee compliance. | Payout blocked without payee record (proposal). | No payee entities. | Phase 8 | **OPEN — requires detailed policy/legal review; do not mark fully approved from assumptions.** |
| FD-R11 | What partners may see about referred clients | Masked · consent · counts only | Partner portal privacy. | Portal not built. | No partner surface. | Phase 10 | **OPEN** |
| FD-R12 | Partner portal access method | Magic link · invitation · credential | Partner auth model. | Portal not built. | No PARTNER role wired. | Phase 10 | **OPEN** |
| FD-R13 | Card copy | Headline, CTA, back copy | Print immutability. | — | Specimens PROPOSED. | Phase 11 | **PARTIAL — Founder direction: front YOUR BUSINESS. BUILT TO LAST.; back START HERE.; benefits + QR; AIO name in red; foil direction selected. Print production still gated.** |
| FD-R14 | Card territory, stock and finish | Territory · stock · finish | Print cost and signature. | — | Territories CONCEPT. | Phase 11 | **PARTIAL — Reflective red metallic foil on selected red typography/accents; print/export not approved.** |
| FD-R15 | Digital share mechanism | Share sheet · copy · download · email | Partner self-serve share. | Copy/download only in specimens. | None. | Phase 9 | **OPEN** |
| FD-R16 | Payout execution | Record-only · provider later | RECORD vs SEND. | — | No payout provider. | Phase 8 | **DECIDED — Record-only workspace; SEND PAYMENT not authorized.** |
| FD-R17 | AIO agreement and activation | Sign · planned · retire ACTIVE fixture | First strategic partner. | — | Fixture ACTIVE + null agreement_version (conflict). | Phase 3 | **DECIDED — AIO planned at $50/strategic rate; activation requires executed terms + payee docs; do not auto-activate.** |
| FD-R18 | Correction and approval authority | Founder only · dual control | Audit and separation of duties. | Founder-only in specimens. | Admin allowlist. | Phase 7 | **OPEN** (unless separately decided) |
| FD-R19 | Suspended / terminated partner obligations | Honour · forfeit | Partner lifecycle. | No auto-forfeiture in specimens. | In-memory partner statuses. | Phase 3 | **OPEN** (unless separately decided) |
| FD-R20 | Destination index and placement | 06 REFERRALS · 05 · inside OPS | Navigation numbering. | Specimens use 06/07. | Six destinations today. | Phase 1 | **OPEN** |

## 2. Visual approvals
| Id | Item | Boards | Status |
| --- | --- | --- | --- |
| V-01 | REFERRALS as a seventh destination; sidebar / rail / menu placement | R01, R02, R04, R42 | OPEN (with FD-R20) |
| V-02 | Overview composition per tier | R01–R05 | OPEN |
| V-03 | Partner registry + detail (seven sections) | R06–R11 | OPEN |
| V-04 | Attribution ledger, trace, exceptions | R12–R15 | OPEN |
| V-05 | Commission ledger, detail, approval | R16–R20 | OPEN |
| V-06 | Payout workspace (record-only) | R21–R25 | OPEN |
| V-07 | Card Studio | R26–R28 | OPEN |
| V-08 | Card territory A / B / C | R29, R30 | OPEN (with FD-R14) |
| V-09 | Print proof + production spec | R33, R34 | OPEN |
| V-10 | Partner portal | R35–R38 | OPEN (with FD-R11, R12) |
| V-11 | Overlay system RO-01…RO-20 | R40 | OPEN |
| V-12 | Component registry RF-001+ | doc 06 | OPEN |

## 3. Explicitly not approved (still)
- **Live commission accrual, live payouts, or production financial writes.**
- **AIO as an active paying partner** without executed agreement and payee documentation.
- **Production QR print runs** before durable attribution URLs and print gating (FD-R17, FD-R14).
- **Percentage-based commissions** or the reference image **15%** / **30-day cookie** models.
- **Automatic partner tier upgrades** ($25 → $35 → $50) without founder-authorized terms amendment.
- **Any fee above $50** per qualifying client (universal cap).

## 4. Decision record format
`FD-Rxx · DECIDED · <date> · <decision text> · <initials>`. A changed decision creates a new line; old lines are never edited.

## 5. Decision history (append-only)
- FD-R01 · DECIDED · 2026-10-19 · FIXED dollar amount per qualifying client; no percentage commissions · FOUNDER POLICY LOCK1
- FD-R02 · DECIDED · 2026-10-19 · Qualifying purchase = $500 IDNTY Digital Foundation base package only; add-ons excluded · FOUNDER POLICY LOCK1
- FD-R03 · DECIDED · 2026-10-19 · Standard $25 / Established $35 / Strategic up to $50 / AIO $50; cap $50; minor units 2500/3500/5000; bands not auto-upgraded · FOUNDER POLICY LOCK1
- FD-R04 · DECIDED · 2026-10-19 · Verified base-package payment + 14-day hold + founder approval; visit/intake/quote not sufficient · FOUNDER POLICY LOCK1
- FD-R05 · DECIDED · 2026-10-19 · Monthly payout target 15th; no minimum; manual external payment; no auto-approve · FOUNDER POLICY LOCK1
- FD-R06 · DECIDED · 2026-10-19 · Pre-payout full refund reverses unpaid commission; post-paid adjustment + review; no automated bank clawback · FOUNDER POLICY LOCK1
- FD-R07 · DECIDED · 2026-10-19 · 90-day attribution window; durable attach at artifact creation · FOUNDER POLICY LOCK1
- FD-R08 · DECIDED · 2026-10-19 · Multi-partner collision → manual founder review; one commission per qualifying purchase · FOUNDER POLICY LOCK1
- FD-R09 · DECIDED · 2026-10-19 · Self-referral and duplicate disqualified; existing-client repeat not commissioned; related-party review · FOUNDER POLICY LOCK1
- FD-R16 · DECIDED · 2026-10-19 · Founder workspace record-only payouts; SEND PAYMENT not authorized · FOUNDER POLICY LOCK1
- FD-R17 · DECIDED · 2026-10-19 · AIO (All In One Enterprises Inc.) planned strategic partner at $50; activation requires executed terms; fixture conflict must surface · FOUNDER POLICY LOCK1
- FD-R13 · PARTIAL · 2026-10-19 · Card copy/finish direction locked for creative; print production not approved · FOUNDER POLICY LOCK1
- FD-R14 · PARTIAL · 2026-10-19 · Reflective red metallic foil direction; territories/stock not fully approved · FOUNDER POLICY LOCK1
