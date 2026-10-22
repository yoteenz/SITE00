# 02 · Desktop proportion audit

**Scope:** OPUS1 desktop and tablet boards 02, 04, 06, 08, 10, 11, 12, 14, 16, 18, 20, 22, 23, 24 and 25. They were re-rendered from the OPUS1 sources at commit b82ca64e4 and inspected at 1:1 and 2×.

**Method:**
- The OPUS1 device frames were measured in the live board DOM (`.bd-device` boxes) and cropped from the OPUS1 PNGs into `boards/src/before/`.
- Each defect is classified with one of the ten proportion classes below and tied to a board and a component.
- Every OPUS2 correction is shown live on the comparison boards: C-01 (desktop), C-02 (tablet) and C-04 (components).

**Founder diagnosis confirmed:** OPUS1 desktop is enlarged mobile. The display headline grew from 50 to 68 px, but the mobile micro type (7–9 px) stayed the same size. Mobile stacking (hero, then card, then list) was kept on a 1216 px stage. Fixed component sizes were carried across tiers without a grid that relates them.

## 1. Proportion classes

| Class | Name | Test used in this audit |
| --- | --- | --- |
| **P-01** | Inverse type scaling | Display type grows with the viewport while labels and data do not, so the ratio between them widens past 6:1 |
| **P-02** | Sub-minimum text | Any application text below 10 px, or labels below 11 px from tablet up |
| **P-03** | Mobile component carried to desktop | Same height, padding or block width as on the phone where the desktop has room for a different form (block buttons, quick-action tiles, card rows) |
| **P-04** | Vertical stacking where a horizontal composition fits | Siblings stacked while the stage has ≥ 2× their width |
| **P-05** | Stretch gap / unconstrained distribution | Content spread evenly across available width with no maximum: gaps > 360 px between neighbouring text in one row, or step nodes > 140 px apart |
| **P-06** | Uncontrolled wrapping | Labels, buttons or navigation wrapping by accident; data broken mid-token |
| **P-07** | Clipping / crushing | Columns, controls or labels cut off or shrunk below their content because siblings took fixed space |
| **P-08** | Broken column relationships | No shared grid: header, toolbar, stage and inspector edges do not align; duplicate titles |
| **P-09** | Density mismatch | Row height not proportional to content (58 px rows for two 8 px lines) or inconsistent rhythm between pages |
| **P-10** | Dead zones and fold priority | Large empty regions while primary content is pushed below the fold |

## 2. Findings (OPUS1) → corrections (OPUS2)

| # | Board · component | Class | OPUS1 (measured) | OPUS2 authority | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | 04 · page title + hero object (SH-16, SC-16) | P-01 P-10 | Title 68 px; the object makes the header 208 px tall. At 1440 × 900 the ACTIVE WORK table shows **2 rows** above the fold. | Title 52 px (44 when height ≤ 860) in a ~112 px header. The object is capped at 104 px inside the header. The registry starts above the fold. | C-01 §01, D-02 |
| 2 | 04 · labels, meta, table text | P-01 P-02 | Labels 7.5–9 px at 0.2–0.24 em; table cells 8.5 px. The ratio of title to label is 9:1. | Labels 11 px / 0.16 em, meta 12 px, body 14 px. The ratio is 4.7:1. | C-03, D-15 |
| 3 | 04 · current focus (OV-03) | P-03 P-04 | A 620 px card stacking label, identity, headline, CTA and meta | Horizontal composition: identity and statement (≤ 22ch) left, CTA row anchored to the bottom, height matched to the decision queue | D-02 §01 |
| 4 | 04 · signals (OV-02) | P-04 P-07 | Four cells squeezed into the right half (~120 px each); AWAITING CLIENT wraps when the inspector opens | A full-width 4-up strip at stage ≥ 920; a 2 × 2 block beside the queue at ≥ 1440 | D-02, C-01 §02 |
| 5 | 04 · topbar + title (SH-04, SH-16) | P-08 | Topbar says OVERVIEW and the H1 says DIGITAL FOUNDATION: two titles | Topbar is breadcrumb (index + destination + record) + search + utilities; the title appears once | D-01 §03 |
| 6 | 02 · sidebar (SH-11) | P-03 P-06 P-10 | 232 px; 44 px block NEW FOUNDATION; CORRESPONDENCE STUDIO wraps unplanned; ~380 px empty band | 224 / 248 px; 40 px create; 12 px primary labels never wrap; tool links wrap by design to two balanced lines; footer identity anchored | D-01, C-04 |
| 7 | 06 · registry table (FN-05) | P-02 P-09 P-07 | 58 px rows of 8.5 px text; seven fixed columns; NEXT ACTION wraps to three lines | 56 px two-line cells at 14 px. The column set is chosen from the registry's own width: 3 columns 600–919, 5 columns ≥ 920, capped ≥ 1300. Next action is clamped to 2 lines; owner on its own line. | D-03, C-05 |
| 8 | 02 (1194 × 834) · registry toolbar | P-07 | Inspector docked with the stage at 630 px: the search field is crushed to ~70 px with a 4-line placeholder; SORT and LAST ACTIVITY are clipped | Dock rule `stage ≥ 680`; the toolbar puts search and tools on row 1 and tabs on their own scrolling row; the registry drops to 3 columns | TL-03, C-02 §02 |
| 9 | 02 (834 × 1112) · registry | P-07 | The 7-column desktop table clips at the right edge (chevrons and LAST ACTIVITY cut off) | Tablet portrait uses CLIENT / STATUS / NEXT ACTION | TP-03, C-02 §01 |
| 10 | 06 / 10 · inspector (SH-12) | P-07 P-08 | Fixed 392 px (360 on rail) regardless of stage; stage content squeezed | clamp(344, 24vw, 420), clamp(420, 18vw, 480) from 1920; docks only when the stage keeps ≥ 680 | D-01 §01, C-05 |
| 11 | 10 · journey (CR-04) | P-05 | Eight nodes spread across ~1100 px (~140 px apart); labels 7 px | Max width 1180 with 8 equal tracks; labels 11 px; abbreviated below 920 stage; beside the status block at ≥ 1440 | D-05, C-04 |
| 12 | 10 · record overview | P-04 P-10 | Header + journey panel + tabs = 420 px before content; three 200 px summary tiles; ~300 px empty stage below | Two zones: section left, context column (link, contact, movement) right, 360 / 400 | D-05 |
| 13 | 10 (inspector) · email | P-06 | `ops@horizon-` / `freight.invalid` broken at a hyphen in a 2-line header | Emails in single-line slots are nowrap + ellipsis + title; in kv rows they wrap anywhere (data never transformed) | C-01 §05, D-03 |
| 14 | 10 · quick actions (CR-03) | P-03 | Four out-buttons + more in the header, each at mobile height | 34 px small out-buttons on the name baseline; wrap below the name < 920 | D-05 |
| 15 | 14 · reviews (RV-01) | P-04 | A table + inspector: the decision is two clicks away | Workbench queue / context / decision (3 panes at stage ≥ 1160; decision footer 920–1159) | D-08, C-06 |
| 16 | 16 · review detail decision (RV-05) | P-03 | Stacked choice cards and block CTA at mobile proportions inside a 392 px inspector | Decision pane 320–360 (stacked) or a footer grid: choices, note and CTA in one row | D-09, TL-06 |
| 17 | 18 · operations (OP-01) | P-07 P-08 | Segmented control overlaps the section heading; a 300 px side column squeezes the task list | Runbooks, then main, then context. Context goes beneath as a 3-up row until the stage is ≥ 1440 px. Stage labels clamp to 2 lines and show numbers only below 700 px. | D-10 |
| 18 | 20 · correspondence (CO-01) | P-05 | Lifecycle table only; messages would span the stage | Index, thread, context; the thread is capped at 68ch + padding and centred | D-11 |
| 19 | 22 · system modules (SY-03) | P-03 P-02 | Eight equal cards in a 4 × 2 grid with 7.5 px descriptions; status buried in a corner chip | Status-first console rows (44 px compact): MODULE / STATUS / AREA / DETAIL / CHECKED, ordered by severity | D-12, C-07 |
| 20 | 23 · test lab | P-04 | Four tall panels stacked | 2 → 3 column auto grid | D-13 |
| 21 | 24 · overlays | P-07 | Desktop dialog fixed at 460 / 560 px with no max height; popovers positioned by hand | Per-family container modes per tier; max height = viewport − margins − keyboard; popovers anchored to their trigger and flipped above when short | D-14, TP-10, TL-10 |
| 22 | 25 · responsive components | P-08 | Tablet docking rule `width − nav ≥ 1100` docked the inspector at 1194 even though the stage then fell to 630 | Replaced by `viewport − nav − inspector ≥ 680` (docks from 1100 in rail grammar) | D-01, TL-01 |

## 3. Desktop issues: counts

| | Count |
| --- | --- |
| Desktop / tablet proportion defects identified | **22** (above) |
| Resolved in the OPUS2 authority (shown live on boards) | **22** |
| Classes covered | P-01 to P-10 (all ten) |
| Defects deferred | 0 visual; data-dependent cells are marked G-01 / G-03 rather than invented |

## 4. What was kept from OPUS1

- Palette, red period, rail index, plates, marks and status vocabulary.
- Square geometry and journey semantics.
- The mobile compositions. They are approved and now rendered from the same responsive stylesheet; the phone frames at 320–430 pass the same audit.
