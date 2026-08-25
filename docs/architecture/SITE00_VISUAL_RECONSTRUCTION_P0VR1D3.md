# P0.VR.1D.3 — Single-screen NDX overview menu-open proof

Execution-only layer on P0.VR.1D + P0.VR.1D.1 + P0.VR.1D.2.

## Reference

- Asset: `visual-references/founder/ndxbook/mobile-overview-menu-open.png`
- Route: `/projects/ndxbook`
- State: `THREE_DOT_PROJECT_MENU_OPEN` (`?site00MobileLayout=1&vrMenuOpen=1`)
- Viewport: 390×844 (@2x)

## Run

```bash
npx tsx scripts/visualReconstruction/runNdxOverviewMenuOpenLiveReconstruction.ts
```

## DOM regions

`ndx-header`, `ndx-overview-heading`, `ndx-metrics`, `ndx-production`, `ndx-radar`, `ndx-bottom-nav`, `ndx-project-menu`

## Tests

`tests/visualReconstructionP0VR1D3.test.ts`
