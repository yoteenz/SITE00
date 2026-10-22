# 26 · API and backend gap matrix

Classification (used here and in doc 33):
- **EXISTS** — usable as is.
- **EXTEND** — exists; needs additions.
- **FIX** — exists with a defect.
- **NEW** — must be built.
- **POLICY** — blocked on a founder decision.

## 1. Gaps

| Id | Area | Today | Needed | Class | Blocks | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| G-RF-01 | Persistence | Invitation system in-memory (`memoryStore.ts`) | Supabase-backed store for the nine tables | NEW | Everything durable | P3 |
| G-RF-02 | Partner CRUD API | `GET partners` (admin) only | Create draft, edit, status change, invite record, revoke | EXTEND | R06–R11 | P3 |
| G-RF-03 | Durable artifact on activation | `completeVerifiedActivation` uses non-durable `createArtifactForLead`; AIO kind hard-coded | `createArtifactForLeadDurable` + kind from partner | FIX | Attribution | P4 |
| G-RF-04 | Attribution resolver | Candidate written without window / touch / existing / self rules | RF-045 resolver, write-once, exceptions | NEW + POLICY (FD-R07–R09) | R12–R15 | P4 |
| G-RF-05 | Agreement version | `commissionLedger.ts:45` sets agreement_version = rules version | Terms version FK | FIX | Commissions | P6 |
| G-RF-06 | Eligibility wiring | `commissionStatusFromPaymentEvidence` unused | Engine transitions from evidence | FIX/NEW | R16–R20 | P6 |
| G-RF-07 | Terms versions | Rules file with null amounts | `partner_terms_versions` + API | NEW + POLICY (FD-R01–R06) | Terms, engine | P6 |
| G-RF-08 | Payment amount / ids | Webhook does not persist amount, PI/charge id | Persist evidence | NEW (payments) | Calculation | P6 (separate approval: payment webhooks are not changed in this sprint) |
| G-RF-09 | Refund amounts | All refunds treated as full; matching likely broken | Partial refunds, matching | FIX | ADJUSTED / REVERSED | P6 |
| G-RF-10 | Disputes | No dispute events; DISPUTED never set | Handle `charge.dispute.*` | NEW | DISPUTED | P6 |
| G-RF-11 | Approval / adjustment API | None | `POST approve / adjust` with idempotency | NEW | R20 | P7 |
| G-RF-12 | Payouts | None | Payouts, payment records, payees, reversal | NEW + POLICY (FD-R05, R10, R16) | R21–R25 | P8 |
| G-RF-13 | Search / notifications | Workspace search over clients only | Referral providers | EXTEND | RF-004/005 | P13 |
| G-RF-14 | Public API CORS | `CORS *` on `api/site00/invitation.ts` | Origin allowlist | FIX | Launch | P4 |
| G-RF-15 | Rate limiting | Dedupe bucket only | Per-IP-bucket limits on resolve / visit | NEW | Launch | P4 |
| G-RF-16 | QR validation | QR rendering exists; no validation record | Validator + device scan record | NEW | Print | P11 |
| G-RF-17 | Print package | `render-invitation001.ts` script for one campaign | Gated per-partner export, PDF/X | EXTEND | Print | P11 |
| G-RF-18 | Card templates | INVITATION 001 artwork only | Template + version + approval | NEW + POLICY (FD-R13, R14) | Studio | P9 |
| G-RF-19 | Partner auth | Admin allowlist; no partner role | Portal auth (FD-R12), RLS policies | NEW + POLICY | Portal | P10 |
| G-RF-20 | Partner reporting | `getPartnerReporting` contract (in-memory) | Masked projection API | EXTEND + POLICY (FD-R11) | Portal | P10 |
| G-RF-21 | Admin preview bypass | `TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW` | Exclude referral mutations | FIX | Security | P1 |
| G-RF-22 | AIO fixture | ACTIVE with null agreement | Set to DRAFT / PLANNED until FD-R17 | FIX + POLICY | AIO | P3 |
| G-RF-23 | Webhook idempotency | In-memory Set | Persistent processed-event store | FIX | Engine correctness | P6 |
| G-RF-24 | Admin UI referral source | Create hard-codes DIRECT | Picker / derived from attribution | EXTEND | FOUNDATIONS link | P5 |
| G-RF-25 | Analytics read models | None | Summary read model with evidence classes | NEW | Overview | P2 / P12 |

## 2. Endpoint inventory (proposed)

| Endpoint | Method | Class | Notes |
| --- | --- | --- | --- |
| `/api/site00/invitation` (resolve, visit, begin, complete) | GET/POST | EXISTS / FIX | CORS, rate limit, durable artifact |
| `/api/admin/site00-invitation` (founder-review, partners, partner-report, qr-asset, record-conversion-event) | GET/POST | EXISTS | Fold into `/api/admin/referrals/*` or keep and wrap |
| `/api/admin/referrals/summary` | GET | NEW | Metrics (doc 07 §1) |
| `/api/admin/referrals/partners[/:ref]` | GET/POST/PATCH | NEW | Draft only on create |
| `/api/admin/referrals/partners/:ref/terms` | GET/POST | NEW | Versioned |
| `/api/admin/referrals/partners/:ref/invite` · `/revoke-access` | POST | NEW | Send gated |
| `/api/admin/referrals/links` (issue / revoke) | POST | NEW | Code generation server-side |
| `/api/admin/referrals/attribution[/:ref/trace]` | GET | NEW | |
| `/api/admin/referrals/exceptions/:id/resolve` · `/attribution/:ref/correct` | POST | NEW | Reason required |
| `/api/admin/referrals/commissions[/:ref/approve|adjust]` | GET/POST | NEW | Idempotent |
| `/api/admin/referrals/payouts[/:ref/record-payment|reverse]` | GET/POST | NEW | Record-only |
| `/api/admin/referrals/cards`, `/qr/validate`, `/qr/device-scan`, `/proofs`, `/print-package` | GET/POST | NEW | Gate enforced server-side |
| `/api/admin/referrals/events` | GET | NEW | CSV export logged |
| `/api/partner/summary | card | earnings | terms` | GET | NEW | Session-scoped |

## 3. Can be built before policy approval
- G-RF-01, 02, 03, 13, 14, 15, 16, 21, 23, 24, 25.
- The UI for every page, showing empty and policy states.

## 4. Needs founder approval first
G-RF-04 (rules), 07, 12, 18, 19, 20, 22, and any production activation.
