# 10 · ASSET MOTION OWNERSHIP

Rule: only independently mounted art may move.
- A baked object is part of the static composition.
- No background is shifted to fake an object moving.
- Nothing is double-mounted.
- Nothing is extracted with CSS tricks.

| Asset | Mounted as | Independent? | May move | What OPUS4 does |
|---|---|---|---|---|
| `F05_MOTION_SIDEKICK.webp` (bust, arch, coast, botanicals) | L0 environment | no: one image | no (entrance brightness only) | the ambient light D sits **over** it as a separate gradient layer; the image is untouched |
| `F05_MOTION_TITLE_PAPER.webp` | L1 | yes | entrance only | unchanged |
| `F05_MOTION_WAX_SEAL.webp` | L1 | yes | yes | ambient C sheen, a light band masked to **this same file's** alpha (no second copy of the seal is drawn) |
| `F05_MOTION_CARD_*.webp` on account papers | inside each paper | yes, with the paper | with its paper | carousel motion, settle; the balance wash is a gradient span, not art |
| DOT 01 `sk01_seal`, `seal_sk03`, screen `seal*` layers | L1 on DOT 01 pages | yes | yes | ambient C sheen on page boards only |
| OV02 / OV03 / OV05 / CH01 / CH02 regenerated shells | one image per overlay | the shell as a whole | as a whole (entrance / exit only) | the plate enters and leaves as one object; nothing inside the shell art moves |
| OV03 direction seal | baked into the OV03 shell | no | no | **no wax stamp** (see 17) |
| OV04 note (paper and paperclip) | one image | the note as a whole | as a whole | the note lifts as one object; **the paperclip does not move separately** (see 17) |
| OV04 RENAME / DELETE papers | independent papers | yes | press only | cream press; blush deliberate press |
| CH01 amount / effect / back papers | independent papers | yes | yes | rise while editing; settle on a stored change; nudge on a refusal |
| V3 caution bronze seal (live component) | live element | yes | yes | warning settle once |
| OV08 menu environment | one image | as a whole | as a whole | the menu plate enters and leaves; rows respond; the art stays still |

## Duplicate check

- The sheen masks the seal with the already-loaded file. No `<img>` is added (unit A2: the motion CSS loads no art).
- E2E O1 asserts the closing copy carries no `data-asset-id`, so a page-wide art count never sees two copies of the same art.
- The existing per-overlay art counts in `jurnl-global-menu-recovery.e2e.ts` and `jurnl-editorial-overlays.e2e.ts` still pass (see 13).
