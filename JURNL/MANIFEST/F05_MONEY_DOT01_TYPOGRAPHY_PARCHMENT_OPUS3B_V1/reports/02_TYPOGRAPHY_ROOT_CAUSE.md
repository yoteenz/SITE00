# 02 · Typography root cause (RECORD TRANSACTION first, then every overlay)

Measured on the authority master `16_RECORD_BANK_TRANSACTION.png` (941 × 1672) by ink bounding boxes, and on the runtime by
the DOM (`scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts` `TEXT=1`, board px = screen px ÷ board scale).

## 1 · The title was sized to a measure wider than its paper

Base (`8e0b8d861`), `Dot01Frame.tsx` `titleSize(lines, overlay=true)`:

```ts
const cap = lines.length <= 1 ? 88 : lines.length === 2 ? 70 : 54;
return Math.min(cap, 500 / Math.max(1, longest * 0.66));
```

and `.jrn-d01[data-env^='SK03'] .jrn-d01__heading { left: 196px; top: 318px; width: 520px; height: 180px }`.

The SK03 SIDEKICK's heading paper (`F05_DOT01_SK03_FIELD.webp`, measured: visible paper x 50–640, y 318–555) ends at x ≈ 640 at
its top and its torn lower-right corner rises from y ≈ 470 (right edge 607 at y 480, 590 at y 500, 550 at y 520), with the
foliage drawn over it. A 520 px box from x 196 reaches x 716 — 76 px past the paper at the top and > 110 px past it on the second
line. RECORD / TRANSACTION fitted that box at ≈ 69 board px, so TRANSACTION's last letters crossed the torn edge and touched the
foliage: the "oversized heading", "text overlapping parchment boundaries" and "text approaching neighbouring artwork" the founder
reported.

## 2 · One measure for every line

The lower lines of the SK03 paper have less width than the first, but the fit used one measure for all lines.

## 3 · The authority title is not small — its paper is wide

Authority 16: RECORD x 192–470, y 345–398; TRANSACTION x 192–685, y 410–462 (cap ≈ 50 board px, ≈ 0.6 em per letter, line pitch
64 px ≈ 0.94 em). Its title paper runs x ≈ 90–715, y 296–500: wider and **shorter** than the SK03 paper (x 50–640, y 318–555).
Shrinking the type to fit the SK03 paper (the interim fix) made the title smaller than the authority and left it "swallowed" by a
paper taller than drawn. So the fix is the paper and the type together (report 03 / 06), not a font-size reduction alone.

## 4 · Content type below the authority's

| Role (16) | Authority (board px) | Base runtime (board px, 471 × 836) |
|---|---|---|
| field label (TYPE, AMOUNT …) | cap ≈ 20 → ≈ 29 | 22.8 (`--d01-fs × 0.9 − 2px`) |
| field value (PURCHASE …) | cap ≈ 20 → ≈ 29 | 29–30 |
| SCAN RECEIPT | cap ≈ 28 → ≈ 40 | 26.4 (`--d01-fs × 1.02 − 2px`, every button) |
| MANUAL ENTRY | ≈ 32 | 26.4 |
| RECORD TRANSACTION | cap ≈ 23 → ≈ 33 | 26.4 |

Labels and actions were set one generic size smaller than drawn: the text read as small marks on large papers.

## 5 · Not causes (checked)

* `text-transform: uppercase` is applied only to system text; stored names keep their case (`.jrn-d01__content` uppercases its
  own labels; pocket names come from the repository and are uppercase in the synthetic data as entered).
* No fallback font loads: the title, labels and actions resolve to `JURNL Authority Serif` (self-hosted); notes use `JURNL Sans`.
* `--f05-type-nudge` subtracts 2 px from board type on the shortest phones; it is unchanged.
