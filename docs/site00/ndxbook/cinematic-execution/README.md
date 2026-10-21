# NDXBOOK cinematic execution — Kling 4.0 foundation (P0 audit)

Sprint: `P0.SITE00.NDXBOOK.KLING4-CINEMATIC-EXECUTION-PIPELINE-AUDIT-REFERENCE-INTEGRITY-AND-ENTRY002-MOTION-PROOF1`

## Module

Implementation lives in `shared/site00-ndxbook-cinematic-execution/` (feature-flagged, default **off**).

| Deliverable | Location |
| --- | --- |
| Pipeline audit snapshot | `pipeline/repositoryAuditSnapshot.ts` |
| Production flow order | `NDXBOOK_PRODUCTION_FLOW_ORDER` in same file |
| Kling 4 capability matrix | `capability/kling4CapabilityMatrix.ts` |
| Provider access assessment | `capability/providerAccessAssessment.ts` |
| Shot + reference schemas | `types/schemas.ts` |
| Reference readiness validation | `validation/referenceReadiness.ts` |
| Keyframe compiler | `compiler/keyframeCompiler.ts` |
| Artlist Kling 4 adapter (manual) | `provider/artlistKling4Adapter.ts` |
| Job lifecycle + idempotency | `job/jobLifecycle.ts` |
| Paid generation gate | `validation/paidGenerationGate.ts` |
| Entry 002 asset recovery | `entry002/assetRecovery.ts` |
| Benchmark execution packet | `entry002/benchmarkShotPacket.ts` |
| Rough cut handoff validator | `pipeline/roughCutHandoff.ts` |
| Marketing reusability | `pipeline/marketingReusability.ts` |

## Regenerate founder artifacts

```bash
npx tsx scripts/ndxbook/entry002-cinematic-asset-recovery.ts
```

Outputs under `docs/site00/ndxbook/cinematic-execution/generated/`.

## Feature flag

Set **both** (default false):

- `NDXBOOK_KLING4_EXECUTION_ENABLED=1`
- `VITE_NDXBOOK_KLING4_EXECUTION_ENABLED=1`

Paid runs also require `spend_authorization_id` via production gateway spend authorization pattern.

## Benchmark shot

`NDX-ENTRY-002-BENCHMARK-SHOT-P08-RECOGNITION-V001` — final storyboard panels 8→9, NDX hand + subject + phone authorities.

No paid Artlist generation is performed in CI or this sprint without explicit founder authorization.
