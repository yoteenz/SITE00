# 18 · Coverage and omission report

## 1. Coverage against the sprint brief

| Requirement | Delivered | Where |
| --- | --- | --- |
| Read the OPUS1 package; registry as coverage source | 124 components carried, ids unchanged | `registry/`, 09 |
| Typography reflow audit + matrix | Measured scale per tier, line length, wrap / truncation / alignment policy, floor | 03, C-03, D-15 |
| Desktop zones + documented grid | Four zones, grid areas, minmax / clamp, gutters, header heights, rhythm | 06, 08, D-01 |
| Density classes per page | RELAXED / STANDARD / COMPACT | 06 §4, 08 §6 |
| Tablet portrait and landscape as separate grammars | Rail + push + sheets vs rail + two panes + short header + docking | 04, 05, TP / TL boards |
| Breakpoints + dock rule; 16 viewports rendered | All 16 rendered for 45 states (720 renders) | 15, `verification/` |
| Page compositions (overview, registry columns, record journey, reviews, ops, correspondence, system, create) | All | 11, D-02 to D-13 |
| 20 overlay families × mobile / tablet / desktop | All 20 + toast, three tiers each | 10, D-14, TP-10, TL-10 |
| Proportion audit P-01 to P-10 with before / after | 22 findings | 02, 12, C-01, C-02, C-04 |
| Text wrapping rules (nav, titles, headings, buttons, status, names, activity, messages, errors, identifiers, tables) | All eleven | 03 §4 |
| Component variants for the 124 components (M, TP, TL, D, UW) | All 124 | 09, registry |
| Desktop interaction (hover + alternatives, shortcuts, palette, sorting; no multi-select; no new API) | Yes | 06 §5 |
| Tablet touch / keyboard / pointer / orientation / keyboard-open / zoom / split screen | Yes | 04 §3–4, 05 §3–4, TL-01 |
| 42 boards (D-01–15, TP-01–10, TL-01–10, C-01–07) | 42 | 14, `boards/png/` |
| Existing pipeline (Vite SSR, Chromium, DSF 2, real fonts / tokens / icons / data) | Yes; live specimens in iframes | `boards/render-boards.mjs`, `boards/lib.mjs` |
| Visual verification (15 checks per board) + automated layout audit | Yes | 15 |
| WCAG 2.2 AA | Contracts + measured contrast | 13 |
| 18 docs, registry, breakpoints, typography tokens, page mappings, sources, images, verification outputs | Yes | This folder |
| Authority distinctions (§33) and not-auto-approved list | Yes | 16 |
| Handoff phases 0–10 (not implemented) | Yes | 17 |

## 2. Omissions and limits (stated, not hidden)

| Item | Why | Consequence |
| --- | --- | --- |
| Real iPhone / iPad Safari | Only Chromium in this environment | IPHONE_SAFARI_VERIFICATION: not performed. Tablet and phone frames are Chromium at those viewport sizes. |
| Real browser zoom (200% / 400%) | Simulated by viewport width | WCAG 1.4.10 shown by width equivalence (320 CSS px); real zoom to be checked in Phase 9 |
| Software keyboard | Simulated by a labelled band and `--ws-kb` | Real keyboard insets (`visualViewport`) to be verified on device |
| Motion (entries, transitions) | Specified in 10 §3; boards are static | Verify in Phase 8 |
| Screen readers | Not run | Phase 9 |
| Record sections RECORDS, COMMUNICATIONS, ACTIVITY | Drawn as the shared two-zone layout, not as bespoke content | Content as OPUS1 boards; responsive rules identical |
| Live data | Fictional illustrative identities (OPUS1 DEMO set); no real clients, no "Anthony" | Values never come from a backend in this package |
| Stretch-gap warnings | Remaining warnings are row-end metadata at wide widths | Listed in `verification/layout-audit-summary.md`; not hard failures |

## 3. Nothing changed outside this folder

No production route, component, style, API, schema, test or deployment was modified. The specimens and boards live under `docs/` and are served only by the board renderer's Vite instance.
