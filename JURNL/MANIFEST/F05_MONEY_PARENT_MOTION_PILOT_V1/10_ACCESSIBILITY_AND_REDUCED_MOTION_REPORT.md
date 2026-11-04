# 10 — Accessibility and reduced motion

## Automated

| Check | Result (360, 393, 834, 1440) |
|---|---|
| axe on the pilot stage | **0 serious, 0 critical** |
| axe on the MONEY actions sheet | **0 serious, 0 critical** |
| Reduced motion (`prefers-reduced-motion: reduce`) | **0 pilot animations**; every flow still works (sheet, account route, back) |
| Focus | Focus moves into the actions sheet, Escape closes it, and focus returns to the "+" chip (asserted) |
| Keyboard paging | ← / → from any focused paper; the dots are a real button |
| Touch targets | Every control is ≥ 44 screen px (CSS floors at any scale). The papers are 70–143 px tall. |
| Readable at once | Figures and names are DOM text from the first render; after the entrance every figure and paper is at opacity 1 (asserted) |
| No essential information only in motion | yes: the same text and values exist with motion off |

## Semantics

- **Headings and text:** the heading is `h1` MONEY, followed by the script line (lowercase DOM text, `lang="en"`). The wordmark is real text (`JURNL`).
- **Figures:** four `button`s with full accessible names that state the basis. Example: "AVAILABLE: $2,415, SAFE TO SPEND FOR THE NEXT 30 DAYS. OPENS THE PLANNING PERIOD." With no places of the person's own: "NOT KNOWN UNTIL YOU ADD A PLACE."
- **Account papers:** one `button` each, named "{full name}. {amount} HELD/OWED. {transfer state}. OPEN." The visual name may be clipped; the accessible name never is.
- **Decoration:** all imagery (environment, title paper, seal, card art) is `alt=""` and/or `aria-hidden`.
- **Dock:** the existing five-button `nav` (aria-label PRIMARY), with `aria-current="page"` on MONEY.
- **Overlays:** the existing `JurnlDrawer` (role dialog, `aria-modal`, labelled title, Escape, focus trap and return).
- **Reading order:** wordmark → MONEY → script → summary (HELD, OWED, COMMITTED, AVAILABLE) → places → page control → chips → dock.

## Contrast

Text sits on its own paper. Contrast ratios were measured (WCAG formula) against the real background pixels: the band's median and its lightest 5 %, the card parchment's median and its darkest 5 %.

| Text | Background | Ratio |
|---|---|---|
| Cream figures `#f3ead8` | dark olive band | 10.97 : 1 (9.82 on the band's lightest 5 %) |
| AVAILABLE gold `#e2ae4e` | dark olive band | 6.49 : 1 (5.81 on the lightest 5 %) |
| Ink names and amounts `#1c1610` | card parchment | 12.57 : 1 (11.65 on its darkest 5 %) |
| Captions `#6a5640` | paper tile | 4.85 : 1 (AA for small text) |

axe reported no serious contrast violations.

## Reduced motion in detail

| Effect | Normal | Reduced |
|---|---|---|
| Entrance (environment, title, seal, type, figures, papers) | ≤ 650 ms | none |
| Hover / press / lift | 120–180 ms transitions | none (state styles still apply instantly) |
| Route to an account | shared-element morph (View Transitions API) | instant route |
| View-transition pseudo-elements | 420 ms / 260 ms | `animation: none` |
| Return settle | 420 ms | none |

## Found, not changed (pre-existing, outside the pilot)

The shell's screen transition (`.jrn-screen[data-transition='family']`, a 700 ms blur-fade) **is not removed by the shell's own reduced-motion rule**: `.jrn .jrn-screen { animation: none }` has lower specificity than the transition rule. It affects every JURNL screen. The pilot disables it on its own screen; the shell rule should be fixed in a separate change.

## Not verified here

- **Mobile Safari:** not available in this environment (Chromium only). The View Transitions API ships in Safari 18; older Safari falls back to the instant route by design.
- **Screen readers:** VoiceOver / TalkBack were not run. The structure above is from the DOM, and the axe results.
