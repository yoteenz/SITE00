# 04 · MOTION DIRECTOR IMPLEMENTATION

`src/projects/jurnl/runtime/motion/director.ts` holds the `JurnlMotionDirector`. The runtime singleton is `motionDirector`, and `createMotionDirector(env)` builds one with an injectable clock for tests.

## Inputs

| Input | Source | Method |
|---|---|---|
| reduced-motion preference | `matchMedia('(prefers-reduced-motion: reduce)')` with a change listener | `setReduced` |
| page visibility | `visibilitychange` | `setHidden` |
| constrained device | `navigator.connection.saveData`, `navigator.deviceMemory ≤ 2` (only where the browser reports them) | `setConstrained` |
| design-preview intensity | `?motion=full\|subtle\|off` (design preview only) | `setOverride` |
| touch / pointer | `pointerdown` on the root, then `pointerup` / `pointercancel` on the window, tracked per `pointerId` | `beginInteraction()` → its end |
| typing | `focusin` / `focusout` on `input, textarea, select, [contenteditable]` | `setTyping` |
| overlays | MutationObserver on the overlay host (live children, closing copies excluded) | `setOverlays` |
| anchored surfaces | every `JurnlPopover` while mounted (selects, dates, the MANAGE POCKET note) | `holdOverlay()` → release |
| route change | `useLocation().pathname` (not on first mount) | `cancelAll()` + `navigate(700)` |
| collection change | `useMoneyCarousel.go()` | `navigate(520)` |
| committed state | `respond()` (from `useStateResponse` or after a store call returned ok) | `signal(phase)` + `play()` |

## Outputs

These are written on the `.jrn` root on every change:

- `data-jrn-motion-mode`: FULL, SUBTLE or OFF;
- `data-jrn-motion-phase`: one of the 11 phases;
- `data-jrn-ambient`: the granted channels, e.g. `D C`, or `off`.

`subscribe(fn)` notifies once per distinct mode, phase, channels, overlays or hidden signature.

## Ambient grant

`ambientAllowed()` requires all of the following:

- mode ≠ OFF;
- the page is visible;
- no overlay and no held surface;
- no pointer down;
- not typing;
- not navigating;
- no signal;
- the quiet period has passed.

`channels()` then takes the declared channels in preference order A (botanical), D (light), C (material), B (scenery), limited to `CHANNELS_FOR[mode]` (FULL 2, SUBTLE 1, OFF 0). Only surfaces with independently mounted art declare channels (see 10).

## One-shot responses: `play(el, keyframes, { key, priority, duration, easing, delay })`

- Returns `null` under reduced motion, while hidden, without an element, or where `el.animate` is missing.
- If a response is already running on the element:
  - a lower-priority request (larger number) is refused;
  - otherwise the running one is cancelled and the new one plays.
- Always `fill: 'none'`. On `finish` or `cancel` the element is untracked.
- `cancelAll()` cancels and untracks everything. It runs on route change, on a hidden page and when reduced motion is turned on.

## Verified behaviour

Unit tests (`tests/jurnlMotionOpus4.test.ts`, fake clock and fake elements):

| Test | Asserts |
|---|---|
| D1 | mode precedence (reduced › override › constrained › FULL) |
| D2 | the entrance quiet period; root attributes |
| D3 | grants FULL 2 / SUBTLE 1 / OFF 0, in preference order |
| D4 | a stale undeclare never removes a newer declaration |
| P1 | overlays pause; closing waits a quiet period |
| P2 | held popovers; a double release is harmless |
| P3 | INTERACTING → SETTLING → AMBIENT; ending twice counts once |
| P4 | typing |
| P5 | hidden → SUSPENDED, responses cancelled, `play` refused |
| P6 | NAVIGATING, then quiet |
| P7 | CONFIRMED holds then quiets; PROCESSING holds until cleared; a stale clear is ignored; ERROR outranks touch |
| P8 | self-wake, no polling, subscribers notified |
| R1–R4 | `play` refused under reduced / no element; `fill: 'none'`; interruption; the priority guard; `cancelAll` |

Browser (`e2e/jurnl/jurnl-motion-opus4.e2e.ts`):

| Test | Asserts |
|---|---|
| A1 | nothing during the entrance, then `D C` |
| A2 | touch, overlay and typing pause; recovery |
| A3 | a hidden page is SUSPENDED and recovers |
| A4 | a collection change is NAVIGATING |
| A5 | data saver → SUBTLE (`D` only) |
| R1 | reduced motion → OFF |
