# 10 · Inspector and overlay responsiveness

**Boards:** D-14 (desktop + phone), TP-10, TL-10, D-01 §03, D-03 §03, D-04, D-07, D-09, D-10, D-13. **Implementation reference:** `boards/src/ws-overlays.js`. Every family declares one container per tier: `data-m`, `data-t`, `data-d`.

## 1. Inspector (SH-12)

| Tier | Container | Width | Height | Entry | Dismissal |
| --- | --- | --- | --- | --- | --- |
| M | Bottom sheet under the 52 px header, square, 2 px red top edge (FD-6) | 100% | viewport − 56 | Slide up 200 ms (reduced motion: none) | Close button, back gesture, ESC |
| TP | Right sheet over a 42% scrim | min(420, 88vw) | full | Slide in from right | Close, scrim, ESC |
| TL | Sheet < 1100; **docked ≥ 1100** | 340 | full | Docked: none (columns re-flow) | Close / ESC |
| D | Docked | clamp(344, 24vw, 420) | full | none | Close / ESC; focus returns to the row |
| UW | Docked | clamp(420, 18vw, 480) | full | none | same |

**Structure:** head (kicker + open-full + close), scrolling body, footer actions. The footer's block button flexes and icon buttons stay 40–44. Below 340 px the arrow drops and tracking tightens so OPEN FOUNDATION never truncates.

**Rules:**
- The stage behind a docked inspector is never narrower than 680 (audit check `inspector`: 0 findings).
- **Keyboard:** the inspector is a complementary landmark.
  - Docked: focus is not trapped.
  - Sheet: focus is trapped; the background is `inert`.

## 2. Overlay families × tiers

| Family | Phone (< 768) | Tablet (768–1279) | Desktop (≥ 1280) | Width (T / D) | Max height | Position |
| --- | --- | --- | --- | --- | --- | --- |
| OL-01 Create foundation | Full screen | Dialog | Dialog | 600 | 100dvh − 64 − kb / min(100dvh − 96, 820) | Centred |
| OL-02 Link ready | Full screen | Dialog | Dialog | 560 | same | Centred |
| OL-03 Workspace menu | Right drawer min(340, 86vw) | Left drawer 320 | **n/a**: sidebar carries tools | 320 | full | Edge |
| OL-04 Search / command | Full screen + keyboard | Palette | Palette | 640 / 680 | 80dvh − kb / 64vh | Top 10vh / 14vh |
| OL-05 Notifications | Bottom sheet | Popover | Popover | 400 | viewport − anchor − 16 | Below bell, end-aligned; flips above |
| OL-06 Row actions | Action sheet (8 px inset) | Popover | Popover | 280 | same | Below ⋯, end-aligned |
| OL-07 Filter / sort | Bottom sheet | Popover | Popover | 360 | same | Below FILTER |
| OL-08 Approve quote | Bottom sheet | Dialog | Dialog | 500 | as dialog | Centred |
| OL-09 Revise quote | Full screen | Dialog | Dialog | 720 | as dialog | Centred |
| OL-10 Mark complete | Full screen | Dialog | Dialog | 560 | as dialog | Centred |
| OL-11 Request revision | Bottom sheet + keyboard | Dialog (portrait) / decision footer (landscape) | **Inline** decision pane | 520 / pane | as dialog | — |
| OL-12 Task detail | Inspector sheet | Inspector sheet / docked ≥ 1100 | Inspector | as SH-12 | full | Edge |
| OL-13 Set blocker | Bottom sheet | Dialog | Dialog | 500 | as dialog | Centred |
| OL-14 Compose message | Inline composer above keyboard | Inline | Inline | thread | — | Thread foot |
| OL-15 Gated send | Bottom sheet | Dialog | Dialog | 540 | as dialog | Centred |
| OL-16 Module detail | Inspector sheet | Sheet / docked | Inspector | as SH-12 | full | Edge |
| OL-17 Reset test data | Bottom sheet + keyboard | Dialog | Dialog | 500 | as dialog | Centred |
| OL-18 Account menu | In the MENU drawer | Popover from rail foot | Popover, opens **upward** from sidebar foot | 280 | anchor-bounded | Above-start |
| OL-19 Client preview | Push to record | Inspector sheet | Inspector | as SH-12 | full | Edge |
| OL-20 Technical detail | Inline `<details>` | Inline | Inline, max 760 | — | — | Under the error banner |
| SC-14 Feedback toast | Above bottom nav, 12 inset | Stage bottom-left | Stage bottom-left | ≤ 440 | auto | Bottom-left |

## 3. Common behaviour

| Aspect | Authority |
| --- | --- |
| Entry | Dialogs: fade + 8 px rise (160 ms). Sheets: slide (200 ms). Popovers: fade (120 ms). `prefers-reduced-motion`: no movement. |
| Scroll | Header and footer are fixed inside the overlay; the body scrolls. The page behind never scrolls (scroll lock). |
| Keyboard | Tab cycles inside (focus trap); ESC closes; ↵ submits only from the last field (OL-01) or the focused button. Menus: ↑ / ↓, Home / End, type-ahead. |
| Focus | First field or the primary choice on open; returns to the trigger on close. Background is `inert` (`aria-modal="true"` on dialogs). |
| Dismissal | Close button, ESC, scrim (non-destructive families only). OL-10 / OL-15 / OL-17 never close on scrim. |
| Reflow | Container mode switches at the tier boundaries above. Within a tier, width is `min(token, 100vw − 48)`; the dialog never touches the viewport edge. |
| Overflow | Long values: ellipsis in single-line slots, wrap in bodies. Buttons wrap as a row, never their labels (audit `multiline`: 0). |
| Software keyboard | `--ws-kb` subtracts from max height and lifts dialogs by half the keyboard. Sheets sit on the keyboard. Simulated on TP-04, TP-06, TP-08, TL-04 and OL-04 / OL-11 / OL-17 phone frames. |
| Popover anchoring | Anchored to the trigger's rect, end- or start-aligned, flipped above when it would pass the viewport bottom, clamped 12 px inside both edges. |

## 4. States drawn

- **OL-01:** form, validation, duplicate notice (client-side, G-11), submitting (fields locked), not created (RETRY, entries kept), link ready.
- **Persistence rule from #1657:** LINK READY appears only after the server confirms the durable write.
