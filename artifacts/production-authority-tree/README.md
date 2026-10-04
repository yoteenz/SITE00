# Production Authority Tree — COMPOSER1

**Sprint:** `P0.STUDIOOS.PRODUCTION.AUTHORITY-TREE.COMPOSER1`  
**Purpose:** Forensic / architectural map of every reachable Production workspace surface before Opus tab-by-tab reconstruction.  
**Base implementation SHA:** `269f2af563b5e69044c4afa41a6a72605a284ae1` (branch `cursor/production-authority-convergence-opus2` lineage)  
**Runtime delta:** None — documentation and manifest only.

## Governing principle

**Parent → child → grandchild → interaction inheritance.** Descendants may specialize functionally; they must not drift to unrelated design systems, generic SaaS, or legacy Production generations without explicit `LEGACY_LOCKED` classification.

## Production root canon (bottom nav)

Seven lenses of the **same** project shell (`ProductionAuthorityFrame`):

| Tab | Route anchor |
|-----|----------------|
| HUB | `/production` |
| INBOX | `/production/queue` |
| DESIGN | `/production/:projectSlug/design?mode=` |
| EXPERIENCE | `/production/:projectSlug/experience` |
| EXPRESSION | `/production/:projectSlug/expression` |
| LIBRARY | `/production/libraries` |
| ACTIVITY | `/production/activity` |

Persistent chrome (header + bottom nav) is part of every authority evaluation.

## Deliverables

| File | Role |
|------|------|
| [MASTER_TREE.md](./MASTER_TREE.md) | Full hierarchy (routes + sections + interactions) |
| [tabs/](./tabs/) | Per-tab deep trees (01–07) |
| [NODE_MATRIX.md](./NODE_MATRIX.md) | Classified node matrix (161 nodes) |
| [INHERITANCE_MATRIX.md](./INHERITANCE_MATRIX.md) | Parent→child must-inherit rules |
| [INTERACTION_INVENTORY.md](./INTERACTION_INVENTORY.md) | Non-route interactions |
| [RESPONSIVE_TREE.md](./RESPONSIVE_TREE.md) | Breakpoint structural behavior |
| [STALE_FALLBACK_MAP.md](./STALE_FALLBACK_MAP.md) | Legacy / generic fallback risks |
| [RECONSTRUCTION_ORDER.md](./RECONSTRUCTION_ORDER.md) | Recommended Opus rebuild sequence |
| [AUTHORITY_SOURCE_INDEX.md](./AUTHORITY_SOURCE_INDEX.md) | Where visual authority comes from |
| [nodes.manifest.json](./nodes.manifest.json) | Machine-readable node catalog |
| [MANIFEST_SUMMARY.json](./MANIFEST_SUMMARY.json) | Counts for sprint receipt |

## Method

1. Route definitions: `src/routes/Site00Routes.tsx`, `src/site00/config/routes.ts`, `shared/site00-production-workspace/routes.ts`
2. Registry / canon: `shared/site00-production-workspace/registry.ts`, `src/site00/config/production-authority-registry.ts`
3. Shell routing: `ProductionWorkspaceHubPage`, `ProductionWorkspaceProjectHubPage`, experience/expression shells
4. Cross-check: `artifacts/production-authority-opus2/` crawl (`descendants.json`, `STALE_SURFACE_AUDIT.md`) — structural convergence at Opus2; this tree adds inheritance, interaction, responsive, and honest UNMOUNTED labels

## Regenerate matrix

```bash
node scripts/build-authority-tree-manifest.mjs
node scripts/generate-production-authority-tree.mjs
```

## Status taxonomy (required)

`REFERENCE_LOCKED` · `STRUCTURALLY_CORRECT_VISUALLY_WRONG` · `STALE_VISUAL_SYSTEM` · `PARTIAL` · `MISSING` · `UNMOUNTED` · `LEGACY_LOCKED` · `NEEDS_FOUNDER_AUTHORITY` · `UNKNOWN_REQUIRES_INSPECTION`

Do not use PASS as a substitute.
