# Responsive component matrix

**Status:** PROPOSED. Board 25 is the authority, with boards 01 and 02 for shell geometry. The breakpoints are open as FD-W20.

## 1. Breakpoints and regions

| Range (CSS px) | Navigation | Stage | Contextual detail |
| --- | --- | --- | --- |
| < 768 · phone | Header + bottom nav (+ MENU drawer) | One column, 16 px gutters | Push page or bottom sheet |
| 768–1279 · tablet / narrow desktop | 72 px index rail + 56 px top bar | One or two columns (two at stage ≥ 900) | Docked 360 if width − 72 ≥ 1100, otherwise right sheet 360 |
| ≥ 1280 · desktop | 232 px sidebar + 56 px top bar | Up to 1180 px content | Docked 392 inspector while selected |

**Width decides, not device class.** Test at 320, 375, 390, 430, 768, 834, 1024, 1194, 1280, 1440 and 1920.

## 2. Matrix

| Component | Phone | Tablet | Desktop |
| --- | --- | --- | --- |
| Primary navigation | Bottom nav (5) + MENU | Rail (6 + create) | Sidebar (6 + create + tools) |
| Page title | H1 50, ≤ 2 lines, small object | H1 50–68 | H1 68 + object |
| Search | Full screen | Palette 620 | Top bar field + palette |
| Notifications | Sheet | Popover | Popover |
| Create | Centre block → sheet → full-screen form | Rail + → dialog 560 | NEW FOUNDATION → dialog 560 |
| Signals | 4-up compact rail | 4-up | Rail beside the focus |
| Focus block | Card, 24 px line | Card | Wide card, 28 px line |
| Registry row | Card row (plate 42) | Dense row (5 columns) | Table row (7 columns) |
| Status views | Scrolling tabs (5 visible) | Tabs | Tabs inline in the toolbar |
| Filters / sort | One sheet | Popovers | Popovers |
| Client preview | Push to record | Right sheet / dock | Dock 392 |
| Record header | Band + plate + name + segments | Header + journey panel | Header + journey panel with dates |
| Record sections | 4 tabs + MORE | 8 tabs | 8 tabs |
| Quick actions | 5-up icon grid | Inline buttons | Header buttons |
| Journey | 8 segments + "STEP n OF 8" | Short-label nodes | Full-label nodes + dates |
| Quote decision | Fixed bar above nav | Panel foot | Ink-bordered decision panel |
| Review queue | Cards with one action | List + dock | Table + inspector |
| Review detail | Push + fixed decision bar | Page or dock | Two panels + decision panel |
| Stage rail | Horizontal scroll | Full strip | Full strip |
| Task detail | Bottom sheet | Right sheet / dock | Inspector |
| Dependencies | List in task sheet | Diagram | Diagram |
| Correspondence intents | List | List / table | Table + preview inspector |
| Thread | Full screen + composer | Thread | Thread |
| System modules | 2-up grid + sheet | 2–4-up + sheet / dock | 4-up + inspector |
| Readiness report | Stacked columns | 2 × 2 | 4 columns |
| Technical configuration | Pushed page | Section | `<details>` table |
| Confirmations | Bottom sheet | Dialog 440 | Dialog 440 |
| Toast | Above bottom nav | Stage bottom-left | Stage bottom-left |
| Tables | Never | Dense rows below 900 px stage | Tables |

## 3. Rules

1. A docked inspector and its sheet are the **same component**; only the container changes. Content, scroll position and selection survive a container switch, for example on rotation or window resize.
2. There is no horizontal page scroll at any width ≥ 320. Only explicit strips scroll horizontally (tabs, stage rail).
3. Fixed bars (decision bar, bottom nav) never overlap content. The stage pads by their height plus the safe area.
4. Touch targets stay at 44 px whenever the primary input is touch, whatever the width.
