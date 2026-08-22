# Repository Evidence

Evidence records explain **why SITE 00 believes something exists** without treating code presence as completion.

## Evidence Lineage

Every imported record retains:

| Field | Purpose |
|-------|---------|
| `organization_id` | Owning project |
| `source_system` | e.g. github, local_filesystem |
| `repository` | e.g. `yoteenz/SITE00`, `yoteenz/fsbw` |
| `source_identifier` | Commit SHA, tree SHA, or scan id |
| `source_path` | File or directory path |
| `observed_at` | When evidence was collected |
| `evidence_type` | route, api, migration, test, workflow, component, etc. |
| `workstream_id` / metadata.workstream_key | Related workstream |
| `confidence` | HIGH, MEDIUM, LOW, UNKNOWN |
| `metadata` | Additional normalized findings |

## Ingestion Sources

### Local filesystem (SITE 00 self-reconciliation)

`inventoryLocalSite00(workspaceRoot)` scans this repository for:

- Routes, pages, API handlers
- Migrations, tests, workflows
- Email pack, orchestration, admin surfaces

### GitHub read-only (external repos)

`inventoryGitHubSnapshot(owner, repo, tree)` uses authenticated GitHub API:

- **yoteenz/SITE00** — SITE 00 self
- **yoteenz/fsbw** — Frontal Slayer + Studio World (shared repo, separate logical ownership)

Evidence is tagged to the correct organization via workstream patterns in `repositoryInventory.ts`.

## Evidence ≠ Completion

| Observation | Does NOT imply |
|-------------|----------------|
| Route exists | Feature complete |
| Table exists | Workflow complete |
| Test exists | Production ready |
| Commit exists | Launch ready |

Reconciliation may suggest state changes; admin approval required.

## Freshness

Records store `observed_at` and optional `source_commit`. Old observations do not prove current runtime readiness. Future sprints will trigger revalidation when drift is detected.

## Security

- GitHub token server-side only (`SITE00_GITHUB_TOKEN`)
- Read-only repository access
- No credentials exposed to browser
