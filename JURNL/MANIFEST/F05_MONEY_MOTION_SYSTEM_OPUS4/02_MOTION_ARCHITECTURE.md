# 02 · MOTION ARCHITECTURE

```
                      the page                                   the store (committed state only)
   pointer · typing · route · overlays · visibility · reduced-motion        │ saved buffer, consent value,
                      │                                                     │ transfer state, pocket balance,
                      ▼                                                     ▼ refused save
             useMotionRuntime (JurnlRuntimeRoot)                 useStateResponse / respond()
                      │                                                     │
                      └──────────────►  JurnlMotionDirector  ◄──────────────┘
                                        (motion/director.ts)
                                         │            │
               root attributes on .jrn ◄─┘            └─► play(): Web Animations, fill:'none',
               data-jrn-motion-mode                         keyed interruption, priority guard
               data-jrn-motion-phase
               data-jrn-ambient  ──► CSS ambient loops (motion/jurnl-motion.css), only on .jma-* layers
```

## Files

| File | Role |
|---|---|
| `src/projects/jurnl/runtime/motion/director.ts` | `createMotionDirector(env)` and the runtime singleton `motionDirector`. Framework-free, owns no financial state. |
| `motion/materials.ts` | Easing per material, timing ranges, one-shot `RESPONSES`, `respond(el, name)` |
| `motion/useMotion.ts` | `useMotionRuntime` (page wiring), `useAmbientChannels` (a surface declares channels), `useStateResponse` / `stateResponseStep` (a response only on a real committed change) |
| `motion/overlayMotion.ts` | The overlay host observer (open count, the closing copy) and `ghostAfterClose` for anchored surfaces |
| `motion/jurnl-motion.css` | Material tokens, the ambient layers and loops, overlay and note entrances, press affordances, the warning seal, the reduced-motion block |
| `JurnlRuntimeRoot.tsx` | Mounts `JurnlMotionRuntime` once per runtime: root, overlay host, route key, design-preview `?motion=` override |

## Contracts

1. **State drives motion; motion never drives state.** No file in `runtime/motion` imports the store, the ledger or the repository (unit test F3). Responses are called from effects that run after a commit, such as `useStateResponse(b.storedUsd …)`, never from a click handler before persistence.
2. **One phase at a time.** Order: SUSPENDED (hidden) › signal (CONFIRMED, WARNING, ERROR, PROCESSING, VALIDATING) › INTERACTING (pointer or typing) › NAVIGATING › SETTLING (quiet period) › AMBIENT (channels granted) › IDLE.
3. **Priority.** 0 accessibility and safety, 1 active interaction, 2 financial feedback, 3 navigation, 4 ambient.
   - A response with a lower priority never displaces a running one with a higher priority.
   - A newer response on the same element interrupts the older one.
   - Ambient never runs while anything of priority 0–3 is happening.
4. **Cancellation.**
   - `cancelAll()` runs on route change, on a hidden page and when reduced motion is turned on.
   - Every one-shot animation uses `fill: 'none'`, so nothing persists after it ends.
   - The closing copy is removed when it finishes, when it is cancelled, or by a 340 ms safety timer.
5. **No polling, no rAF.**
   - The director wakes itself with one `setTimeout` at the next expiry (quiet period, navigation, signal).
   - No `requestAnimationFrame` or `setInterval` exists in `runtime/motion` (unit test F3).
   - Ambient loops are CSS and compositor-only.
6. **Mode.**
   - OFF when the reduced-motion preference is set (always wins).
   - Otherwise the design-preview `?motion=full|subtle|off` override, if given.
   - Otherwise SUBTLE when the browser reports data saver or `deviceMemory ≤ 2`.
   - Otherwise FULL.
   - No other device assumption is made and no telemetry is used.

## Quiet periods (ms)

| After | Quiet | Constant |
|---|---|---|
| the runtime attaches (entrance) | 1400 | `QUIET.entrance` |
| a touch ends, typing ends, an overlay closes, a popover closes | 900 | `QUIET.interaction` |
| navigation (route or collection change) | its own length + 1000 | `QUIET.navigation` |
| a signal ends, the page becomes visible | 700 | `QUIET.signal` |

Signals hold their phase for CONFIRMED 800, WARNING 700 and ERROR 650 ms. PROCESSING and VALIDATING hold until cleared, and a stale clear is ignored.
