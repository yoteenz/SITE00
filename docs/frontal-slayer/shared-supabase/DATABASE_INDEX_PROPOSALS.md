# Database index proposals (DDL not applied)

**Project:** `hyycomvcaqxxvyrfupes`  
**Authorization:** Founder gate required · **no migrations in this sprint**

## 1. `site_analytics_events` — live presence + analytics

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_analytics_events_type_created
  ON public.site_analytics_events (event_type, created_at DESC);
```

| Benefit | Faster `event_type = page_view` + time window + order |
| Locking | `CONCURRENTLY` minimizes writes block |
| Disk | moderate (~table size dependent) |
| Rollback | `DROP INDEX idx_site_analytics_events_type_created;` |
| Window | Off-peak · monitor I/O |

## 2. `site_analytics_events` — social aggregate

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_analytics_events_social_created
  ON public.site_analytics_events (event_type, created_at DESC)
  WHERE event_type = 'social_click';
```

Partial index smaller than full composite.

## 3. `site00_senior_creative_judgments` — time-ordered admin scans

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site00_senior_judgments_created
  ON public.site00_senior_creative_judgments (created_at DESC);
```

Existing: `idx_site00_senior_judgments_campaign (campaign_id)`.

## 4. `site00_campaign_copy_packages` — list by recency

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site00_campaign_copy_updated
  ON public.site00_campaign_copy_packages (updated_at DESC);
```

Existing: `idx_site00_campaign_copy_campaign`.

## 5. `site00_methodology_validation_runs` — mode filter

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site00_methodology_runs_org_mode_updated
  ON public.site00_methodology_validation_runs (organization_id, mode, updated_at DESC);
```

## Maintenance

- Run `ANALYZE` after index create.
- Re-check `pg_stat_user_tables` seq_scan vs idx_scan after 24–48h production traffic.

**Count proposed:** 5 indexes (4 new + 1 partial variant counted separately = **5**)
