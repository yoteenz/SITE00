# SITE 00 Visual Reconstruction — P0.VR.1D.9

**Mobile page shell reconstruction + Campaign/Lab frame replacement (function-preserving visual rebuild)**

Corrects P0.VR.1D.6 / P0.VR.1D.8 methodology: the **entire visible phone screen** is design authority for shell geometry — not just inner card content.

## Authority split

| Layer | Preserves |
|-------|-----------|
| **FunctionalShellAuthority** | routing, data hooks, interactions, notification center, project menu, bottom nav |
| **VisualShellAuthority** | layout, gutters, header/nav geometry, page background, section frame |

## References

- Campaign: `visual-references/founder/ndxbook/mobile-campaign-board-reference.png`
- Lab: `visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png`

## Module

| File | Role |
|------|------|
| `p0vr1d9/mobileScreenVisualShellSpec.ts` | `MobileScreenVisualShellSpec` + CSS var bridge |
| `p0vr1d9/campaignScreenImplementationSpec.ts` | Full-screen spec incl. shell regions |
| `p0vr1d9/labScreenImplementationSpec.ts` | Full-screen spec incl. shell regions |
| `p0vr1d9/visualShellMatchEvaluation.ts` | Shell DOM delta scoring |
| `p0vr1d9/invalidateStaleShellLocks.ts` | `STALE_AFTER_SHELL_RECONSTRUCTION` |
| `p0vr1d9/parentGeometryFirst.ts` | Parent shell before child locks |
| `p0vr1d9/runNdxMobileShellReconstructionPass.ts` | Live screenshot + overlay QA |

## UI

- `MobileFounderWorkspaceChrome` — `visualSpec` prop drives reference shell CSS variables
- `MobileCampaignBoardScreen` / `MobileExperiment01Screen` — direct page surface (no giant wrapper card)
- Shell VR regions: `ndx.campaign.screen|header-shell|content-shell|bottom-nav-shell`, `ndx.lab.*`

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D9.test.ts
```
