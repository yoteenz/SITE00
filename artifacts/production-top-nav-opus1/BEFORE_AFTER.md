# Before / after

Pairs are in `routes/<route>/<width>-before-after.jpg`: before (base `7dcf37de`) on top, after below. That is 12 routes × 7 widths.

| Area | Before | After |
|---|---|---|
| Phone ITEMS NEED YOU | cropped on the right by its copy box and cell (every authority-frame route at 360 and 430) | fully visible, black label under the red count, as in the authority |
| Phone groups | 5 (TAB, PROJECT, CURRENT WORKSPACE, ATTENTION, MENU) in fixed grid tracks | 4, matching the authority (TAB, PROJECT, ATTENTION, MENU); content-sized, sharing spare width evenly |
| Phone roots vs descendants | two geometries: `.pxa` roots (120 units, 40px title) vs PwFrame and Design overlay (75 units, 20px title) | one geometry everywhere (120 units, 32 title, 36 count) |
| Phone menu | 48-unit cell crowding the right edge | 80-unit cell, icon centred |
| Long titles | `brand--long` ellipsis path for titles over 12 characters | no ellipsis path; EXPERIENCE and EXPRESSION fit at the narrowest strip |
| Tablet / desktop height | 58 / 62px with line boxes under the glyph box | 64 / 72px tokens, line-height 1.15–1.2 |
| Tablet / desktop type | hard-coded per breakpoint | `--pxh-*` tokens |
| ITEMS NEED YOU colour (tablet/desktop) | red | ink (the count stays red), matching the authority and the phone |
| Dividers | per-group margins | one shared inset token; the detector checks that all group dividers align |
