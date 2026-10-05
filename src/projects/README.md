# `src/projects/` — ingested project bodies

SITE 00 = HOST. Everything under `src/projects/<slug>/` is a PROJECT body ingested into SITE 00
(P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1). JURNL is the first.

## Firewall

| Layer | Owns | Lives in |
|-------|------|----------|
| SITE 00 host | workspace shell, project selection, viewport machinery, review controls, routing, Studio OS | `src/site00/**`, `shared/**` |
| Project | brand, typography, colour, imagery, components, screens, interactions, copy | `src/projects/<slug>/**` |

- `src/projects/<slug>/data/**` — data only (records, screen tree, copy, contract). No CSS, no components.
  The host may import it to **inspect** the project.
- `src/projects/<slug>/runtime/**` — the project's live UI. Mounted **only** through the generic
  project-runtime route `/production/:projectSlug/runtime/*` (lazy, registry-driven). The host never imports it.
- Project CSS is scoped under the project root class (`.jrn` for JURNL). No `:root`, no `body`, no host classes.
- Project fonts live in `public/site00/projects/<slug>/fonts/` under project-scoped family names.

Tests: `tests/jurnlF01*.test.ts` enforce the firewall (host never imports runtime; runtime never imports host UI).
