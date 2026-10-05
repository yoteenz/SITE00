# Pending Supabase migrations (SITE 00)

Project: **FS Website** · ref `hyycomvcaqxxvyrfupes`

## When the cloud agent cannot reach the database

If `GET $SUPABASE_URL/auth/v1/health` returns **522** or MCP `list_migrations` times out, the project API/database origin is unreachable from the agent. Open [Supabase Dashboard → Project](https://supabase.com/dashboard/project/hyycomvcaqxxvyrfupes) and confirm status. If the project was recently unpaused, wait until health checks pass before applying SQL.

## Apply from your machine (recommended)

```bash
supabase login
bash scripts/supabase/apply-pending-site00-migrations.sh
```

Or manually: **SQL Editor** → run each file below in timestamp order (idempotent `create table if not exists` where used).

## Likely not yet on remote (since 2026-09-16 audit)

Verify on **Database → Migrations** before re-running:

| Version | File |
|---------|------|
| `20260921120000` | `site00_page_concept_generation_runs.sql` |
| `20260929153000` | `site00_marketing_commercial_state.sql` |
| `20260929160000` | `site00_identity_commercial_state.sql` |
| `20261001150000` | `site00_existing_location_service.sql` |
| `20261001200000` | `site00_experience_compiler_creative_director.sql` |

## Post-apply verification

```sql
select version, name from supabase_migrations.schema_migrations
order by version desc limit 10;
```

Creative Director tables (if latest migration applied):

```sql
select to_regclass('public.site00_ec_creative_threads') as creative_threads;
```
