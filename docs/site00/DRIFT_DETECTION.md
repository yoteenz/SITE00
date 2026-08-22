# Drift Detection Foundation

Sprint 02 prepares for ongoing synchronization when external evidence changes after baseline establishment.

## Table

`site00_drift_events` (Sprint 02 migration):

| Field | Purpose |
|-------|---------|
| organization_id | Affected project |
| source_system | e.g. github |
| previous_observed_state | Snapshot before change |
| new_observed_state | Snapshot after change |
| source_commit | New commit SHA if applicable |
| may_affect_orchestration | Flag for review |
| created_at | When drift was detected |

## Intended Flow (future sprints)

1. Periodic or webhook-triggered re-inventory
2. Compare previous evidence snapshot vs new observation
3. If meaningful change → create drift event
4. Optionally trigger reconciliation suggestion
5. **Do not automatically rewrite launch state**

## Source Freshness

Evidence records include:

- `observed_at`
- `source_commit` (when available)
- `metadata.validation_type` (when applicable)

Stale evidence should not indefinitely prove runtime readiness.

## Sprint 02 Status

| Item | State |
|------|-------|
| Drift events table | ✓ |
| Evidence freshness fields | ✓ |
| Automatic drift polling | NOT YET |
| Drift → reconciliation trigger | NOT YET |

## Manual Re-baseline

Until automatic drift runs:

```
POST /api/admin/site00-orchestration { "action": "bootstrap" }
```

Re-runs inventory and reconciliation (idempotent for existing orgs/manifests where coded).
