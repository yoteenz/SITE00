# 03 · MATERIAL MOTION TOKENS

Source: `src/projects/jurnl/runtime/motion/materials.ts` (JS) and `motion/jurnl-motion.css` (`--jm-*` on `.jrn`).

## Easing per material

| Material | Curve | Character | JS | CSS |
|---|---|---|---|---|
| Paper | `cubic-bezier(0.22, 0.75, 0.28, 1)` | soft deceleration | `EASE.paper` | `--jm-ease-paper` |
| Bronze / coin | `cubic-bezier(0.3, 0, 0.12, 1)` | slow to start, settles firmly | `EASE.bronze` | `--jm-ease-bronze` |
| Wax | `cubic-bezier(0.34, 0.06, 0.2, 1)` | short compression, small rebound | `EASE.wax` | `--jm-ease-wax` |
| Oxblood textile | `cubic-bezier(0.45, 0.05, 0.25, 1)` | slow and soft | `EASE.textile` | `--jm-ease-textile` |
| Navigation | `cubic-bezier(0.25, 0.1, 0.25, 1)` | controlled, even | `EASE.navigation` | `--jm-ease-nav` |
| Error | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` | brief, local | `EASE.error` | — |

- Stone and sculpture never move: no token exists for them.
- No spring or rubber-band curve is used.

## Timing ranges

These are the sprint's ranges, encoded as `TIMING` in `materials.ts` and enforced by unit test T1.

| Range | ms | Used by |
|---|---|---|
| micro | 100–180 | press transforms (`--jm-micro` 140 ms) |
| paper feedback | 180–350 | `paperSettle` 340, `errorNudge` 320, carousel exit 180–300, settle back 140–280 |
| paper reveal | 350–550 | the MANAGE POCKET note 380 (`--jm-note-in`) |
| overlay | 350–650 | overlay entrance 420 (`--jm-overlay-in`); the exit copy is shorter, 220 |
| material | 450–800 | `bronzeSettle` 620, `waxStamp` 560, `warningSettle` 520, `consentAck` 600, `balanceAck` 700, warning seal 620 |
| navigation | 550–900 | a collection change: exit and entry together, ≤ 540 ms per paper. Route View Transition: 260 ms (unchanged). |
| ambient cycle | 8 000–20 000 | light 18 s, seal sheen 14 s |

## One-shot responses (`RESPONSES`)

Each response is a transform or opacity keyframe list, played with `fill: 'none'`, and holds one director signal while it plays.

| Name | Keyframes | ms | Easing | Signal | Used for |
|---|---|---|---|---|---|
| `paperSettle` | translateY 0 → −3px → 0 | 340 | paper | CONFIRMED | Buffer effect paper after a stored change; transfer status ARRIVED; a renamed pocket paper |
| `bronzeSettle` | rotate 0 → −2° → 0.7° → 0 | 620 | bronze | CONFIRMED | defined. No independent coin art is mounted where it would apply (see 17). |
| `waxStamp` | scale 1 → 0.94 → 1.02 → 1 | 560 | wax | CONFIRMED | defined. No independent wax art exists in the transfer surfaces (see 17). |
| `errorNudge` | translateX 0 → −3 → 3 → −2 → 0 | 320 | error | ERROR | a refused save (Buffer amount paper); an error line appearing |
| `warningSettle` | translateY 0 → 2px → 0 | 520 | textile | WARNING | transfer FAILED, RETURNING, REVERSED, NEEDS RECONCILIATION |
| `consentAck` | opacity 0 → 1 → 0 on the row's `.jce-ack` wash | 600 | textile | CONFIRMED | a stored consent change |
| `balanceAck` | opacity 0 → 1 → 0 on the paper's `.jrn-f05m__paper-ack` wash | 700 | textile | CONFIRMED | a pocket's stored balance changed (parent) |

## CSS-only material motion

| Name | What | ms |
|---|---|---|
| `jm-ovl-in` | an overlay plate or folio settles in: translateY 14px, rotate −0.35°, scale 0.992 → none | 420 |
| `jm-note-in` / `jm-note-in-up` | the MANAGE POCKET note lifts and turns from its pocket | 380 |
| `jm-warn-seal` | the caution surface's bronze seal settles once: rotate −5° → 1.6° → 0 | 620, 320 ms delay |
| press | menu papers `translateY(1px) scale(0.992)`; DELETE `translateY(1.5px)` at 200 ms on textile easing (deliberate, never springy); menu row chevron `translateX(2px)`; Buffer amount paper `translateY(-1px)` while focused | 140–240 |
| `jm-amb-light`, `jm-amb-sheen` | ambient loops (see 05) | 18 s, 14 s |
