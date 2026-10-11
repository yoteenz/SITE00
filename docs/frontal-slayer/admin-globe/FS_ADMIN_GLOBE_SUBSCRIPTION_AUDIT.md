# FS Admin Globe — subscription and polling audit

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Source repo:** `yoteenz/fsbw` @ `4097645e`

## Supabase Realtime

| Check | Result |
| --- | --- |
| `supabase.channel()` in admin globe tree | **None found** |
| Realtime on `site_analytics_events` | **Not used** |
| Realtime log noise (last 23h) | Available via unified logs `source = 'realtime_logs'`; **not tied to globe** in code review |

**Count: 0 Realtime subscriptions** for the globe feature.

## HTTP polling

| Mechanism | Interval | Scope | Cleanup |
| --- | --- | --- | --- |
| `LIVE_GLOBE_REFRESH_MS` | **90,000 ms** (90s) | `fetchLiveGlobe` while `activeTab === 'OVERVIEW'` | `clearInterval` on tab change / unmount |
| Initial fetch | Once on OVERVIEW enter | Same | N/A |
| `getAdminRevenue` | Once per revenue page mount | Whole revenue page | N/A (no interval) |

Historical note (fsbw `motherboard/MEMORY.md`): poll was **30s** before later tuning; live window was **5 minutes** before expansion to **24 hours** (`LIVE_WINDOW_MS` in `api/admin/live-presence.ts`). Older configs increased read volume if many `page_view` rows existed in-window.

## Sitewide heartbeat (feeds globe visitors)

| Mechanism | Interval | Scope | Cleanup |
| --- | --- | --- | --- |
| `HEARTBEAT_MS` in `livePresenceHeartbeat.ts` | **60,000 ms** | Every route after App load (deferred start) | Runs for app lifetime; **not** stopped when globe unmounts |
| `visibilitychange` | Extra tick when tab visible | Same | N/A |

Each tick: optional ipapi.co fetch (external, not Supabase) + **INSERT** `site_analytics_events` (`page_view`).

## iframe postMessage (not Supabase)

`AdminRevenueLiveGlobe` ↔ `embed/admin-globe` uses `postMessage` types:

- `fsbw-admin-globe`, `fsbw-admin-globe-point`, `fsbw-admin-globe-cluster`, `fsbw-admin-globe-pov`, `fsbw-admin-globe-ready`, `fsbw-admin-globe-ui-cluster-panel`

No database involvement.

## Duplicate fetch patterns

| Pattern | Assessment |
| --- | --- |
| Double live-presence on strict mode remount | Possible duplicate **first** fetch in React 18 dev; production single mount |
| Multiple admin tabs on OVERVIEW | **Independent** 90s poll loops (multiplies read QPS linearly) |
| N+1 SQL inside live-presence | **No** — single query + in-memory dedupe |

## Aggressive polling verdict

Current shipped constants (90s globe poll, 60s heartbeat) are **moderate**, not sub-second polling. Risk scales with:

1. Number of concurrent admin OVERVIEW sessions  
2. Number of storefront tabs generating heartbeats (write amplification)  
3. Width of `LIVE_WINDOW_MS` (24h × up to 5000 rows read per poll)

With **no new `page_view` rows since 2026-08-08**, live-presence reads today return **empty or tiny** sets (plan estimates ~1 row examined in 24h window).
