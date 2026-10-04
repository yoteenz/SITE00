# RESPONSIVE TREE

Breakpoints (from `production-authority-registry.ts`):

| Label | Width rule |
|-------|------------|
| MOBILE | &lt; 700px |
| MOBILE XL | 700–1119 (uses mobile host strip unless noted) |
| TABLET | ≥ 700px (`PRODUCTION_TABLET_MIN_WIDTH`) |
| DESKTOP | ≥ 1120px (`PRODUCTION_DESKTOP_MIN_WIDTH`) |

Host chrome: **mobile** uses scaled `ph` strip; **tablet/desktop** uses `pxh` + `ProductionHostNav`.

## Node behavior matrix

| Node | MOBILE | MOBILE XL | TABLET | DESKTOP |
|------|--------|-----------|--------|---------|
| shell-frame | `.pxa` + ph nav | same | pxh header + host nav | same |
| hub-root | full hero stack | same | wider gutters | same |
| hub-machine | 864-space zoom | same | same | same |
| inbox-root | stacked cards | same | two-column where CSS allows | same |
| design-root modes | chamber + mode bar | same | boards side-by-side | ON YOUR TABLE grid |
| design-viewport | device frame | same | landscape desktop frame | zoom controls visible |
| design-child-workspace | **768 canvas scaled** | **scaled** | overlay + bench | overlay + bench |
| experience-root | capsules wrap | same | hero + panel | same |
| experience-child-* | PwFrame empty | same | 1180–1320 band | same |
| expression-root | floor grid 1-col | same | multi-col floors | same |
| cf-surface | native 432 canvas | scaled | nav + scaled canvas | same |
| library-root | vault scroll | same | collections 2-col | full vault |
| activity-root | filter wrap | same | log full width | same |

## RESPONSIVE_AUTHORITY_FAILURE (flagged, not fixed)

1. **design-child-workspace** — MOBILE / MOBILE XL: twin-opus fixed 768px canvas scaled into ~390px viewport (“desktop canvas on phone”).
2. **shell-header-mobile** — MOBILE / MOBILE XL: `ph-top` / `ph-nav` shorter than authority target (~34px / ~37px vs ~57px / ~52px) due to shared 864-space lock with hub machine, CF, design overlay.

## Same DOM ≠ same authority

- **experience-child-*** uses identical empty mount at all breakpoints — authority is the **shell**, not fictional content.
- **Character Fabrication** uses different font stack (Fab Condensed) at all sizes — specialization, not responsive drift.

See responsive-variant nodes `resp-*` in [NODE_MATRIX.md](./NODE_MATRIX.md) (44 records).
