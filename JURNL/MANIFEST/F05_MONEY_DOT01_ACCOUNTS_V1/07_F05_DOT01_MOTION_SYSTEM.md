# 07 · Motion system

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

All keyframes are declared only under `@media (prefers-reduced-motion: no-preference)` (`jurnl-f05-dot01.css`). With reduced motion, nothing moves and every state appears at once.

| Moment | What moves | Timing | Contract |
|---|---|---|---|
| Parent entry (01) | environment static → title paper, seal and four papers settle → MONEY, band and figures reveal | papers 300 ms, 36 ms stagger; text from 140 ms; done ≈ 900 ms; never replayed on a carousel change | static environment → papers settle → content reveals ✔ |
| Carousel change (01) | the central papers only; exit toward the swipe, enter from the other side | ≤ 520 ms, 30–35 ms stagger | central group only; statue, JURNL, nav fixed ✔ |
| Account select (01 → 02–05) | the chosen paper morphs into the account page's balance paper (View Transition `jrn-place`); press lift on the paper | lift 120 ms; route transition 420 ms | lift 100–160 ms; transition 350–500 ms ✔ |
| Detail entry (02–13, 22, 31, 32, 35) | the environment brightens in; papers settle; heading reveals; strips stagger | env 220 ms; papers 300 ms + 36 ms stagger from 90 ms; heading 300 ms at 140 ms; strips 240 ms + **34 ms** stagger from 280 ms | strips stagger 25–45 ms ✔ |
| Figures | rendered in their final value from the first frame (`data-jrn-amount-cents`) | no count-up | no false intermediate values ✔ |
| Overlay (14–21, 23–30, 33, 34, 36, 37) | an independent paper composition rises over the page | 260 ms | 220–320 ms ✔; focus trap, Escape, focus restored ✔ |
| History rows | the first 8 rows slip in | 200 ms + 32 ms stagger | — |
| Receipt scan (27) | a scan line moves over the user's photo while the engine reads; the step list follows the engine's own progress events | scan line 1.6 s alternate; steps = real stages (loading reader → reading text n % → finding merchant / date / total → checking duplicates) | follows the real extraction, not a countdown ✔ |
| Saved / corrected | the laurel seal stamps once | 300 ms | — |

## Reduced motion

- No keyframes run, and the shell's family screen transition is stopped too (this sprint fixed a specificity gap in the global rule).
- The View Transition is skipped.
- The browser test `reduced motion · no animation runs` counts running animations that move or resize anything: it found 0 on the page, after navigating, in an overlay and after a save.

## Captures (`MOTION/`)

- `F05_DOT01_PARENT_MOTION_PREVIEW.webp` and `parent-entrance_frames.webp`: the parent entrance, paused and seeked from 0 to 1100 ms.
- `F05_DOT01_ACCOUNT_MOTION_PREVIEW.webp`, `expansion_frames.webp` and `account-entrance_frames.webp`: the bank paper becoming the account page (View Transition frames 0–420 ms), then the account page entrance from 0 to 900 ms.
- `F05_DOT01_RECEIPT_WORKFLOW_PREVIEW.webp`: the receipt workflow as real states on the real engine — capture → scanning → review (read values) → transaction review → saved → transaction detail. This is a sequence of states, not a screen recording.
