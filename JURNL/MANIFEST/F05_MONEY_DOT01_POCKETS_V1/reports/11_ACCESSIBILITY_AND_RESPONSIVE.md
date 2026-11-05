# 11 · Accessibility and responsive behaviour

## Keyboard and screen reader

| Need | How |
|---|---|
| Reach the menu without a hold | the MANAGE POCKET chip (Tab → Enter); Shift + F10 / ContextMenu key on any focused Pocket card or paper |
| Discoverability | cards and papers carry `aria-keyshortcuts="Shift+F10"` and `aria-description="PRESS AND HOLD, OR SHIFT F10, TO MANAGE THIS POCKET."`; the chip is named MANAGE POCKET with `aria-haspopup="menu"` / `aria-expanded` |
| Menu semantics | `role="menu"` named `MANAGE POCKET: <NAME>`, items `role="menuitem"`, focus on the first item, ↑ ↓ Home End, Enter / Space, Escape, Tab |
| Focus restore | Escape, outside press, CANCEL and KEEP POCKET return focus to the anchor: the held card or paper, or the chip (T01, T06, T10, T19) |
| Overlays | `role="dialog"`, `aria-modal`, focus contained, Escape closes (existing `Dot01Overlay`) |
| Errors | rename errors and the blocked-delete alert are `role="alert"` |
| Toasts | POCKET RENAMED / POCKET DELETED are the shared `role="status"` live region |
| Hold hit area on a Pocket page | `aria-hidden`: it duplicates the chip and is not a focus stop |
| Reduced motion | no hold settle, no menu rise; overlays appear without motion (existing) |
| Axe (T18) | menu, rename and delete (blocked) surfaces open, and the Pocket page with its new chip: **0 serious / critical** on all four sizes |

## One viewport

| Check | Result |
|---|---|
| Page scroll with the menu, rename or delete open (T18, T02, T06, R1, D1, D2) | none, vertical or horizontal, at 360 × 780, 393 × 852, 834 × 1194 and 1440 × 900; capture probe at 375 × 667 (see `tests/capture_measurements.json`) |
| Menu inside the viewport (T18) | yes on all four sizes |
| Dock (06, 31) | the popover now uses the dock's top as its floor. Before the fix, `.jrn-nav` is `position: fixed`, its `offsetParent` is always null, and the floor never engaged: on a tablet a menu under the last card opened beneath the dock (caught by T11 at 834 × 1194). It now reads the dock from its client rects and flips above. |
| Targets | menu items 46 px, chip 88 board px (≥ 44 CSS px at every supported width), rename buttons the overlay's standard pair |
| Text | rename field is 16 px or more (no iOS zoom), stacked to the full sheet width so a long name is visible |

## Touch platforms

- **Android Chrome:** the hold is the timer. The platform `contextmenu` that also fires is de-duplicated, and there is a 12 ms vibration.
- **iOS Safari:** the hold is the timer, and `-webkit-touch-callout: none` / `user-select: none` stop the link preview and text selection. There is no vibration API, so no haptic. **Not verified on a device:** no WebKit or iOS device is available in this environment, so IOS_SAFARI is BLOCKED (doc 14).
