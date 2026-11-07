# 03 · UTILITY BUTTON COMPONENT

`src/projects/jurnl/runtime/components/JurnlUtilityArtButton.tsx`, with styles in `jurnl-utility-art.css`.

```tsx
<JurnlUtilityArtButton kind="search" | "add" | "menu" | "close"
  label="SEARCH POCKETS AND ACTIVITY"   // the accessible name (aria-label)
  trigger="f05m-search"                 // data-jrn-trigger, kept from the control it replaces
  className="jrn-f05m__chip"            // the host's existing class (position, size, motion hooks)
  onClick={…} disabled={…} aria-haspopup / aria-expanded / style … />
```

Rendered markup (one element tree per control):

```html
<button type="button" class="jrn-uab jrn-f05m__chip" data-utility-art="search" data-jrn-trigger="f05m-search" aria-label="SEARCH POCKETS AND ACTIVITY">
  <img class="jrn-uab__art" src="…/UTILITY_SEARCH_GOLD.webp" width="256" height="256" alt="" aria-hidden="true" draggable="false" data-asset-id="F05.UTILITY.SEARCH.GOLD" decoding="async">
</button>
```

## Contract

| Concern | How |
|---|---|
| Artwork | The image is the whole visual. It comes from `global/utilityArt/registry.ts` (`UTILITY_ART[kind]`). |
| Decorative image | `alt=""`, `aria-hidden="true"`, `draggable="false"`, `pointer-events: none`, `user-select: none`. The image is never the target. |
| Accessible name | `aria-label` on the `<button>`. Every label, `aria-haspopup` and `aria-expanded` is kept from the control it replaces. |
| Behaviour | Every handler, `disabled`, focus, Enter / Space and touch activation belong to the native `<button>`. Trigger ids are unchanged, so Escape, focus return and the overlay host work as before. |
| No added shell | The button has `border: 0`, `background: none`, `box-shadow: none`, no backdrop filter, and no CSS circle. The artwork carries its own disc, bevel and shadow. |
| Hit area | The button box is a transparent square-rounded area (`border-radius: 12px`), so it is not a circular tappable control and the existing "no circular control" rules still hold. |
| Size | `--uab-disc` is the visible disc diameter. The image is `calc(var(--uab-disc) / 0.8065)` wide and centred, so every kind shows the same disc at the same optical centre. |
| Focus | `outline: 2px solid #dcab4f; outline-offset: 2px`. The MONEY parent chips keep their approved 5 board-px gold ring, which scales with the board. |
| Disabled | The artwork dims (`opacity: 0.45; saturate(0.6)`), the cursor is `default`, and the native disabled state applies. |
| Press | With motion allowed, the artwork compresses to `translateY(1px) scale(0.955)` over 90 ms on the paper easing, then settles over 160 ms on the bronze easing. With reduced motion there is no transition and no compression. Nothing animates while idle. |
| Scope | Every selector is under `.jrn`, so nothing leaks outside the JURNL runtime. |

## Hosts and their sizes

| Host | `--uab-disc` | Box | Touch target |
|---|---|---|---|
| MONEY parent SEARCH / ADD (`.jrn-f05m__chip`) | the approved 64 board-px chip square, scaled with the board | 64 board px | `::before` gives 44 CSS px tall, and is as wide as the approved 20 board-px gaps allow without overlapping a neighbour |
| MONEY parent MENU (`.jrn-corner .jrn-f09a__menu`) | `var(--f05m-chip)`: the same visible disc as SEARCH / ADD | the far-right approved square | `::before` gives 44 tall and about 38.5–53 wide, kept inside the viewport |
| Overlay closes (`.jsh-close`, `.jed-close`, `.jgm-close`) | `clamp(34px, 9cqw, 46px)`: the authorities' disc is about 9 % of the plate width | `max(44px, disc)` square | ≥ 44 × 44 |

## The global hamburger

`JurnlCornerChrome` renders the hamburger for every hub. `MoneyMotionParent` calls `claimMenuArt()` while it is mounted. `useMenuArt()` is built on `useSyncExternalStore`, and the claim is counted and idempotent. While the claim is held, the corner renders the MENU artwork button; otherwise it renders the unchanged line hamburger. Exactly one control is rendered either way, never the glyph and the artwork together. Unit test `C2` covers balanced and double releases; E2E `U9` checks that leaving MONEY restores the line hamburger.

At tablet widths, the open menu's CLOSE sits exactly where the hamburger sits. This overlap existed before this sprint at 9fc523fdd: the hamburger covered the close and left it no target.

- While the menu is open and the two rectangles intersect, the hamburger steps aside (`data-yield`: `visibility: hidden`, `pointer-events: none`). The check runs on a frame and on resize.
- It returns synchronously when the menu closes, so focus can return to the hamburger.
- On phones the two do not meet, and the hamburger stays as the menu's toggle.

## Files

| File | Change |
|---|---|
| `components/JurnlUtilityArtButton.tsx` | new |
| `components/jurnl-utility-art.css` | new |
| `global/utilityArt/*.webp`, `registry.ts` | new, generated |
| `screens/f05/MoneyMotionParent.tsx` | SEARCH and ADD chips; claims MENU |
| `components/JurnlCornerChrome.tsx` | MENU artwork while claimed; the tablet yield |
| `global/GlobalMenu.tsx` | `jgm-close` |
| `surfaces/editorial/Shell.tsx` | `jsh-close` (SEARCH, BUFFER, PRIVACY) |
| `surfaces/editorial/Editorial.tsx` | `jed-close` (plate: ADD A POCKET, MOVE MONEY; folio: MONEY ACTION SHEET) |

No financial, routing, storage or data logic changed.
