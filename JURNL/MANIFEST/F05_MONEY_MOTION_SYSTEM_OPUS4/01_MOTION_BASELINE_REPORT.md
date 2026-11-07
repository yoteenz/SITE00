# 01 · MOTION BASELINE REPORT

Sprint: `P0.JURNL.F05-MONEY.INTELLIGENT-IMMERSIVE-MOTION-SYSTEM-AND-LIVING-ENVIRONMENT.CONVERGENCE.OPUS4`

The baseline was inspected on `claude/jurnl-global-eight-overlays-menu-recovery-um0u93` at `1297c7b34`, the OPUS3 head before any OPUS4 change. The PR base is `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` at `eb9058e03`.

## What moved before OPUS4

Almost all motion was a one-time entrance that ended about 650 ms after the page appeared. Nothing moved once the page was at rest.

| Surface | Motion | Where | Duration |
|---|---|---|---|
| MONEY parent | SIDEKICK brightness reveal | `jurnl-f05-motion.css` `f05m-env` | 240 ms |
| | title paper scale-in, wax seal scale-in | `f05m-title`, `f05m-seal` | 320 ms, 300 ms |
| | MONEY / script clip reveal, summary rise | `f05m-reveal`, `f05m-rise` | 200–340 ms |
| | four papers, staggered (`--i` × 45 ms) | `f05m-paper` | 340–610 ms |
| | threads / tokens appear | `f05m-fade`, `f05m-token` | 200 ms |
| | return from an account (`data-return`) and the just-added pocket (`data-fresh`) | `f05m-return` | 420 ms |
| | a finished transfer resolves into its destination or closes | `f05m-ghost`, `f05m-arrive` | 300–480 ms |
| MONEY carousel | exit 300 ms + 35 ms stagger, entry 360 ms + 30 ms stagger | `jurnl-f05-carousel.css` | ≤ 520 ms |
| | drag follows the finger (×0.55, ×0.2 at the ends); settle back | `useMoneyCarousel.ts` | fixed 160 ms |
| Opening a pocket | shared-element View Transition (paper → account title) | `MoneyMotionParent.openPlace` | 260 ms |
| DOT 01 pages | environment brightness, layer settle, title reveal, strips, content, slips, stamp | `jurnl-f05-dot01.css` | 200–440 ms |
| Overlays | folio / shell / menu entrance; scrim fade | `jed-in` 260, `jsh-in` 240, `jgm-in` 260, `jv3-fade` 200 | ≤ 260 ms |
| | close: instant (React unmount) | — | 0 ms |
| Popovers (selects, date, MANAGE POCKET note) | rise | `jrn-pop-in` | 160 ms |
| Controls | press scale / translate transitions | several | 120–180 ms |

## What was missing

- No motion after the entrance. No ambient life, no idle state.
- No coordinator. Every surface timed itself, with no shared priorities, no cancellation and no pause while hidden.
- No response to a committed financial state. The only exception was transfer threads resolving.
- Overlays closed instantly, so the exit had no relation to the entrance.
- One easing per file rather than one per material.

## Conflicts found

| ID | Conflict | Effect | Resolution (OPUS4) |
|---|---|---|---|
| A | `.jrn[data-jrn-f05-dot01] .jrn-screen { animation: none }` ties in specificity with `.jrn .jrn-screen[data-transition='family']`, so the winner depends on stylesheet order | a 700 ms blur fade could play on top of the account page's own entrance | `.jrn[data-jrn-f05-dot01] .jrn-screen[data-transition] { animation: none }` (E2E F5) |
| B | Rail paper `--i` was the account index | the 6th pocket started 225 ms late in a change, past the 520 ms change window | `--i` is the position on its page (`index % 2`) |
| C | `data-fresh` was never cleared, and the `[data-phase='idle']` selector re-matched after every collection change | the just-added pocket replayed `f05m-return` after unrelated swipes | `data-fresh` stays as identity; a separate one-shot `data-settle` is cleared after 700 ms (E2E W4) |
| D | Several E2E helpers awaited `finished` on every animation, or called `finish()` on all of them | infinite ambient loops would hang or throw | helpers skip `jm-amb-*` and finite-check before `finish()`; strictness is kept (see 13) |
| E | Inline transforms on `.jrn-f05m__board`, `__mark` and tokens | a motion layer must not override them | no OPUS4 rule touches these elements |

## Reduced motion before OPUS4

The parent used a JS `useReducedMotion` and CSS `no-preference` blocks. These had gaps:
- `.jrn-pop-backdrop` still faded;
- DOT 01 press transitions still travelled;
- VIEW ALL and the drag settle transitions still ran.

## Gestures

- Carousel swipe: THRESHOLD 56 px or FLICK 0.45 px/ms.
- Edge zone: 20 px.
- Trackpad step: 60 px.
- Long press: 520 ms (`useLongPress`).
- Directory reorder drag.
