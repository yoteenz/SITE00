# 06 — Animation architecture

The approved picture does not move as one image. Motion lives on separate layers, each with its own job:

- **L0 environment** (`.jrn-f05m__env`): text-free SIDEKICK slices.
- **L1 collage objects:** title paper and wax seal (true alpha).
- **L2 live type:** wordmark, MONEY, the script line, the four figures.
- **L3 papers:** one button per account, plus the ADD and MOVE papers.
- **L4 chrome:** chips and the global dock (never animated); overlays use the shared drawer motion.

Implementation: CSS keyframes in `src/projects/jurnl/runtime/screens/f05/jurnl-f05-motion.css`, all inside `@media (prefers-reduced-motion: no-preference)`, with `animation-fill-mode: backwards`. A finished animation leaves no style behind (E2E check 19).

- **Geometry:** only `transform`, `opacity`, `filter` and `clip-path`.
- **Data:** no animation reads or writes data.
- **Loops:** none.

## A. Page entrance (measured, ≤ 650 ms; E2E asserts the last pilot animation ends by 650 ms)

| Phase | Layer | Start → end (ms) | Motion | Why it is safe |
|---|---|---|---|---|
| Environment establishes | L0 | 0 → 240 | exposure: brightness 0.86 → 1, saturation 0.92 → 1 | no geometry changes, so nothing misregisters |
| Title paper settles | L1 | 100 → 420 | scale 1.014 → 1 about (18 %, 70 %), soft shadow fades | Scale-only envelope: the paper always covers its footprint. **0 px of covered fill exposed** (pipeline `envelope_check`). |
| Seal presses | L1 | 180 → 480 | scale 1.06 → 1, rotate −3° → 0 about centre | scale margin ≥ rotation sweep: **0 px exposed** |
| MONEY reveals | L2 | 200 → 500 | `clip-path` mask, left → right | text is in the DOM from frame 0 |
| Script reveals | L2 | 280 → 620 | mask, like ink | lowercase DOM text |
| Figures appear | L2 | 270 → 470 | opacity 0 → 1, 5 px rise | **values never count up**; the final number is the only number |
| Papers settle | L3 | 340 → ≤ 610 | 14 px rise, scale 0.985 → 1, opacity; stagger `min(45 ms, 70 ms / (n − 1))` | The stagger shrinks with the number of papers, so the last always lands by 610 ms (a fixed 45 ms reached 825 ms with 6 papers; the test caught it) |
| Navigation | L4 | 0 | none | always available and never waits |

The app shell's own 700 ms blur-fade (`jrn-family` on `.jrn-screen`) is disabled on this screen only. It would have hidden the layered sequence and held the first legible figures past the budget.

Deterministic frames: `13_MOTION_CAPTURE/` holds frames at 0, 80, 160, 240, 320, 400, 480, 560 and 650 ms. They were made by freezing every CSS animation from its first frame and seeking it, not by timed screenshots.

## B. Paper interaction

| State | Motion | Timing |
|---|---|---|
| Hover (fine pointer only) | translateY −3 px, scale 1.008, deeper halo | 180 ms |
| Press (pointer down) | translateY +1 px, scale 0.985, tighter shadow | 120 ms |
| Selected | translateY −7 px, scale 1.035, deepest shadow, `z-index` raised | applied synchronously, then the transition starts (no delay before routing) |
| Keyboard | `:focus-visible` gold outline 5 source px; Enter / Space open; ← / → change pages | — |

Selection is bound to the paper's `data-account-id`. The click handler reads the account object from the canonical reading, never a position.

## C. Account transition (shared element)

1. The click sets `view-transition-name: jrn-place` on the selected paper and calls `document.startViewTransition(() => flushSync(() => go('money/places/{id}')))`.
2. The account route's title already carries `view-transition-name: jrn-place`. That one-line hook is the only change to the child page.
3. The browser morphs the paper into the title in 420 ms; the rest of the page cross-fades in 260 ms. `13_MOTION_CAPTURE/route-*.png` holds the frames, made by freezing and seeking the view-transition pseudo-elements.
4. **Interruptible:** a `popstate` during the transition calls `skipTransition()`.
5. **Fallback:** without the View Transitions API, or under reduced motion, the route changes at once.
6. **Return:** the selected id is kept in `sessionStorage` (a UI convenience, not data). On return, that paper plays a 420 ms settle from its lifted pose.
7. **Clean-up:** E2E checks 13 and 19 confirm no transforms are held, no element keeps the `jrn-place` name, and no animation is still running.

## D. Environmental depth

Depth comes from different layers moving differently: the environment only changes exposure, the papers move, the seal turns. The bust and botanicals are **not** parallaxed. Moving them independently would expose background that the flattened source does not contain (doc 02, rows 2–4). There is no perpetual sway and no pointer-tracking parallax.

## E. Reduced motion

`prefers-reduced-motion: reduce` turns off:

- every pilot keyframe and paper transition;
- the view-transition animations;
- the route morph, which is skipped in JS.

Every action and figure is unchanged (E2E check 14 asserts 0 pilot animations and runs the full flows).

## Timing summary vs the sprint targets

| Target | Sprint | Pilot |
|---|---|---|
| Tactile feedback | 120–220 ms | 120 (press) · 180 (hover) |
| Paper lift | 180–300 ms | applied at once, then the morph (420 ms) |
| Typography reveal | 200–450 ms | 300 (MONEY) · 340 (script) |
| Major transition | 350–650 ms | 420 ms morph · 260 ms cross-fade |
