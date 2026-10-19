# 25 · Data model proposal (reconciled; no SQL)

**No migration is written in this sprint and no SQL appears here.** This proposal reconciles the REFERRALS authority against the **actual schema**:
- `supabase/migrations/20261009180000_site00_invitation_system_v1.sql` (nine tables, unused by code);
- `20261008160000_site00_digital_foundation_artifact_v1.sql` (DF artifacts, leads, `site00_df_referral_sources`).

The rule: **adopt and constrain the existing tables; add only what is missing; create no parallel `referrals_*` system.**

## 1. Existing tables → decision

| Existing table | Key columns (actual) | Decision | Changes proposed (later migration) |
| --- | --- | --- | --- |
| `site00_referral_partners` | `partner_id uuid pk default gen_random_uuid()`, `partner_number text unique`, `display_id`, `legal_name`, `status default 'DRAFT'`, `agreement_version`, `reporting_scope` | **Adopt** as the partner table | CHECK on `status` (DRAFT, ACTIVE, PAUSED, TERMINATED); add `display_name`, `partner_type`, `contact_email` (founder-only), `owner`, `active_terms_version_id` FK; invariant `status='ACTIVE' ⇒ active_terms_version_id not null`; deprecate free-text `agreement_version` in favour of the FK |
| `site00_invitation_campaigns` | `partner_id` FK, `invitation_type`, `status`, `attribution_policy_version`, `commission_rule_version` | **Adopt** | CHECK on `status`, `invitation_type`; versions become FKs to policy/terms version tables once they exist |
| `site00_invitation_batches` | `campaign_id` FK, `card_edition`, `print_status default 'NOT_PRINTED'` | **Adopt** as card batches | CHECK on `print_status`; add `template_id`, `template_version`, `proof_id` |
| `site00_invitation_codes` | `code text unique`, `status default 'ACTIVE'`, `expires_at`, `revoked_at` | **Adopt** as referral links | CHECK on `status`; minimum code length/entropy enforced in the service; add `environment` (production / staging / test) |
| `site00_invitation_visits` | FKs to code/campaign/partner, `anonymous_visit_key`, `traffic_class`, `dedupe_bucket` | **Adopt** | Retention job; no raw IP column (none today — keep it so) |
| `site00_invitation_activations` | FKs, `status`, `foundation_artifact_id uuid` (no FK), `activation_secret_hash`, `policy_version` | **Adopt** | FK `foundation_artifact_id` → DF artifacts table; CHECK on `status` |
| `site00_client_acquisition_attributions` | FKs to partner/campaign/code/activation, `foundation_artifact_id` (no FK), `policy_version`, `eligibility`, `disqualification_reason` | **Adopt** as the attribution record | FK to DF artifact; **UNIQUE (`foundation_artifact_id`)** = one attribution per artifact; CHECK `eligibility` (CANDIDATE, DISQUALIFIED, + EXCEPTION); add `terms_version_id`, `evidence_class`, `captured_by` (system/founder) |
| `site00_referral_business_events` | `idempotency_key unique`, `correlation_id`, `payload jsonb`, nullable FKs | **Adopt** as the audit log | Revoke UPDATE/DELETE; add `actor_type`, `actor_id`; extend event types (doc 24) |
| `site00_partner_commission_entries` | `agreement_version text not null`, `commission_rule_version`, `rate_basis_points`, `fixed_reward_minor`, `eligible_amount_minor`, `calculated_reward_minor`, `status`, `payout_batch_id` (no FK), `attribution_id` FK | **Adopt** as the commission ledger | CHECK on `status` (sprint states mapped, doc 16 §2); replace `agreement_version` text with `terms_version_id` FK (fixes the `commissionLedger.ts:45` confusion); `payout_batch_id` → FK to `payouts`; add `calculation_snapshot jsonb`, `engine_version`; append-only |
| `site00_df_referral_sources` (DF) | Fixed UUIDs `1111…01–06` (#1657) | **Keep** as the coarse source label on leads/artifacts | No change. An attributed artifact also keeps `referral_source_id` = AIO / CLIENT_REFERRAL / CUSTOM for DF reporting. **No random ids** |

## 2. New tables proposed (only what is missing)

| Proposed table | Purpose | Key fields (conceptual) | Notes |
| --- | --- | --- | --- |
| `partner_terms_versions` | Versioned commission terms per partner (FD-R01…R10) | id, partner_id FK, version, compensation_type, rate_basis_points?, fixed_amount_minor?, basis_definition, trigger, window_days?, touch_model, refund_rule, payout_timing, cap_minor?, effective_from, approved_by, approved_at | Immutable once approved; no defaults |
| `attribution_exceptions` | Collision / cross-device / duplicate / existing-client review queue | id, artifact_id FK, candidate partner ids, reason, opened_at, resolution, resolved_by, resolved_at | Resolution writes a correction event |
| `commission_adjustments` | Signed correction rows (ADJUSTED) | id, commission_entry_id FK, amount_minor (signed), reason, evidence_ref, actor, created_at | Append-only |
| `payouts` | Payout batches per partner | id, display_ref, partner_id FK, total_minor, currency, state, planned_on | Lines = commission entries with `payout_batch_id` |
| `payout_payment_records` | RECORD PAYMENT entries | id, payout_id FK, amount_minor, paid_on, method_type, method_last4, reference, receipt_object_key?, idempotency_key unique (payout+reference), actor | No banking details |
| `partner_payees` | Payee documentation status (FD-R10) | partner_id FK, status, documents_object_keys (encrypted storage), verified_at | Documents outside DB |
| `partner_portal_access` | Portal access state (doc 22) | partner_id FK, state (INVITED…ARCHIVED), auth_user_id?, invited_at, activated_at, revoked_at | Links to Supabase auth user when FD-R12 decides |
| `card_templates` / `card_proofs` / `qr_validations` | Card Studio records | template (territory, version, copy hash, approved), proof (batch, file hash, approved), validation (code, environment, checks, device scan, actor, time) | Gate evaluation reads these |

## 3. Identifier rules
1. Primary keys: database-generated UUIDs (as today). **Never** per-process `randomUUID()` for rows that others reference before insertion. This is the #1657 lesson.
2. Public identifiers: the code (opaque) and display refs (`001`, `R-0015`, `C-0010`, `PO-0005`) are generated server-side and unique-indexed. UUIDs never appear in URLs, cards or filenames.
3. Every FK that crosses into DF artifacts is enforced (today the `foundation_artifact_id` columns have no FK).

## 4. Money
Integer minor units + `currency` on every amount column. No numeric or float types. Signed values only on adjustments and reversals.

## 5. RLS (needed for the portal)
Today: RLS is enabled with no policies, so the service role only. Proposed:
- service role keeps full access for founder APIs;
- a `partner` role sees only rows where `partner_id = auth partner`, on a reduced, masked view (no client email; client labels masked per FD-R11).

## 6. Migration sequencing (later phases, not this sprint)
1. Constraints + FKs on existing tables (P3).
2. Terms versions (P6).
3. Exceptions (P5).
4. Adjustments (P6).
5. Payouts + payment records + payees (P8).
6. Portal access (P10).
7. Card records (P11).

Each migration is reversible (down-migration documented) and preceded by a data check. The tables are empty today, so the risk is low. **AIO fixture rows must not be migrated as ACTIVE.**
