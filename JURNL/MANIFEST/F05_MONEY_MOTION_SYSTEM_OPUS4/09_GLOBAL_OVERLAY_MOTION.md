# 09 · GLOBAL OVERLAY MOTION (ALL EIGHT)

## Shared behaviour

Sources: `motion/jurnl-motion.css`, `motion/overlayMotion.ts`, `screens/f05/surfaces/JurnlSurfaces.tsx`.

**Open.** The overlay enters as an illustrated object settling into the existing world.
- Folios and plates use `jm-ovl-in`: 420 ms, paper easing, translateY 14px, rotate −0.35°, scale 0.992 → none.
- This replaces the earlier 240–260 ms entrances, with exactly one entrance per overlay (E2E O1).
- The page behind stays still. The scrim fade is unchanged.

**Close.** A shorter, related reverse plays on an inert copy of the overlay's last frame.
- Opacity → 0 with translateY 10px and scale 0.994, over 220 ms.
- The real overlay is already gone from React and from the accessibility tree, and focus has already returned.
- The copy has:
  - `inert`, `aria-hidden`, and no pointer events;
  - no ids, test ids, triggers, roles, labels, asset ids, record ids or values;
  - no CSS animation or transition of its own, so it never replays the entrance;
  - inputs disabled.
- It is removed on finish, on cancel, or after a 340 ms safety timer (E2E O1, O3).

**Nested overlays.**
- When an overlay replaces another in the same commit (a menu destination, RENAME from the note), **no copy** is made, so the two never compete (E2E O2, O4).
- BACK to the menu makes no copy either.

**Focus.** Unchanged. Focus returns to the trigger (asserted for the menu, search and move money in E2E O1).

**Ambience.** Pauses while any overlay or popover is open, and resumes after a quiet period (E2E A2, O3).

## Per overlay

| # | Overlay | Open | Close | Interaction / state response | Proof |
|---|---|---|---|---|---|
| OV01 | MONEY ACTION SHEET | `jm-ovl-in` | copy 220 ms | press transforms | E2E O1 pattern; recording P02/P03 |
| OV02 | ADD A POCKET | `jm-ovl-in` (plate folio) | copy | on save, the new pocket settles once on the parent | E2E W4; recording P02 |
| OV03 | MOVE MONEY | `jm-ovl-in` (plate folio) | copy | error line nudge; recorded → balance wash only (no completion) | E2E O1, F3; recording P03 |
| OV04 | MANAGE POCKET note | `jm-note-in` 380 ms (lift and turn from its pocket; `-up` above) | its own copy, unless RENAME / DELETE replace it | RENAME cream press; DELETE deliberate press; renamed paper settles | E2E O4; recording P02 |
| OV05 | SEARCH | `jm-ovl-in` (shell plate) | copy | **No per-row animation while typing or filtering.** Results reflow as live rows; typing pauses ambience. | E2E A2, O1; recording P04 |
| OV06 / OV07 | DELETE / ARCHIVE (confirm, blocked) | DOT 01 overlay board entrance (unchanged) | copy | BLOCKED: bronze warning seal settles once (620 ms), no celebration | E2E F4; recording P02B |
| OV08 | GLOBAL MENU | `jm-ovl-in` (menu plate) | copy | row hover / focus: chevron `translateX(2px)`; press: icon `translateX(1px)`. The menu's contained scroll and environment art are unchanged. | E2E O1–O3; recording P04 |

## Menu children

- **CH01 SAFE TO SPEND BUFFER.** Replaces the menu with no copy.
  - While editing, the amount paper rises 1px.
  - A **stored** change settles the effect paper once (`paperSettle`, CONFIRMED). Saving an unchanged amount does nothing.
  - A refused save nudges the amount paper (`errorNudge`) and stores nothing. The figure itself never moves (E2E F1).
- **CH02 PRIVACY & CONSENTS.**
  - A **stored** consent change warms only that row once, using opacity on its own `.jce-ack` wash.
  - The switch shows the value. OFF stays OFF. Nothing plays on open (E2E F2).
- **Other menu destinations** (currency, connections, account, preferences, rules, membership, add-ons, Ask) share the menu's entrance and exit and its replace-without-copy rule. They have no state response of their own.

The OV06 / OV07 row groups delete-confirm, delete-blocked and archive under one entry, so the table has seven rows for the eight overlays. The count of eight global overlays is OV01–OV08 as named in the OPUS3 mount map.
