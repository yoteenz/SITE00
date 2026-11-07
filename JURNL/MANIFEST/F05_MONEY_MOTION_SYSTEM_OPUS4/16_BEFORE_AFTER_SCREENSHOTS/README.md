# 16 · BEFORE / AFTER SCREENSHOTS

Both sides were captured by the same script, `scripts/jurnl/motion/capture_opus4_states.ts`:
- **BEFORE**: the OPUS3 head `1297c7b34`, in a separate worktree;
- **AFTER**: this branch.

Both run with the same synthetic worlds at device scale 2. A mid-motion frame is the runtime's own frame: every animation that is *running* at that moment is paused at the stated time (finished animations are not rewound). Each image is labelled with the animations present. `BEFORE_AFTER_STATES.json` holds, for every state on both heads:
- the root motion attributes;
- the running animations;
- the closing-copy count;
- page scroll.

The files here are JPEGs at half size. The full-resolution PNGs are in the full evidence ZIP.

| State | What to look for |
|---|---|
| `P01-parent-resting` | Resting composition. Identical art; AFTER lists `jm-amb-light`, `jm-amb-sheen` running (the light is at opacity 0 for most of its cycle). |
| `P01-parent-ambient-peak` | The light at its crest and the sheen crossing the seal. Deliberately near-imperceptible. See `P01-parent-ambient-peak-DIFF-x8.jpg` (the difference to resting, amplified ×8: only the scenery's top right and the seal change; max channel delta 264 / 765 at the seal, ≈ 4.0 % of the frame's pixels touched) and `P01-seal-sheen-crop-x3.jpg`. |
| `P01-parent-swipe-exit-midway` | A collection change at 150 ms: only the papers move, the shell is still, and the dots fill. |
| `P02-manage-note-entering-190ms` | MANAGE POCKET at 190 ms. BEFORE: the 160 ms rise has finished (and `jrn-family`, the screen fade conflict A, appears on the account page). AFTER: the note is still lifting from its pocket (`jm-note-in`), and no family fade. |
| `P04-buffer-saved-settle-crest` | BUFFER right after a stored save: the effect paper at its settle crest (AFTER) vs no response (BEFORE). |
| `P04-menu-close-sequence-from-recording.jpg` | The menu's closing copy, cut from the P04 recording at 40 ms steps. In BEFORE the menu simply disappeared. (A frozen still cannot hold the copy: its safety timer removes it at about 340 ms, which is shorter than a full-resolution screenshot.) |
| `P05-reduced-resting`, `P05-reduced-menu-open` | Reduced motion. AFTER: mode `OFF`, nothing running, the menu opens without animation. |
| `R-parent-resting-<w>x<h>` | Resting composition at 360 × 640, 393 × 660, 393 × 852, 430 × 932, 820 × 1180 and 1440 × 900. No page scroll on either head. |
