# Background job concurrency audit

**Sprint:** `P0.SITE00.FS.SHARED-SUPABASE.WORKLOAD-CONTAINMENT-AND-QUERY-STABILIZATION1`  
**Production job cancellation:** NOT authorized

## SITE 00

| Workload | Origin | DB pattern | Concurrent agents? | Risk | Mitigation (code / process) |
| --- | --- | --- | --- | --- | --- |
| Expression engine proofs | `runC19*`, entry pipelines | burst writes judgments/copy | yes (cloud agents) | write spikes | idempotent upserts; **no change to job cancel** |
| EVOLVE validation runs | methodology stores | upsert JSONB rows | yes | shared table lock contention | per-mode fixed IDs where used; replay list now **bounded** |
| Personality replay execution | `replayExecutionService` | read org replays + write run | single-user typical | unbounded org list | **limit 200** on active-replay discovery |
| ASSTS generation poll | `site00-assts` API `poll` | job + asset rows | admin sessions | N+1 versions | **cap listAllAssetsWithVersions** |
| Design bench / Opus native poll | `OpusNativeAgentPanel`, `DesignAgentDock` | mostly API state | yes | API not DB heavy | LOW-RISK for Postgres |
| Studio world runs | execution service | upsert runs | yes | moderate | existing **limit 50** on list |
| Marketing campaign processors | Railway + Supabase | engagements + studio world | yes | moderate | admin list **limit 200** |

## Frontal Slayer

| Workload | Origin | DB pattern | Risk | Mitigation |
| --- | --- | --- | --- | --- |
| Live presence poll | Revenue OVERVIEW | read analytics | moderate if heartbeats resume | cache + lower row cap + visibility pause |
| Page view heartbeat | `App.tsx` deferred | INSERT analytics | high if traffic returns | retention + index (proposed) |
| Studio / Slay Forecast jobs | admin studio routes | burst writes | episodic | out of scope — monitor |
| Stripe webhooks | membership | upsert payments | spiky | LOW-RISK today |

## Proposals (no production enforcement in this sprint)

1. **Concurrency ceiling** for cloud-agent expression proofs writing to same `campaign_id` (queue keyed by campaign).
2. **Retry budget** on Supabase upsert loops (campaign copy version inserts — sequential today).
3. **Backpressure** when `listJudgmentsFromSupabasePage` `hasMore` true — UI/API should iterate pages, not raise limit.
4. **Delay between heavy migrations** — process gate already in founder runbooks; not automated here.

## Result

**AUDIT COMPLETE** — bounded reads implemented for highest-risk list patterns; job concurrency limits documented, not enforced in production.
