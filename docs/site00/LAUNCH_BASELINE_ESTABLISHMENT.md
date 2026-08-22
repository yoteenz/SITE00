# Launch Baseline Establishment

Sprint 02 establishes **provisional** evidence-backed launch baselines for registered projects.

## Manifest Types

| Project | Proposed Target Type | Notes |
|---------|---------------------|-------|
| SITE 00 | FULL_PLATFORM_LAUNCH | Self-reconciled from repo |
| Frontal Slayer | FLAGSHIP_BRAND_LAUNCH | Not every future feature in denominator |
| AIO | CORE_SERVICE_OPERATIONS | Social deferred to EVOLVE |
| Studio World | N/A (infrastructure) | No client launch manifest |

## Provisional vs Authoritative

All Sprint 02 manifests are:

- `is_provisional: true`
- `approval_state: PENDING`

Readiness displayed as **PROVISIONAL READINESS** until admin approves manifest.

## Readiness Calculation

`readinessCalculator.ts` counts only requirements classified:

- REQUIRED_FOR_LAUNCH
- REQUIRED_FOR_MILESTONE (when in active milestone scope)

Excluded from denominator:

- DEFERRED_BY_OWNER
- OPTIONAL_POST_LAUNCH
- OUT_OF_SCOPE

### AIO Social Marketing Test

AIO `social_marketing` is **DEFERRED_BY_OWNER** → appears in EVOLVE, does **not** reduce launch readiness.

## Current vs Master Roadmap

`master_roadmap_count` on manifests tracks total future capabilities. Current launch target may require a subset (e.g. 14 of 40). Remaining items must not deflate readiness score.

## Bootstrap

```
POST /api/admin/site00-orchestration
{ "action": "bootstrap" }
```

Runs `registryBootstrap.ts`:

1. Upsert 4 organizations + relationships
2. Register external connections (truthful states)
3. Inventory repositories → evidence batch insert
4. Run reconciliation suggestions
5. Create provisional manifests from `manifestBuilder`
6. Derive project health

Auto-runs on debug GET when Supabase tables exist and org count is zero.

## Pending Decisions

Provisional readiness reports:

- Blockers (blocking dependencies remaining)
- Pending reconciliation decisions (NEEDS YOU)
- Pending manifest approvals

## Next Sprint

Wire approved admin dashboard to these real orchestration services — do not begin automatically after Sprint 02.
