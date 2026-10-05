# SITE 00 — Ground Zero (P0.SITE00.GROUND-ZERO-FULL-PRODUCT-COMPLETION-AUTHORITY-TREE-FORENSIC1)

Forensic, planning and canon only. These files describe the repo at `eedc9c8`.

- No code changed.
- No routes or tree changes applied.
- No generations.
- No client accounts.
- No AIO or Frontal Slayer edits.

**Start here:** `SITE00_GROUND_ZERO_MASTER_BRIEF.md`. For the second-opinion review, start with `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md`.

| Group | Files |
|---|---|
| Brief | `SITE00_GROUND_ZERO_MASTER_BRIEF.md`, `SITE00_FULL_PRODUCT_INVENTORY.json` |
| Current truth | `SITE00_CURRENT_DISCOVERED_PAGE_TREE.json`, `evidence/` |
| Opus proposal (PROPOSED_BY_OPUS) | `SITE00_OPUS_RECOMMENDED_CANONICAL_PAGE_TREE.json`, `SITE00_OPUS_TREE_RECOMMENDATION.md`, `SITE00_PAGE_TREE_CHANGELOG.json`, `SITE00_OPUS_PROPOSED_FAMILY_TREE.json`, `SITE00_OPUS_PROPOSED_SCREEN_TREE.json`, `SITE00_PRODUCTION_DISPOSITION_MAP.json` |
| Alternative + comparison | `SITE00_OPUS_ALTERNATIVE_TREE.json`, `SITE00_TREE_TRADEOFF_MATRIX.md` |
| Independent review | `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md` / `.json`, `SITE00_TREE_REVIEW_QUESTIONS.md` |
| Design canon | `SITE00_DESIGN_LANGUAGE_CANON.json`, `SITE00_VISUAL_AUTHORITY_REGISTRY.json`, `SITE00_COMPONENT_VISUAL_RULES.json`, `SITE00_RESPONSIVE_VISUAL_RULES.json`, `SITE00_PUBLIC_SURFACE_RULES.json`, `SITE00_WORKSPACE_SURFACE_RULES.json`, `SITE00_CLIENT_APP_SURFACE_RULES.json` |
| Completion | `SITE00_INCOMPLETE_SURFACE_MAP.json`, `SITE00_AUTHORITY_REUSE_MATRIX.json`, `SITE00_MISSING_AUTHORITY_PLAN.json` |
| Systems audits | `SITE00_CLIENT_APP_GAP_MATRIX.json`, `SITE00_PRODUCTION_WORKSPACE_GAP_MATRIX.json`, `SITE00_AUTH_PERMISSION_MAP.json`, `SITE00_PROJECT_REGISTRY_MAP.json`, `SITE00_REVIEW_APPROVAL_MAP.json`, `SITE00_PROJECT_FIREWALL_MAP.json` |
| Plans | `SITE00_CLIENT_READY_MVP.json`, `SITE00_FULL_COMPLETION_PLAN.json`, `SITE00_PARALLEL_EXECUTION_PLAN.json` |

The companion client-room sprint is in `../client-project-room/`.

**Method.**

- **Routes.** These were extracted with the TypeScript compiler AST from `src/App.tsx`, `src/routes/Site00Routes.tsx` and `src/routes/Site00AdminRoutes.tsx`. Raw output: `evidence/routes_ast_extraction.json`.
- **Audits.** Eight read-only code audits are in `evidence/`.
- **Not run locally.** Build, typecheck and tests could not run, because the npm registry is blocked in the audit environment. CI status for `main` was read from GitHub Actions instead.
