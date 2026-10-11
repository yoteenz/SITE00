# FS Admin Globe — data flow audit

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Supabase project:** FS Website (`hyycomvcaqxxvyrfupes`)  
**Globe source repository:** `yoteenz/fsbw` (forensic clone `4097645e` on `master`)  
**Note:** The live 3D globe is **not** present on `yoteenz/SITE00` `main` at `3cd487e2`. Both products share the same Supabase project.

## Route and entry

| Item | Value |
| --- | --- |
| Admin route | `/admin/revenue` |
| Globe visibility | **OVERVIEW** tab only (`REVENUE_TABS[0]`) |
| Lazy component | `AdminRevenueLiveGlobe` from `src/components/admin/AdminRevenueLiveGlobe.tsx` |
| WebGL embed | Optional iframe from `VITE_ADMIN_GLOBE_EMBED_URL` → `embed/admin-globe` (globe.gl + three, isolated bundle) |
| Fallback | SVG equirectangular map when embed URL unset |

## End-to-end flow

```
Admin opens /admin/revenue?tab=OVERVIEW (default)
  → AdminRevenue page mounts
  → Orders list built from localStorage (buildRevenueOrdersList) — NOT Supabase on the hot path
  → useMemo: buildOrderGlobeClustersFromRevenueOrders(orders) — client-only geography
  → useEffect (OVERVIEW only): fetchLiveGlobe() immediately
  → setInterval fetchLiveGlobe every LIVE_GLOBE_REFRESH_MS (90_000)
  → fetchLiveGlobe → getAdminLivePresence() → GET /api/admin/live-presence
  → API: service-role SELECT on site_analytics_events (page_view, 24h window, LIMIT 5000)
  → Dedupe by visitor_id in Node; map to visitor globe points
  → AdminRevenueLiveGlobe merges visitorPoints + orderPoints (postMessage to iframe or SVG)
  → WebGL rendering: browser GPU only (no Postgres)

Parallel (once per revenue page mount, admin only):
  → getAdminRevenue() → GET /api/admin/revenue → SELECT orders.active_orders, past_orders

Sitewide (all routes, not globe-specific):
  → App.tsx startLivePresenceHeartbeat (deferred)
  → Every HEARTBEAT_MS (60_000): POST /api/analytics/event page_view + geo meta
  → Inserts into site_analytics_events (write load feeds live-presence reads)
```

## What is NOT in the database path

- Order pillars / cluster towers: derived from **localStorage** revenue orders and shipping-address heuristics (`orderShippingToGlobePoint`, `adminOrderGlobeClusters`).
- Land mesh, boundaries, H3 prisms: static assets + embed bundle (`adminGlobeNe110mLand`, `adminGlobeBoundaryPaths`).
- Profile photos on cluster panel: `registeredUsers` in localStorage + enrich helpers.

## Cleanup on unmount

- `setInterval` cleared when leaving OVERVIEW tab or unmounting revenue page (`return () => clearInterval(id)`).
- Heartbeat interval is **global** (started once in `App.tsx`); it is **not** stopped when the globe unmounts.
- No Supabase Realtime channels; nothing to unsubscribe on the DB side.

## Browser vs database cost

| Layer | Cost type |
| --- | --- |
| globe.gl / three iframe | GPU + main-thread; can affect **admin browser** stability (documented in fsbw MEMORY: chunk size, mobile white screens) |
| live-presence poll | One bounded SQL read per poll per admin session on OVERVIEW |
| page_view heartbeat | One INSERT per active tab per minute sitewide |
| Order globe geometry | CPU on client only |

Postgres exhaustion requires **database** work (reads, writes, migrations, large scans). WebGL alone does not explain Supabase compute restarts.

## Related admin surfaces (not the revenue globe)

- `/admin/analytics` and brand analytics use `GET /api/admin/analytics` (separate from live-presence).
- `/admin/brand` social analytics shares `site_analytics_events` but not the globe component.
