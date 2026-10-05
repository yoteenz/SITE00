# Existing Project Ingestion

Sprint 01 established intake architecture. **Sprint 02 completed deep repository reconciliation and real registry bootstrap.**

See also: `EXTERNAL_PROJECT_RECONCILIATION.md`, `REPOSITORY_EVIDENCE.md`, `LAUNCH_BASELINE_ESTABLISHMENT.md`.

## Intake Fields

| Field | Purpose |
|-------|---------|
| project_name | Display name |
| organization | Brand/org association |
| project_classification | INTERNAL_BRAND, MANAGED_BRAND, etc. |
| project_type | Site, app, platform, etc. |
| existing_or_new | EXISTING or NEW |
| current_state | Declared current state |
| repository_reference | GitHub URL or slug |
| production_engine | e.g. STUDIO_WORLD |
| known_database | Supabase project ref |
| known_deployment | Deployment provider |
| current_objective | Stated business objective |
| current_launch_target | Declared launch target |

## Post-Registration State

After registration: `RECONCILIATION_REQUIRED`

The system is ready for Sprint 02 to inspect external evidence.

## API

```
POST /api/admin/site00-orchestration
{ "action": "ingest-project", "projectName": "...", ... }
```

## Database

`site00_project_ingestions`

## Rules

- Do not fake cross-repository integrations
- Do not duplicate external application databases
- Do not mark debug fixtures as production truth
- Ingestion creates a record — it does not reconcile

## Sprint 02

Will connect GitHub, inspect repos, ingest Studio World signals, and establish real launch baselines.
