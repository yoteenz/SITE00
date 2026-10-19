# Responsive interaction authority

**Boards:** 01A, 01B, 06. The founder-tested iPhone Safari experience comes first.

## 1. Breakpoints

These match the existing DF media queries in `site00-df-client.css`: 768 px and 1100 px; the 520 px column is the sheet width.

| Class | Example viewport | Column | Selector (Opus recommendation) | Value text | Notes |
| --- | --- | --- | --- | --- | --- |
| Compact mobile | 320 × 568 / 375 × 667 | Full width, 26 px gutter | B sheet; the list scrolls inside | 16 px | Labels wrap in lists and never truncate; a closed trigger may ellipsize |
| Standard mobile | 390 × 844 (founder) | Full width | B sheet; all 10 rows visible | 16 px | Reference viewport |
| Large mobile | 428 × 926 | Full width | B sheet | 16 px | Watch long add-on labels |
| Tablet portrait | 768 × 1024 | 640 screen / 560 main, 40 px gutter | A listbox (fine pointer) or B (coarse) | 16 px coarse, 14 px fine | The `IdntySelect` choice follows the pointer, not the width alone |
| Tablet landscape | 1024 × 768 | Same | Same | Same | |
| Desktop | 1280 × 800 | 520 px form column, 88 px headline | A listbox; all 10 rows, no scroll | 14 px | Board 01B |
| Ultra-wide | 1920+ | Column stays 520 px | A | 14 px | Nothing stretches |

**Selection rule:** `matchMedia('(pointer: coarse) and (max-width: 600px)')` selects B, otherwise A.

Re-evaluate on `change`, but never while a list is open.

## 2. iPhone Safari specifics

| Concern | Authority |
| --- | --- |
| Dynamic viewport | Sheets use `100dvh`. Their maximum height is `calc(100dvh − 56px)` (the same cap as `.df-bsheet__panel`). They anchor to the visual viewport, so they sit on Safari's toolbar, never under it. |
| Safe area | Sheet foot padding is `env(safe-area-inset-bottom)` (34 px on Face ID phones when the toolbar collapses) |
| Keyboard open | The focused field card, including its message line, is scrolled into view (`scrollIntoView({ block: 'nearest' })` plus `scroll-margin-bottom` on `.df-field`). DfSelect already re-places on `visualViewport` resize. |
| Keyboard to selector | Tapping a Business Type trigger blurs the text field. The keyboard drops before the sheet rises, so there is never a keyboard behind a sheet. |
| Focus zoom | Values are 16 px on coarse pointers (NF-01). Never fix it with `maximum-scale=1`: the viewport meta allows user scaling (`maximum-scale=10`), and it must stay that way. |
| Scroll containment | The sheet list uses `overscroll-behavior: contain`. The body scroll lock (`useDfScrollLock`, reference-counted) applies **only while a modal sheet is open**. Page-level scrolling and the `.site00-desktop-artboard` artifact scroll model are otherwise untouched. |
| Scroll restoration | Closing restores the page offset; focus returns to the trigger with `preventScroll` (the existing DfSelect `close()` pattern). |
| Accidental selection | Commit on `click` (pointer up), never on `pointerdown`. Scrolling inside the list never selects. The DfSelect list already prevents `pointerdown` default to keep focus. |
| Landscape (844 × 390) | The sheet header collapses to one line (rail plus title); rows drop to 44 px; 24 px of page stays visible; width is capped at 520 px and centred. |
| Long option labels | Wrap to two lines; the row grows; the numeral and mark stay vertically centred |
| Browser zoom / large text | Everything is in px and scales with zoom; targets stay at least 44 px; nothing is clipped (Board 06, frame 06) |
| Reduced motion | `df-rise` and `df-fade` are disabled under `prefers-reduced-motion` (the existing block); the sheet appears without movement |

## 3. Overlay rules

- **Selector sheets are modal:** `aria-modal`, scrim, background inert, scroll lock.
- **Information sheets** (P02 MORE INFORMATION and the P04/P05 detail sheets) keep their non-modal peek behaviour from #1573. The visual skin (FD-6) is separate from the behaviour.
- **One overlay at a time.** A selector never opens over a peeking sheet; DfSelect already measures the peek and opens above it.
- **The menu drawer** (approved) is not changed and never stacks with a selector sheet.

## 4. Territory A placement

- Opens below when space below is at least the smaller of the list height and 180 px; otherwise opens above.
- Height runs from a minimum of 120 px to a maximum of 300 px (the existing `place()` numbers: `want = min(n × 38 + 2, 300)`).
- **Proposed constant change:** rows from 38 to 40 px (the control height), and the cap from 300 to 402 px with a fine pointer, so all 10 Business Types show on desktop without scrolling (Board 01B).
- This is a visual constant only, with no data impact. On touch the cap stays at 300 (6½ rows), which is why B is recommended there.

## 5. Verification still owed

- None of this has been run on a physical iPhone in this sprint.
- Playwright WebKit is not installed in this environment; only Chromium is.
- The founder iPhone pass is listed in `VERIFICATION_AND_RECOMMENDATIONS.md`.
