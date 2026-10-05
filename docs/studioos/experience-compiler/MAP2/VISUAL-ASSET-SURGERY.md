# MAP2 — Visual Asset Surgery

Post-Opus layer between geometry convergence and Grok fabrication. A flattened authority screen is **not** a sufficient handoff.

## Pipeline position

`APPROVED AUTHORITY → SONNET → OPUS GEOMETRY → **VISUAL ASSET SURGERY** → GROK ASSET PACK → GROK → COMPOSER INJECTION`

## Modules (`src/studioos/experience-compiler/visual-surgery/`)

| Module | Role |
|--------|------|
| `sceneDecomposition.ts` | Geometry-aware layers per authority |
| `layerOwnership.ts` | LIVE_CODE_UI / LIVE_SVG / image ownership |
| `imageRequirements.ts` | ImageRequirement manifest + must include/exclude |
| `imageFamilies.ts` / `imageExpressions.ts` | Family DNA |
| `continuityGroups.ts` | Same-world rules (BLDR, EVOLVE, Origin, …) |
| `imageSurfaceVariants.ts` | Mobile/tablet/desktop/app derivation |
| `referenceCropCompiler.ts` | Reference crop metadata (not final pixels) |
| `safeZoneCompiler.ts` | UI clear / focal / crop-safe regions |
| `assetDependencies.ts` | Master → variant lineage |
| `assetFabricationSpec.ts` | Per-asset Grok contract |
| `grokAssetPackCompiler.ts` | `GROK_ASSET_PACK/` layout |
| `assetQA.ts` | Requirement + contamination checks |
| `visualFamilyPack.ts` | Experience-family contact sheets |
| `visualSurgeryPipeline.ts` | `runVisualAssetSurgeryPipeline()` |
| `site00VisualSurgery.ts` | SITE 00 INGEST fixture |

## SITE 00 validation

Run `npx tsx scripts/run-map2-visual-surgery-fixtures.ts` to refresh `MAP2_*_EXAMPLE.json` under this folder.

No mass Grok generation in compiler sprints — manifests and specs only.

## Workspace

- **Families** tab: Image system summary  
- **Production** tab: Visual asset surgery metrics  
- Authority pack export includes `images/` and `GROK_ASSET_PACK/` stubs when `visual_surgery_pipeline` is present.

See also: `SCENE-DECOMPOSITION.md`, `GROK-ASSET-PACK.md`, `SITE00-VISUAL-ASSET-SURGERY-VALIDATION.md`.
