# External System Registry

Generic abstraction for systems SITE 00 orchestrates against.

## System Types

| Type | Example |
|------|---------|
| GITHUB_REPOSITORY | yoteenz/SITE00 |
| STUDIO_WORLD | Production engine |
| SUPABASE_PROJECT | Database project |
| DEPLOYMENT_PROVIDER | GoDaddy cPanel |
| EMAIL_PROVIDER | Transactional email |
| ANALYTICS_PROVIDER | Web analytics |
| OTHER | Custom integrations |

## Connection Record

| Field | Purpose |
|-------|---------|
| organization_id | Owning brand/org |
| external_system_id | System type |
| logical_name | Human label |
| connection_state | NOT_CONNECTED, CONNECTED, TO_BE_CONNECTED_IN_SPRINT_02 |
| external_identifier | Repo slug, project ref, etc. |
| environment | production, staging, etc. |
| sync_state | NEVER_SYNCED, SYNCING, SYNCED, ERROR |
| last_sync_at | Last successful sync |
| health_state | UNKNOWN, HEALTHY, DEGRADED, ERROR |
| secret_ref | Server-side credential reference (never client-side) |

## Rules

- No fake connection represented as live
- No provider secrets client-side
- Studio World and Frontal Slayer may share a physical repository but are **different logical systems**

## Database Tables

- `site00_external_systems` — system type catalog
- `site00_external_connections` — per-org connections

## Signals & Evidence

External activity produces **signals** → **evidence records** → optional **reconciliation suggestions**.

Evidence **does not** automatically mark requirements complete.

## Sprint 02 Handoff

- Live GitHub connection for FS, AIO, SITE 00
- Studio World signal ingestion
- Deployment provider health checks
