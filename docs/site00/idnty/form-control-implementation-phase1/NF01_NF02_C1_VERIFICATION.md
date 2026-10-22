# NF-01, NF-02, C-1 verification

Authority measurements: `docs/site00/idnty/form-control-visual-authority-opus1/evidence/finding-measurements.json` (commit `c5a773381`).

## NF-01 — iOS Safari input zoom (16px minimum)

| | Before | After (Phase 1) |
| --- | --- | --- |
| Finding | `#df-business_name` computed `14px` on 390×844 review | `@media (pointer: coarse)` sets `font-size: var(--df-input-touch-size)` (16px) |
| Verification | Playwright `iPhone 13` profile against workspace Vite `:5175` | `#df-business_name` → **16px** |
| Desktop fine pointer | — | **14px** (unchanged visual density) |

Not verified on physical iPhone Safari in this run (authority U-6).

## NF-02 — `.df-chip` unstyled

| | Before | After |
| --- | --- | --- |
| Finding | No matching CSS rules; native button chrome | `.df-chip` / `.df-chips` in `site00-df-components.css` |
| Verification | CSS file guard in `tests/dfFormControlPhase1.test.ts` | Portal record filters inherit DF tokens |

## C-1 — Chevron rule collision

| | Before | After |
| --- | --- | --- |
| Finding | Native intake chevron shared `.df-select__chev` with combobox absolute/transform rules | Native uses `.df-native-select__chev` in client CSS only |
| Verification | P02 markup test: contains `df-native-select__chev`, not `df-select__chev` | Combobox chevron rules unchanged on `DfSelect` |

## NF-06 (related, Phase 1 prerequisite)

Unchecked `.df-check` border color aligned to `#8f8d88` via `--df-check-border`. Playwright sample: `1px solid rgb(143, 141, 136)` on iPhone profile (width may compute as 1px; declared 1.5px).
