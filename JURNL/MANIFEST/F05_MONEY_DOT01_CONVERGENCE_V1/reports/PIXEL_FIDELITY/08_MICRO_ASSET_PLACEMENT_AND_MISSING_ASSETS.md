# 08 · Micro-asset placement and missing assets

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

**Registry:** `src/projects/jurnl/runtime/screens/f05/microAssets.ts` — all 69 founder IDs; 40 with runtime art (Batches 01–04, trimmed + resized to 192 px by `scripts/jurnl/f05-motion-pilot/extract_micro_assets.py`, manifest `families/F05_MONEY/MICRO_ASSETS/MICRO_ASSETS_MANIFEST.json`), 10 PENDING_BATCH_05, 10 PENDING_BATCH_06, 6 NO_BATCH, 3 BAKED_IN_SIDEKICK. `MicroIcon` renders the art or the existing line glyph; Batches 05 / 06 mount by adding their files — no screen edit.

## Mounted: 17 / 40

| Registry ID | Slot |
|---|---|
| `F05.D01.ICON.ARROW.HANDINK` | paper back chip (02–05, 11–29) |
| `F05.D01.ICON.PLUS.FRAMED` | amber add chip (01 parent excluded; 30–37, 31, 32) |
| `F05.D01.ICON.COINS.STACK` | 02 MOVE MONEY, 04 ADD CASH |
| `F05.D01.ICON.BANK.COLUMN` | 02 ACCOUNT DETAILS |
| `F05.D01.ICON.HISTORY.LEDGER` | 03 TRANSACTION HISTORY |
| `F05.D01.ICON.CREDIT.CARD` | 03 MANAGE CARD |
| `F05.D01.ICON.RECEIPT.INK` | 04 RECORD CASH SPENDING |
| `F05.D01.ICON.SCAN.CAMERA` | 16 / 18 / 19 scan block |
| `F05.D01.ICON.CATEGORY.DINING` | history rows: DINING, FOOD & DRINK |
| `F05.D01.ICON.CATEGORY.GROCERY` | history rows: GROCERIES, FOOD |
| `F05.D01.ICON.CATEGORY.TRAVEL` | history rows: TRAVEL |
| `F05.D01.ICON.CATEGORY.PAYMENT` | history rows: card payments, bank income |
| `F05.D01.ICON.FUEL.PUMP` | history rows: FUEL |
| `F05.D01.ICON.PURCHASE.BASKET` | history rows: SHOPPING |
| `F05.D01.ICON.DAILY.PAYOUT` | history rows: payout-card income |
| `F05.D01.ICON.CASH.COIN` | history rows: cash income |
| `F05.D01.ICON.FOOD.BASKET` | cash history: groceries / food |

## Registered, not mounted: 23 / 40 (authority precedence, documented)

| Registry ID | Why |
|---|---|
| `F05.D01.ICON.CHEVRON.INK` | not yet mounted: strips keep the line chevron (next pass) |
| `F05.D01.ICON.SEARCH.INK` | authority search glyph is light on the dark scene; the asset is dark ink |
| `F05.D01.ICON.CLOSE.INK` | overlays draw the back arrow (authority), no close slot |
| `F05.D01.ICON.INFO.MEDALLION` | gold medallion vs the authority's ink ring |
| `F05.D01.ICON.PAYMENT.BANK` | 05 tile slot draws a light glyph |
| `F05.D01.ICON.CHART.BARS` | 04 draws bare bars; the asset carries its own torn tile |
| `F05.D01.ICON.PAYOUT.FEE` | no fee category in the data |
| `F05.D01.ICON.TIPS.FRUIT` | no tips category in the data |
| `F05.D01.ICON.CATEGORY.FEE` | no fee category in the data |
| `F05.D01.ICON.EDIT.PEN` | 11 / 24 draw light glyphs in colored tiles |
| `F05.D01.ICON.TAG` | as EDIT.PEN |
| `F05.D01.ICON.REVERSE.LOOP` | as EDIT.PEN |
| `F05.D01.ICON.ARCHIVE.CHEST` | as EDIT.PEN |
| `F05.D01.ICON.BALANCE.SCALE` | 13 draws an ink seal; asset is a gold badge |
| `F05.D01.ICON.CALENDAR` | Batch 04 glossy; date fields draw an ink calendar (FD-03) |
| `F05.D01.ICON.WALLET` | no wallet slot in the authorities |
| `F05.D01.ICON.UPLOAD` | cloud implies upload; receipts stay on the device (FD-03) |
| `F05.D01.ICON.CHECK.SEALED` | Batch 04 rosette vs ink checks (FD-03) |
| `F05.D01.ICON.ALERT.TRIANGLE` | Batch 04 glossy vs ink (FD-03) |
| `F05.D01.ICON.FILTER.SLIDERS` | 31 filter chips not rebuilt yet (structural) |
| `F05.D01.ICON.REORDER.GRIP` | three-bar menu glyph; authority six-dot grip (FD-03) |
| `F05.D01.ICON.SAVE.FLOPPY` | authority SAVE carries no glyph |
| `F05.D01.ICON.LOCK.STATUS` | Batch 04 glossy vs ink (FD-03) |

## Still missing (no art supplied)

- **Batch 05:** back tiles (light / dark), back frame, torn action strip variant, moss and cream buttons, chip parchment, field paper, account tile, receipt tab. Today: founder parchment 9-slices and CSS surfaces at the authority geometry.
- **Batch 06:** scanner corners and beam, duplicate mark, correction badge, five dock glyphs, terracotta caution surface.
- **No batch:** moss success block, padlock seal (36), open-book ledger (02), engraved coin, amphora, rideshare tag (03–05 art), per-screen seals.

Visual verification: mounted assets appear in the after captures (`before_after/02_AUTHORITY_BEFORE_AFTER.webp`, `before_after/16_AUTHORITY_BEFORE_AFTER.webp`, history screens) and the interactive-state captures. The 17 mounted IDs require founder review of placement; Batch 04 / 03 (scan art) is marked for style refinement.
