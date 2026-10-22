# 03 · Existing referral infrastructure audit

Repository forensics performed on `claude/digital-foundation-authority-audit-8d42xk` (base `cursor/idnty-founder-readiness-e2e-be3b`). Every path below was opened during this sprint. **Nothing was changed.** The purpose is to stop the REFERRALS destination from inventing a parallel system, and to record what can be reused, what must be reconciled and what is missing.

## 1. Summary

| Area | Exists today | State | Verdict |
| --- | --- | --- | --- |
| DF referral source on leads/artifacts | Yes | Persisted (opt-in), fixed UUIDs after #1657 | **Reuse** as the coarse source label; not sufficient for partner-level attribution |
| Invitation System V1 (partners, campaigns, batches, codes, visits, activations, attributions, events, commission entries) | Yes | **In-memory only**; 9 tables migrated but unused | **Reconcile and adopt** — the REFERRALS data model builds on these tables (doc 25) |
| Attribution policy | Draft v1.0.0-draft, `PENDING_FOUNDER` | Not enforced | Becomes the founder decisions FD-R07…FD-R09 |
| Commission rules | v1.0.0-unapproved, all amounts `null`, `payout_live: false` | Not usable | Replaced by versioned partner terms (FD-R01…FD-R06) |
| Payouts | None | — | **New** (record-only) |
| Partner authentication | None (admin allowlist only) | — | **New** (FD-R12) |
| QR generation | Yes (`qrcode` 1.5.4, EC level H) | Working | **Reuse** |
| Public entry `/invite/:code` | Yes (`InvitationEntryPage`) | Working against in-memory store | **Reuse**; no new `/r/` route |
| Payment evidence for commissions | Partial | Webhook does not persist amounts or ids | **Gap** (doc 26 G-RF-08…10) |

## 2. Digital Foundation referral source (`shared/site00-digital-foundation`, `api/_lib/digitalFoundation`)

- `types.ts` — `ReferralSourceKind = AIO | SISTER_REA | DIRECT | CLIENT_REFERRAL | SITE00 | CUSTOM`; `ReferralFunnelStage` REFERRED … BUILD_BOOKED; `ReferralSource { referral_source_id, kind, label, active }`. Leads and artifacts both carry `referral_source_id` (denormalised).
- `referralSources.ts` — **fixed UUIDs** `1111…01` … `1111…06` for the six kinds. This is the **#1657 / a99d914d repair**: previously a `randomUUID()` per process was used and never inserted, so the FK from leads/artifacts failed silently. The fix (`ensureReferralSourcesPersisted` in `persistence/supabaseStore.ts`, `assertSupabaseOk`, `createArtifactForLeadDurable` in `service.ts`) seeds the fixed rows and fails loudly.
- Migration `20261008160000_site00_digital_foundation_artifact_v1.sql` creates `site00_df_referral_sources` (no UNIQUE / CHECK on `kind`); lead and artifact FKs `on delete set null`.
- `service.ts createLead` always sets funnel stage REFERRED; STARTED / BUILD_BOOKED are never set; there is no reassignment path.
- Checkout metadata carries `referral_source_id` (`service.ts`, `payment/stripeHostedCheckout.ts`).
- `clientProjection.ts` strips referral data from client-facing projections (`SAFE_REFERRAL_LABELS`). **Keep this invariant**: referral data never reaches the client view.
- Admin UI create path hard-codes `DIRECT`; the detail view shows the referral label read-only; no picker exists.

**Lesson carried forward (do not repeat):** identifiers that other rows reference must be **durable and persisted before use** — fixed or database-generated, never per-process random. Every new referral entity in doc 25 uses database-generated ids with FKs, and public codes are separate high-entropy values, never the primary key.

## 3. Invitation System V1 (`shared/site00-invitation-system`, `api/_lib/invitationSystem`)

### 3.1 Types (`types.ts`)
- `PartnerStatus = DRAFT | ACTIVE | PAUSED | TERMINATED`; `ReferralPartner { partner_id, partner_number, display_id, legal_name, status, agreement_version, reporting_scope: SELF_ONLY }`.
- `InvitationType = SHARED_OFFICE | PERSONALIZED`; `CampaignStatus = DRAFT | ACTIVE | PAUSED | REVOKED | RETIRED` with `attribution_policy_version`, `commission_rule_version`.
- `InvitationBatch.print_status = NOT_PRINTED | PROOF | PRINTED | DISTRIBUTED | RETIRED`.
- `InvitationCodeStatus = ACTIVE | PAUSED | REVOKED | EXPIRED`.
- `InvitationVisit` (anonymous_visit_key, traffic_class, dedupe_bucket); `InvitationActivation` (foundation_artifact_id, activation_secret_hash); `ClientAcquisitionAttribution` eligibility `CANDIDATE | DISQUALIFIED`.
- `ReferralBusinessEventType` — 16 values from INVITATION_SCANNED to COMMISSION_REVERSED; `ReferralBusinessEvent` with `idempotency_key`, `correlation_id`, `source_transaction_id`.
- `CommissionEntryStatus = CANDIDATE | PENDING | QUALIFIED | APPROVED | PAYABLE | PAID | REVERSED | DISQUALIFIED`.

### 3.2 Policy and rules
- `attributionPolicy.ts` v1.0.0-draft, **PENDING_FOUNDER**: capture on VERIFIED_ACTIVATION, window 90 days, repeat EXTEND_SESSION, existing client PRESERVE_PRIOR, multi-partner MANUAL_REVIEW, self-referral DISQUALIFY, `scan_is_not_attribution`, `unpaid_is_not_commission`. No first/last-touch rule. **Not enforced anywhere.**
- `commissionRules.ts` v1.0.0-unapproved: FOUNDATION FIXED_MINOR `null`; BLDR PERCENT basis points `null`; USD; `payout_live: false`.

### 3.3 AIO fixture (`campaigns/aioInvitation001.ts`)
- Partner `0000…0001`, number `001`, display `AIO`, legal name ALL IN ONE ENTERPRISES INC, **status `ACTIVE`, `agreement_version: null`**.
- Campaign INVITATION 001 OFFICE / AIO FRONT OFFICE (SHARED_OFFICE); batch `AIO-OFFICE-BATCH-001` (`print_status: NOT_PRINTED`); code `aio-office-inv001`.
- **Conflict:** an ACTIVE partner without an agreement. The founder workspace must not treat this fixture as truth. The partner page shows a red conflict banner (board R10) and AIO stays **PLANNED · NOT ACTIVE** until FD-R17. Note also that `aio-office-inv001` is a **guessable, human-readable code**; personalised codes use `newPersonalizedInvitationCode` (16 bytes base64url), which is the pattern to keep.

### 3.4 Service (`api/_lib/invitationSystem/service.ts`)
- `resolveInvitationCode`, `recordInvitationVisit` (daily dedupe bucket, UA classification), `beginSecureActivation` (email + hashed secret), `completeVerifiedActivation` (calls `createArtifactForLead` with **referral kind AIO hard-coded**, CANDIDATE attribution), `recordConversionEvent` (FOUNDATION_PURCHASED + payment id → candidate), `getPartnerReporting`.
- Activation uses the **non-durable** `createArtifactForLead` (fire-and-forget) — the same class of failure #1657 fixed for direct creation. Must move to `createArtifactForLeadDurable` before any real attribution (G-RF-03).
- Persistence: in-memory singleton (`memoryStore.ts`).

### 3.5 Commission ledger (`commissionLedger.ts`, `eligibility.ts`)
- Creates CANDIDATE / PENDING entries; `reverseCommission` adds an adjustment.
- **Bug, line 45:** `agreement_version: rules.version` — writes the *rules* version into the *agreement* field, so an entry would appear to have a signed agreement. Must be the partner’s terms version (G-RF-05).
- `eligibility.ts commissionStatusFromPaymentEvidence` is **never called**.

### 3.6 Routes and pages
- Public `api/site00/invitation.ts` (resolve, visit, begin-activation, complete-activation; CORS `*`).
- Admin `api/admin/site00-invitation.ts` (founder-review, partners, partner-report, qr-asset, record-conversion-event, test-set-activation-secret). Registered in `server/routes.ts`.
- `src/site00/pages/invitation/InvitationEntryPage.tsx` at `/invite/:code`. An `invitationAdmin` route constant exists without a page.
- Tests: `tests/invitationSystem.test.ts`, `tests/invitationActivationExperience.test.tsx`.

### 3.7 Database (`supabase/migrations/20261009180000_site00_invitation_system_v1.sql`)
Nine tables: `site00_referral_partners`, `site00_invitation_campaigns`, `site00_invitation_batches`, `site00_invitation_codes` (`code` UNIQUE), `site00_invitation_visits`, `site00_invitation_activations`, `site00_client_acquisition_attributions`, `site00_referral_business_events` (`idempotency_key` UNIQUE), `site00_partner_commission_entries`.
- **No code reads or writes these tables.**
- No CHECK constraints on any status column; no FK from attributions/commissions to DF artifacts; `payout_batch_id` has no FK and there is no payout table; no adjustments table; no terms table.
- RLS is enabled with **no policies** (service role only) — acceptable for founder-only access, insufficient for a partner portal.

## 4. Payments (`api/_lib/digitalFoundation/payment`, `api/site00/digital-foundation-stripe-webhook.ts`)
- Money in integer minor units; base `base_price_minor` 50000 (USD); credit 20000; quote expiry 14 days.
- Stripe hosted checkout puts metadata on the session (not on `payment_intent_data`).
- Webhook handles `checkout.session.completed`, `payment_intent.succeeded/failed`, `charge.refunded`, `checkout.session.expired`. **No dispute handling**; payment state DISPUTED is never set.
- **Not recorded:** amount captured, payment intent / charge ids, refund amount. Stripe event idempotency is an in-memory Set. `recordRefund` treats all refunds as full; refund matching is likely broken.
- No link from a payment to an invitation conversion.
- **Constraint:** payment webhooks are not changed in this sprint. Gaps are recorded for later phases.

## 5. Other relevant code
- `shared/site00-business-growth-intelligence/aioReferralBoundaries.ts` — SITE 00 vs AIO service boundary; rule *“Do not bundle AIO services into SITE 00 invoices without approved commercial arrangement.”* The REFERRALS design never bills AIO services through DF quotes.
- `shared/site00-invitation-system/qr.ts` — `renderInvitationQrSvg` / `renderInvitationQrPngDataUrl` (EC H, 512 px); `invitationPublicUrl` → `/invite/:code`; scripts `generate-invitation-qr.ts`, `invitation001/render-invitation001.ts`.
- `api/_lib/adminAuth.ts` / `src/utils/adminAuth.ts` — Supabase bearer + email allowlist, `requireAdminFounder`; **preview bypasses** (`TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW`, `isCloudMobilePreviewDev`). Financial actions must not be reachable through a bypass (doc 23).
- Supabase email/password exists for the client app without roles. `site00_access_credentials` has a `PARTNER_ACCESS` credential type that is not linked to anything.
- `profiles.referral_code` — legacy, unrelated to this programme. Do not reuse.
- `src/studioos/platform-economics` — `Money { currency, minor }`, `PlatformPayoutBatch` with `liveMovement: false`; Stripe Connect blocked. Useful patterns, separate product.
- Entry routes: `/foundation/:token`, `/invite/:code`, `/access/:code`. No self-serve DF start; no `?ref=` or UTM capture.

## 6. Two business-card systems
- **System A — SITE 00 studio business cards** (studio identity). Out of scope; not touched.
- **System B — IDNTY Digital Foundation referral cards** (this sprint). The existing INVITATION 001 / AIO-OFFICE-BATCH-001 artefacts belong to System B and are surfaced on the AIO partner CARDS section as existing assets.

## 7. Consequences for this authority
1. REFERRALS adopts the invitation-system vocabulary and tables; state names in the UI map to the repository enums (doc 16 §3, doc 12 §3).
2. No parallel `referrals_*` tables; doc 25 proposes additions *beside* the nine tables (terms versions, payouts, adjustments, exceptions, access) and constraints *on* them — **no SQL in this sprint**.
3. Public referral URLs stay `/invite/:code`.
4. Fix list before any live attribution: durable artifact creation in activation, agreement-version bug, payment evidence capture, dispute handling, AIO fixture status.
