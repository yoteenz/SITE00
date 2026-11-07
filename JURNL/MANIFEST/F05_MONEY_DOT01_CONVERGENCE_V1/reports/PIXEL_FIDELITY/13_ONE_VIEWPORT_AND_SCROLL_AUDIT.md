# 13 · One-viewport and scroll audit (after)

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

Probe: 37 states × 10 viewports = 370 measurements on `be8718b7` (393x852 · 471x836 · 375x667 · 390x844 · 430x932 · 360x780 · 768x1024 · 834x1194 · 1280x800 · 1440x900).

| Viewport | States | Page scroll Y | Page scroll X | Board cut (px) | Unreachable controls | Internal scroll | Pillarboxed |
|---|---|---|---|---|---|---|---|
| 393x852 | 37 | 0 | 0 | 0 | 0 | 8 | 0 |
| 471x836 | 37 | 0 | 0 | 0 | 0 | 15 | 0 |
| 375x667 | 37 | 0 | 0 | 0 | 0 | 25 | 0 |
| 390x844 | 37 | 0 | 0 | 0 | 0 | 8 | 0 |
| 430x932 | 37 | 0 | 0 | 0 | 0 | 7 | 0 |
| 360x780 | 37 | 0 | 0 | 0 | 0 | 10 | 0 |
| 768x1024 | 37 | 0 | 0 | 0 | 0 | 6 | 37 |
| 834x1194 | 37 | 0 | 0 | 0 | 0 | 5 | 37 |
| 1280x800 | 37 | 0 | 0 | 0 | 0 | 16 | 37 |
| 1440x900 | 37 | 0 | 0 | 0 | 0 | 12 | 37 |

**Result: page-level vertical scroll 0 / 370, horizontal 0 / 370, unreachable controls 0, board cut 0 px.** Opening a JURNL select or date picker adds no document height (interactive probe, addendum doc 10). Dock visible only on 01, 06, 31.

Internal scroll regions: the content paper of long forms and lists (`.jrn-d01__content[data-scroll=true]`, `overscroll-behavior: contain`), the listbox inside a popover. No nested competing scroll regions: the popover is outside the content box.

**iOS Safari:** not verifiable here (no WebKit / device). Keyboard-open behaviour was not measurable in Chromium headless.
