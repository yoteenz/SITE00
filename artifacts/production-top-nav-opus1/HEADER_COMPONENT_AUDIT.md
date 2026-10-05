# Header component audit

## Implementations found

| # | Implementation | Where it mounts | Before | After |
|---|---|---|---|---|
| 1 | `ProductionHostTop` (`pxh-top`) | tablet / desktop, via `ProductionWorkspaceHeader` | shared; hard-coded px per breakpoint | **canonical**, `--pxh-*` tokens |
| 2 | `ProductionWorkspaceHeader` phone branch (`ph-top` in the 864-unit zoomed strip) | mobile, via the same component | 5 groups (extra CURRENT WORKSPACE selector); `brand--long` ellipsis | **converged**: same 4 groups as #1, `ph-top--host` + `--phh-*` tokens |
| 3 | `.pxa`-only phone TOP layer (`.pxa .prod-chrome-strip.ph--hub .ph-top…`) | phone header **inside the authority frame only** | made authority-frame roots a different header from PwFrame descendants and the Design overlay (a 40/36px type bump in fixed grid tracks) | **removed**; replaced by one unscoped block |
| 4 | `ProductionHub` machine header (`hub-header`) | `/production?view=machine` (legacy hub machine) | own header (PRODUCTION / CURRENT PRODUCTION / overlays) | **unchanged**: LEGACY_LOCKED machine view; no `.ph-top--host`, so unaffected |
| 5 | `FabricationHeader` (Character Fabrication) | `/production/:slug/expression/character-fabrication` | own station header (CURRENT CHARACTER, STEPS REMAINING) | **unchanged**: carries fabrication state, not the Production attention state; converging it would change function |

All three frames mount #1/#2 through `ProductionWorkspaceHeader`:
- `ProductionAuthorityFrame` (the roots)
- `PwFrame` (Experience / Expression descendants)
- `ProductionChromeOverlay` (Design descendants)

A test enforces that no other component renders `data-testid="production-workspace-header"`.

## Geometry before (root cause)

- **Phone.**
  - The base `.ph--hub .ph-top` is a **fixed five-track grid** (`278px 190px 188px minmax(0,1fr) 48px` in 864 units).
  - Hub-authority CSS puts `min-width: 0; overflow: hidden` on **every cell**, and `.ph-top__copy` is `overflow: hidden` too.
  - Line-heights are 0.95–1.05.
  - Inside `.pxa` the title was bumped to 40px and the count to 36px without changing the tracks.
  - The attention track got only the leftover width (160 units), so **ITEMS NEED YOU was cropped** by its copy box and its cell on every phone width (detector: 20/20 phone root routes).
  - PwFrame descendants and the Design overlay didn't get the `.pxa` layer, so they showed a **second, smaller header** (75 units instead of 120), with the same five-group crowding.
- **Tablet / desktop.**
  - No measurable ink clipping, but the line boxes were shorter than the glyph box (`line-height` 0.95–1.05 on a font whose content box is 1.58em).
  - `min-width: 0` sat on every group with flex-shrink 1.
  - Sizes were hard-coded per breakpoint.
  - ITEMS NEED YOU was red, unlike the authority.

## Geometry after

| Token | Tablet (700–1119) | Desktop (≥1120) | Phone (864-unit strip) |
|---|---|---|---|
| header height | `--pxh-top-h` 64px | 72px | `--phh-top-h` 120 |
| title size / line-height | 21px / 1.15 | 26px / 1.15 | 32 / 1.15 |
| secondary (SITE 00) | 10px | 11px | 12 |
| PROJECT label | 9.5px | 10.5px | 11.5 |
| project name | 16px | 19px | 23 |
| attention count | 23px | 28px | 36 |
| ITEMS NEED YOU | 10px | 11px | 12 |
| text line-height | 1.2 | 1.2 | 1.2 |
| group padding | 20px | 32px | 20 (spare width shared evenly) |
| divider inset | 12px | 13px | 22 |
| thumb | 30×40 | 34×46 | 44×60 |
| reticle | 34 | 40 | 58 |
| menu cell / icon | 64 / 22 | 80 / 26 | 80 / 30 |

Rules:
- Every group is `flex: 0 0 auto` on tablet/desktop. On the phone it is `flex: 1 0 auto; min-width: max-content`, which grows evenly and never shrinks.
- No header rule uses `overflow: hidden|clip`, `text-overflow: ellipsis`, `max-height`, `translate` or `flex-shrink ≥ 1`; a test enforces this.
- The thumbnail image crops only its own picture.
