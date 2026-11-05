# 04 · Shared geometry corrections

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Correction | Where | Before | After | Measured from |
|---|---|---|---|---|
| Chip surfaces and widths | `Dot01Frame.tsx` (`CHIP_W`, `CHIP_RIGHT`, `CHIP_GAP`), CSS `.jrn-d01__chip--*` | 64 × 64 dark glass at x 845 − 84 k | paper 88 × 78, amber 72 × 66, bare 56; right edge 902, gap 26; top 34 | top-right crops of all 37 authorities (`AUTH_CHIPS_37.png`) |
| Overlay heading box | CSS `.jrn-d01[data-env^=SK03] .jrn-d01__heading` | left 172, top 356, 440 × 196 | left 196, top 318, 520 × 180 | authorities 14–37 header crops (`OVERLAY_HEADERS.png`) |
| Overlay title size rule | `titleSize(lines, overlay)` | 430 / (n × 0.69), cap 74 / 82 | 500 / (n × 0.66), cap 70 (2 lines) / 88 (1 line) | 16, 17, 23, 26 |
| Overlay content region | `OVERLAY_CONTENT` (shared by every sheet) | y 590–1520 | y 552–1574 (grows with the seam) | 16, 20, 23 (primary action on the landscape) |
| Field rows | CSS `[data-fields=strips]` | one sheet, 48 px rows | torn strips, ≈ 43 px pitch, tile \| rule \| label \| value | 16–20 |
| 06 cards | CSS `.d01-grid .d01-card` | aspect 410:195 | 410:214 | 06 |
| 02 balance label / figure | `AccountPage.tsx` | +24 / +128 on the paper | +40 / +140 | 02 pixel pair |

No device-specific magic numbers were introduced: every value is in board px (941 × 1672) and scales with the board; content-region values map through `boardToScreen`, so tall phones share their extra height as before.
