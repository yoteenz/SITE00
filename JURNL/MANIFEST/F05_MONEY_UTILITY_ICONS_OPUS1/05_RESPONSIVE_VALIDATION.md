# 05 · RESPONSIVE VALIDATION

Method:

- `scripts/jurnl/utility-icons/capture_utility_states.ts` runs Chromium with reduced motion at device scale 3, on the BEFORE head (9fc523fdd, port 5175) and on this branch (port 5174), with the same synthetic world (`f05World('approved')`) and a stubbed exchange-rate response.
- For every utility control on screen it records the artwork, whether it decoded, the button box, the visible disc (image width × 0.8065), any line glyphs left, and the touch target. The touch target is probed with `elementFromPoint` in 0.5 px steps from the centre. A probe stops at the viewport edge, so a target that runs off screen counts only its visible part.
- The E2E spec `e2e/jurnl/jurnl-utility-icons-opus1.e2e.ts` re-checks the same facts at six sizes on three Playwright projects (mobile, tablet, desktop).

## Result

| Check | 360×640 | 393×660 | 393×852 | 430×932 | 820×1180 (tablet) | 834×1194 (tablet) | 1440×900 |
|---|---|---|---|---|---|---|---|
| SEARCH / ADD / MENU artwork decoded, once each | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (E2E) | ✓ |
| One disc size for the three (≤ 0.75 px apart) | 24.7 | 25.5 | 28.2 | 30.8 | 45.2 | ✓ (E2E) | 34.4 |
| No two discs overlap; inside the viewport | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Header touch targets 44 tall | ✓ | ✓ | ✓ | ✓ | ✓ (46) | ✓ | ✓ |
| Overlay close disc / target | — | 35.4 / 44 × 44 | 35.4 / 44 × 44 | ✓ (E2E) | 46 / 46 × 46 | 46 / ≥ 44 | ✓ (E2E) |
| Page scroll (x / y) | none | none | none | none | none | none | none |
| Menu open: CLOSE never covered by the hamburger | ✓ | ✓ | ✓ | ✓ | ✓ (fixed; was covered) | ✓ (fixed) | ✓ |

**Before → after, header targets (w × h, CSS px):**

| Size | SEARCH | MENU |
|---|---|---|
| 360×640 | 32 × 38 → 32 × 44.5 | 39 × 39 → 39.5 × 44 |
| 393×660 | 33 × 38 → 33 × 44.5 | 40 × 40 → 44.5 × 44 |
| 393×852 | 36.5 × 41 → 36 × 44.5 | 41.5 × 43 → 38.5 × 44 (see KNOWN GAPS) |
| 430×932 | 40 × 45 → 40 × 44.5 | 44.5 × 45 → 42.5 × 44 |
| 820×1180 | 58.5 × 65 → 59 × 46 | 60 × 60 → 53 × 46 |
| 1440×900 | 44.5 × 50 → 45 × 44 | 49 × 49 → 44.5 × 44 |

The header chips keep the approved 64 board-px squares at the approved 84 board-px pitch (20 board-px gaps). Their targets fill the pitch without overlapping a neighbour, so on phones they are 32–40 wide; a full 44 × 44 would need overlap or wider spacing, which is a founder decision (see KNOWN GAPS).

Tablet with the menu open: before, the hamburger sat on top of the menu's CLOSE and left it a 0 × 0 target (pre-existing at 9fc523fdd). Now the hamburger steps aside only while the two overlap, the CLOSE gets 46 × 46, and the hamburger comes back, focused, when the menu closes.

## Every captured control (AFTER, with the BEFORE target alongside)

Header controls are listed only in the states where they are reachable; behind an open overlay they correctly have no target.

| State | Viewport | Control | Artwork | Loaded | Line glyphs | Visible disc (CSS px) | Touch target w × h | Before: target w × h | Page scroll |
|---|---|---|---|---|---|---|---|---|---|
| 01-02_MONEY_PARENT_393x852 | 393×852 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 28.2 | 36 × 44.5 | 36.5 × 41 | none |
| 01-02_MONEY_PARENT_393x852 | 393×852 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 28.2 | 36.5 × 44.5 | 35.5 × 41 | none |
| 01-02_MONEY_PARENT_393x852 | 393×852 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 28.2 | 38.5 × 44 | 41.5 × 43 | none |
| 03_TOP_UTILITY_CONTROLS_393x852 | 393×852 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 28.2 | 36 × 44.5 | 36.5 × 41 | none |
| 03_TOP_UTILITY_CONTROLS_393x852 | 393×852 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 28.2 | 36.5 × 44.5 | 35.5 × 41 | none |
| 03_TOP_UTILITY_CONTROLS_393x852 | 393×852 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 28.2 | 38.5 × 44 | 41.5 × 43 | none |
| 04_GLOBAL_MENU_393x852 | 393×852 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 28.2 | 38.5 × 44 | 41.5 × 43 | none |
| 04_GLOBAL_MENU_393x852 | 393×852 | `global-menu-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 05_ADD_A_POCKET_393x852 | 393×852 | `money-add-place-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 06_MOVE_MONEY_393x852 | 393×852 | `transfer-sheet-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 07_PRIVACY_CONSENTS_393x852 | 393×852 | `settings-consents-sheet-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 07b_SAFE_TO_SPEND_BUFFER_393x852 | 393×852 | `global-buffer-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 08_SEARCH_393x852 | 393×852 | `global-search-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 08b_MONEY_ACTION_393x852 | 393×852 | `f05m-actions-sheet-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 09_SHORT_MOBILE_360x640 | 360×640 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 24.7 | 32 × 44.5 | 32 × 38 | none |
| 09_SHORT_MOBILE_360x640 | 360×640 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 24.7 | 32 × 44.5 | 31.5 × 38 | none |
| 09_SHORT_MOBILE_360x640 | 360×640 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 24.7 | 39.5 × 44 | 39 × 39 | none |
| 09_SHORT_MOBILE_360x640_TOP | 360×640 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 24.7 | 32 × 44.5 | 32 × 38 | none |
| 09_SHORT_MOBILE_360x640_TOP | 360×640 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 24.7 | 32 × 44.5 | 31.5 × 38 | none |
| 09_SHORT_MOBILE_360x640_TOP | 360×640 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 24.7 | 39.5 × 44 | 39 × 39 | none |
| 09_SHORT_MOBILE_393x660 | 393×660 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 25.5 | 33 × 44.5 | 33 × 38 | none |
| 09_SHORT_MOBILE_393x660 | 393×660 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 25.5 | 33 × 44.5 | 32 × 38 | none |
| 09_SHORT_MOBILE_393x660 | 393×660 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 25.5 | 44.5 × 44 | 40 × 40 | none |
| 09_SHORT_MOBILE_393x660_SEARCH | 393×660 | `global-search-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 35.4 | 44 × 44 | 44 × 44 | none |
| 09_MOBILE_430x932 | 430×932 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 30.8 | 40 × 44.5 | 40 × 45 | none |
| 09_MOBILE_430x932 | 430×932 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 30.8 | 40 × 44.5 | 40 × 45 | none |
| 09_MOBILE_430x932 | 430×932 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 30.8 | 42.5 × 44 | 44.5 × 45 | none |
| 10_TABLET_820x1180 | 820×1180 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 45.2 | 59 × 46 | 58.5 × 65 | none |
| 10_TABLET_820x1180 | 820×1180 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 45.2 | 59 × 46 | 61.5 × 65 | none |
| 10_TABLET_820x1180 | 820×1180 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 45.2 | 53 × 46 | 60 × 60 | none |
| 10_TABLET_820x1180_MENU | 820×1180 | `global-menu-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 46 | 46 × 46 | 0 × 0 | none |
| 10_DESKTOP_1440x900 | 1440×900 | `f05m-search` | F05.UTILITY.SEARCH.GOLD | True | 0 | 34.4 | 45 × 44 | 44.5 × 50 | none |
| 10_DESKTOP_1440x900 | 1440×900 | `f05m-actions` | F05.UTILITY.ADD.GOLD | True | 0 | 34.4 | 45 × 44 | 45 × 50 | none |
| 10_DESKTOP_1440x900 | 1440×900 | `f09-menu` | F05.UTILITY.MENU.GOLD | True | 0 | 34.4 | 44.5 × 44 | 49 × 49 | none |
| 10_DESKTOP_1440x900_BUFFER | 1440×900 | `global-buffer-close` | F05.UTILITY.CLOSE.GOLD | True | 0 | 46 | 46 × 46 | 44 × 44 | none |

## Screenshots

- `RUNTIME_SCREENSHOTS/`: every state above, AFTER, at device scale 3.
- `VISUAL_BEFORE_AFTER/`: the same states side by side with BEFORE, plus `03_TOP_UTILITY_CONTROLS_MOBILE_SCALE_BEFORE_AFTER.png` (the header row at 393×852, 360×640 and 430×932).

iOS Safari was not run (no iOS device or simulator in this environment); see KNOWN GAPS.
