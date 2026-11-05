# 13 · V3 / editorial component compatibility

Two systems, kept separate (sprint §14):

| System | Where | Surface owner | Changed this sprint? |
|---|---|---|---|
| DOT 01 V9 compositions | `screens/f05/dot01/**` (37 states) | `.d01-btn` (kit `Button`), `.d01-dir__action` (06), strips, papers, title papers | **yes** — the actions now draw the SK03 SIDEKICK's own pills; 06 keeps its OPUS3 authority lifts |
| V3 interactive / editorial overlays (OPUS2) | `runtime/surfaces/editorial/**`, `jv3-*`, `jed-*` (global menu, search drawer, MONEY action sheet, ADD A POCKET, MOVE MONEY, manage-pocket fragment, archive-blocked caution) | `EdAction`, `.jed-*`, `.jv3-pill` | **no** |

Isolation verified in code: `.d01-btn` occurs only in `screens/f05/dot01/` (`kit.tsx`, `DirectoryPage.tsx`, `NotFoundPage.tsx`,
the DOT 01 stylesheet); no editorial or V3 component uses it, and every new rule is scoped `.jrn .d01-btn…` or
`.jrn .jrn-d01[data-env^='SK03'] …`. The two V3 pieces mounted inside DOT 01 overlays (36's `jv3-pill` RESOLVE ISSUES detail link
and caution stone, the pocket menu's `jed-pop-*` clip and kind art) are untouched and were re-checked by the editorial suite
(report 14 / test results) and the census (36: `V3` control kind).

The V3 language is not used to replace the V9 action art: where the authority draws its pill, the pill is drawn; where a new
interactive state has no V9 drawing (pressed, focus, disabled), the V3 interaction rules apply on top of the V9 surface
(1 px press with a shorter shadow, a 3 px gold focus ring around the pill, 0.5 opacity when disabled).
