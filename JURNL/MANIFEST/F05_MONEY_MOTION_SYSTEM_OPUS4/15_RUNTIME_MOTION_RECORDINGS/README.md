# 15 · RUNTIME MOTION RECORDINGS

These are real browser sessions on this branch's runtime:
- Chromium via Playwright `recordVideo`;
- 393 × 852, touch input through the DevTools protocol;
- synthetic worlds, with exchange rates stubbed.

Each one starts after the page entrance and shows real interactions. Produced by `npx tsx scripts/jurnl/motion/record_opus4.ts <out>`.

The small grey dot marks the recording's touches. It is evidence tooling injected by the recorder, not part of JURNL.

| Recording | Length | Shows |
|---|---|---|
| `P01_MONEY_PARENT.mp4` | 70 s | The entrance with ambience off, then a **20 s idle ambient sequence** (light over the scenery, the sheen across the seal). A touch held on the papers: **ambience pauses at once**, then a quiet period and **recovery**. A swipe left continuing at finger speed. A short drag that settles back without committing. A swipe plus a dot. Two swipes right (direction follows the finger). Opening CASH (shared paper, no family fade). Back. At rest again with ambience resumed. |
| `P02_ADD_MANAGE_POCKET.mp4` | 33 s | ADD A POCKET enters as a paper, saves, closes with its shorter copy, and the new pocket settles once. In the directory: MANAGE POCKET note lifts from its pocket; Escape closes it with its copy. RENAME: cream press, the rename overlay replaces the note with no copy, save, then the renamed paper settles after the copy has gone. DELETE: blush deliberate press, KEEP POCKET. |
| `P02B_DELETE_BLOCKED.mp4` | 13 s | DELETE on a pocket something depends on: the bronze warning seal settles once, slowly. KEEP POCKET closes with the copy. |
| `P03_MOVE_MONEY.mp4` | 32 s | MOVE MONEY recorded IN TRANSIT: **no completion motion**; the source paper washes once (its stored balance went down); the token rests between papers. The detail sheet shows no motion for in transit. ARRIVED (a recorded step): the status settles once and the thread resolves into the destination (the destination paper washes). A second transfer FAILED / NOT BACK YET: a calm settle, no shake. |
| `P04_GLOBAL_MENU.mp4` | 34 s | The menu enters, with row hover. BUFFER replaces the menu (no copy). SAVE: the effect paper settles once. A refused amount: the amount paper nudges once and nothing is stored. PRIVACY: the consent row warms once on ON and once on OFF, and OFF stays OFF. Escape: the menu closes with its copy. SEARCH while typing: rows reflow without per-row animation. |
| `P05_FINANCIAL_FEEDBACK_REDUCED_MOTION.mp4` | 28 s | Reduced motion: no ambience, no entrance, no exit copy, no response. The swipe changes at once, the transfer records, and the Buffer saves and refuses, all working. |

## Alongside each recording

- **`<id>.timeline.json`** is the machine record of the same session:
  - every change of the director's `mode`, `phase` and `ambient`;
  - every CSS animation start (name and element);
  - every one-shot response (keyframes, duration, element);
  - every step label, in page milliseconds.
  - A full page load starts a new segment.
- **`<id>_STEPS.jpg`** has one still per step. The full-resolution stills and the browser's original `.webm` files are in the full evidence ZIP.

## Key timeline facts

These are quoted from the JSON files.

**P01**
- `phase=AMBIENT ambient=D C` at 3.5 s, after the entrance.
- The touch: `INTERACTING ambient=off` at 26.97 s, `SETTLING` at 28.38 s, `AMBIENT` again at 29.28 s.
- Each swipe: `NAVIGATING`, then only `f05m-out-*` / `f05m-in-*` / `f05m-ghost` starts, then `AMBIENT` about 1 s after the papers land.
- The short drag: no `NAVIGATING`, no change.

**P03**
- `WAAPI →1→ 700ms on jrn-f05m__paper-ack` (the wash) together with the sheet's exit copy at 9.87 s, with phase `CONFIRMED`.
- In transit opened: nothing.
- ARRIVED: `translateY(0)→(-3px)→(0) 340ms on li` plus `f05m-arrive`.
- FAILED: `translateY(0)→(2px)→(0) 520ms on li`, phase `WARNING`.

**P04**
- `paperSettle` on the effect paper, phase `CONFIRMED`.
- `errorNudge` on the amount paper, phase `ERROR`.
- Two `consentAck` washes.
- `none → translateY(10px) scale(0.994) 220ms on jgm-host` (the menu exit copy).

**P05**
- No CSS animation start and no one-shot response in the whole session. Mode `OFF` throughout.
