# SITE 00 Visual Reconstruction — P0.VR.1D.10

**Mobile full-screen shell reconstruction rollout across remaining NDX tabs**

Applies P0.VR.1D.9 methodology: preserve functional shell, rebuild visual shell from full-screen references.

## Targets

| Screen | Reference |
|--------|-----------|
| Overview | `mobile-overview-fullscreen-reference-hifi.png` |
| Content Ops | `mobile-content-ops-fullscreen-reference.png` |
| Cultural Intelligence | `mobile-cultural-intelligence-fullscreen-reference.png` |
| Character Lab | `mobile-character-lab-fullscreen-reference.png` |

## Module

- `p0vr1d9/` — functional vs visual shell authority + stale lock invalidation
- `p0vr1d10/runMobileShellRolloutPass.ts` — live render + overlay for all targets

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D10.test.ts
```
