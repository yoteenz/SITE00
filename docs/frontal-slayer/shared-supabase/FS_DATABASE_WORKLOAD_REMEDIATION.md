# FS database workload remediation

**Repo:** `yoteenz/fsbw`  
**Branch:** `cursor/shared-supabase-workload-containment-9839`  
**Status:** Code ready — **no production deploy authorized**

## Implemented

| Area | File | Change |
| --- | --- | --- |
| Live globe DB read | `api/admin/live-presence.ts` | Row cap **5000 → 2000**; **60s** in-process cache (`api/_lib/adminLivePresenceCache.ts`); structured log when slow or cap hit |
| Admin social analytics | `api/admin/analytics.ts` | Aggregate scan **100k → 5000**; exact total via `count: 'exact', head: true`; response fields `aggregatesTruncated`, `totalFromScan` |
| Client poll storm | `src/pages/admin/revenue/page.tsx` | Skip live-presence fetch when `document.visibilityState === 'hidden'` |

## Behavior notes

- **Cache** is best-effort on warm serverless instances (same as rate-limit intent in PR #1602 remediation plan).
- When `aggregatesTruncated: true`, breakdown buckets reflect **recent 5000** social clicks only; `total` remains exact count.
- Storefront heartbeat (`POST /api/analytics/event`) unchanged — still idle per forensics.

## Recommended next (not implemented — founder gate)

- Composite index `(event_type, created_at DESC)` on `site_analytics_events` (see `DATABASE_INDEX_PROPOSALS.md`).
- SQL-side `DISTINCT ON (visitor_id)` for live presence.
- Retention job for stale `page_view` rows.

## Verification (staging / post-deploy)

1. Admin → Revenue → OVERVIEW: network shows live-presence at 90s intervals; hidden tab stops polls.
2. `GET /api/admin/analytics` returns JSON with `total` and truncation flags.
3. Supabase Query Performance: fewer rows read per analytics admin load.
