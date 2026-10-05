# SITE 00 Visual Reconstruction — P0.VR.1D.4

**Founder board persistence + region ID alignment + actionable DOM patch execution**

Extends P0.VR.1D / P0.VR.1D.1 / P0.VR.1D.2 / P0.VR.1D.3 without new reconstruction architecture.

## Problem (from P0.VR.1D.2)

1. Founder desktop/mobile mood boards were not persisted → fixture fallback masked missing references.
2. Decomposition region IDs (`region-bottom_nav-7`, `LEFT_RAIL`, …) did not match DOM `data-vr-region` markers → zero actionable `CodePatchInstruction` entries.

## Solution

| Layer | Module | Role |
|-------|--------|------|
| Canonical IDs | `src/site00/config/ndxVisualRegionIds.ts` | Shared dot notation (`ndx.overview.metrics`) |
| Normalization | `p0vr1d4/normalizeReferenceRegionId.ts` | Maps decomposition, board, legacy hyphen, label text → canonical |
| Reference↔DOM map | `p0vr1d4/referenceDomRegionMap.ts` | `ReferenceDomRegionMap` entries |
| Mapped delta | `p0vr1d4/buildMappedReferenceDomDelta.ts` | Compares reference geometry to DOM via canonical ID |
| Component registry | `p0vr1d4/visualReconstructionComponentRegistry.ts` | canonicalRegionId → React component + CSS file |
| Actionable patches | `p0vr1d4/compileActionableCodePatches.ts` | Resolves patches to file/style targets |
| Patch execution | `p0vr1d4/applyCodePatchInstructions.ts` | Applies CSS property patches |
| Founder boards | `p0vr1d4/persistFounderVisualBoards.ts` | Copy to canonical paths + optional Supabase upload |
| Region locks | `p0vr1d4/implementationRegionLockAligned.ts` | Requires mapping + measurement before MATCHED/LOCKED |
| Live runner | `p0vr1d2/runNdxProjectHubLiveReconstruction.ts` (wired) | Uses mapped delta loop by default |

## Founder reference paths

**Canonical local:**

- `visual-references/founder/ndxbook/desktop-mood-board.png`
- `visual-references/founder/ndxbook/mobile-mood-board.png`

**Supabase `live-preview` bucket:**

- `site00/visual-references/projects/ndxbook/founder-workspace-desktop-board.png`
- `site00/visual-references/projects/ndxbook/founder-workspace-mobile-board.png`

When canonical references are expected but missing, resolver emits **`FAIL_FOUNDER_REFERENCE_MISSING`**.

Wireframe fixtures under `tests/fixtures/visual-reconstruction/` remain **dev/test only** — live founder validation must not claim visual pass when `fixtureSubstitution: true`.

## DOM markers

All tracked NDX founder workspace regions use canonical dot IDs via `vrRegionAttr(NDX_VR_REGION.*)`.

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D4.test.ts
```

## Aligned live run

```typescript
import { runNdxProjectHubAlignedLiveReconstruction } from '.../p0vr1d4';

await runNdxProjectHubAlignedLiveReconstruction({
  baseUrl: 'http://127.0.0.1:5174',
  allowFixtureFallback: false, // founder-facing
  requireFounderReference: true,
  executePatches: true,
});
```
