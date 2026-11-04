# 11 — Motion capture

| File | What |
|---|---|
| `F05_CAROUSEL_CHANGE_PREVIEW.webp` | ACCOUNTS → TRANSFERS, at real speed (animated WebP, 393 × 852 phone) |
| `F05_CAROUSEL_CHANGE_PREVIEW_SLOW_x4.webp` | the same change at quarter speed, for review |
| `{small,mobile,desktop}/change-accounts-to-transfers-{000…520}ms.webp` | exact frames: the controller's timer is held (`page.clock`), the CSS animations are paused and seeked with the Web Animations API |
| `…-settled.webp` | after the change: one collection, idle |
| `tablet-mid-drag.webp`, `desktop-mid-drag.webp` | a mouse drag held at −100 px: the papers follow with resistance and a shadow lean; the shell does not move |

Timings and curves are in doc 04. The frame test asserts three things:

- no shell animation runs during a change;
- the exit uses `f05m-out-next` and the entry uses `f05m-in-next` for all four papers;
- the change ends by 520 ms.
