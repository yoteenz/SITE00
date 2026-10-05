# SITE 00 — Capability Genome (P0.SITE00.GROUND-ZERO-MATURE-CAPABILITY-GENOME-RECONCILIATION1)

This is a reconciliation of **current main `6f63aaa`** against the mature endpoint (IDEA → … → EVOLUTION). It is plan and canon only.

| What this sprint did not touch | Count |
|---|---|
| Code changes | 0 |
| Database changes | 0 |
| Paid generations | 0 |
| Client accounts | 0 |
| JURNL / AIO / Frontal Slayer runtime edits | 0 |

**Start here:** `SITE00_CAPABILITY_GENOME.md`.

| Output | What it answers |
|---|---|
| `SITE00_CAPABILITY_GENOME.json` / `.md` | All 290 canonical capabilities, with the full record schema and evidence |
| `SITE00_CAPABILITY_MATURITY_HEATMAP.json` | 0–5 maturity by capability, domain, stage and layer |
| `SITE00_MATURE_ENDPOINT_RECONCILIATION_MATRIX.json` | For each stage: what SITE 00 has, thinks it has, and lacks |
| `SITE00_CAPABILITY_DEPENDENCY_GRAPH.json` | DEPENDS_ON / UNLOCKS / PROVIDES_DATA_TO / CONSUMES_DATA_FROM / GOVERNS / IS_GOVERNED_BY / CLIENT_EXPOSES / FOUNDER_EXPOSES, plus root engines |
| `SITE00_TRUE_MISSING_CAPABILITIES.json` | The 44 capabilities with no implementation (search evidence included) |
| `SITE00_EXISTING_SYSTEM_PROMOTION_PLAN.json` | The 203 existing systems to connect, repair, merge or expand |
| `SITE00_CONCEPT_GRAVEYARD_AUDIT.json` | Never-built or abandoned ideas → REVIVE / MERGE / DEPRECATE / IGNORE |
| `SITE00_CAPABILITY_LAYER_MAP.json` | Capabilities by product layer, with reclassifications |
| `SITE00_CAPABILITY_DUPLICATION_MAP.json` | Competing implementations, plus cross-track reconciliations |
| `SITE00_CAPABILITY_CONNECTION_PLAN.json` | Built-but-unwired code, grouped by root engine |
| `SITE00_CLIENT_READY_CAPABILITY_REQUIREMENTS.json` | 31 blockers → 21 work packages → recalculated MVP timeline |
| `SITE00_POST_CLIENT_CAPABILITY_ROADMAP.json` | P0–P3 phases, FULL SITE 00 and MATURE PLATFORM estimates |
| `SITE00_CAPABILITY_REGISTRY_PROPOSAL.json` | Whether a registry exists (it does not) and what to build |
| `SITE00_DIGITAL_BUSINESS_OPERATING_MODEL.md` | The mature operating model, stage by stage |
| `SITE00_BULLETPROOF_PIPELINE_GAP_ANALYSIS.md` | Where the pipeline fails open today |
| `evidence/` | Raw audit-track JSON (348 records), the audit brief, and `VERIFICATION.json` (independent check) |

**Method.** Six read-only audit tracks covered these domains:

- business / offer / commercial / cost;
- journey / CRM / sales / support / ops / sites / control room / movement;
- marketing / content / SEO / EVOLVE;
- measurement / governance / risk / routing;
- product / expression / data / assets;
- platform / security / release / launch / maintenance.

Cross-track duplicates were merged (58). Reconciliation overrides are recorded in each record's `reconciliation_note`. Build, typecheck and tests could not run locally because the npm registry is blocked; CI state came from GitHub Actions.

**Verification.** A separate agent that did not produce the work checked all blocker records against code, plus 20 random records and 13 specific claims. It found no material errors and 10 small factual corrections, all applied. The corrections are recorded in each affected record's `reconciliation_note` and in `evidence/VERIFICATION.json`. It also flagged priorities: PRODUCTION_PIPELINE was downgraded to a foundation item, and DELIVERABLE_HANDOFF_LIBRARY and STORAGE_BUCKETS were upgraded to blockers. Some evidence lines cite earlier-sprint notes; their copies are in `../ground-zero/evidence/` and `../ground-zero/navigation/evidence/`.

**Related.** `../ground-zero/` (page tree and canon), `../client-project-room/` (client room UX), `../ground-zero/navigation/` (movement layer).
