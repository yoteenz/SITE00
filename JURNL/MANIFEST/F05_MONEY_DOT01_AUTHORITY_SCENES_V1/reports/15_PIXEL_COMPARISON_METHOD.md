# 15 · Pixel comparison method (reproducible, authority coordinate space)

Two scripts, both deterministic, both run with the pilot venv (`python -I`), both write JSON next to their images.

## A · Text-masked comparison of the account pages (02–05) — `scripts/jurnl/f05-motion-pilot/compare_dot01_account_scenes.py`

1. **Capture** each page at **471 × 890, DSF 2** (width-first phone scale u = 0.5346; 1 board px ≈ 1.07 device px; the
   board is cropped 30 px each side exactly as on every phone; 890 tall shows y 0–1665 with no row compression), and
   record the board rect the page reports (`getBoundingClientRect` of `.jrn-d01__board`) in `rects.json`
   (`scripts/jurnl/f05-motion-pilot/capture_dot01_account_boards.ts`).
2. **Map back** into authority px (941 × 1672) with that rect (`cv2.remap`), keeping a validity mask of what was on screen
   (x 30–911).
3. **Live text** (the only thing masked): fixed boxes — the extraction's own masked boxes for 03–05, SK02 boxes for 02,
   plus every strip label. In each box the **tight glyph box** is found in the authority and in the runtime with the same
   detector (light glyphs on the olive ground: `> max(p35 + 45, 105)`; ink on parchment: `< min(p70 − 55, 150)`; 2 × 2
   opening) → left / top / right / bottom offsets and height / width ratios.
4. **Structure** outside the text boxes: Sobel edge maps (|∇| > 60) → edge **recall** (authority edges reproduced within
   3 px) and **precision** (runtime edges within 3 px of an authority edge), per region: heading (y 0–548), scene (band),
   rows (band foot – 1560). Plus the mean |Δ| of RGB.
5. **Images**: alignment overlay (authority edges red, runtime cyan, coincident white), diff heat map (live-text boxes
   dimmed, never removed), the runtime board in authority px.

No illustration or structural region is masked; only the text boxes listed in the JSON.

States: BEFORE = #1713 `f7e2739c` (the financial base); OPUS1 = `3604d2e7` (#1707's founder-rejected convergence,
03–05 only); AFTER = this branch.

## B · Unmasked structural comparison of all 37 states — `scripts/jurnl/f05-motion-pilot/compare_dot01_all_screens.py`

The probe's 471 × 836 DSF 1 captures (BEFORE at the financial base #1713 `f7e2739c`, AFTER at this branch, which also carries OPUS1) are cut to the recorded board
rect; the authority is resized (Lanczos) to the same board size; edge recall / precision within 2 px and mean |Δ| are
computed over the on-screen board. **Nothing is masked** — sample figures, live names and dates count as differences —
so the numbers rank screens and show direction of change; they are not a pass mark.

## C · Responsive / reachability probe — `scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts` (see 13 / 14)

37 states × 9 viewports (471×836, 393×852, 393×660, 375×667, 360×780, 430×932, 768×1024, 834×1194, 1440×900): page scroll
x / y, board rect, clipped foot, internal scroll of the content region, every visible control outside the viewport and
not inside a scroller (**unreachable**), chips, dock visibility. State 27 is captured with the OCR engine held
(`HOLD_OCR`) so SCANNING stays on screen.

## Re-run

```
npx tsx capture_dot01_account_boards.ts <dir> 471x890            # env BASE (defaults to the :5174 dev server)
npx tsx probe_dot01_37_states.ts <dir> 471x836,393x852,393x660,375x667,360x780,430x932,768x1024,834x1194,1440x900   # env SHOTS, LABEL, ONLY, HOLD_OCR
python -I extract_dot01_account_scenes.py --auth <V9 01_MOBILE_SCREEN_AUTHORITIES flat dir> --out src/projects/jurnl/families/F05_MONEY/DOT01/SCENES
python -I compare_dot01_account_scenes.py --auth <dir> --cap <capture dir with rects.json> --viewport 471x890 --scenes <SCENES.json> --out <dir> [--label before]
python -I compare_dot01_all_screens.py --auth <dir> --before <probe dir> --after <probe dir> --before-metrics <jsonl> --after-metrics <jsonl> --out <dir>
python -I build_dot01_scene_evidence.py --auth <dir> --before <probe dir> --after <probe dir> --cmp-before <dir> --cmp-after <dir> --repo . --out <dir>
```
