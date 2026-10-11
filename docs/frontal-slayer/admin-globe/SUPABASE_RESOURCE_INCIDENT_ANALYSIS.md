# Supabase resource incident analysis

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Project:** FS Website (`hyycomvcaqxxvyrfupes`)  
**Region:** us-east-1  

## Incident summary (founder / support)

- Project became **unresponsive** with heavy **memory** and **disk I/O**.
- Compute exhausted; Supabase **restarted** the project.
- Founder verified connectivity: `SELECT 1 AS connection_test` → **1** (replicated 2026-10-11 via MCP `execute_sql`).
- **Sustained stability not certified** (see `SUPABASE_RECOVERY_STABILITY_GATES.md`).

## Evidence collected (read-only)

| Signal | Result |
| --- | --- |
| Project status (Management API) | `ACTIVE_HEALTHY` (2026-10-11) |
| SQL connectivity | OK |
| Connection states (`pg_stat_activity`) | 2 idle, 1 active, 2 null (snapshot) |
| Largest tables (size) | `site00_senior_creative_judgments` ~55 MB; `site_analytics_events` ~37 MB (~95k rows) |
| `site_analytics_events` time range | **2026-04-23 → 2026-08-08** (no rows after August in DB snapshot) |
| Daily analytics volume Sep 27 – Oct 11 | **No rows** in that window (insert pipeline idle or API not writing) |
| Globe live-presence query plan | Index scan on `created_at DESC`, filter `page_view`; cheap when 24h window empty |
| Unified logs (MCP `query_logs`) | **Last 24 hours only** per API cap; `postgres_logs` via `logs` source: 82 lines in sampled 23h window — **not sufficient** to reconstruct Sep 28–30 |

## Historical correlation (Sep 27 – Oct 11, 2026)

| Desired metric | Availability |
| --- | --- |
| CPU / memory / swap / disk I/O time series (Sep 28–30) | **BLOCKED** — not exposed via this agent’s tools; Supabase dashboard history required |
| PostgREST request logs for `/api/admin/live-presence` | **PARTIAL** — only recent 24h window via MCP |
| Postgres slow query log for incident window | **BLOCKED** for Sep 28–30 |
| Causal link globe ↔ outage timestamp | **INSUFFICIENT EVIDENCE** |

**Do not infer** that the globe caused the restart without time-aligned query metrics.

## Hypothesis matrix

| Hypothesis | Evidence for | Evidence against |
| --- | --- | --- |
| Admin globe live-presence polls | Bounded query; can multiply with many admin tabs | 90s interval; **no recent page_view data** to scan heavily today |
| Heartbeat INSERT storm | 97k historical page_views; 60s insert pattern can grow table + WAL | **No inserts since Aug 2026** in DB; Sep/Oct incident unlikely from new analytics writes alone |
| SITE00 creative / copy workloads | 55 MB judgments table; high seq_scan stats on copy packages | Not triggered by opening FS globe |
| Migrations / agent batches on shared DB | MEMORY documents repeated migration apply + timeout episodes on this project | Correlates with **platform-wide** outages, not globe route specifically |
| WebGL globe | Can crash **browser** | Does not consume Postgres CPU |

## Globe root cause confidence

**Classification: INSUFFICIENT EVIDENCE to label CONFIRMED CAUSE.**

**Secondary classification: POSSIBLE CONTRIBUTOR** only under historical conditions:

- Admin OVERVIEW open with **shorter poll interval** (30s documented in MEMORY) and/or **5-minute** live window with active heartbeats filling the window, **plus** multiple concurrent admins.

**Not supported as primary cause for Sep 28–30, 2026** without metrics and without analytics writes in that period.

## Immediate containment (if runaway returns)

Report-only (no production changes made in this sprint):

1. Close admin **Revenue → OVERVIEW** tabs (stops 90s polls).  
2. If API write storm suspected: temporarily disable heartbeat at deploy config (founder approval) — **not executed here**.  
3. Prefer Supabase dashboard **Query Performance** / **Logs** during spike rather than ad-hoc heavy SQL from agents.

## RLS advisory (same project)

Performance/security advisors report **RLS disabled** on `site00_production_invalidation_events` and `site00_production_dependency_edges`. Unrelated to globe but increases blast radius of anon/authenticated access — founder decision required before enabling RLS.
