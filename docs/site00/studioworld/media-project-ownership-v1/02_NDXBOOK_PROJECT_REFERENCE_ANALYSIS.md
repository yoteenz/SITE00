# 02 — NDXBOOK reference analysis

NDXBOOK models **independent founder media work** via:

- Founder index slug `ndxbook` with org UUID in `orgRegistry`
- `PROJECT_INDEX_CANONICAL_ORDER` placement (peer to infrastructure, not child)
- `managedProjectRegistry` row (`MANAGED_BRAND`, `designEnabled: true`)
- Production workspace routes `/production/ndxbook/*`
- Project detail surfaces under `/projects/ndxbook`

THE EXCHANGE reuses **project-level semantics** (own slug, org id, index row, production switcher, scoped URLs) but **not** NDXBOOK story, Expression Entry 002, or design-first website reconstruction (`designEnabled: false`, `productionSpine: true`).
