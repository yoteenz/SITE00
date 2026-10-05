# Responsive convergence matrix

Families follow the host frame:
- mobile: under 700px
- tablet: 700–1119px
- desktop: 1120px and up

Each family is its own composition in `site00-production-inbox-activity.css`. There is no `zoom`, no `scale()`, and no selector on host chrome; a test enforces both.

| Element | Desktop (left frame) | Tablet (centre frame) | Mobile (right frame) |
|---|---|---|---|
| Hero | 268px; plate from 26%; copy left; side words (Activity) in a light column with a red rule | 236px; plate from 22%; smaller type | 186px; mobile plate; stronger left wash; copy capped at 190px; side words hidden |
| Lens bar | lenses + search + filter on one row | lenses on their own row; full-width search + filter below | lenses edge to edge, **scrolling on their own** (360px phones); search + filter below |
| Stats | 4 across | 4 across | 2×2 |
| Inbox ALL | NEEDS YOU / AWAITING side by side; WATCHING / RESOLVED below | same two columns, tighter | single column |
| Inbox APPROVALS | list + preview aside | list + preview | list only (rows open the detail); preview hidden |
| Inbox DIRECT | 3 columns (list / thread / context) | 3 narrow columns | thread + context stacked; list hidden (it is empty) |
| Approval detail | media left, decision column right; tab panels in 3 columns | media full width, decision block under it | media, then the stacked decision buttons; tabs scroll |
| Activity feed | time / art / text / chip / chevron | same | time folded under the text |
| Blockers | 5-column table | 5-column table, tighter | stacked severity cards |
| Milestone detail | head + facts row; 2-column dossier grid | head + facts; 2 columns | single column; tabs scroll |

Verification:
- Live Playwright captures of all 12 routes in all 3 families (`*/*/{desktop,tablet,mobile}/live.jpg`).
- A 36-root structural matrix: 36/36, no page or body horizontal overflow, nav order and active tab correct, no scaling on the host strip.
- Overflow probe at 360, 390 and 430px: the scroll container width equals the viewport on every route.
