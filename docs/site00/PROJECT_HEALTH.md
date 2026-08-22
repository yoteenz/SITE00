# Project Health

Derived health states summarize operational posture beyond raw readiness percentages.

## Client-Facing States

| State | Meaning |
|-------|---------|
| ON_TRACK | No critical blockers; reconciliation manageable |
| ATTENTION_REQUIRED | Pending reviews or moderate gaps |
| BLOCKED | Blocking dependencies or critical failures |
| WAITING | External/client dependency |
| READY_FOR_LAUNCH_REVIEW | Provisional manifest ready for admin approval |
| LAUNCHED | Active launch achieved (future) |
| POST_LAUNCH | Operating post-launch (future) |

## Infrastructure (Studio World)

| State | Meaning |
|-------|---------|
| HEALTHY | Connections validated |
| DEGRADED | Partial/unverified connections |
| UNAVAILABLE | Critical connection missing |

## Derivation

`projectHealth.ts` considers:

- Blocking requirements and dependencies
- Pending reconciliation count
- Pending manifest approvals
- Override presence (does not hide underlying incomplete state)
- Connection states for infrastructure orgs

Health is **not** derived from readiness percentage alone.

## Storage

Organizations table column: `project_health` (Sprint 02 migration).

Updated during bootstrap and after reconciliation decisions.

## Debug UI

`/admin/site00/debug/orchestration` — PROJECT HEALTH section per org slug.
