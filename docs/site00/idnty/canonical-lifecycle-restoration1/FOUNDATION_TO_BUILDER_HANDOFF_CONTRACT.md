# Foundation → general builder handoff contract

**Foundation product:** IDNTY Digital Foundation (`/foundation/:token`)  
**Builder product:** SITE 00 Hybrid Spatial Studio (`/bldr/studio`, blueprint entry `/bldr/studio/blueprint`)  
**PR #1672:** Consumer side **not modified** in Phase 1.

## Shared module

`shared/site00-digital-foundation/builderHandoff.ts`

- `FOUNDATION_BUILDER_DEEP_LINK_PATH` = `/bldr/studio/blueprint`
- Query param `dfHandoff` = opaque handoff id (no PII, no credit amount).

## Server API

`POST /api/site00/digital-foundation-artifact?action=create-builder-handoff`

Body: `{ token, build_path_preference?: SIMPLE_BUILD | ADVANCED_BUILD | CUSTOM_BUILD }`

Response:

- `handoff_id`, `deep_link_path`, `credit_verified`, credit amount/expiry from **credit record**
- `builder_credit_consumption: PENDING_BUILDER_INTEGRATION`

Implementation: `createFoundationBuilderHandoff` / `verifyFoundationBuilderHandoff` in `api/_lib/digitalFoundation/service.ts`.

## Eligibility rules

1. `artifact.completion_state === COMPLETE`
2. `FoundationBuildCredit.status === AVAILABLE`
3. Credit not past `expires_at`
4. Idempotent: active non-expired handoff for same artifact returns same id

## Credit source

Issued on `markFoundationComplete` from `commercialConfig.foundation_credit_amount_minor` and `foundation_credit_validity_days` — **not** URL parameters.

## Build path preference

Optional client choice (Simple / Advanced / Custom) stored on handoff record; does not change builder catalog pricing.

## Consumer blocker (Phase 1 honest status)

General builder does not yet call `verifyFoundationBuilderHandoff` or `reserveFoundationCredit`. Discount application remains **pending**; UI shows server-verified credit context only.

## Security

- Handoff TTL: 30 minutes (memory store Phase 1)
- Replay: verification rejects consumed / expired handoffs
- Tamper: builder must not trust client-supplied discount amounts
