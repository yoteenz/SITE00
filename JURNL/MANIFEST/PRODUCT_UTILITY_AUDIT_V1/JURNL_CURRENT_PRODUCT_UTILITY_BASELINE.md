# JURNL current product utility baseline

**Sprint:** P0.JURNL.PRODUCT-UTILITY.PERSONAL-ACCOUNTING-ASSISTANT-AND-PLAIN-LANGUAGE-FORENSIC-AUDIT1  
**Main baseline SHA:** `e413590e1318be18c41e59c598880322c1f10a5c` (2026-11-02, America/Chicago)  
**Branch:** `cursor/jurnl-product-utility-audit-4e5a`  
**Mode:** Read-only audit — no runtime changes

## Reconciliation summary

| Area | Finding | Classification |
| --- | --- | --- |
| 16-family routes | Wired in `JurnlRuntimeRoot.tsx` | IMPLEMENTED_VERIFIED |
| Financial CRUD | Device `localStorage` repository v5 | IMPLEMENTED_VERIFIED (local) |
| Bank / Plaid feed | Not present | NOT_IMPLEMENTED |
| Server financial sync | `serverSyncCoordinator` exists; not verified as production money source | PARTIAL / UNKNOWN |
| Safe to Spend | Central formula `computeSafeToSpend` | IMPLEMENTED_VERIFIED |
| Obligations | Canonical type `JurnlObligation` with `kind: BILL \| SUBSCRIPTION` | IMPLEMENTED_VERIFIED |
| Subscriptions UI | No dedicated view; add flow defaults `kind: 'BILL'` | PARTIAL |
| Per-bill funding | Trips/purchases/goals/plan assign; **not** per-obligation | PARTIAL |
| Mark bill paid | No obligation payment lifecycle | NOT_IMPLEMENTED |
| TODAY daily ops | Signal + 2-line upcoming preview | PARTIAL |
| Parent editorial copy | `parents/catalog.ts` questions on hubs | IMPLEMENTED_VERIFIED |
| E2E harness | `e2e/jurnl/*.e2e.ts` + fixture | IMPLEMENTED_VERIFIED |
| Visual authorities | F03/F04+ parent plates; F03 generation blocked in manifest | DOCUMENTED_ONLY / BLOCKED |

## Active JURNL PRs (audit window)

- **#1703** — identity V2 (draft, unrelated — not modified)
- **#1701** — logo forensic (draft, not modified)

## Persistence truth (critical)

`deviceRepository.ts` header: **“Not production server persistence.”** Financial records live in per-user `localStorage` keys (`jurnl.repository.v5.{userId}`). Demo/mock cash and upcoming values apply when setup is incomplete (`MOCK_CASH`, `MOCK_UPCOMING`).

## Feature matrix

Machine-readable: `JURNL_CURRENT_STATE_FEATURE_MATRIX.json`

## Tests referenced (not altered)

- `tests/jurnlWave2Families.test.ts`, `jurnlWave0Foundations.test.ts` — STS formula unit coverage
- `e2e/jurnl/jurnl-core-mutations.e2e.ts` — mutation smoke (local dev results in `JURNL_QA_JOURNEY_RESULTS.json`)

## Founder intent gap (headline)

The product **displays** money and obligations but **does not yet behave** like a personal accounting assistant: no subscription hub, no funded-vs-remaining bill progress, no pay/confirm lifecycle, and plan intentions are not linked to specific bills.
