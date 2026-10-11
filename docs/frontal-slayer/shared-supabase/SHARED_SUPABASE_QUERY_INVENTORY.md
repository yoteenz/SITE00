# Shared Supabase query inventory

**Sprint:** `P0.SITE00.FS.SHARED-SUPABASE.WORKLOAD-CONTAINMENT-AND-QUERY-STABILIZATION1`  
**Project:** FS Website · `hyycomvcaqxxvyrfupes`  
**Date:** 2026-10-11  
**Forensics baseline:** SITE00 PR #1602 · `docs/frontal-slayer/admin-globe/`

## Classification legend

| Class | Meaning |
| --- | --- |
| **CONFIRMED EXPENSIVE** | Large heap, high seq_scan, or unbounded `select('*')` on hot paths |
| **PROBABLE SCALING RISK** | Bounded today but pattern scales poorly |
| **LOW-RISK** | Indexed point reads, small limits, or idle workloads |
| **INSUFFICIENT EVIDENCE** | Cannot tie to incident without dashboard time series |

## SITE 00 (yoteenz/SITE00)

| Query pattern | Source | Route / caller | Table | Columns | Limit (before → after) | Sort | Pagination | Index | Frequency | Class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Senior judgments list | `creativeIntelligenceSupabaseStore.ts` · `listJudgmentsFromSupabase*` | Expression engine / future admin | `site00_senior_creative_judgments` | summary cols + optional `record` | none → **200 default / 1000 max page** | `created_at desc` | **range + chunked fetch** | `campaign_id` | batch / admin | **CONFIRMED EXPENSIVE** |
| Creative corrections list | same · `listCorrectionsFromSupabase*` | CI retrieval | `site00_creative_corrections` | denormalized + `record` | none → **200 / 1000** | `created_at desc` | **range + chunks** | `project_id` | batch | **PROBABLE SCALING RISK** |
| Campaign copy packages | `campaignCopySupabaseStore.ts` · `listCampaignCopyPackagesFromSupabasePage` | copy director | `site00_campaign_copy_packages` | summary cols | none → **100 / 500** | `updated_at desc` | **range** | `campaign_id` | write-heavy | **CONFIRMED EXPENSIVE** (seq_scan snapshot) |
| Campaign copy load | `loadCampaignCopyPackageFromSupabase` | API proofs | packages | `record` only | 1 row | — | — | key | per package | LOW-RISK |
| Methodology validation replays | `personalityReplay/.../supabaseStore.ts` | EVOLVE replay | `site00_methodology_validation_runs` | `record` | none → **100 default / 500 max** | `updated_at desc` | **limit** | `(org_id, updated_at)` | page load + execution | **PROBABLE SCALING RISK** |
| Marketing engagements admin | `marketingEngagements/service.ts` | `GET /api/admin/site00-marketing?action=list` | `site00_marketing_engagements` | `*` | none → **200 / 500** | `updated_at desc` | **limit** | varies | admin | PROBABLE SCALING RISK |
| ASSTS library filter | `site00Assts/service.ts` · `listFilteredLibraryAssets` | `GET .../site00-assts?action=assets` | `site00_logical_assets` | `*` | none → **2000 cap** | `asset_key` | **limit** | — | admin vault | CONFIRMED EXPENSIVE |
| ASSTS category counts | `getLibraryCategoryCounts` | library summary | logical_assets | **projection** | full table → **narrow cols** | — | — | — | library open | PROBABLE SCALING RISK |
| Admin identity detail fan-out | `adminOperations.ts` · `getIdentityDetail` | admin API | 5 related tables | `*` | unbounded → **100 each** | various | **limit** | FK cols | admin drill-down | PROBABLE SCALING RISK |
| Studio world runs | `site00StudioWorldExecution/supabaseStore.ts` | execution truth | `site00_studio_world_runs` | `*` | **50 default** (pre-existing) | `created_at desc` | limit | — | jobs | LOW-RISK |

## Frontal Slayer (yoteenz/fsbw)

| Query pattern | Source | Route | Table | Limit (before → after) | Poll / concurrency | Class |
| --- | --- | --- | --- | --- | --- | --- |
| Live globe presence | `api/admin/live-presence.ts` | `GET /api/admin/live-presence` | `site_analytics_events` | 5000 → **2000** + **60s in-process cache** | 90s OVERVIEW tab | PROBABLE SCALING RISK (low traffic today) |
| Social analytics aggregate | `api/admin/analytics.ts` | `GET /api/admin/analytics` | `site_analytics_events` | 100k scan → **5000** + exact count head | on demand | PROBABLE SCALING RISK |
| Admin activity | `api/admin/activity.ts` | `GET /api/admin/activity` | `user_activity` | **500 max** (pre-existing) | on demand | LOW-RISK |
| Revenue / orders rollup | `api/admin/revenue.ts`, `dashboard.ts` | admin | `orders` | all rows · JSON columns | on load | PROBABLE SCALING RISK (0 rows snapshot) |
| Page view heartbeat | `api/analytics/event.ts` | `POST /api/analytics/event` | `site_analytics_events` | INSERT | 60s all visitors | idle since 2026-08-08 per forensics |

## Cross-cutting

- **No Supabase Realtime** on globe path (see `FS_ADMIN_GLOBE_SUBSCRIPTION_AUDIT.md`).
- **Digital Foundation + FS + SITE 00** share one Postgres project (`CORE.md` / PR #1602).
- **Episodic DDL / agent migrations** remain highest **outage correlation** in project memory — not disproven by this sprint.
