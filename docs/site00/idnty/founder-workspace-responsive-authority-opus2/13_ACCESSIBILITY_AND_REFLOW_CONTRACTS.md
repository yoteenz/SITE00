# 13 · Accessibility and reflow contracts (WCAG 2.2 AA)

These contracts extend OPUS1 `ACCESSIBILITY_AND_INTERACTION_CONTRACTS.md` and the form-control authority (FD-1…FD-6). They add the responsive obligations.

| WCAG 2.2 | Contract | How the boards / audit show it |
| --- | --- | --- |
| 1.3.1 Info and relationships | Registry rows use `role="table" / "row" / "cell" / "columnheader"`. Hidden responsive columns are removed from the accessibility tree (`display: none`), not merely shrunk. The mobile card exposes the same facts as cells. | `ws-pages.js` registry; audit `dimensions` = 0 |
| 1.3.2 Meaningful sequence | DOM order is the reading order at every tier. Grid areas reorder only visually within a region (overview), and focus follows the DOM. | Specimens |
| 1.3.4 Orientation | Both orientations are supported; nothing is locked. | TP / TL boards |
| 1.4.3 Contrast (minimum) | Text tokens: ink #0c0c0c; muted #6f6d68 (4.95:1 on page #fbfaf8, 5.17:1 on white, 4.62:1 on chamber); red #ce1017 (5.66:1 on white); red ink #b30f17 on red tint (6.55:1); warn #a65208 on its tint (4.99:1); ok #2e7a4b on its tint (4.77:1). Faint #8f8d88 (3.18–3.32:1) is used **only** for non-text marks and disabled items (exempt). Index numerals, stage numbers and placeholders were moved from faint to muted during this sprint. | Token table, 03 |
| 1.4.4 Resize text | Sizes in tokens; 200% text zoom reflows (wrap policies, no fixed heights on text containers except one-line slots that truncate with the full value available) | 03 §4 |
| **1.4.10 Reflow** | 320 CSS px wide (= 1280 at 400%) uses the phone grammar with **no horizontal page scroll**. Only data tables inside their own panel may scroll horizontally. | 16 viewports × 45 states, audit `overflow` = 0 |
| 1.4.11 Non-text contrast | Control edges ≥ 3:1: input, checkbox and task-box edges use #8f8d88 (3.32:1 on white), the repaired NF-06 edge; the live #b8b6b1 (2.03:1) is not used. Focus ring 2 px red. Current-step and selection marks are red or ink. | D-15 |
| **1.4.12 Text spacing** | Line height ≥ 1.35 for multi-line text (1.6 for reading); no clipping when spacing is overridden, because one-line slots use ellipsis with the full text in `title` / accessible name. | 03 |
| 1.4.13 Content on hover or focus | Popovers and menus are dismissible (ESC), hoverable and persistent; no hover-only content. | 10 |
| 2.1.1 Keyboard | Every action reachable by keyboard: J / K, ↵, ESC, ⌘K, `/`. Menus use arrow keys. No keyboard trap except intentional modal traps with ESC. | 06 §5 |
| 2.4.3 Focus order | Opening an overlay moves focus inside; closing returns it to the trigger. A docked inspector does not trap focus. | 10 §3 |
| 2.4.7 Focus visible | 2 px red outline, 2 px offset, every interactive element | `:focus-visible` in `ws.css` |
| **2.4.11 Focus not obscured (minimum)** | The sticky decision bar, composer, toasts and the software keyboard never cover the focused element. `scroll-padding` on the stage; dialogs lift above the keyboard. | TP-04, TP-06, TP-08, TL-04 |
| **2.5.7 Dragging movements** | No drag is required (no Kanban; ordering is not draggable). | 11 Operations |
| **2.5.8 Target size (minimum)** | ≥ 24 × 24 everywhere; the house rule is ≥ 44 × 44 on touch tiers (buttons 44, icon buttons 44, rail 72 × 58, rows 56) and ≥ 34 on desktop. | 09 |
| 3.2.6 Consistent help | Account menu → keyboard shortcuts in the same place on every page | D-01 |
| 3.3.1 / 3.3.3 Error identification and suggestion | Field errors with red mark + text; banners for page and system errors with RETRY; technical detail (OL-20) | D-04, D-02 |
| **3.3.7 Redundant entry** | Failed create keeps all entries; failed decision keeps the note | D-04, D-09 |
| 4.1.2 Name, role, value | Icon-only buttons have `aria-label`; tabs are `tablist` / `tab` with `aria-selected`; segmented controls are `radiogroup`; the journey `ol` uses `aria-current="step"` | Specimens |
| 4.1.3 Status messages | Toasts `role="status"` (errors `role="alert"`); SAVING… / NOT SAVED announced | D-14 |

**Reduced motion:** all entries (fade, slide) are disabled under `prefers-reduced-motion: reduce`.

**Not verified in this sprint:** VoiceOver and NVDA announcements, iPad and iPhone Safari keyboard behaviour, and real 200% / 400% browser zoom. Zoom is simulated by width; see `15_RESPONSIVE_VERIFICATION_REPORT.md`.
