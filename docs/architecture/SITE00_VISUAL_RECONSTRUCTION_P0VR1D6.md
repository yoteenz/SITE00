# SITE 00 Visual Reconstruction — P0.VR.1D.6

**Campaign Board design correction + artwork/geometry tightening + NDX lime diamond recovery**

Targeted micro-convergence on NDXBOOK mobile Campaign Board only — no IA rebuild.

## Reference

- `visual-references/founder/ndxbook/mobile-campaign-board-reference.png`
- Artwork crops: `public/visual-references/founder/ndxbook/campaign-board-artwork/*.webp`

## Module

| File | Role |
|------|------|
| `p0vr1d6/referenceDetailAudit.ts` | CampaignBoardReferenceDetailAudit |
| `p0vr1d6/resolveCampaignBoardArtwork.ts` | Reference crop artwork binding |
| `p0vr1d6/runNdxCampaignBoardCorrectionPass.ts` | Live render + DOM delta + overlay |

## UI

- `MobileCampaignBoardScreen` — reference-fidelity layout (day grid, pages/margins/motion lanes)
- `MobileFounderWorkspaceChrome` — `Site00Diamond` for NDX lime project accent
- `FounderWorkspaceShell` — routes `campaign-board` to dedicated mobile screen

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D6.test.ts
```
