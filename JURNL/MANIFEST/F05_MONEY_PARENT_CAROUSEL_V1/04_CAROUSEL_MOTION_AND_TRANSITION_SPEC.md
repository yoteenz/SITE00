# 04 — Carousel motion and transition spec

Motion shows which collection is being read. It never creates or changes financial state. All of it is CSS keyframes inside `@media (prefers-reduced-motion: no-preference)`, with fill `backwards` (entry) or `both` (exit, which is removed with its element). Nothing is left behind once a change settles; the E2E suite checks for no held transforms, no translucent papers and no running animations.

## Page arrival (unchanged pilot entrance, directive §09A)

Environment → title paper and seal → MONEY reveal → script → summary → the four papers (340–610 ms) → threads (≤ 640 ms). It plays only when the page mounts (`data-phase="load"`). A collection change does not replay it; a frame test asserts no shell animation runs during a change.

## Swipe start (§09B)

- The active collection follows the pointer horizontally at 0.55 × the drag, or 0.2 × at the ends (resistance). There is no rotation and no perspective.
- Shadows lean against the drag: `drop-shadow(∓4px 9px 9px)`.
- Text is never transformed apart from its paper.
- The statue, title, band, dots and dock do not move (pixel-identical; E2E 07–10).

## Collection exit (§09C)

| | |
|---|---|
| What | the four papers of the outgoing collection, as a group |
| Motion | `translateX(drag → ∓170 px)` and opacity 1 → 0 |
| Duration | 300 ms, `cubic-bezier(0.4, 0, 0.6, 1)` |
| Stagger | 35 ms per paper (0, 35, 70, 105 ms) |
| Threads and tokens (ACCOUNTS) | fade out in 160 ms |

Torn edges keep their shape, because each paper is one image with real alpha and is moved whole. Each paper stays bound to its own record (id-keyed elements) until it leaves.

## Collection entry (§09D)

| | |
|---|---|
| What | the four papers of the incoming collection, from the opposite side |
| Motion | `translateX(±150 px → 0)`, opacity 0 → 1, shadow from a lifted `drop-shadow(∓6px 12px 12px)` to the paper's resting halo |
| Duration | 360 ms, `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| Start | 60 ms after the change, then 30 ms per paper |
| Threads and tokens (ACCOUNTS) | fade in 160 ms, from 340 ms |

- Live numbers are in the DOM from the first frame. Nothing counts up or passes through fictional values.
- Interaction returns immediately: entering papers accept taps. After 520 ms the outgoing collection is removed and the incoming one is `idle`.

## Timing against the directive (§09F)

| Directive | Pilot |
|---|---|
| touch feedback 80–150 ms | panel papers scale to 0.985 in 120 ms (`:active`); account papers use the pilot's press state |
| threshold response immediate | the drag follows from 8 px; commit at 56 px or a 0.45 px/ms flick |
| paper transition 300–500 ms | exit 300 ms, entry 360 ms; the whole change ends by 510 ms (asserted ≤ 520 ms) |
| fragment stagger 25–65 ms | 35 ms (exit), 30 ms (entry) |
| settling 100–180 ms | a drag short of the threshold settles back in 160 ms |

## Reduced motion (§16)

- The collection changes at once: no exit group, no entry, no drag offset.
- The dot fill is instant.
- Every control still works: swipe, dots, keys, previous / next, panels. The E2E test asserts zero animations in the stage before and after a change.

## Evidence

Exact frames, captured paused and seeked, are in `11_MOTION/`.

- One change: 0, 60, 120, 180, 240, 300, 360, 420 and 520 ms, then settled.
- A mid-drag frame.
- An animated preview (`F05_CAROUSEL_CHANGE_PREVIEW.webp`) assembled from those frames.
