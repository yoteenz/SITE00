# Shared Supabase workload — relevance to Gate A

**Reference sprint:** `P0.SITE00.FS.SHARED-SUPABASE.WORKLOAD-CONTAINMENT-AND-QUERY-STABILIZATION1`  
**SITE00 PR:** [#1604](https://github.com/yoteenz/SITE00/pull/1604) (draft, not merged)

## Necessary before Gate A?

| Item | Necessary? | Notes |
| --- | --- | --- |
| DF migrations v1 + v2 | **YES** | Tables missing; API persist flag is on |
| cPanel frontend ZIP | **YES** | Stale Sep bundle on site00.com |
| Railway redeploy (same SHA) | **NO** | Already on `3cd487e` |
| SITE00 bounded list queries | **NO** (immediate) | Reduces long-term I/O; not blocking intake |
| fsbw globe/analytics patch | **NO** (immediate) | Low measured load; defer unless admin globe active |
| Index DDL on `site_analytics_events` | **NO** for Gate A | Separate founder gate |

## Active resource risk

- **OPEN (Gate A critical):** DF schema absent while persistence env enabled → client/founder flows hit PostgREST errors.  
- **CONTAINED (monitor):** Expression-engine table weight — address via PR #1604 post-incident, not before migrations.

## Deferred improvements (documented)

- Merge PR #1604 after Gate A migration window.  
- Apply fsbw workload patch when fsbw deploy access available.  
- Execute `DATABASE_INDEX_PROPOSALS.md` in maintenance window.
