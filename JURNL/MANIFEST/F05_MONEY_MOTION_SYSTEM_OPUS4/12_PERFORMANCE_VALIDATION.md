# 12 · PERFORMANCE VALIDATION

Measured in Chromium through the DevTools protocol (`Performance.getMetrics`, `HeapProfiler.collectGarbage`, `Runtime.getHeapUsage`) by `scripts/jurnl/motion/perf_opus4.ts`, on the dev server, at 393 × 852. Raw data: `12_PERFORMANCE_DATA/perf_after_opus4.json` (this branch) and `perf_before_1297c7b34.json` (the OPUS3 head, same script).

## Idle scene, 12 s window after the entrance

| | Ambience (D + C running) | Still (reduced motion) | OPUS3 head (no ambience exists) |
|---|---|---|---|
| running animations | `jm-amb-light`, `jm-amb-sheen` | none | none |
| layouts | **0** | 0 | 0 |
| style recalculations | 5 | 0 | 0 |
| layout time | 0 s | 0 s | 0 s |
| style recalc time | < 1 ms | 0 | 0 |
| script time | 1 ms | 1 ms | — |
| task time | 7 ms | 3 ms | 3 ms |
| `requestAnimationFrame` calls by the page | **0** | 0 | 0 |
| `setInterval` created | **0** | 0 | 0 |

The ambient loops cost no layout and about 4 ms of extra task time over 12 s. They animate only `opacity` and `transform` on two small layers, so the compositor runs them. There is no blur: the motion stylesheet contains no `filter` or `blur(` (unit K2).

## Leaks: 80 overlay cycles

Four overlays (menu, search, move money, actions) were each opened and closed 20 times, then garbage collected.

| | This branch | OPUS3 head |
|---|---|---|
| JS heap before → after | 19.28 → 20.22 MB (+0.94) | 19.17 → 20.07 MB (+0.90) |
| DOM nodes before → after | 268 → 268 | 260 → 260 |
| closing copies left | **0** | — |
| one-shot animations still running | **0** | 0 |

- The heap growth matches the OPUS3 head's, so it is dev-mode React and V8 behaviour, not a motion leak.
- The DOM is unchanged after 80 cycles.
- The 8 extra nodes are the OPUS4 ambient and wash layers: light, sheen and its band, and one wash span per pocket paper.

## Hidden page

After `visibilitychange` to hidden: phase **SUSPENDED**, ambience **off**, **0** running animations. Every running one-shot response is cancelled (`setHidden → cancelAll`).

## Governor

| Mode | Channels | Proof |
|---|---|---|
| FULL (default) | 2 | E2E A1 (`D C`) |
| SUBTLE (data saver / `deviceMemory ≤ 2`) | 1 | E2E A5 (`D`) |
| OFF (reduced motion) | 0 | E2E R1 |

No telemetry is used and no other device assumption is made. Interaction correctness and financial feedback are identical in every mode; only decoration changes.

## Design rules held

- `fill: 'none'` on every one-shot response, so nothing is held after it ends.
- CSS one-shots use `backwards`: an animation that ends leaves no style behind.
- No `requestAnimationFrame` and no `setInterval` in `runtime/motion` (unit F3). The director wakes with one `setTimeout` at the next expiry.
- No continuous blur. The OV04 note's backdrop blur is the existing OPUS3 surface and is static.
