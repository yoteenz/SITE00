# SITE 00 UI — P0.UI.3D Reference-Locked Icon Rebuild

**NDX_ICON_VISUAL_CANON_V3** — full path replacement from attached icon reference sheet.

## Authority

- Source: `visual-references/founder/ndxbook/ndx-icon-reference-sheet-p0ui3d.jpg`
- 13 labeled icons: bottom nav (5), header (2), project menu (6)
- Module: `shared/site00-studio-world-ui/icons/p0ui3d/`

## Key fixes vs V2

| Icon | V2 issue | V3 fix |
|------|----------|--------|
| Ellipsis | Bare three dots | Circular container + dots |
| Project Overview | Copied house icon | Stacked pages |
| Return to Origin | Full globe meridians | Planet with crater + dot |
| All targets | Approximate traces | Reference-sheet geometry |

## Tests

```bash
npm test -- tests/ndxIconSystemP0UI3D.test.ts
npx tsx scripts/icons/extractNdxIconReferenceCropsP0UI3D.ts
```

## Lineage

V2 paths preserved in `buildSupersededGeometryRecords()` with status `SUPERSEDED_BY_P0_UI_3D_REFERENCE_CANON`.
