# Responsive matrix

## Detector

`navclip` is a Playwright script, kept in this session's scratch space and not committed. Per route and width it checks every text node of the live header:
- **Ink box:** canvas `measureText` gives the string's actual glyph extents, placed on the element's measured baseline and scaled by the strip zoom. The font's 1.58em content box is not used.
- **Clipping:** the ink box must sit inside every clipping ancestor and inside the header.
- **Masking:** no `overflow: hidden` truncation, no ellipsis, nothing off-screen.
- **Collisions:** no ink overlap between any two strings, and no overlap between groups.
- **Alignment:** every group divider shares the same top and bottom; the menu stays on screen and vertically centred.

Widths:
- mobile 360 and mobile-xl 430: mobile emulation at DPR 2
- tablet-min 700 and tablet 1024
- desktop-min 1120, desktop 1440 and desktop-xl 1920

Routes: the 7 roots and 5 descendants. Result: **before 64/84 clean → after 84/84 clean.**

`before → after` per route and width:

| route | mobile | mobile-xl | tablet-min | tablet | desktop-min | desktop | desktop-xl |
|---|---|---|---|---|---|---|---|
| hub | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| inbox | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| design | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| experience | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| expression | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| library | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| activity | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| inbox-approvals | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| design-surfaces | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| experience-world | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| expression-casting | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |
| activity-blockers | ✗ → ✓ | ✗ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ | ✓ → ✓ |

- mobile 360px: header 50px tall, menu 327–360
- mobile-xl 430px: header 59.7px tall, menu 390–430
- tablet-min 700px: header 64px tall, menu 636–700
- tablet 1024px: header 64px tall, menu 960–1024
- desktop-min 1120px: header 72px tall, menu 1040–1120
- desktop 1440px: header 72px tall, menu 1360–1440
- desktop-xl 1920px: header 72px tall, menu 1840–1920

Every pre-existing failure is the same defect: ITEMS NEED YOU cropped by `.ph-top__copy` and `.ph-top__attn` (`overflow: hidden`) on phone widths. At 360px its ink ran to x=341 inside a 340 box; at 430px to 408 inside 406. PwFrame descendants (experience-world, expression-casting) passed the detector only because they used the second, smaller header.

## Structural matrix (36 roots)

`/tmp/pa/cap.mjs` covers 12 screens × mobile 360 / tablet 1024 / desktop 1280. Result: **36/36**. It checks nav order and active tab, host-top present, menu at the far right, cluster not overlapping the menu, no scale on host chrome, nav anchored to the bottom, and no page errors (`MATRIX_36.json`).

## Families

- **Mobile (<700):** the 864-unit phone strip (the existing approved zoom; nothing new scales), 120 units tall: 50px at 360 and 60px at 430.
  - Four content-sized groups share spare width evenly.
  - At the 864-unit minimum (360px), EXPRESSION and EXPERIENCE fit with no shrink. The detector found no group overlap, nothing off-screen and the menu fully on screen at 360px.
- **Tablet (700–1119):** native px, 64px tall. Content-sized groups leave free space before the menu. At 700px the menu sits at 636–700, with no group overlap.
- **Desktop (≥1120):** native px, 72px tall, wider gutters, menu cell 80px.
