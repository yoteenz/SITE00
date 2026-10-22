# 29 · Founder approval register

All entries are **OPEN**. Nothing in this package is founder-approved. The founder records decisions here; Composer reads this file before every phase (doc 32 P0).

## 1. Policy decisions FD-R01 … FD-R20
| ID | DECISION | OPTIONS | WHY IT MATTERS | UNTIL DECIDED | REPOSITORY TODAY | BLOCKS | STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FD-R01 | Compensation type | PERCENT of basis · FIXED fee per qualifying client · PARTNER-SPECIFIC structure | Shapes the commission engine inputs, terms editor (RO-05) and every calculation breakdown. | Engine computes nothing; ledger shows TRACKED / NOT YET ELIGIBLE only. | Commission rules null in invitationSystem (commission_rules: null); no rate anywhere in repo. | Phase 6 | OPEN |
| FD-R02 | Commission basis | Collected SITE 00 service revenue net of pass-through costs (domain registration, third-party licences), taxes and processor fees · gross collected · a fixed list of DF line items | Determines what a refund or pass-through does to the commission; must be integer minor units. | Basis shown as NOT SET; no amount derived. | Payments store minor units (base_price_minor 50000) but the Stripe webhook does not persist amount or line items. | Phase 6 | OPEN |
| FD-R03 | Rate or amount | A number the founder sets per terms version (no default proposed) | The only value that turns an eligible basis into money. | Field empty; RO-05 cannot save without it. | None. The reference image's 15% is illustrative and NOT adopted. | Phase 6 | OPEN |
| FD-R04 | Eligibility trigger | Verified first payment · verified payment after refund window closes · DF delivered + paid | Separates CONVERTED from ELIGIBLE; drives NOT YET ELIGIBLE → ELIGIBLE. | Converted clients stay NOT YET ELIGIBLE. | commissionStatusFromPaymentEvidence exists but is unused; no payment→commission wiring. | Phase 6 | OPEN |
| FD-R05 | Payout timing and minimum | Monthly batch · on approval · threshold before payout (amount TBD) | Controls SCHEDULED dates and the payout workspace grouping. | Payouts are recorded ad hoc only; no schedule generated. | payout_live:false; no payout entities exist. | Phase 8 | OPEN |
| FD-R06 | Refund, chargeback and clawback rule | Reverse in full · reverse pro-rata · net against next payout · no clawback after N days | Defines ADJUSTED vs REVERSED and payout netting. | Refund evidence marks the commission DISPUTED for manual review. | Refund matching likely broken; no dispute (chargeback) handling in webhooks. | Phase 6 | OPEN |
| FD-R07 | Attribution window | Length of time a valid link/QR touch can attribute a later DF artifact (no default proposed) | Drives the window check in the attribution resolver and edge cases E03/E04. | Only same-session, server-held attribution is recorded; later returns are UNATTRIBUTED unless corrected (RO-19). | Draft policy says 90 days (PENDING_FOUNDER, not enforced). The reference image's 30-day cookie is NOT adopted. | Phase 4 | OPEN |
| FD-R08 | Touch model with multiple partners | First valid touch · last valid touch · manual review on collision | Edge cases E05/E06; whether a second partner can displace the first. | Collision creates an ATTRIBUTION EXCEPTION (RO-18) for manual review. | Draft policy: collision MANUAL_REVIEW; no first/last-touch rule. | Phase 4 | OPEN |
| FD-R09 | Existing client, self-referral and related parties | Existing client never attributes · preserve prior attribution · partner referring itself or its owners is disqualified · family/related-party rules | Prevents paying for clients SITE 00 already had and for self-dealing. | Existing-client and self-referral matches are DISQUALIFIED pending review. | Draft policy: existing client PRESERVE_PRIOR, self-referral DISQUALIFY (not enforced). | Phase 4 | OPEN |
| FD-R10 | Payee documentation, tax and caps | W-9 / 1099 collection before first payout · per-partner annual cap · none | US payouts to non-employees usually require payee tax documentation; caps limit exposure. | Payout recording is blocked for a partner without a documented payee record (proposal). | No payee or tax entities exist. | Phase 8 | OPEN |
| FD-R11 | What partners may see about referred clients | Masked initials + industry · business name after client consent · nothing beyond counts | Partner portal privacy; client confidentiality. | Portal specimens use masked labels (F•••• & E••••). | No partner-facing surface exists. | Phase 10 | OPEN |
| FD-R12 | Partner portal access method | Supabase magic link with a PARTNER role · invitation-code activation · founder-issued credential | Authentication model for the portal; QR possession is never authentication. | Portal not built; partners receive statements from the founder. | Supabase user login exists without a partner role; site00_access_credentials has an unlinked PARTNER_ACCESS type. | Phase 10 | OPEN |
| FD-R13 | Card copy | Headline, service line and back-side call to action wording | Printed copy cannot be corrected after a run. | Specimen copy is labelled PROPOSED. | INVITATION 001 artwork exists for the AIO office batch (System B). | Phase 11 | OPEN |
| FD-R14 | Card territory, stock and finish | Territory A / B / C · stock (e.g. 16 pt / 32 pt) · finish (matte, soft-touch, foil, edge paint) | Determines print cost, lead time and visual signature. | All three territories stay CONCEPT; print export blocked. | None beyond the INVITATION 001 batch record. | Phase 11 | OPEN |
| FD-R15 | Digital share mechanism | System share sheet (Web Share API) · copy link · download PNG · email from the partner's own client | What a partner can do from a phone without SITE 00 sending anything. | Copy link and download only in specimens; nothing is sent by SITE 00. | None. | Phase 9 | OPEN |
| FD-R16 | Payout execution | Record-only (founder pays outside SITE 00) · payout provider integration later | RECORD PAYMENT ≠ SEND PAYMENT; a provider would add credentials and compliance scope. | SEND is unavailable everywhere; RECORD PAYMENT creates an audit record only. | No payout provider; payout_live:false. | Phase 8 | OPEN |
| FD-R17 | AIO agreement and activation | Approve AIO terms and sign · keep AIO planned · retire the ACTIVE fixture | AIO is the first planned partner; the repository fixture marks it ACTIVE with agreement_version null. | AIO is shown PLANNED · NOT ACTIVE; fixture conflict surfaced on the partner page. | aioInvitation001.ts: status ACTIVE, agreement_version null, code aio-office-inv001, batch AIO-OFFICE-BATCH-001. | Phase 3 | OPEN |
| FD-R18 | Correction and approval authority | Founder only · founder + second reviewer above a threshold · who may record a payment vs approve it | Separation of duties and the audit trail for manual attribution changes. | Founder is the only actor; every correction requires a reason and creates an event. | Admin email allowlist only (adminAuth.ts); preview bypasses exist. | Phase 7 | OPEN |
| FD-R19 | Suspended / terminated partner obligations | Honour earned commissions · honour approved only · forfeit on termination for cause | What happens to TRACKED and ELIGIBLE rows when a partner is suspended or terminated. | Status change dialog explains the effect; no automatic forfeiture. | ReferralPartner statuses DRAFT / ACTIVE / PAUSED / TERMINATED (in memory). | Phase 3 | OPEN |
| FD-R20 | Destination index and placement | REFERRALS as 06 (SYSTEM 07) · as 05 per reference image · inside OPERATIONS | Navigation numbering appears in the sidebar, rail, menu drawer and page header. | Specimens use 06 REFERRALS · 07 SYSTEM; mobile bottom bar unchanged. | Founder workspace nav has six destinations; the reference shows 05 REFERRALS. | Phase 1 | OPEN |

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

## 3. Explicitly not approved by this sprint
- Any rate, fee, basis, window or trigger. The reference image's 15% and 30 days are rejected.
- AIO as an active partner.
- Any printing, any live payout, any partner message, any production migration.

## 4. Decision record format
`FD-Rxx · DECIDED · <date> · <decision text> · <initials>`. A changed decision creates a new line; old lines are never edited.
