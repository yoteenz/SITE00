# 12 · Interactive accessibility — visible artwork vs hit area

The illustrated surface and the functional element are separate (sprint §10):

| Control family | Visible artwork | Functional element | Keyboard | Focus indicator | Touch target | Disabled | Pressed | Screen-reader label |
|---|---|---|---|---|---|---|---|---|
| DOT 01 actions (`.d01-btn`) | lifted SK03 pill (`border-image`, caps at their own aspect) | the native `<button>` (kit `Button`, unchanged API, `data-jrn-trigger`) | Enter / Space (native) | 3 px gold ring, offset 3, radius 999 px (follows the pill) | `min-height: max(44px, 3.1 × fs)` (scan pair 3.3 / 2.8 × fs, ≥ 44) | `:disabled` 0.5 opacity, native `disabled` | 1 px down, shorter shadow | its live text (system text, uppercase) |
| 06 ADD / REORDER | lifted paper + lifted glyph (`img`, `alt=""`, decorative) + live label (`aria-hidden` span) | one `<button>` over the whole paper, `aria-label="ADD ACCOUNT"` / `"REORDER ACCOUNTS"` | native | gold ring | 391 × 140 / 402 × 149 board px (≈ 195 × 70 css px at 393 wide) | REORDER disabled with < 2 pockets | paper lifts 2 px | aria-label |
| Title papers, seals, scan art | `img` layers, `alt=""`, `aria-hidden`, `pointer-events: none` | — | — | — | — | — | — | the `<h1>` title is live text |

Decorative layers never intercept a tap: every `.jrn-d01__layer` (title paper, seals, scan art) has `pointer-events: none`;
E2E `S1` taps the centre of each 06 paper and gets the button; the editorial suite (`A1`, `B4`) checks the same for the V3
overlays. Focus trap / Escape / focus return of the overlays are unchanged (`Dot01Overlay`), covered by
`jurnl-f05-dot01.e2e.ts` (keyboard journeys) and the editorial `B5`.

Tests run on this branch (results in report 14 and the final contract): the new suite `jurnl-f05-dot01-artwork-type.e2e.ts`
(R1 · R2 · H × 6 · S1) at 360 × 780 and 393 × 852 — pill surfaces, labels between the caps, no icon/text collision, ≥ 44 px
targets, Enter activation, tap reaches the button, no page scroll; the unit suite `jurnlF05Dot01ArtworkType.test.ts` (10 tests)
for the CSS / geometry / provenance contracts.
