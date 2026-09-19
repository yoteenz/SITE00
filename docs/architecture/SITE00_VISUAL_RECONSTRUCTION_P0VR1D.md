# SITE 00 — P0.VR.1D Visual Reconstruction (Screenshot-First)

Extends P0.VR.1 / 1A / 1C. **Reference image is primary visual authority**; text supports interpretation only.

## Authority order

1. REFERENCE IMAGE  
2. STRUCTURAL EXTRACTION  
3. VISUAL TOKENS  
4. REGION GEOMETRY  
5. COMPONENT CONSTRAINTS  
6. TEXT DESCRIPTION  
7. GENERIC DESIGN HEURISTICS  

## Pipeline

```
REFERENCE IMAGE
  → resolveWebVisualReferenceAsset()
  → ingestScreenshotReference()
  → WebVisualReferenceAuthority
  → PageVisualDecomposition
  → VisualRegionMap + PixelGeometryContract + ReferenceTypographyContract + FrameAuthority
  → runScreenshotFirstReconstructionPipeline()
  → renderControlledReference() @ exact viewport
  → compareRenderedReference()
  → PixelMatchEvaluation + VisualDifferenceMap
  → lock matched regions → iterate until threshold
```

## Module location

`shared/site00-studio-world-production/visualReconstruction/p0vr1d/`

| Module | Role |
|--------|------|
| `webVisualReferenceAuthority.ts` | Image-first authority; blocks text override |
| `resolveWebVisualReferenceAsset.ts` | Supabase/upload URL resolution |
| `pageVisualDecomposition.ts` | Structural decomposition |
| `visualRegionMap.ts` | Region map + locking |
| `pixelGeometryContract.ts` | Geometry + tolerances |
| `referenceTypographyContract.ts` | Typography with line-break preservation |
| `frameAuthority.ts` | Camera/environment framing |
| `desktopMobileVisualAuthority.ts` | Separate desktop/mobile authorities |
| `screenshotFirstReconstructionPipeline.ts` | Orchestrator |
| `webReconstructionProviderRouting.ts` | Prefer image-capable providers |

## Modes

- `WEBSITE_RECONSTRUCTION` — match reference (implemented)
- `WEBSITE_DESIGN_GENERATION` — create from spec (separate path)

## UI

`src/site00/components/founderWorkspace/VisualReconstructionWorkspace.tsx` — 7-step founder flow with reference / implementation / overlay / difference views.

## Tests

`tests/visualReconstructionP0VR1D.test.ts` — 21 tests + success-criteria boolean block.

## Golden fixtures

NDX founder references via `shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.ts`.

## Rules

- Do not derive mobile from desktop when a mobile reference exists.
- Do not perform unsolicited design improvement during reconstruction.
- Final output remains coded and interactive (no flattened screenshot as the site).
- Historical P0.VR calibrations remain immutable evidence.
