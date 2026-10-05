# SITE 00 — P0.VR.1D.1 Visual Reconstruction (Screenshot-as-Design-Spec)

Extends **P0.VR.1D** without replacing it. The screenshot is the **design specification**, not inspiration.

## Core rule

```
MOOD BOARD / SCREENSHOT
  → SCREEN EXTRACTION
  → VISUAL MEASUREMENTS
  → IMPLEMENTATION SPEC
  → CODE
  → BROWSER RENDER
  → DOM MEASUREMENT
  → SCREENSHOT COMPARISON
  → TARGETED PATCH
  → CONVERGENCE
```

## Default input

- Desktop mood board
- Mobile mood board
- Optional full-screen precision overrides per screen

Founder does **not** manually crop every screen.

## Module location

`shared/site00-studio-world-production/visualReconstruction/p0vr1d1/`

| Module | Role |
|--------|------|
| `moodBoardScreenExtractionPipeline.ts` | `MoodBoardScreenExtractionPipeline` — board → `ScreenReference[]` |
| `screenReferenceResolutionEvaluation.ts` | SUFFICIENT / PARTIALLY_SUFFICIENT / INSUFFICIENT |
| `screenReferenceAuthorityVersion.ts` | Mood-board crop authority + full-screen supersession |
| `fullScreenReferenceMatcher.ts` | Match full-screen overrides to existing screens |
| `regionCodeSpec.ts` | Reference geometry → CSS/DOM properties |
| `visualSpecToCodeBridge.ts` | `VisualSpecToCodeBridge` → `ScreenImplementationSpec` |
| `composerScreenBuildContract.ts` | Composer brief — no redesign freedom |
| `renderedDomMeasurementMap.ts` | Post-render DOM capture |
| `referenceDomDelta.ts` | Reference vs DOM geometry delta |
| `codePatchInstruction.ts` | Actionable patch compiler |
| `implementationRegionLock.ts` | UNMEASURED → DRIFTING → MATCHED → LOCKED |
| `domPatchConvergencePipeline.ts` | DOM + visual QA convergence orchestrator |

## NDX golden pilot

`shared/site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.ts`

- `ingestNdxDesktopMoodBoard()` / `ingestNdxMobileMoodBoard()`
- `ingestNdxProjectHubMoodBoards()`
- `rebuildNdxProjectHubThroughP0VR1D1()`

## Modes

- `SCREENSHOT_EMULATION_MODE` — code what is visibly there
- `WEBSITE_RECONSTRUCTION` — separated from design generation

## Tests

`tests/visualReconstructionP0VR1D1.test.ts` — 30 tests + success-criteria boolean block.

## Lineage

P0.VR.1 → P0.VR.1A → P0.VR.1C → P0.VR.1D → **P0.VR.1D.1**

Prior modules under `p0vr1d/` are preserved and reused.
