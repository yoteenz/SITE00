# 14 · Responsive and keyboard QA

Measured on the real overlays (scripts/jurnl/f05-motion-pilot/capture_editorial_overlays.ts), BEFORE = `c4787f382` with the working tree stashed, AFTER = this branch:

| # | Surface | Viewport | opens BEFORE | opens AFTER | page scroll | close on screen | primary on screen | focus inside | off-screen controls (not in a scroller) |
|---|---|---|---|---|---|---|---|---|---|
| 01 | MONEY ACTION SHEET | 393x852 | True | True | False | True | True | True | — |
| 01 | MONEY ACTION SHEET | 393x660 | True | True | False | True | True | True | — |
| 02 | ADD A POCKET | 393x852 | True | True | False | True | True | True | — |
| 02 | ADD A POCKET | 393x660 | True | True | False | True | True | True | — |
| 03 | MOVE MONEY | 393x852 | True | True | False | True | True | True | — |
| 03 | MOVE MONEY | 393x660 | True | True | False | True | True | True | — |
| 04 | MANAGE POCKET | 393x852 | True | True | False | None | True | True | — |
| 04 | MANAGE POCKET | 393x660 | True | True | False | None | True | True | — |
| 05 | SEARCH DRAWER | 393x852 | False | True | False | True | True | True | — |
| 05 | SEARCH DRAWER | 393x660 | False | True | False | True | True | True | — |
| 06 | ACCOUNT / SETTINGS | 393x852 | True | True | False | True | True | True | — |
| 06 | ACCOUNT / SETTINGS | 393x660 | True | True | False | True | True | True | — |
| 07 | ARCHIVE BLOCKED | 393x852 | True | True | False | None | True | True | — |
| 07 | ARCHIVE BLOCKED | 393x660 | True | True | False | None | False | True | — |
| 08 | GLOBAL MENU | 393x852 | True | True | False | True | True | True | — |
| 08 | GLOBAL MENU | 393x660 | True | True | False | True | False | True | — |

The E2E spec adds 393 × 660 for the three pilots (A4: close and primary on screen, no page scroll) and runs every spec in the small (360 × 780), mobile (393 × 852), tablet (834 × 1194) and desktop (1440 × 900) projects. Inputs are 16 px (no iOS zoom); the folio height follows the visual viewport (`--jrn-vvh`). iOS Safari / WebKit: **UNVERIFIED** (no WebKit in this container; the tunnel was not touched).
