# 06 · MONEY PARENT MOTION

Files: `screens/f05/MoneyMotionParent.tsx`, `useMoneyCarousel.ts`, `jurnl-f05-motion.css`, `jurnl-f05-carousel.css`.

## Layers and what may move

| Layer | Content | Motion |
|---|---|---|
| L0 | SIDEKICK (bust, arch, coast, botanicals, baked) | entrance brightness only (unchanged). **Never moves afterwards.** |
| ambient D | `.jma-light` over the scenery | opacity loop while granted |
| L1 | title paper, wax seal (independent, real alpha) | entrance scale (unchanged); the seal gets the ambient C sheen while granted |
| L2 | JURNL, MONEY, script, HELD / OWED / COMMITTED / AVAILABLE | entrance reveal (unchanged). **Never animated afterwards; figures never move.** |
| L3 | the four collections of papers, threads, tokens | swipe, collection change, return / settle, balance wash |
| L4 | chips, dock | press only |

## Implemented

1. **Ambient scene depth.** Implemented as light and material presence, D + C (see 05). Botanical and scenic depth need extracted art (see 17).
2. **Account papers as objects.**
   - Unchanged: the press lift (`data-pressed`), the long-press MANAGE POCKET, and the shared-element lift into the account page (`view-transition-name: jrn-place`, `data-lifted`).
   - New: a **stored balance change** (a recorded transfer leg, a correction) gets one opacity wash on that paper only (`balanceAck`, 700 ms). The amount never moves; nothing plays on arrival or for a pocket that has just appeared. Verified by E2E F3.
3. **Swipe contract.** Verified by E2E W1–W3.
   - **Progress follows the gesture.** The collection is translated by the drag, ×0.55 (×0.2 resistance at the ends), with the shadow leaning against the motion (unchanged).
   - **Direction follows the finger.** Left → next, right → previous (`data-dir`).
   - **Cancel reverses cleanly.** A release before the threshold settles back in `--f05m-settle-ms` = 140 + 1.4 × |drag| ms, clamped 140–280.
   - **Commit completes naturally.** The exit keyframes start from where the finger left the papers (`--f05m-drag`). Their duration is `--f05m-exit-ms` = remaining travel ÷ release speed, clamped 180–300 ms. Release speed is a short running average of the last moves. A tap, key or dot uses the full 300 ms.
   - **No unrelated entrance after a swipe.** E2E W2 records every `animationstart` during the change: only `f05m-out-*`, `f05m-in-*`, `f05m-ghost`, `f05m-fade` and `f05m-token` occur, with no shell, page or paper-arrival entrance.
   - **Rapid taps.** At most one exit group; the change lands on the last collection asked for, with no held transforms (W3).
   - **Rail stagger.** A rail paper's stagger is its position on its page, so a sixth pocket never starts late (conflict B).
4. **A just-added pocket.** It settles once (`data-settle`, cleared after 700 ms). `data-fresh` stays as its identity. A later collection change never replays it (conflict C, E2E W4).
5. **Contextual movement on a DOT.** The collection change runs in the direction of the chosen dot (unchanged), and the director marks it NAVIGATING so ambience waits until the papers land (E2E A4).
6. **Stable resting composition.** At rest nothing but the two ambient layers runs, and they are at opacity 0 for most of each cycle (E2E A1: `other: []`).
7. **Four-dot navigation model.** Unchanged.

## Not changed

Transfer threads and tokens show the recorded settlement state:

- not left: the token rests at the source;
- in transit / returning: the token rests between the papers;
- finished: the thread resolves into the destination (COMPLETED) or closes.

These were already state-bound and are kept as they were.
