# SITE 00 — IDNTY Digital Foundation — Critical Contract Repair V1

Sprint: `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V1-CRITICAL-CONTRACT-REPAIR-AND-LAUNCH-SAFETY1`  
Audit baseline: Opus commit `1ecdaac3` on branch `claude/digital-foundation-authority-audit-8d42xk` (blueprint doc on that branch).

## 01 — Blocker repair register

| ID | Finding | Cause | Fix | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| F-01 | Public artifact API broken import | Extra `../` in `digital-foundation-artifact.ts` | Correct path to `shared/site00-digital-foundation/quoteEngine.js` | `digitalFoundationArtifactHandler.test.ts` | IMPLEMENTED + TESTED |
| F-02 | Memory-only persistence | Service used `memoryStore` only | Supabase load/persist bridge + migration `20261008170000_*` | `digitalFoundationPersistence.test.ts` (BLOCKED unless `SITE00_DF_PERSISTENCE_TEST=1`) | IMPLEMENTED — PENDING DEPLOYMENT |
| F-03 | Client action = approve | `completeClientAction` always completed tasks | Explicit `APPROVE` / `REQUEST_CHANGE` + version checks | `digitalFoundationCriticalRepair.test.ts` | IMPLEMENTED + TESTED |
| F-04 | Internal leak in client payload | Full `getArtifactPayload` returned events + referral label | `toClientArtifactPayload` allowlist; public API uses client projection | Redaction test in critical repair suite | IMPLEMENTED + TESTED |
| F-05 | Refund/complete routing | Refund reset project; complete surfaced as upsell | `PAYMENT_RECOVERY` surface; complete surface when `build_interest === NONE` | Lifecycle routing tests | IMPLEMENTED + TESTED |
| F-06 | Payment safety gaps | Simulated checkout in prod; weak correlation | Production fail-closed; checkout session map; quote version gate on webhook | Payment + webhook tests | IMPLEMENTED + TESTED |
| F-07 | Unreviewed quotes payable | No commercial gate | `assessQuotePayability` + `markQuoteCommerciallyReady` (founder) | Quote gating tests | IMPLEMENTED + TESTED |
| F-08 | Included services double-charged | Recommendation mapped security/device to paid add-ons | Base-included mapping in `recommendationEngine.ts` | Included scope tests | IMPLEMENTED + TESTED |
| F-09 | Timeline/readiness clock | Clock started too early | `readinessClock.ts` + client `timeline_readiness` | Readiness tests | IMPLEMENTED + TESTED |

## 02 — Persistence model

- **Tables (existing + v2 migration):** `site00_df_*` artifact, lead, quote, acceptance, events, approvals, client actions, stages, credits, stripe events; plus `site00_df_checkout_sessions`, `site00_df_operations_bundle`, readiness columns.
- **Write path:** Service mutations → memory (request cache) → `persistArtifactGraph()` when `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1`.
- **Read path:** Public handler calls `loadArtifactGraphByToken()` before open.
- **Authorization:** Server-side service role only; RLS enabled (no anon access).
- **Deployment:** Apply migrations on Supabase; set env flag on Railway API.

## 03 — Payment safety contract

- Checkout allowed only when `assessQuotePayability` passes.
- Production without Stripe secret → `PAYMENT_NOT_CONFIGURED` (no silent sim).
- Webhook: signature required (existing), idempotent event ids, checkout session correlation fallback.
- Payment activation requires matching accepted quote version and non-expired quote.

## 04 — Client action contract

- Approval-gated actions require `decision: APPROVE | REQUEST_CHANGE`.
- `REQUEST_CHANGE` records `REVISION_REQUESTED` and does not complete linked tasks.
- Stale `target_version` → `STALE_APPROVAL_VERSION`.

## 05 — Timeline readiness contract

- `computeReadinessState` tracks missing requirements and sets `production_started_at` only after readiness satisfied (typically post-payment + intake).
- Client copy: service window label references post-readiness start.

## 06 — Visual authority handoff (semantic)

Five-board UI should consume:

- **Client API payload:** `getClientArtifactPayloadByToken` shape (`referral_channel`, `timeline_readiness`, no `events`).
- **Surfaces:** include `PAYMENT_RECOVERY` for refunded/disputed; `COMPLETE` when finished without build interest.
- **P03/P04 configurator:** align selections with `recommendationEngine` / quote engine (included vs add-on).
- **Checkout:** honor `MANUAL_REVIEW_PENDING` / founder cleared state before enabling pay CTA.
- **P11 complete:** route from `completion_state === COMPLETE'`, not URL alone.

## Notifications

No live SITE 00 transactional sender wired for Digital Foundation in this sprint. Event hooks remain in `artifact_events`. Do not show “email sent” unless a future notification sprint connects a verified channel.

## Remaining risks

- Plain-text `public_token` in DB (hash-at-rest recommended next).
- Supabase persistence requires migration + env on production API.
- Opus audit blueprint doc not merged to `main` (still on audit branch).
