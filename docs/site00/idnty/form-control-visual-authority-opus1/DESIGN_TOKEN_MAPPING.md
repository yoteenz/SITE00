# Design token mapping

Every value used on the boards, where it comes from, and whether the proposal changes it. **No new colours or typefaces are introduced.**

## Colour

| Token | Value | Defined in | Used for | Change |
| --- | --- | --- | --- | --- |
| `--df-bg` | `#f3f2ef` | `site00-df-client.css` | Page chamber | — |
| `--df-card` | `#f9f8f6` | client | Field card, rows, read-only fill | — |
| `--df-surface` | `#ffffff` | `site00-df-components.css` | Controls, sheets | — |
| `--df-ink` | `#0c0c0c` | client | Type, locked or done marks, sheet head rule | — |
| `--df-ink-2` | `#2f2f2e` | client | Option rows, read-only value | — |
| `--df-muted` | `#75736e` | client | Sub copy, hints, status | — |
| `--df-faint` | `#a3a19c` | client | Index numerals, `OPTIONAL` tag | — |
| `--df-rule` | `#dcdad5` | client | Card borders, hairlines between surfaces | — |
| `--df-rule-strong` | `#c9c7c2` | client | Rail rule, progress hairline | — |
| `--df-control-border` | `#d9d7d2` | components | Control rest border | — |
| `--df-control-border-strong` | `#b8b6b1` | components | Hover, check border | — |
| `--df-placeholder` | `#a9a7a2` | components | Placeholders | — |
| `--df-disabled-bg` / `-border` / `-ink` | `#efeeeb` / `#e4e2dd` / `#b5b3ae` | components | Disabled | — |
| `--df-red` | `#ce1017` | client | Primary, selected, current, error, red period, active frame | — |
| `--df-red-ink` | `#b30f17` | client | Hover and busy CTA, banner text | — |
| `--df-scrim` | `rgba(12,12,12,.46)` | components | Sheet scrim (no blur) | — |
| `--ix-divider` | `#eeede9` | **names** the `.df-select__option + .df-select__option` hard-coded value | List dividers | Named only |
| `--ix-active-bg` | `#f4f3f0` | **names** the `.df-select__option--active` value | Active and pressed row | Named only |
| `--ix-open-bg` | `#fffafa` | **names** the `.df-select--open .df-select__trigger` value | Open trigger | Named only |
| `--df-shadow-pop` | `0 1px 2px …, 0 10px 28px …` | components | DfSelect list today | **Proposed: not used** on selector lists (the active frame replaces the shadow) |
| `--df-shadow-sheet` | `0 -1px 0 …, 0 -10px 34px …` | components | Bottom sheet today | **FD-6** |
| Success / warning tints | `#2e7a4b` … / `#c2610f` … | components | Toasts, status only | — (rule kept) |

## Typography

| Role | Face | Size / weight / tracking | Source | Change |
| --- | --- | --- | --- | --- |
| Headline | SITE 00 Display | 900 · `min(64px, 15.4vw)` · 88 px at ≥ 1100 | client `--df-headline` | — |
| Rail index | SITE 00 Display | 600 · 17 px · .06em · red | client `.df-rail__index` | — |
| Sheet title | SITE 00 Display | 900 · 30 px (22 px landscape) | — | **New role** (P) |
| Field label | Saira Semi Condensed | 700 · 10 px · .18em | components `--df-label-size` | — |
| Control text / placeholder | Saira | 500 · 10 px · .16em · caps | components `--df-control-text` | — |
| Entered value | Saira | 400 · **16 px (coarse)** / 14 px (fine) | components `.df-input` (14) | **P: 16 px on coarse pointers (NF-01)** |
| Sheet option | Saira | 600 · 11 px · .16em | — | P |
| Index numeral | Saira | 400 · 12.5 px · tabular | client `.df-drawer__index` | Reused |
| Message | Saira | 700 · 8.5 px · .16em | components `.df-field__error` | — |
| Micro tag | Saira | 700 · 7.5 px · .2em | client `.df-tag` scale | P (usage) |
| CTA | Saira | 600 · 11 px · .26em | components `.df-cta` | — |

## Geometry

| Token | Value | Source | Change |
| --- | --- | --- | --- |
| `--df-control-h` | 40 px | components | — (Territory A rows match it: 38 → 40, P) |
| `--df-cta-h` | 46 px | components | — |
| `--df-radius-sm` | 3 px | components | — |
| Mark radius | 2 px | components `.df-check` | — |
| `--df-radius-sheet` | 16 px | components | **FD-6:** 0 px proposed |
| Active frame | 1 px border + 1 px inset | client `.df-row--active` pattern | P (applied to controls) |
| Red period | 6 px (lists) / 5 px (labels, status) | client `.df-headline__period` scaled | P |
| Sheet row | 48 px (44 px landscape) | — | P |
| Threshold edge | 2 px red | pre-#1573 `.df-sheet__panel` | P (revived) |
| Touch target | ≥ 44 px | brief §3.5 | — |
| `--df-gutter` | 26 / 40 / 64 px | client | — |
