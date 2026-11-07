# 18 · FOUNDER REVIEW

Draft PR **#1723** (`claude/jurnl-global-eight-overlays-menu-recovery-um0u93` → `cursor/jurnl-tunnel-opus-v3-overlays-4e5a`). Not merged, not deployed.

## What to look at first

1. `15_RUNTIME_MOTION_RECORDINGS/P01_MONEY_PARENT.mp4`:
   - the 20 s idle sequence from about 5 s;
   - the touch interruption at about 26 s and the recovery;
   - the swipes from about 32 s.
   The ambience is deliberately close to the threshold of notice. On a phone at arm's length it reads as light moving over the coast and a glint crossing the seal now and then.
2. `P04_GLOBAL_MENU.mp4`: the Buffer save settle, the refused-amount nudge, the consent acknowledgement, the menu's closing copy, and search while typing.
3. `P03_MOVE_MONEY.mp4`: nothing celebrates a transfer that is only recorded. Arrival settles once; a failure settles calmly.
4. `16_BEFORE_AFTER_SCREENSHOTS/P01-parent-ambient-peak-DIFF-x8.jpg`: exactly where the ambience acts, amplified ×8.

## Decisions for the founder

| # | Question | Current choice |
|---|---|---|
| F1 | Ambient intensity. The light peaks at opacity 0.16 for a moment in each 18 s cycle; the sheen crosses the seal in about half a second every 14 s. Stronger, as is, or subtler? | as is |
| F2 | Botanical sway (A) and scenic depth (B) need the extractions listed in 17 (X1, X2). Commission them? | not started (no artwork in this sprint) |
| F3 | A wax stamp after a transfer is persisted needs the OV03 seal as its own layer (X3). Commission it? | no stamp |
| F4 | Overlay entrance is now 420 ms (it was 240–260 ms) with a slight paper turn; the exit copy is 220 ms. Keep? | 420 / 220 ms |
| F5 | The balance wash marks a pocket paper whose stored balance changed. Keep, or keep the papers fully still? | wash on |
| F6 | DOT 03 / DOT 04 have no state of their own to answer, so they use the shared vocabulary only. Any specific choreography wanted? | none |

## Status against the sprint's success criteria

| Criterion | Status |
|---|---|
| The MONEY family no longer relies primarily on one-time entrance animations | **met**: ambience after the entrance; responses to touch and stored state |
| Selected scenes show subtle life after loading | **met**: parent D + C; DOT 01 seal pages C |
| Motion responds to actual interaction; gestures follow the finger; interactions immediate | **met**: swipe contract (E2E W1–W3), press affordances, no delays |
| Paper tactile; bronze and wax weighted | **partly**: paper and the bronze warning seal are in place; wax and coin responses are defined but have no independent art to move (17) |
| Animations interruptible; the environment rests naturally | **met**: keyed interruption, cancel on route / hidden / reduced; at rest only the two ambient layers run |
| Motion respects actual financial state and never manipulates records | **met**: unit F1–F5; E2E F1–F3; no store import in the motion layer |
| Reduced motion works; ambience pauses when inappropriate | **met**: E2E R1, A2–A5 |
| No new overflow, page scroll or duplicated assets; no distorted art | **met**: E2E V (six viewports), O1 (copies carry no asset ids); see 13 for the suite results |
| No accessibility regressions | **met for the motion layer**: copies are inert and hidden, focus returns, no flashing. The pre-existing DOT 01 axe test crashes the page on base too (13). |
| Actual runtime motion evidence | **met**: six recordings with timelines; before/after screenshots |
| No deployment, no merge | **met** |

## Not verified

- iOS Safari on a device.
- Real-device touch latency. The recordings use DevTools touch events in Chromium.
