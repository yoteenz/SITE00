# SITE 00 Visual Reconstruction — P0.VR.1D.8

**Lab / Experiment 01 design correction + 3×3 board geometry + Current Direction tightening**

Targeted micro-convergence on NDXBOOK mobile Lab (Experiment 01) only — no IA rebuild.

## Reference

- `visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png`
- Artwork crops: `public/visual-references/founder/ndxbook/experiment-01-artwork/*.webp`

## Module

| File | Role |
|------|------|
| `p0vr1d8/referenceDetailAudit.ts` | LabReferenceDetailAudit |
| `p0vr1d8/resolveExperiment01Artwork.ts` | Reference crop artwork binding |
| `p0vr1d8/runNdxLabExperiment01CorrectionPass.ts` | Live render + DOM delta + overlay |

## UI

- `MobileExperiment01Screen` — reference-fidelity layout (breadcrumb, metrics, 3×3 grid, Current Direction)
- `FounderWorkspaceShell` — routes `experiment-01` to dedicated mobile screen
- `ndxFounderWorkspaceMobileNav` — Lab nav → experiment-01 route

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D8.test.ts
```
