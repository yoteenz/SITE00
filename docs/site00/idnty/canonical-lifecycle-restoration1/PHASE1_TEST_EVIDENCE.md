# Phase 1 test evidence

**Date:** 2026-10-20  
**Branch:** `cursor/idnty-living-portal-one-pass-completion1-be3b`

## Automated (Vitest)

| Suite | Scope |
| --- | --- |
| `tests/digitalFoundationLifecyclePhase1.test.ts` | Portal through completion, handoff eligibility, expiry, idempotency, queue boundary |
| `tests/dfClientLifecycleRouting.test.ts` | Completion → portal views (updated) |
| `tests/digitalFoundationPortal.test.ts` | Portal v2 tabs |
| `tests/digitalFoundationMenuDrawer.test.ts` | Menu destinations |
| `tests/digitalFoundationCriticalRepair.test.ts` | Completion surface, approvals |
| `tests/digitalFoundationCommerce.test.ts` | Credit lifecycle |

Run: `npm test -- tests/digitalFoundationLifecyclePhase1.test.ts tests/dfClientLifecycleRouting.test.ts`

## Staging E2E

**Not claimed.** Phase 1 uses in-memory DF store + Vitest; no live Stripe or staging DB mutation in this sprint.

## Browser (local dev)

Planned viewports 390 / 834 / 1440 on `/foundation/review` and fixture-backed `/foundation/:token` when dev server available. Artifacts under `/opt/cursor/artifacts/` when capture completes.

## Security

- Handoff rejects incomplete projects and expired credits (unit tests)
- Deep link contains opaque id only (assertion in phase1 suite)
- Builder credit consumption explicitly `PENDING_BUILDER_INTEGRATION`
