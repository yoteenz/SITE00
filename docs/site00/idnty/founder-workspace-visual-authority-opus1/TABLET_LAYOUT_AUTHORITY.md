# Tablet layout authority

**Status:** PROPOSED. Applies from 768 to 1279 px CSS width. Boards 02 (iPad portrait 834 × 1112, landscape 1194 × 834) and 25. **No tablet reference was attached**, so this behaviour is derived and carries no reference authority.

## 1. Frame

| Region | Size | Content |
| --- | --- | --- |
| Index rail | 72 px fixed, left | SITE 00 plate, + create, six destinations as icon + index (01…06), review dot, founder plate at the foot |
| Top bar | 56 px | Index + destination title (breadcrumb on pushed views) · search (⌘K with a keyboard) · notifications |
| Stage | Remaining width | Desktop page composition at one or two columns |
| Inspector | 360 px | **Docked only if width − 72 ≥ 1100 px** (landscape iPad: 1194 − 72 = 1122 → docked). Otherwise a right sheet over the stage |

## 2. Rules

1. **Width decides, not device class.** The layout controller (SH-15) reads the viewport width. A narrow desktop window gets the tablet layout; a wide tablet in a split view may get the phone layout.
2. **Stage columns.** At stage widths ≥ 900 px, two-column page bodies (record overview, quote workspace, operations) keep their desktop split. Below that they stack like phones but keep tables as dense rows.
3. **Dense rows instead of tables** below a 900 px stage. The rows have five columns: plate, name and category, segments with step, status, last activity (board 25 §03).
4. **Overlays are dialogs:** create 560, confirm 440, search palette 620. A right sheet (360) replaces the docked inspector when it cannot dock.
5. **Touch first.** Targets stay at 44 px even when a pointer is present. Hover states are additive, never required to reveal an action.
6. **Rotation.** Selection, scroll position and open overlays survive rotation. When the inspector switches between docked and sheet on rotation, its content and scroll position are preserved, because the component is the same and only the container changes.
7. **Keyboard.** With a hardware keyboard: ⌘K search, ESC closes the top overlay, arrow keys move in lists and tabs.

## 3. Tablet behaviour per destination

| Destination | Portrait (834) | Landscape (1194) |
| --- | --- | --- |
| 01 Overview | Focus → signals → needs-you → active work (dense rows) → movement | Desktop two-column composition |
| 02 Foundations | Dense rows; selection opens a right sheet | Table + docked inspector 360 |
| Client record | 8 section tabs; overview stacks | Desktop composition |
| 03 Reviews | List; detail as a page | List + docked detail |
| 04 Operations | Stage strip + tasks; task in a right sheet | Tasks + right column; task in the dock |
| 05 Correspondence | List; preview as a sheet | Table + docked preview |
| 06 System | Tabs + 2-column module grid; module in a sheet | 4-column grid + dock |

## 4. Not verified

No tablet device or Safari iPadOS testing was done. The boards are Chromium renders at tablet viewport sizes.
