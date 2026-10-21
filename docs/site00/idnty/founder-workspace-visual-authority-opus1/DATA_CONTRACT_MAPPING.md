# Data contract mapping

Every value the proposed workspace shows maps to a real field or action, or it is marked as a **gap**. No metric may be filled with mock data.

Sources were audited at `392ac76d5` (integration branch plus persistence fix #1657). Paths are relative to the repository root.

## 1. Canonical states (never collapsed in data)

All types below are in `shared/site00-digital-foundation/types.ts`.

| Field | Values | Where |
| --- | --- | --- |
| `artifact.state` | INVITED, OPENED, INTAKE_IN_PROGRESS, INTAKE_COMPLETE, RECOMMENDATION_READY, QUOTE_READY, AWAITING_ACCEPTANCE, AWAITING_PAYMENT, PAID, PROJECT_ACTIVE, IN_PROGRESS, WAITING_ON_CLIENT, WAITING_ON_PROVIDER, FINAL_VERIFICATION, COMPLETE, BUILD_OPPORTUNITY, ARCHIVED | `types.ts:5-22`; transitions `lifecycle.ts:3-21` |
| `intake_state` | NOT_STARTED, IN_PROGRESS, COMPLETE | `types.ts:24` |
| `payment_state` | NONE, CHECKOUT_PENDING, PAID, FAILED, REFUNDED, DISPUTED | `types.ts:26-32` |
| `project_state` | NOT_STARTED, ACTIVE, WAITING_ON_CLIENT, WAITING_ON_PROVIDER, FINAL_VERIFICATION, COMPLETE | `types.ts:34-40` |
| `completion_state` | NOT_STARTED, IN_PROGRESS, COMPLETE | `types.ts:42` |
| `quote.status` | DRAFT, READY, CLIENT_REVIEW, ACCEPTED, SUPERSEDED, EXPIRED, PAID; plus `founder_commercial_ready` (bool) and `_at` | `types.ts:44-51, 172-174` |
| Payability codes | QUOTE_MISSING, QUOTE_NOT_ACCEPTED, ACCEPTANCE_VERSION_MISMATCH, QUOTE_EXPIRED, QUOTE_SUPERSEDED, MANUAL_REVIEW_PENDING, CUSTOM_PRICING_PENDING, ARTIFACT_STATE_INVALID | `quoteReadiness.ts:7-15` |
| `ApprovalRecord.status` | REQUESTED, APPROVED, REVISION_REQUESTED (actor CLIENT, FOUNDER, SYSTEM) | `types.ts:292-293` |
| `ClientActionRequest.status` | OPEN, COMPLETED, CANCELLED; 17 `ClientActionType` values | `types.ts:256-281` |
| `ProjectStageCode` | 01_DETAILS_RECEIVED, 02_DOMAIN, 03_PROFESSIONAL_EMAIL, 04_DNS_SECURITY, 05_DEVICE_SIGNATURE, 06_FINAL_VERIFICATION, 07_FOUNDATION_COMPLETE | `types.ts:233-240` |
| `ProjectStageStatus` | WAITING, IN_PROGRESS, NEEDS_CLIENT, NEEDS_PROVIDER, COMPLETE, BLOCKED | `types.ts:242-248` |
| `ExecutionMode` | AUTOMATED, ASSISTED, CLIENT_ACTION, EXTERNAL_MANUAL, VERIFICATION. No generated task uses AUTOMATED; the default is ASSISTED. | `operations/types.ts:3`; `runbookGenerator.ts:18` |
| `ExecutionTaskStatus` | NOT_READY, READY, IN_PROGRESS, WAITING_CLIENT, WAITING_PROVIDER, BLOCKED, READY_TO_VERIFY, VERIFYING, VERIFIED, FAILED, COMPLETE, SKIPPED, SUPERSEDED | `operations/types.ts:18-31` |
| `BlockerCategory` | CLIENT_INFO_MISSING, CLIENT_AUTH_REQUIRED, PROVIDER_PENDING, PROVIDER_ERROR, DNS_PROPAGATION, PAYMENT_REQUIRED, SCOPE_REVIEW, TECHNICAL_CONFLICT, MANUAL_REVIEW, UNKNOWN | `operations/types.ts:33-43` |
| `VerificationCheckKind` / `VerificationStatus` | 12 checks (DOMAIN_RESOLVES … REGISTRAR_ACCESS_CONFIRMED) / NOT_RUN, RUNNING, PASS, FAIL, PARTIAL, MANUAL_CONFIRMATION_REQUIRED | `operations/types.ts:55-69` |
| `SendIntentStatus` | DRY_RUN, SIMULATED, QUEUED, ACCEPTED, SENT, DELIVERED, FAILED, BOUNCED, COMPLAINED, SUPPRESSED, SKIPPED | `communications/types.ts:32-43` |
| Readiness `overall_status` | BLOCKED, ACTION_REQUIRED, AWAITING_FOUNDER_APPROVAL, UNVERIFIED | `api/_lib/digitalFoundation/founderReadiness.ts:44-48` |
| Payload `surface` | PROSPECT, INTAKE, INTAKE_SUBMITTED, RECOMMENDATION, QUOTE, CHECKOUT, PORTAL, COMPLETE, BUILD_UPSELL, PAYMENT_RECOVERY | `types.ts:428-439`; `surface.ts` |
| Artifact token | No revoked or expired state and no token expiry (`PERSISTENT_ARTIFACT_RECOVERY_REPORT.md`, token policy). Quote expiry (14 days) **never** reads as link expiry. | `service.ts:72-74` |

## 2. Display phases → canonical states

The workspace journey has **eight presentation phases**. They are labels only and never written back.

| Display phase | Canonical condition (first match wins, evaluated from COMPLETE backwards) |
| --- | --- |
| INVITED | `state` ∈ {INVITED, OPENED} and `intake_state = NOT_STARTED` |
| INTAKE | `intake_state` ∈ {NOT_STARTED (opened), IN_PROGRESS}, or `state = INTAKE_IN_PROGRESS` |
| RECOMMEND | `state` ∈ {INTAKE_COMPLETE, RECOMMENDATION_READY} |
| QUOTE | `state` ∈ {QUOTE_READY, AWAITING_ACCEPTANCE} or `quote.status` ∈ {READY, CLIENT_REVIEW} |
| PAYMENT | `state = AWAITING_PAYMENT` or `payment_state` ∈ {CHECKOUT_PENDING, FAILED} |
| SETUP | `state` ∈ {PAID, PROJECT_ACTIVE, IN_PROGRESS, WAITING_ON_CLIENT, WAITING_ON_PROVIDER} |
| VERIFY | `state = FINAL_VERIFICATION` or stage `06_FINAL_VERIFICATION` IN_PROGRESS |
| COMPLETE | `state` ∈ {COMPLETE, BUILD_OPPORTUNITY} |
| (excluded from active) | `state = ARCHIVED`, or `payment_state` ∈ {REFUNDED, DISPUTED} (shown with their own status label) |

**Whose move** (drives the status mark):

| Mark | Meaning | Condition |
| --- | --- | --- |
| FOUNDER (red square) | Founder decision pending | §4 "needs review" true |
| CLIENT (hollow ink) | Waiting on the client | `intake_state ≠ COMPLETE` before RECOMMEND; `quote.status = CLIENT_REVIEW`; `state` ∈ {AWAITING_ACCEPTANCE, AWAITING_PAYMENT, WAITING_ON_CLIENT}; OPEN client actions |
| SITE 00 (solid ink) | SITE 00 is working | SETUP or VERIFY with no client wait or blocker |
| BLOCKED (hollow red) | Cannot advance | Any task BLOCKED, `WAITING_ON_PROVIDER`, or payment FAILED |
| DONE (grey) | Finished | COMPLETE / BUILD_OPPORTUNITY |

## 3. Overview and registry metrics

| UI metric | Source | Derivation | Empty | Error | Refresh |
| --- | --- | --- | --- | --- | --- |
| ACTIVE | `list` → `artifacts[]` (`api/admin/site00-foundation.ts:71-85`) | Count where display phase ∈ RECOMMEND…VERIFY, or phase = INTAKE with `intake_state = IN_PROGRESS`. Excludes INVITED-not-opened, COMPLETE, BUILD_OPPORTUNITY, ARCHIVED and refunded. **Synthetic (`SYNTH ·`) excluded unless the TEST filter is on.** | `0` plus the "NO ACTIVE FOUNDATIONS" state | Signal shows `—` and the page banner "COULDN'T LOAD FOUNDATIONS" | On load, on focus, and after any mutation |
| NEEDS REVIEW | §4 | Count of distinct review items | `0` (no red) | `—` | Same |
| AWAITING CLIENT | `list` (+ detail for quote status) | Whose move = CLIENT | `0` | `—` | Same |
| COMPLETE | `list` | Phase = COMPLETE; "+N THIS MONTH" from `completed_at` | `0` | `—` | Same |
| Intake progress | `intake_state` plus the six client steps (`foundationProgress()`, `model.ts:755-778`) | **No percentage exists on the server.** Show segmented phases (INVITED / INTAKE / … ), never a %. The references' "70%" is **not reproducible**: gap G-02. | — | — | — |
| Business name, category | `artifact.intake.business_name` / `industry` (detail), or `lead.business_name` | **Not in the `list` row** (gap G-01). Today it needs N detail calls or the `pipeline` action. | Plate shows `—`; the name falls back to the masked token `ab12…9z` | — | — |
| Last activity | `artifact.last_activity_at` (in the list) | Relative time | `—` | — | — |
| Recent movement (activity) | `detail.events` (last 50, `service.ts:883-932`) | Merge per artifact, sort by `created_at` | "NO RECENT ACTIVITY" | Banner | **Events are memory-only** (`memoryStore.ts:48`); lost on restart (gap G-03, persistence dependency) |
| Quote total | `detail.quote` (subtotal) or `pipeline.quote_amount_minor` | Money in config currency | `—` | — | Not in the list (G-01) |
| Current blocker | `pipeline.blocker` / tasks BLOCKED (`operationsEngine`) | First blocker category plus reason | none | — | Memory-only ops (G-04) |
| Next action | `pipeline.next_action` / `project-command` | Text | — | — | Memory (G-04) |

## 4. "Needs review": the founder decision queue

There is **no queue table and no flag** on the artifact. The queue is a union of derivations. Each item carries its own source and timestamp; urgency is **never** invented.

| Review type (tab) | Condition | Source | Timestamp shown | Primary action → API |
| --- | --- | --- | --- | --- |
| INTAKES | `state ∈ {INTAKE_COMPLETE, RECOMMENDATION_READY}` and no READY/CLIENT_REVIEW quote marked commercial-ready | artifact + quote | `INTAKE_COMPLETED` event, else `last_activity_at` | REVIEW INTAKE → opens the record (no state change). Founder edits the quote via `update-quote` |
| RECOMMENDATIONS | `recommendation.manual_review = true` | `detail.recommendation.manual_review_reasons` | `last_activity_at` | REVIEW → `update-quote` (selections) |
| QUOTES | quote exists, `status ∈ {READY, CLIENT_REVIEW}` and `founder_commercial_ready = false`; or payability `MANUAL_REVIEW_PENDING` / `CUSTOM_PRICING_PENDING` | `quoteReadiness.ts:51-69` | `quote.created_at` | APPROVE → `quote-commercial-ready`; REVISE → `manual-adjustment` / `update-quote` |
| CLIENT ACTIONS | `approvals[].status = REQUESTED` (client-raised `REQUEST_CHANGE` responses), OPEN client actions that need a founder response | `detail.approvals`, `client_actions` | approval `requested_at` | RESOLVE → `approval-resolve` (APPROVED / REVISION_REQUESTED) |
| EXCEPTIONS | tasks BLOCKED or FAILED verification; `payment_state ∈ {FAILED, DISPUTED}`; completion-gate failures | `workbench`, `completion-gate` | task `started_at` / event time | OPEN TASK → `escalate-task` / `set-blocker` / `verify-task` |
| HISTORY | Resolved approvals, quotes marked ready, verified tasks | events | event time | read-only |

Not supported, so not designed as live:
- A "reject" state (only APPROVED and REVISION_REQUESTED exist).
- "Requires clarification" as a stored state. It maps to REVISION_REQUESTED plus a note; the note is stored only on `approval-resolve`.
- Deadlines.

## 5. Founder actions available (admin API)

All actions are on `/api/admin/site00-foundation` (`api/admin/site00-foundation.ts`), with admin auth via `resolveAdminAuth` (`api/_lib/adminAuth.ts:37-93`).

| UI action | API action | Persisted? | Note |
| --- | --- | --- | --- |
| Create client | `create-artifact` (contact_email, contact_name, business_name, referral_kind / source) | **Yes** (awaited, #1657) | Returns `personalized_url` |
| Create synthetic test client | `create-test-client` (display_name, contact_email, contact_name) | Yes | Requires `SITE00_DF_FOUNDER_TEST_MODE`; email must be on `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST`; name prefixed `SYNTH · ` |
| Copy link | — (client-side) | — | `list` returns `public_token`; URL `/foundation/<token>`. A `token_masked` exists for test clients. |
| Resend invitation | **None** | — | Gap G-05. Only `prepare-test-invitation` and `dispatch-test-email` exist, for synthetic intents. |
| Archive / revoke / rotate link | **None** | — | Gap G-06. Not designed as live; shown as unavailable. |
| Update quote / selections | `update-quote` | Yes | QUOTE_LOCKED once ACCEPTED or PAID |
| Manual price adjustment | `manual-adjustment` | **No** | G-04 dependency |
| Approve quote (commercial ready) | `quote-commercial-ready` | Yes | — |
| Request client action | `client-action` | **No** | G-04 |
| Approval request / resolve | `approval-request` / `approval-resolve` | **No** | G-04 |
| Stage update / mark complete | `update-stage` / `mark-complete` | **No** | G-04; `mark-complete` needs PAID plus the completion gate |
| Runbook / tasks | `generate-runbook`, `activate-runbook`, `set-providers`, `start-task`, `complete-task`, `verify-task`, `escalate-task`, `set-blocker` | **No** | G-04 |
| Messages | `messages` (GET), `send-message` (POST, 8000 max) | Yes | Client can send only once PAID |
| Email timeline | `email-timeline` | Intents are memory-only | Recipient masked |
| Prepare / dispatch test email | `prepare-test-invitation`, `dispatch-test-email` (`founder_approved_send`) | Intent memory | Real send only when every gate passes (§6) |
| Synthetic journey | `test-journey`, `advance-test-intake`, `advance-test-quote` | — | Rejects non-synthetic artifacts |
| Reset test data | `reset-test-data` | Clears memory and rehydrates; **no DB delete** | — |
| Fixtures | `materialize-fixture` (A_BASE…M_COMPLETE_CREDIT) | — | Staging and test only |
| Readiness | `readiness-report` | — | §7 |

## 6. Communications gates (the UI must mirror these)

Every lifecycle event in `communications/eventMap.ts:8-27` is `enabled:false`. A delivery passes these gates in order (`deliveryWorker.ts:127-207`):

1. DRY_RUN intent
2. non-synthetic artifact without test mode
3. recipient not on the allowlist
4. `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` off → DRY_RUN
5. no renderer
6. no `RESEND_API_KEY` → SIMULATED
7. Resend → ACCEPTED or FAILED

The Resend webhook maps delivered, bounced and complained statuses.

**UI rule:** SEND renders only when the specific intent passes gates 1–5. Otherwise the control reads `SEND DISABLED · <REASON>` with policy hatching. "Delivered" is shown only from a webhook status.

Correspondence Studio itself cannot send ("SEND TEST OFF" is permanent) and stores reviews in localStorage.

## 7. System / readiness checks (real, nothing more)

From `founderReadiness.ts:138-314`, `stagingEnvConfig.ts`, `stagingDatabaseSecurityProbe.ts` and `stagingReadinessRuntime.ts`:

- Test mode and allowlist.
- Transactional send flag: **ON is reported as UNVERIFIED**.
- Resend key.
- Supabase isolation: the project ref equals the staging ref and not the production ref.
- Persistence flag.
- Public origin.
- Stripe key mode by prefix: test, live (live → BLOCKED), missing, unrecognized.
- Resend webhook secret; From and Reply-To present.
- **DKIM: always NEEDS FOUNDER (manual)**.
- Deployment identity.
- RLS probe (anon vs service role on `site00_df_project_messages`: denied, allowed_rows, not_configured, error).
- Founder login.
- `synthetic_intake_ready`.
- `activation.e2e_authorized` is **always false** by design.

**Not checked today**, so the system modules show them as `UNVERIFIED`, never as healthy:
- API health ping (`/api/health` exposes diagnostics but the desk doesn't use it)
- Stripe webhook endpoint probe
- E2E run results
- live email delivery

## 8. Commercial values (from source)

- Base package: `base_price_minor 50000` USD, so **$500.00**, with 2–3 business days (`commercialConfig.ts:6-9`).
- Quote expiry: 14 days. Terms: `df-terms-v1`. Foundation credit: $200 for 30 days.
- Third-party notice: verbatim at `commercialConfig.ts:16-17`.
- Add-on catalog: `addonCatalog.ts:9-209`. Prices are loaded on the boards from source.
- Config is in memory with no admin route (`setCommercialConfig` is unrouted).

## 9. Gaps for Composer (not filled with mock data)

| ID | Gap | Needed for | Proposed resolution (Composer decides) |
| --- | --- | --- | --- |
| G-01 | The `list` row has no business name, industry, intake_state or quote total (`foundationAdminApi.ts:25-31` is narrower still) | Registry rows, signals | Extend `list` with a lead join plus `intake_state` and `quote.status`/subtotal (backend change; separate sprint) |
| G-02 | No intake completion % or step count on the server | Reference "70%" | Use phase segments (designed). A percentage needs an approved deterministic calculation. |
| G-03 | Events are memory-only; `site00_df_artifact_events` is never written | Activity, history, review timestamps | Persist events (persistence workstream) |
| G-04 | Ops, approvals, stages, manual-adjustment, client-action and mark-complete do not persist on their own | Reviews, Operations | Persistence workstream; until then the UI shows `UNSAVED ON SERVER RESTART` risk only in the System test lab, not as a fake success |
| G-05 | No resend-invitation action for real clients | Record quick action | New endpoint (founder approval plus send policy) |
| G-06 | No archive / revoke / rotate | Registry actions | Founder decision plus backend |
| G-07 | `pipeline` and `detail` read memory only (no Supabase sync) | Inspector after restart | Persistence workstream |
| G-08 | Readiness lacks API health, Stripe webhook probe and E2E results | System modules | Optional new probes |
| G-09 | Send intents and consents are memory-only | Correspondence history | Persistence workstream |
| G-10 | No notification feed or store | Header bell | Derive from §4 items plus G-03 events; a stored feed would be new |
| G-11 | `create-artifact` does not detect duplicate contact emails | Create flow duplicate notice | Client-side match over the loaded `list` (designed); server-side rejection is a product decision |
