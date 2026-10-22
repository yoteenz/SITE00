# 03 · Typography reflow matrix

**Families (locked, L-1):** `'SITE 00 Display'` 900 for titles, statements and numerals of record; `'Saira Semi Condensed'` 400–700 for everything else. No third family appears anywhere. The audit checks the computed `font-family` and `document.fonts.check()` of every rendered text box. Result: 0 fallbacks in 720 renders.

**Case (locked, L-2):**
- Application copy is uppercase through CSS `text-transform`. The underlying strings are never changed.
- Names, emails, domains, keys, link tokens, typed values and client-written messages carry `.ws-data` / `.ws-read` and keep their own case.
- The board renderer walks every iframe's text and reports any lowercase application text. Final render: 0.

**Wrapping is fixed with columns and policies, not by shrinking type.** The tables below were measured live by `getComputedStyle` in Chromium (specimen `page=components`). Token source: `tokens/typography-tokens.json`.

## 1. Scale per viewport (computed px)

| Token | Use | 320 | 390 | 834 (TP) | 1024 / 1194 (TL, short) | 1366 × 768 (D, short) | 1440 (D) | 1920 / 3440 (UW) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--ws-fs-title` | Page title (display 900, lh .86) | 42.6 | 50 | 48 | 44 | 44 | **52** | 60 |
| `--ws-fs-h2` | Overlay / empty-state title | 28 | 28 | 30 | 30 | 32 | 32 | 36 |
| `--ws-fs-statement` | Focus and verdict statements | 24 | 24 | 26 | 26 | 28 | 28 | 32 |
| `--ws-fs-num` | Signal numerals | 30 | 30 | 34 | 34 | 40 | 40 | 44 |
| `--ws-fs-name` | Client names, task titles (700, .10em) | 13 | 13 | 14 | 14 | 14 | 14 | 15 |
| `--ws-fs-body` | Data cells, next action (600, .06em) | 13 | 13 | 13 | 13 | 14 | 14 | 15 |
| `--ws-fs-label` | Labels, column heads, status (700, .16em) | 10 | 10 | 11 | 11 | 11 | 11 | 12 |
| `--ws-fs-meta` | Meta lines (500, .10em) | 11 | 11 | 11 | 11 | 12 | 12 | 12 |
| `--ws-fs-read` | Client-written text (400, lh 1.6, sentence case) | 15 | 15 | 15 | 15 | 15 | 15 | 16 |
| `--ws-fs-btn` | Button labels (600, .18em) | 11 | 11 | 11 | 11 | 12 | 12 | 12 |
| `--ws-fs-nav` | Bottom nav / rail / sidebar | 10 | 10 | 10 | 10 | 12 | 12 | 12 |
| chip / count | Status chips, count badges | 10 | 10 | 10 | 10 | 10 | 10 | 10 |
| `--ws-fs-input` | Typed values | **16** | **16** | 15 | 15 | 14 | 14 | 14 |

**Notes on the scale:**
- Phone input text is 16 px so iOS Safari does not zoom on focus.
- Short-height landscape (min-width 1024, max-height 860) lowers only the title and the header padding.

**OPUS1 → OPUS2 at 1440:**

| Element | OPUS1 | OPUS2 |
| --- | --- | --- |
| Title | 68 | 52 |
| Labels | 7.5–9 | 11 |
| Meta | 8.5 | 12 |
| Table text | 8.5 | 14 |
| Buttons | 10 | 12 |

Title-to-label ratio drops from 9:1 to 4.7:1 (P-01).

## 2. Minimum sizes

| Rule | Value | Enforced by |
| --- | --- | --- |
| Hard floor, every tier | 10 px | `audit-layout.mjs` `minText` (0 findings) |
| Labels from tablet up | 11 px | token values above |
| Only at 10 px from tablet up | Rail / bottom-nav words, chips, count badges | FD-W8 (still open) can raise these. Raising them does not change any layout rule. |

## 3. Maximum line length

| Text | Maximum | Mechanism |
| --- | --- | --- |
| Client-written messages, notes | 68ch | `--ws-measure`, `max-width` on `.ws-read`; the thread column is centred |
| Focus statement | 22ch | `max-width: 22ch` + `text-wrap: balance` |
| Overlay body copy | Dialog width (≤ 720) | Container |
| Console detail | Column width (≥ 220 px) | Grid column |
| Page title | One line at desktop; two lines at 320–430 (balanced) | `text-wrap: balance` |

## 4. Wrapping, truncation and alignment policy

| Element | Wrap | Truncate | Alignment | Full text available |
| --- | --- | --- | --- | --- |
| Navigation (sidebar, rail, bottom nav) | Never (primary). Tool links may wrap to 2 balanced lines. | Never | Left (sidebar), centred (rail, bottom nav) | — |
| Page titles | Balanced, max 2 lines on phones | Never | Left, baseline-aligned with header actions | — |
| Section headings (`ws-h3`) | Balanced, 2 lines max inside panels | Never | Left | — |
| Buttons | Never; width by content | Never (audit `multiline` + `truncation`: 0) | Centre | — |
| Status labels | Up to 2 lines, breaking at spaces / `·` | Never | Left, mark aligned to the first line | — |
| Client names | One line | Ellipsis | Left | `title` + accessible name |
| Activity / meta lines | Wrap | Never | Left | — |
| Next action | Up to 2 lines | Line clamp 2 | Left | `title` |
| Messages | Wrap (pretty), 68ch | Never | Left; own messages right-aligned block | — |
| Errors | Wrap | Never | Left with red mark | — |
| Identifiers / emails / keys in single-line slots | Never | Ellipsis | Left | `title`; copy action gives the full value |
| Identifiers in key-value rows | `overflow-wrap: anywhere` | Never | Left | — |
| Table headers | One line | Never | Left; numbers right-aligned | — |
| Table numbers / money | Never | Never | Right, tabular numerals | — |
| Search placeholder | One line | Ellipsis allowed (not mandatory text) | Left | `aria-label` |

## 5. Tracking

Tracking tightens as size grows, so larger type does not widen lines into wraps.

| Text | Tracking |
| --- | --- |
| Labels | 0.16 em |
| Meta | 0.10 em |
| Names | 0.10 em |
| Body | 0.06 em |
| Data | 0.01 em |
| Display | 0 |
| Navigation | 0.04 (bottom), 0.06 (rail), 0.12 em (sidebar) |

## 6. Verification

- **C-03:** the type gallery measured at 390 / 834 / 1440 / 1920, plus the registry at all 16 viewports.
- **D-15:** the full component gallery at 1440 and 1920.
- **`verification/layout-audit.json`:** the `minText`, `fonts`, `truncation` and `multiline` arrays are empty for every render.
