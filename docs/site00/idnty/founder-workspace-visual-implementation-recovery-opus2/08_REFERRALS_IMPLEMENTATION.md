# 08 · Referrals (OPUS3 R01–R42)

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


Styles: `styles/ifw-referrals.css` = OPUS3 `rf.css` with every selector scoped under `.ws` (portal / public-entry sections
not ported — separate products) + the founder card. Primitives: `referrals/rfKit.tsx`.

| Surface | Implementation | Status |
| --- | --- | --- |
| R01–R05 Overview | `rf-head` with environment image, section nav (tabs / phone section menu), signals, partners preview, policy panel, activity, card | COMPLETE |
| R06–R08 Partners | `prt` registry: AIO (planned, never active) + real attribution sources; inspector docked ≥ 1100 | COMPLETE · partner records BACKEND BLOCKED |
| R09–R11 Partner detail | `pd-head`, OVERVIEW (activation checklist) / REFERRALS / COMMISSIONS / PAYOUTS / CARDS / TERMS / ACTIVITY | COMPLETE · ledgers BACKEND BLOCKED |
| R12–R15 Attribution | `ldg` ledger of attributed artifacts + source trace with evidence classes | COMPLETE |
| R16–R20 Commissions | signals “—”, empty ledger, fixed-fee policy panel, RO-05/11/12/13 | POLICY + BACKEND BLOCKED |
| R21–R25 Payouts | no-provider banner, empty ledger, payout target 15th, RO-14…17 | POLICY + BACKEND BLOCKED |
| R26–R34 Card Studio | founder card FRONT / BACK, finish, print gate (6 open), share / export / proof / QR check | COMPLETE · print POLICY BLOCKED |
| R39 Activity | timeline from registry attribution (`referralActivityFromRegistry`), event detail; events API gap stated | COMPLETE |

Truthfulness:

- Real data: `list()` artifacts (`referral_source_id`) and `referral_sources`. Signals with no backing ledger render “—”
  and say why; active partners = 0 (no partner record exists); paid referred clients count `payment_state = PAID` and say
  “EVIDENCE NOT LINKED”.
- No fabricated revenue, payments, commissions or active partners; no `$` amounts besides the founder-locked fee policy.
- The fake `/invite/aio-demo` path from the previous page is removed; no production QR without a verified URL — the QR is a
  deterministic non-scannable placeholder marked NOT VALID FOR PRINT.
- AIO: `AIO_PARTNER_DISPLAY.autoActive = false`, shown PLANNED · NOT ACTIVE everywhere.

Founder card (not an OPUS territory concept): front “YOUR BUSINESS. / BUILT TO LAST.”; back “START HERE.”, four
benefits (DOMAIN · PROFESSIONAL EMAIL · EMAIL SECURITY · OWNERSHIP RECORDS), partner QR placeholder, INTRODUCED BY +
ALL IN ONE ENTERPRISES INC. in red. Red type and accents carry a reflective red metallic foil simulation (gradient sheen),
labelled as screen simulation, not proof.

Evidence: `evidence/matrix/referrals-14-viewports.jpg`, `evidence/matrix/cardstudio-14-viewports.jpg`, `evidence/compare/referrals-*.jpg`,
`evidence/compare/cardstudio-*.jpg`.
