# 08 · Responsive grid specification

**Machine-readable:** `tokens/breakpoints.json`. **Implementation reference:** `boards/src/ws.css` (proposal only; the app never imports it). **Boards:** D-01, TP-01, TL-01, C-05.

## 1. Two decisions, two mechanisms

1. **Viewport tier → shell** (media queries): which navigation, which top bar, whether an inspector can dock.
2. **Available width → composition** (container queries):
   - Pages query the named `stage` container.
   - Components query their own container: registry `reg`, decision pane `dec`, panels, inspector `insp`.

   A docked inspector narrows the stage, so pages recompose from the width they actually have, never from the device class.

## 2. Shell tiers

| Tier | Viewport | Columns (`grid-template-columns`) | Areas | Top | Gutter | Page max |
| --- | --- | --- | --- | --- | --- | --- |
| M | < 768 | `minmax(0,1fr)` | `"top" "stage" "bnav"` (rows 52 / 1fr / 72) | 52 | 16 | 100% |
| TP | 768–1023 | `80px minmax(0,1fr)` | `"nav top" "nav stage"` | 56 | 24 | 100% |
| TL | 1024–1279 | `80px minmax(0,1fr)` (+ `340px` docked ≥ 1100) | `"nav top insp" "nav stage insp"` | 56 | 28 | 100% |
| D | 1280–1919 | `224px` (248 ≥ 1600) `minmax(0,1fr)` `clamp(344px,24vw,420px)` | same | 56 | 32 | 1560 |
| UW | ≥ 1920 | `248px minmax(0,1fr) clamp(420px,18vw,480px)` | same | 56 | 40 | 1760 |

**Dock rule:** the inspector docks when `viewport − nav − inspector ≥ 680`, which in the rail grammar is from 1100. Below that the inspector is a right sheet (tablet) or a bottom sheet under the header (phone). This replaces OPUS1's `width − nav ≥ 1100`, which docked at 1194 and left a 630 px stage (P-07).

**Short-height rule:** `min-width: 1024px and max-height: 860px` → title 44, header padding 18 / 16.

## 3. Stage container tiers

| Tier | Stage width | Typical viewports |
| --- | --- | --- |
| cs | < 640 | Phones; Split View 1/2 |
| cm | 640–919 | Tablet portrait; 1194 with inspector; 1280–1600 with inspector |
| cl | 920–1439 | 1024 landscape; 1280–1440 without inspector; 1920 with inspector |
| cx | ≥ 1440 | 1920+ without inspector |

## 4. Component container rules

| Component | Container | Breakpoints |
| --- | --- | --- |
| Registry | `reg` | < 600 card rows · 600–919 CLIENT / STATUS / NEXT ACTION · ≥ 920 CLIENT / LIFECYCLE / INTAKE / NEXT ACTION / LAST ACTIVITY · ≥ 1300 capped columns |
| Decision | `dec` | < 560 stacked · 560–819 choices row + note \| CTA · ≥ 820 choices \| note \| CTA |
| Console | nearest | < 960 icon · module · status · ≥ 960 MODULE / STATUS / AREA / DETAIL / CHECKED |
| Key-value grid | nearest | ≥ 720 two columns |
| Intake answers | panel | ≥ 760 two columns |
| Stage rail | panel | < 700 numbers only |
| Task row | nearest | < 560 status under mode · ≥ 1000 text ≤ 480, status follows |
| Signals | nearest | < 360 2 × 2 |
| Focus | nearest | ≥ 520 rows auto / auto / 1fr / auto |

## 5. Page grids (named areas)

| Page | cs | cm | cl | cx |
| --- | --- | --- | --- | --- |
| Overview `.ov` | `focus · signals · work · move · mile` | `focus focus / signals signals / needs move / work work / mile mile` | `7fr 5fr: focus needs / signals signals / work work / mile move`; from 1100: `work move / mile move` | `6fr 3fr 3fr: focus needs signals / work work move / mile mile move` |
| Record `.rec-body` | 1 column | 1 column | `1fr minmax(300,360)` | `1fr 400` |
| Workbench `.wb` | One pane (push) | One pane; queue in 2 columns | `minmax(280,320) 1fr` + decision footer row | From 1160: `minmax(280,320) 1fr minmax(320,360)`; ≥ 1440: `360 1fr 400` |
| Operations `.ops` | 1 column | 1 column | `280 1fr` + context row | ≥ 1440: `300 1fr 340`; ≥ 1680: `320 1fr 380` |
| System `.sys-grid` | 1 column | 1 column | 1 column | `1fr 360` |
| Test lab `.lab` | 1 | 1 | 2 | 3 |

## 6. Spacing and rhythm

| Token | Relaxed | Standard | Compact |
| --- | --- | --- | --- |
| `--ws-row` | 64 | 56 | 44 (48 phone) |
| `--ws-pad` | 22 | 18 | 14 |
| `--ws-gap` | 24 | 18 | 12 |
| `--ws-cell` | 16 | 14 | 12 |

Header heights: top bar 52 / 56; page header ≈ 112 at desktop, ≈ 92 short-height. Panel header min 48. Every value is a multiple of 2; the vertical rhythm is the row token of the page's density class.
