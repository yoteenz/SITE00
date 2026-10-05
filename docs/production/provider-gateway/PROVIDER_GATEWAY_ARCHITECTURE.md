# Production Provider Gateway

**Sprint:** P0.SITE00.PRODUCTION-GATEWAY-MOTHERBOARD-CONTEXT-SYNC1  
**Canonical entry:** `runProductionProviderRequest()` in `shared/site00-production-guardrails/providerGateway/runProductionProviderRequest.ts`

## Problem

Reference-binding and expression guardrails existed in `precheckGenerationDispatch()` but were consumed mainly by tests and documentation. Dozens of production code paths still imported FAL, OpenAI, xAI, and Anthropic directly. That architectural gap allowed plate-first generation, text-to-image when references existed, and client-controlled `founderConfirmedSpend` flags.

## Target flow

1. **Resolve** project / family context (caller + registry validation).
2. **Spend authorization** — server-issued `spend_authorization_id` (not body boolean alone).
3. **Precheck** — `precheckGenerationDispatch()` (reference binding, expression brief, plate occupancy, family output project, sidekick rules).
4. **Authority-first** — JURNL `ENVIRONMENT_PLATE` requires registry-approved full-page authority (`validateAuthorityFirstPlate` inside precheck).
5. **Dispatch** — approved provider adapter only when precheck PASS.
6. **Receipt** — cost receipt adapter (JSONL under `data/production-cost-receipts/` + in-memory for tests).
7. **Incidents** — structured in-memory incidents for governance failures (adapter boundary for future event ledger).

## Related docs

| Artifact | Path |
|----------|------|
| Request schema | `PROVIDER_GATEWAY_REQUEST_SCHEMA.json` |
| Policy | `PROVIDER_GATEWAY_POLICY.json` |
| Bypass allowlist | `PROVIDER_BYPASS_ALLOWLIST.json` |
| Call inventory | `PROVIDER_CALL_SITE_INVENTORY.json` |
| Migration report | `PROVIDER_GATEWAY_MIGRATION_REPORT.json` |
| QA matrix | `PROVIDER_GATEWAY_QA.json` |

## FAL adapter

`shared/site00-visual-generation/falImageViaProductionGateway.ts` wraps `runFalReferenceImageJob` behind the gateway for incremental migration.

## Enforcement

- **Static audit:** `tests/providerDirectBypassAudit.test.ts` — new unallowlisted `@fal-ai/client` imports fail CI.
- **Runtime:** New paid generation should use `runProductionProviderRequest`; legacy paths remain allowlisted until migrated.
