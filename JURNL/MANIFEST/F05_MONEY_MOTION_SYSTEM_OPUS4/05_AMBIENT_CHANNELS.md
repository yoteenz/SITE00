# 05 · AMBIENT CHANNELS

The rule: alive, not busy. Each cycle is mostly stillness, and nothing ambient touches a figure, a word, a field or a large paper with live content.

## Channels

| Channel | Meaning | Status | Where | How |
|---|---|---|---|---|
| A · botanical | leaves / lemons swaying | **not implemented** | — | The botanicals are baked into the SIDEKICK (L0). Moving them would mean shifting the background, which the sprint forbids. See 17: extraction need. |
| B · scenic depth | coast / sea / sky parallax | **not implemented** | — | The arch and coast are baked into the SIDEKICK. Same reason. See 17. |
| C · material presence | light crossing the wax seal | **implemented** | MONEY parent (`F05_MOTION_WAX_SEAL.webp`, L1, independent); DOT 01 pages that draw an independent seal (`sk01_seal`, `seal_sk03`, screen `seal*` layers) | `.jma-sheen` span at the seal's own box, masked to the seal's own alpha (`mask: var(--jma-mask)` = the same file, already mounted). A 38 % light band `> i` travels across: `jm-amb-sheen 14s` on bronze easing, 2.2 s delay, still for 0–76 % of the cycle. |
| D · soft light | a faint warm light over the scenery | **implemented** | MONEY parent, over the arch and coast (board x 0.6–1.0, y 0–0.36) | `.jma-light` radial gradient, opacity only: `jm-amb-light 18s` on textile easing. Still for 0–32 %, peak opacity 0.16 at 56 %, back to 0. The art itself never moves. |

## Grants

| Surface | Declares | FULL | SUBTLE | OFF / reduced |
|---|---|---|---|---|
| MONEY parent | `D`, `C` | D + C | D | none |
| DOT 01 page with an independent seal | `C` | C | C | none |
| DOT 01 page on SK02 (no independent seal) | nothing | none | none | none |
| Overlays, sheets, popovers (task surfaces) | nothing; they also pause any ambience behind them | none | none | none |

## When it runs

Ambience is granted only when all of these hold (see 04):

- the entrance quiet period (1.4 s) has passed;
- nothing is touched or typed;
- no overlay or popover is open;
- no navigation is in progress;
- no financial signal is held;
- the page is visible.

When a grant is withdrawn, the attribute becomes `off` and the CSS animation is removed at once. The light and sheen are at opacity 0 without the animation, so a pause never leaves a lit frame behind.

## Proof

- **E2E A1.** Off during the entrance. Then exactly `jm-amb-light` on `.jma-light` and `jm-amb-sheen` on `.jma-sheen > i`, both infinite and both opacity/transform only. Nothing else running. The SIDEKICK, seal and title paper carry no animation.
- **E2E A2–A5.** Touch, overlay, typing, hidden page, navigation and SUBTLE.
- **Recordings.** P01 includes a 20 s idle ambient sequence, a touch interruption and the recovery.
- **Timelines.** `15_RUNTIME_MOTION_RECORDINGS/P01_MONEY_PARENT.timeline.json` logs every change of `data-jrn-ambient` with its time.
