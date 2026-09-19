# SITE 00 — Visual Reconstruction P0.VR.2

**Master Design Reconstruction Workspace + Canonical Reference Registry + Mobile/Desktop Shell Rebuild Pipeline**

## Objective

Formalize the visual reconstruction methodology proven across NDXBOOK into a permanent Studio World production workspace.

## Routes

| Route | Purpose |
|-------|---------|
| `/studio-world/design` | Master Design workspace (all projects) |
| `/projects/:projectSlug/design` | Project-scoped Design workspace |

## Module

`shared/site00-studio-world-production/visualReconstruction/p0vr2/`

- `CanonicalVisualReference` — versioned reference registry (mobile/desktop independent)
- `FunctionPreservingVisualRebuildContract` — keep function, rebuild look
- `VisualReconstructionComposerBrief` — standardized Composer handoff with actual reference path
- `VisualReferenceAssetResolver` — existing asset → reference crop → FAL image-reference (never full UI)
- `designScreenMatrix` — founder-facing mobile/desktop status matrix
- `ndxPilotRegistration` — NDXBOOK adapter seed (not global behavior)

## Core rule

**REFERENCE = DESIGN AUTHORITY**

Keep: function, routing, data, state, business logic, accessibility.

Rebuild: visual shell, layout, geometry, spacing, typography, assets when canonical reference differs.

## UI

`StudioWorldDesignWorkspace` — control bar (project, screen, viewport, reference, status), upload, match reference, REFERENCE | LIVE | COMPARE panels, screen matrix.

## Tests

`tests/visualReconstructionP0VR2.test.ts`
