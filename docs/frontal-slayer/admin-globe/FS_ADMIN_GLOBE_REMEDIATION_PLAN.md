# FS Admin Globe — remediation plan (proposal only)

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Status:** **NOT IMPLEMENTED** — founder approval required  
**Implementation repo:** `yoteenz/fsbw` (globe code); index/migration changes apply to shared Supabase project.

## Goals

1. Keep live globe useful for founders without unbounded Postgres work.  
2. Separate **browser** performance from **database** performance.  
3. Avoid repeating outage conditions during recovery.

## Recommended fixes (priority order)

### P1 — Database (shared project)

| # | Change | Rationale | Effort |
| --- | --- | --- | --- |
| 1 | Add composite index `(event_type, created_at DESC)` on `site_analytics_events` | Matches live-presence filter + sort; avoids wide index scans when heartbeats resume | **S** (one migration, off-peak) |
| 2 | Materialized or rolling **live_presence_snapshot** table updated by trigger or cron | Admin reads O(unique visitors) instead of 5000-row scrape | **M** |
| 3 | Retention job: archive/delete `page_view` older than N days | Table already ~37 MB / ~98k rows | **M** |

### P2 — API (`fsbw`)

| # | Change | Rationale | Effort |
| --- | --- | --- | --- |
| 4 | Server-side aggregate endpoint: return deduped visitors in SQL (`DISTINCT ON (visitor_id)` + time window) | Less data over wire and in Node | **S** |
| 5 | Circuit breaker: if `site_analytics_events` query > X ms, return last cached payload + stale flag | Protects DB during incidents | **S** |
| 6 | Rate-limit live-presence per admin JWT (e.g. min 60s between DB hits regardless of client poll) | Stops accidental multi-tab storms | **S** |
| 7 | Restore shorter `LIVE_WINDOW_MS` (e.g. 15–30 min) **or** keep 24h but lower `.limit()` with cursor | Trade freshness vs read size | **S** |

### P3 — Client (`fsbw`)

| # | Change | Rationale | Effort |
| --- | --- | --- | --- |
| 8 | Pause polling when document hidden (`document.visibilityState`) | Cuts idle admin tab load | **S** |
| 9 | Increase `LIVE_GLOBE_REFRESH_MS` to 120–180s if founder accepts staleness | Linear reduction in reads | **S** |
| 10 | Heartbeat: skip admin routes or backoff when `navigator.connection.saveData` | Fewer INSERTs | **S** |
| 11 | Lazy-start heartbeat only after first user interaction | Reduces bot/noise inserts | **S** |

### P4 — Observability

| # | Change | Rationale | Effort |
| --- | --- | --- | --- |
| 12 | Log live-presence duration + row count server-side | Correlate future incidents | **S** |
| 13 | Supabase dashboard alert on disk I/O / memory saturation | Founder-facing ops | **S** (config) |

## Not recommended

- Disabling production admin without founder sign-off.  
- `VACUUM FULL` or compute resize during forensic window.  
- Unbounded load tests against production.

## SITE00 cross-cutting (not globe UI)

| Change | Rationale | Effort |
| --- | --- | --- |
| Paginate `listJudgmentsFromSupabase` / campaign copy lists | 55 MB table + unbounded `select('*')` | **M** |
| Schedule heavy admin jobs off founder peak hours | Reduces collision with FS storefront | **Process** |

## Effort key

- **S** — small PR, <1 session  
- **M** — multi-file or migration + deploy coordination  

## Rollout order (suggested)

1. P1 #1 (index) + P2 #8 (pause poll when hidden)  
2. P2 #6 rate limit + P4 #12 logging  
3. Evaluate retention / snapshot if heartbeats resume and table grows  

## Verification after fixes

Use gates in `SUPABASE_RECOVERY_STABILITY_GATES.md` plus:

- p95 live-presence < 500 ms with active heartbeats  
- No monotonic growth in `site_analytics_events` without retention  
- Admin OVERVIEW open 30 min → stable connection count and CPU on Supabase dashboard  
