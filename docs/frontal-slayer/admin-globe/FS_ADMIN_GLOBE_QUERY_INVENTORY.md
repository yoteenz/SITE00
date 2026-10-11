# FS Admin Globe — query inventory

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Source repo:** `yoteenz/fsbw` @ `4097645e`

Each row is a **database-touching** step tied to the globe experience or its feed. Rendering steps are omitted.

## Q1 — Live presence (globe visitors)

| Field | Value |
| --- | --- |
| **ID** | `live-presence-page-view` |
| **Source file** | `api/admin/live-presence.ts` |
| **Call site** | `src/utils/api.ts` → `getAdminLivePresence()`; invoked from `src/pages/admin/revenue/page.tsx` `fetchLiveGlobe` |
| **HTTP** | `GET /api/admin/live-presence` |
| **Tables** | `public.site_analytics_events` |
| **Filters** | `event_type = 'page_view'`, `created_at >= now() - 24h` |
| **Sort** | `created_at DESC` |
| **Joins** | None |
| **Row limit** | 5000 (PostgREST `.limit(5000)`) |
| **Pagination** | None (single page) |
| **Frequency** | On OVERVIEW tab mount + every **90s** while OVERVIEW stays active |
| **Concurrency** | One poll loop per admin browser tab on revenue OVERVIEW |
| **Est. result size** | Up to 5000 rows over the wire; deduped to unique `visitor_id` in API (typically far smaller) |
| **Index coverage** | `EXPLAIN` (2026-10-11, no ANALYZE): **Index Scan** on `site_analytics_events_created_at_desc_idx` with filter on `event_type`. No composite `(event_type, created_at)` index. |
| **Cleanup** | Interval cleared when tab ≠ OVERVIEW or component unmounts |
| **Unbounded?** | **No** (hard limit 5000) |

## Q2 — Revenue totals (overview cards, not globe geometry)

| Field | Value |
| --- | --- |
| **ID** | `admin-revenue-orders-json` |
| **Source file** | `api/admin/revenue.ts` |
| **Call site** | `getAdminRevenue()` once on revenue page mount (`useEffect` in `page.tsx`) |
| **HTTP** | `GET /api/admin/revenue` |
| **Tables** | `public.orders` |
| **Filters** | None (full table select) |
| **Sort** | None |
| **Joins** | None |
| **Row limit** | None (select two JSON columns for all rows) |
| **Pagination** | None |
| **Frequency** | Once per revenue page load (admin + Supabase configured) |
| **Est. result size** | **0 live rows** in production snapshot (`orders` count 0); cheap today, pattern is unbounded if many order blobs exist |
| **Index coverage** | PK only |
| **Globe-specific?** | **No** — overview metrics only; globe orders use localStorage |

## Q3 — Page view ingest (feeds Q1, sitewide)

| Field | Value |
| --- | --- |
| **ID** | `analytics-event-page-view` |
| **Source file** | `api/analytics/event.ts` |
| **Call site** | `src/utils/livePresenceHeartbeat.ts` → `postPageView`; started from `src/App.tsx` |
| **HTTP** | `POST /api/analytics/event` |
| **Tables** | `public.site_analytics_events` |
| **Filters** | N/A (INSERT) |
| **Frequency** | **60s** per browser tab + on visibility visible |
| **Row limit** | 1 insert per tick |
| **Globe-specific?** | **No** — all storefront/admin client routes; powers visitor dots when geo present |
| **Production note** | Table max `created_at` = **2026-08-08** (97,984 rows total). Heartbeat inserts appear **stale** since August 2026 in this project snapshot. |

## Q4 — Social analytics aggregate (NOT globe UI; shared table risk)

| Field | Value |
| --- | --- |
| **ID** | `admin-analytics-social-aggregate` |
| **Source file** | `api/admin/analytics.ts` |
| **Call site** | Brand / analytics admin pages |
| **Tables** | `site_analytics_events` |
| **Filters** | `event_type = 'social_click'` |
| **Row limit** | **100000** |
| **Globe-specific?** | **No** |
| **Risk** | Pattern is a large read; today only **1** social_click row exists |

## Summary counts (globe session)

| Metric | Value |
| --- | --- |
| Distinct Supabase queries in globe UI path | **2** (`live-presence`, optional `admin/revenue`) |
| Recurring query while globe visible | **1** (`live-presence` every 90s) |
| Realtime subscriptions | **0** |
| Unbounded globe queries | **0** |
| Order globe data SQL | **0** (localStorage) |

## SITE00 shared project (cross-check, not globe)

These run against the same Supabase project from `yoteenz/SITE00` APIs and can dominate resources without any FS admin globe:

| Pattern | File | Risk |
| --- | --- | --- |
| `select('*')` on `site00_senior_creative_judgments` | `api/_lib/site00ExpressionEngine/.../creativeIntelligenceSupabaseStore.ts` | Unbounded; **~6,480 rows**, **~55 MB** table |
| Campaign copy package reads | `campaignCopySupabaseStore.ts` | High **seq_scan** count on `site00_campaign_copy_packages` in `pg_stat_user_tables` |
| Many `site00_*` admin / EVOLVE routes | `api/admin/site00-*.ts` | Feature-dependent |

See `SUPABASE_WORKLOAD_COMPARISON.md`.
