# 14 · RESPONSIVE VALIDATION

| Viewport | Ambient layers on their art | Light inside the board, top right | Page scroll (y / x) | Proof |
|---|---|---|---|---|
| 360 × 640 | yes | yes | no / no | E2E `V · 360×640`; `16_…/R-parent-resting-360x640__BEFORE_AFTER.jpg` |
| 393 × 660 | yes | yes | no / no | E2E `V · 393×660`; screenshot |
| 393 × 852 | yes | yes | no / no | E2E `V · 393×852`; screenshot; recordings P01–P05 |
| 430 × 932 | yes | yes | no / no | E2E `V · 430×932`; screenshot |
| 820 × 1180 (tablet) | yes | yes | no / no | E2E `V · 820×1180`; screenshot |
| 1440 × 900 (desktop) | yes | yes | no / no | E2E `V · 1440×900`; screenshot |

- "On their art" means the sheen box equals the seal's box within 1 px at every size, because both use the same board rectangle.
- OPUS4 adds no new layout. The ambient spans are absolutely positioned inside the scaled board, with `pointer-events: none`. The closing copy sits in the overlay host and is removed.
- `BEFORE_AFTER_STATES.json` records `pageScroll: { y: false, x: false }` for every captured state on both heads.

## Keyboard-open states

- OPUS4 adds no motion to fields or the keyboard. While editing, the Buffer amount paper rises 1 px (a transform), which does not change layout.
- The OPUS3 keyboard-open captures remain valid: ADD A POCKET, SEARCH and BUFFER, at 6 viewports, from `scripts/jurnl/global-menu/capture_opus3_states.ts`.
- The keyboard-open E2E checks still pass on this branch: C6 BUFFER (keyboard open keeps the field and actions on screen) in `jurnl-global-menu-recovery.e2e.ts`, mobile project, see 13.

## Short phones

- At 393 × 660 and 360 × 640 the overlays keep their OPUS3 geometry: only the list or body scrolls inside them (E2E C7, S1 and A3 pass).
- The longer entrance (420 ms) does not move resting geometry. A3 now reads positions after the entrance has settled, as the OPUS3 C-tests already did (see 13).
