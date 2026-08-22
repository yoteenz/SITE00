# External Project Reconciliation

Sprint 02 connects SITE 00 orchestration to real registered projects and runs evidence-backed reconciliation.

## Scope

SITE 00 orchestrates; it does **not** become external project databases. It stores:

- Organization/project registry references
- External connection records (truthful states only)
- Normalized evidence with lineage
- Reconciliation suggestions and admin decisions
- Provisional launch manifests and readiness

## Registered Projects (Sprint 02)

| Slug | Classification | Role |
|------|----------------|------|
| `site-00` | INTERNAL_BRAND_PLATFORM | SITE 00 platform |
| `frontal-slayer` | INTERNAL_BRAND | Flagship brand |
| `all-in-one-enterprises` | MANAGED_BRAND | Managed client brand |
| `studio-world` | PRODUCTION_INFRASTRUCTURE | Production engine (not client-facing) |

## Reconciliation Outcomes

Each workstream/requirement finding is classified:

- **CONFIRMED** — multiple independent evidence sources agree
- **PROBABLE** — strong repository evidence, no runtime validation
- **CONFLICT** — evidence contradicts declared state
- **MISSING_EVIDENCE** — insufficient observation
- **NEWLY_DISCOVERED** — found in repo, not previously declared
- **REQUIRES_REVIEW** — needs admin judgment

## Admin Review Flow

1. Evidence ingested (GitHub tree, local inventory, signals)
2. `runReconciliation` creates suggestion with confidence (HIGH / MEDIUM / LOW / UNKNOWN)
3. Item enters Command Queue category **NEEDS YOU**
4. Admin decides: **ACCEPT** | **MODIFY** | **REJECT**
5. Decision writes orchestration event; only ACCEPT/MODIFY apply state changes

## Rules

- **Code exists ≠ feature complete** — routes/tables/tests/commits do not auto-complete requirements
- **Unknown stays unknown** — prefer MISSING_EVIDENCE over guessing
- **Deferred scope excluded from readiness** — e.g. AIO social marketing in EVOLVE
- **Current launch target ≠ master roadmap** — manifests use `master_roadmap_count` and `is_provisional`

## API

```
GET  /api/admin/site00-orchestration?action=debug
POST /api/admin/site00-orchestration { "action": "bootstrap" }
POST /api/admin/site00-orchestration { "action": "reconcile-decide", "reconciliationId", "decision" }
POST /api/admin/site00-orchestration { "action": "reconcile", "organizationSlug", "requirementKey", "declaredState" }
```

## Debug UI

`/admin/site00/debug/orchestration` — project health, provisional baselines, reconciliation review, evidence sample, command queue.

## Limitations (Sprint 02)

- AIO GitHub repository not accessible from current token — reconciliation partial
- Studio World live signal ingestion prepared; not all signal types emitted yet
- Approved admin dashboard not wired (next sprint)
- Fixtures remain in memory mode for unit tests only (`ORCHESTRATION_USE_MEMORY=1`)
