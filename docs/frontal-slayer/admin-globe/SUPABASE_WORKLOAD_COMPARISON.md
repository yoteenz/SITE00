# Supabase workload comparison — FS Globe vs other consumers

**Sprint:** `P0.FS.ADMIN.GLOBE-SUPABASE-RESOURCE-FORENSICS-AND-OUTAGE-ROOT-CAUSE1`  
**Date:** 2026-10-11  
**Project:** `hyycomvcaqxxvyrfupes` (FS Website)

Single Postgres project serves **Frontal Slayer storefront + admin**, **Studio OS**, **Slay Forecast**, **PSA**, and **SITE 00** EVOLVE / expression / intake tables.

## FS Admin Globe (suspect)

| Workload | Read / write | Typical trigger | Scale (2026-10-11 snapshot) |
| --- | --- | --- | --- |
| `GET /api/admin/live-presence` | Read up to 5000 analytics rows | Admin on `/admin/revenue` OVERVIEW every 90s | Low today (no page_views in last 24h) |
| `POST /api/analytics/event` page_view | INSERT | All site visitors, 60s heartbeat | **Idle** since 2026-08-08 |
| Order globe | None | localStorage | N/A |
| WebGL embed | None | iframe | N/A |

## Other FS Admin (same repo, same DB)

| Feature | API / table | Pattern | Risk note |
| --- | --- | --- | --- |
| Brand / social analytics | `GET /api/admin/analytics` | `social_click` up to **100k** rows | Low row count today (1 row) |
| Client activity | `api/admin/activity.ts` | `user_activity` reads | 4,293 rows; low idx_scan vs seq_scan |
| Revenue API | `api/admin/revenue.ts` | Full `orders` select | Unbounded pattern; 0 rows today |
| PSA chat | `psa_messages`, threads | Chat persistence | Moderate row counts |
| Studio / Slay Forecast | `slay_forecast_*`, `studio_*` | Jobs, renders, audit | Burst writes during generation |
| Membership / Stripe | `membership_payments` | Webhook driven | Spiky |

## SITE 00 (yoteenz/SITE00 on same Supabase)

| Feature | Tables / APIs | Pattern | Risk note |
| --- | --- | --- | --- |
| Senior creative judgments | `site00_senior_creative_judgments` | `select('*')` lists | **Largest heap** (~55 MB, 6480 rows) |
| Campaign copy | `site00_campaign_copy_packages`, versions | Frequent reads | **7660 seq_scans** on packages (stats snapshot) |
| Methodology validation | `site00_methodology_validation_runs` | Admin / batch | High seq_scan relative to size |
| EVOLVE marketing | 20+ `site00_marketing_*` | Campaign ops | Moderate |
| Intake / identity / client reviews | `site00_*intake*`, reviews | Admin + API | Spiky during sprints |
| Digital Foundation | `site00_idnty_submissions`, etc. | API from Railway | Not globe-related |

## Digital Foundation on same project?

**Yes.** `VITE_SUPABASE_URL` for SITE 00 points at this project (documented in motherboard). DF and FS workloads **share compute**.

## Storefront vs admin globe

| Source | DB pressure |
| --- | --- |
| Public shoppers | Heartbeat INSERTs (when API live), cart/wishlist, analytics |
| Admin globe | Bounded SELECT poll + optional revenue SELECT |
| Cloud agents / migrations | DDL + bulk DML spikes (documented 522/timeout episodes) |

## Ranking (qualitative, current snapshot)

1. **SITE00 expression / copy / judgment** storage and unbounded list queries — **highest static table weight**  
2. **Migration + agent** activity — **highest episodic outage correlation** in project MEMORY  
3. **Globe live-presence + heartbeat** — **moderate design risk**, **low current measured load** (stale analytics pipeline)  
4. **WebGL rendering** — **client-only**

## Conclusion

The globe is **one consumer** among many on a **shared** Supabase instance. Resource exhaustion is **plausible** from combined SITE 00 + FS workloads; **not proven** that the globe was the dominant query during Sep 28–30 without dashboard metrics.
