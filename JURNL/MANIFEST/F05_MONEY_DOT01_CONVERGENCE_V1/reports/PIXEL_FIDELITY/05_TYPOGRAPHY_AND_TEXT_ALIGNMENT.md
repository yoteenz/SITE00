# 05 · Typography and text alignment

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

**Fonts loaded (verified):** JURNL Authority Serif = modified Playfair Display 400 / 500 / 600 (`public/site00/projects/jurnl/fonts`, OFL); JURNL Authority Sans = Jost; JURNL Sans = Barlow Semi Condensed; JURNL Script = Pinyon Script. No 700 weight exists; the authorities' overlay titles read heavier than 600, so 600 is the closest available (adding 700 would change every JURNL family that asks for bold; not done).

| Element | Before | After | Rule kept |
|---|---|---|---|
| Overlay titles (14–37) | serif 500, 0.06 em, line 0.98 | serif 600, 0.02 em, line 0.94, larger measure | UPPERCASE |
| Overlay subtitle | script 33 px, #2a2016 | script 38 px, #1a120b | lowercase, one line |
| Field labels | sans 0.9 × fs, 0.10 em | serif 600, 0.05 em | UPPERCASE |
| Field values (inputs, selects, dates) | sans 500 | serif 600; text inputs ≥ 16 px (no iOS zoom); select / date buttons ≥ 14 px | UPPERCASE |
| 02–05 balance label / figure / stats | 500 | 600, 0.05 / 0.04 em | live values, no hard-coded samples |
| 02–05 strip labels | 500, 0.10 em (18 % wider than authority 02) | 600, 0.05 em | UPPERCASE |
| 06 card name / amount | 0.92× / 1.45× fs, 500 | 1.05× / 1.72× fs, 600 | dynamic amounts (`formatMoney`), long names wrap / ellipsize per line |
| Dates | native `11/04/2026` | `NOV 4, 2026` (authority form `JAN 28, 2025`) | ISO stored |

**Dynamic values:** amounts stay `formatMoney` output (negative, zero, large, decimals); balance figures keep `amountSize` fitting; card names keep `nameLines` + ellipsis; nothing is truncated without its full value in the accessible label (cards and rows carry full `aria-label`s).
