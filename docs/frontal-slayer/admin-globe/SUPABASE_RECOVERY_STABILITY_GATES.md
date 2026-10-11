# Supabase recovery stability gates

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Project:** FS Website (`hyycomvcaqxxvyrfupes`)

## Current certification status

| Gate | Status (2026-10-11) | Evidence |
| --- | --- | --- |
| `SELECT 1` connectivity | **PASS** | MCP `execute_sql` |
| Sustained production certification | **NOT CERTIFIED** | Single probe only; no 24h metrics bundle |
| Founder write verification | **DEFERRED** | Read-only sprint |

**Do not declare the project stable based only on `SELECT 1`.**

## Required gates before “stable” declaration

### G1 — Database reads

- [ ] 10 consecutive successful service-role reads on representative tables (`profiles`, `site_analytics_events`, one `site00_*` table) via API or SQL, spaced over ≥15 minutes  
- [ ] PostgREST / API routes used by FS admin return JSON (not 522/timeout) from production API host  

### G2 — Database writes (controlled)

- [ ] One controlled INSERT + DELETE (or rollback transaction) on a **non-production test row** or staging branch — **founder-approved**  
- [ ] Heartbeat `POST /api/analytics/event` returns 201 once from staging or production with monitoring  

### G3 — Connection stability

- [ ] `pg_stat_activity` total connections stable (no monotonic climb) over 30 minutes under normal traffic  
- [ ] No pgbouncer “max client connections” errors in logs (24h sample)  

### G4 — Compute headroom (dashboard)

- [ ] CPU average < 70% for 1 hour during business traffic  
- [ ] Memory / swap not pegged sustained  
- [ ] Disk I/O balance not continuously exhausted  
- [ ] **Blocked from agent** if dashboard access unavailable — mark **NOT CERTIFIED**  

### G5 — Query behavior

- [ ] No single query pattern > 30% of DB time for 15 minutes (Query Performance view)  
- [ ] No repeated statement timeouts in postgres logs  

### G6 — Globe-specific (when feature used)

- [ ] Admin opens `/admin/revenue` OVERVIEW for 30 minutes: live-presence p95 acceptable; no error storm  
- [ ] ≤ N concurrent live-presence DB queries (define N = 3 per project)  

## Monitoring checklist (founder / ops)

1. Supabase dashboard → **Database** → health + disk  
2. **Logs** → Postgres errors, PostgREST 5xx  
3. **Query performance** → top statements during admin usage  
4. Vercel/Railway API logs for `/api/admin/live-presence` latency  

## Certification blocked when

- Historical metrics for incident window unavailable **and** no live 24h clean run  
- Analytics pipeline still idle (globe visitor layer untested in production)  
- Outstanding migration drift or active agent migration batches  

## Re-test cadence after remediation

| Phase | Action |
| --- | --- |
| T+0 | Index / API deploy  
| T+1h | G1, G3, G6  
| T+24h | G4 via dashboard  
| T+7d | Retention / table size review |

## Sign-off template

```
PROJECT: hyycomvcaqxxvyrfupes
CERTIFIED_BY: ___
DATE_UTC: ___
G1-G6: PASS / FAIL (list failures)
GLOBE_LOAD_TEST: PASS / FAIL / SKIPPED
NOTES: ___
```

Until sign-off: **DATABASE_STABILITY = NOT CERTIFIED**.
