# 12 · Before / after visual review

**Boards:**
- **C-01:** desktop, 8 pairs at 1440 × 900.
- **C-02:** tablet portrait and landscape.
- **C-04:** components.

**Before frames** are pixel crops of the OPUS1 boards (`boards/src/before/*.jpg`). Their positions were measured from the OPUS1 board DOM: frame interior at (65, 390), 1440 × 900 css; tablet frames at (653, 1501) and (65, 2730). **After frames** are live specimens at the same viewport.

| Pair | Before (OPUS1) | After (OPUS2) | Classes fixed |
| --- | --- | --- | --- |
| Overview | 68 px title + 200 px hero header; focus card stacked; signals crushed; registry starts at y ≈ 700 (2 rows visible) | 52 px title in a ~112 px header; focus \| queue; signal strip; registry above the fold | P-01 P-04 P-10 |
| Overview + inspector | Signals labels wrap; focus squeezed to ~400 | Inspector docks only with stage ≥ 680; the overview recomposes (3-column registry) | P-07 P-06 |
| Foundations | 8.5 px text in 58 px rows; seven fixed columns; next action wraps 3 lines | 14 px two-line cells, 56 px rows; five columns; next action clamped to 2 with owner above | P-02 P-09 P-07 |
| Client record | Stretched journey; three small tiles; ~300 px dead stage | Fixed-rhythm journey; section \| context column | P-05 P-10 |
| Record + inspector | Email broken mid-token in the inspector header | Single-line data slots use ellipsis + title | P-06 |
| Reviews | Table + inspector; decision hidden behind a click | Three-pane workbench | P-04 |
| Operations | Segmented control over the heading; side column squeezes tasks | Runbooks \| main with the context row beneath until stage ≥ 1440 | P-07 P-08 |
| System | Eight equal cards with 7.5 px text | Status-first console, 44 px rows | P-03 P-02 |
| Tablet portrait 834 | Desktop table clipped at the right | CLIENT / STATUS / NEXT ACTION | P-07 |
| Tablet landscape 1194 | Crushed search (4-line placeholder), clipped SORT and LAST ACTIVITY | Dock rule; toolbar on rows; three columns with the inspector | P-07 P-08 |

**What did not change:**
- Palette, marks, plates, the red period, square geometry and journey semantics.
- The approved mobile compositions.

**Founder action:** review C-01 and C-02 first; they summarise the refinement. Then review the D, TP and TL boards by destination.
