# SITE 00 Visual Reconstruction — P0.VR.1D.5

**Single-screen mobile overview micro-fidelity pass** — missing detail recovery, artwork population, micro-spacing convergence.

Extends P0.VR.1D.3 / P0.VR.1D.4. Does **not** rebuild page IA.

## Scope

- NDXBOOK mobile Overview (`OverviewMobileHomeScreen`)
- Reference: `visual-references/founder/ndxbook/mobile-overview-menu-open.png`

## Module

| File | Role |
|------|------|
| `referenceDetailAudit.ts` | Classify reference vs implementation details |
| `resolveProductionCardArtwork.ts` | Existing assets first; reference crop; generation-required gate |
| `runNdxOverviewMicroFidelityPass.ts` | Live render + audit report |

## Artwork

Reference-approved crops: `public/visual-references/founder/ndxbook/card-artwork/*.webp`

Priority: canonical → pipeline URL → reference crop → **ARTWORK_GENERATION_REQUIRED** (no auto FAL spend)

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D5.test.ts
```
