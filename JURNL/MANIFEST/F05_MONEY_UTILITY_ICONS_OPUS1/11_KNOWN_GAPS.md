# 11 · KNOWN GAPS

Each gap is stated as found. None is hidden by a weakened test.

| # | Gap | Where | Why it remains | Decision owner |
|---|---|---|---|---|
| G1 | Header chip touch targets are 44 tall but only as wide as the approved pitch allows: 32 (360), 33 (393×660), 36 (393×852), 40 (430). | MONEY parent SEARCH / ADD | The approved board puts 64 board-px squares at an 84 board-px pitch (20 board-px gaps). A 44-wide target would overlap its neighbour, or need wider spacing that changes the approved composition. The widths match BEFORE within 0.5 px; the phone heights rose from 38–41 to 44.5. | FOUNDER (spacing) |
| G2 | The hamburger target is 38.5 × 44 at 393×852 (BEFORE 41.5 × 43) and 42.5 × 44 at 430×932 (BEFORE 44.5 × 45). | MONEY parent MENU | It now shows the same disc as SEARCH / ADD on the far-right approved square. Its target reaches the viewport edge on the right and meets the ADD target on the left. Height reached 44 everywhere; at 360 and 393×660 it grew (39 × 39 → 39.5 × 44; 40 × 40 → 44.5 × 44). | FOUNDER (spacing) |
| G3 | Glyph-to-disc ratios differ between the four artworks (CLOSE 0.38, ADD 0.40, MENU 0.44 wide, SEARCH 0.44–0.45). | the artwork itself | The artwork is founder-supplied and is not redrawn. The discs are normalised to one size; the glyphs are as drawn. | FOUNDER |
| G4 | Disc alpha is 251–254 (about 1 % translucent), kept as supplied. | all four | Raising it to 255 would alter the supplied pixels. On every tested background it is not visible. | — |
| G5 | Runtime weight is 236,588 B for the four lossless WebPs. | bundle | Lossy q95 measured 40.5–41.5 dB, under the 42 dB floor set for the painted bevel. The four files are cached once and shared by every target. | — |
| G6 | iOS Safari was not run. | all targets | There is no iOS device or simulator here. Chromium with Pixel 5 emulation (touch, mobile) and six viewport sizes was run instead. | QA on device |
| G7 | Closes outside the cream / gold disc authorities are unchanged: F09 ACCOUNT (square outline authority), the DOT01 / OV07 sheets (parchment square chips, V9), QUICK ADD, CHECK PURCHASE (baked board), the V3 sheets and JurnlDrawer sheets. | see `04_SCREEN_MOUNT_MAP.csv` | The sprint asked for the CLOSE art "only where the authority uses the cream / gold circular close" and "do not blindly replace every X icon". | FOUNDER, if the family should extend |
| G8 | OV04 MANAGE POCKET has no close control, so no CLOSE art is mounted there. | OV04 | There is nothing to replace; it is dismissed by tapping outside or with Escape. | — |
| G9 | The MENU artwork shows only on the MONEY parent; other hubs keep the line hamburger. | JurnlCornerChrome | The sprint is scoped to F05 MONEY, and the hamburger is shared by every hub. | FOUNDER, if the family should extend |
| G10 | Placement status is FOUNDER-SUPPLIED, PLACEMENT PENDING FOUNDER REVIEW. | registry | Founder approval is required before merge or deploy. | FOUNDER |

## Fixed while integrating, and found pre-existing

- **Tablet menu overlap.** At 820×1180 the open menu's CLOSE sat directly under the hamburger and had no target. This was already true at 9fc523fdd. While the menu is open and the two overlap, the hamburger now steps aside; when the menu closes it returns synchronously, so focus can return to it. E2E `T · 820×1180` and `T · 834×1194` cover this.
