# SITE 00 Visual Reconstruction — P0.VR.1D.4A

**Founder mood board ingest + canonical persistence + live 6×6 reconstruction execution**

Extends P0.VR.1D.4 with real founder board attachments — no new reconstruction architecture.

## Objective

Ingest founder-provided desktop + mobile NDXBOOK mood boards, persist to canonical paths, verify resolution without fixture fallback, extract 6 desktop + 6 mobile screen crops, and execute live browser reconstruction with DOM delta + patch loop.

## Canonical paths

**Local:**

- `visual-references/founder/ndxbook/desktop-mood-board.png`
- `visual-references/founder/ndxbook/mobile-mood-board.png`

**Supabase `live-preview` bucket:**

- `site00/visual-references/projects/ndxbook/founder-workspace-desktop-board.png`
- `site00/visual-references/projects/ndxbook/founder-workspace-mobile-board.png`

## Module

| File | Role |
|------|------|
| `p0vr1d4a/verifyFounderBoardCanonicalResolution.ts` | Prove founder boards resolve (`FOUNDER_REFERENCE`, no fixture) |
| `p0vr1d4a/runFounderMoodBoardIngestAndLiveReconstruction.ts` | Ingest + crop evaluation + aligned live 6×6 run |
| `p0vr1d4a/constants.ts` | Lineage + `FAIL_REGION_MAPPING_RUNTIME` |

Reuses:

- `persistFounderVisualBoards` (P0.VR.1D.4)
- `runNdxProjectHubAlignedLiveReconstruction` (P0.VR.1D.4)
- `runNdxProjectHubLiveReconstruction` (P0.VR.1D.2)
- `ingestNdxProjectHubMoodBoards` (P0.VR.1D.1)

## Run

```bash
node scripts/visual-reconstruction/runP0VR1D4AFounderBoardLiveReconstruction.mjs
npm test -- tests/visualReconstructionP0VR1D4A.test.ts
```

## Honest pass rule

`VISUAL_PASS` requires real founder reference + real browser render + real DOM measurement + overlay — not architecture readiness alone.
