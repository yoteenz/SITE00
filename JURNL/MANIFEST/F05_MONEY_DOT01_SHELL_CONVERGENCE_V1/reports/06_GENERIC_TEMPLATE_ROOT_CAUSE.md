# 06 · Generic-template root cause (screen 06 ALL ACCOUNTS)

Reproduced at 393 × 852 / 471 × 836 / 393 × 660 with 0, 1, 2, 3, 4, 5, 7 synthetic pockets (evidence/06_counts/before):

| Cause | Verified | Evidence |
|---|---|---|
| INCORRECT_SIDEKICK_MAPPING | yes | 06 mounted `env="SK02_FIELD"` (DirectoryPage.tsx before): SK02 with its papers removed = plain reconstructed olive field y 588–1548 |
| MISSING_ARTWORK_MOUNT | yes | 06's lower sheet, coastal engraving, laurel, red fabric (y 1100–1500) had no layer; SK02_FIELD's own landscape sits at 1548+ under the nav paper |
| DATA_DRIVEN_LAYOUT_COLLAPSE | yes | cards + action strip were document flow at the top of a 600–1446 content region: 2 pockets → one row, then ~850 board px of olive |
| GENERIC_COMPONENT_OVERRIDE | yes | actions were the generic `d01-btn` on 09_BLANK_TORN_PARCHMENT; cards the shared `AccountCard` |
| INCORRECT_SCALING (cards) | yes | the parent's SK01 card thumbnails (413 × 198) in a CSS grid, not 06's own larger papers (≈ 440 × 247) |
| FALLBACK_ICON_SUBSTITUTION | yes | ADD / REORDER glyphs were inline vectors (`plus-framed`, `updown`) |
| WRONG_RESPONSIVE_BREAKPOINT | yes | phones are width-first (u = w / 881): on any screen shorter than 9:16 (471 × 836, 393 × 660, iOS Safari with toolbars) the foot of the board (landscape, nav paper) was below the fold and the dock was drawn over the field |
| BAKED_ARTWORK_DUPLICATION | latent | mounting SK01 with the frame's NAV_PAPER layer would have doubled the nav paper — avoided (one owner) |
| STALE_PREVIEW_BUILD | possible, unverified | preview/tunnel has no DOT 01; the founder's capture must be an agent-served build (report 01) |

Same root on 22 EMPTY ACCOUNTS (generic panel + tiles on SK02_FIELD, its wallet / temple / sheet composition missing).
