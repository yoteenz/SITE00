# OPUS — VISUAL DELTA REPORT

**Before (Sonnet `a86c8cd`):** 0 PASS · 37 PARTIAL · 0 FAIL (Sonnet classification, kept as historical truth).

**History:** OPUS-CONVERGENCE1 (`f376dfb`) → 20 PASS · 15 PARTIAL (Grok) · 2 PARTIAL (Opus) · 0 FAIL. OPUS-SURGICAL-CLEANUP1 closed the two Opus partials (State 00 detail, Build Ready evidence) — see the section at the end.

**After (Opus):** 22 PASS · 15 PARTIAL (15 PARTIAL — GROK DEPENDENCY ONLY · 0 PARTIAL — OPUS VISUAL WORK REMAINS) · 0 FAIL.

**Rubric**

- **PASS:** live geometry, hierarchy, machine identity, panel relationship and type converge on the authority. The only missing fidelity is placeholder assets that carry no layout meaning.
- **PARTIAL — GROK DEPENDENCY ONLY:** the live geometry is converged, but an image-like asset is a primary compositional element of the authority, so the screen cannot be called matched until Grok injects it. Examples: Origin landmark, BLDR/EVOLVE tower, path-page plates, card vignettes, Locations thumbnails.
- **PARTIAL — OPUS VISUAL WORK REMAINS:** a live-code difference is still visible.

Every classification comes from the side-by-side `opus-proof/<id>/comparison.jpg` plus the measured geometry in `opus-geometry-{before,after}.json`. None comes from tests.

| # | Authority | Before | After |
|---|---|---|---|
| 1 | `01_ORIGIN_MAIN` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 2 | `02_ORIGIN_IDNTY_EXPANDED` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 3 | `03_ORIGIN_BLDR_EXPANDED` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 4 | `04_ORIGIN_EVOLVE_EXPANDED` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 5 | `01_IDNTY_DIAGNOSTIC_OVERVIEW` | PARTIAL | PASS |
| 6 | `02_IDNTY_STATE_00_FOUNDATION` | PARTIAL | PASS |
| 7 | `03_IDNTY_STATE_01_REFINE` | PARTIAL | PASS |
| 8 | `04_IDNTY_STATE_02_EVOLUTION` | PARTIAL | PASS |
| 9 | `05_IDNTY_STATE_03_BUILD_READY` | PARTIAL | PASS |
| 10 | `01_FOUNDATION_PRIMARY_GOAL` | PARTIAL | PASS |
| 11 | `02_FOUNDATION_AUDIENCE` | PARTIAL | PASS |
| 12 | `03_FOUNDATION_TIMELINE` | PARTIAL | PASS |
| 13 | `04_FOUNDATION_BUDGET` | PARTIAL | PASS |
| 14 | `05_FOUNDATION_REVIEW` | PARTIAL | PASS |
| 15 | `01_REFINE_EXISTING_ASSETS` | PARTIAL | PASS |
| 16 | `02_REFINE_CONDITION` | PARTIAL | PASS |
| 17 | `03_REFINE_GAPS` | PARTIAL | PASS |
| 18 | `04_REFINE_REVIEW` | PARTIAL | PASS |
| 19 | `01_EVOLUTION_AREAS` | PARTIAL | PASS |
| 20 | `02_EVOLUTION_GOALS` | PARTIAL | PASS |
| 21 | `03_EVOLUTION_TIMELINE` | PARTIAL | PASS |
| 22 | `04_EVOLUTION_REVIEW` | PARTIAL | PASS |
| 23 | `01_BUILD_READY_VERIFICATION` | PARTIAL | PASS |
| 24 | `02_BUILD_READY_EVIDENCE` | PARTIAL | PASS |
| 25 | `03_BUILD_READY_AUTHORITY_CHECK` | PARTIAL | PASS |
| 26 | `04_BUILD_READY_REVIEW_VERIFICATION` | PARTIAL | PASS |
| 27 | `01_BLDR_COMMAND_CENTER` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 28 | `02_BLDR_OVERVIEW` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 29 | `03_BLDR_SITE` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 30 | `04_BLDR_WORLD` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 31 | `05_BLDR_SYSTEMS` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 32 | `06_BLDR_EXTENSIONS` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 33 | `01_EVOLVE_INTERVENTION_CENTER` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 34 | `02_EVOLVE_REFINE` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 35 | `03_EVOLVE_INSTALL` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 36 | `04_EVOLVE_TRANSFORM` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |
| 37 | `01_LOCATIONS_MAIN` | PARTIAL | PARTIAL — GROK DEPENDENCY ONLY |

## 1. `01_ORIGIN_MAIN`

- **AUTHORITY ID:** `01_ORIGIN_MAIN` · route `/`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Header rebuilt at authority scale (00 mark 15px SVG, links 4.8px, SIGN IN pill 14px).
  - Hero: serif SITE 00 46px → 28px; WELCOME/tagline tracking per authority.
  - Margin notes moved from y≈210 to y≈124 at x 20 / right 20.
  - Cards 109×168 → 112×116, landing at y≈464 (authority 457); arrow discs 38 → 22px.
  - Swipe connector/label and footer re-spaced to authority rhythm; footer 00 mark as plain-zero SVG.
- **REMAINING MISMATCHES:**
  - Landmark plate and three card vignettes are Grok slots (and the existing production plate is blocked in the proof sandbox), so the composition around the double-zero cannot be judged locally.
  - CHARACTERS / WORLDS / LIBRARY + SEARCH intentionally absent (no routes / capability).
- **GROK DEPENDENCIES:** `ENV.ORIGIN.COLLAPSED`, `CARD.ORIGIN.IDNTY`, `CARD.ORIGIN.BLDR`, `CARD.ORIGIN.EVOLVE`
- **RESPONSIVE NOTES:** No overflow at 360/390/430; whole page fits 390×693 (doc height 693).
- **PROOF:** `opus-proof/01_ORIGIN_MAIN/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 2. `02_ORIGIN_IDNTY_EXPANDED`

- **AUTHORITY ID:** `02_ORIGIN_IDNTY_EXPANDED` · route `/ (EXPAND IDNTY)`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Corner hero scaled to authority (SITE 00 18px) and the left margin list kept under it (authority shows it).
  - Glass panel x12→378 @ y≈218 (authority 220), radius 12; title 36.8 → 26px; tagline 13 → 8.4px.
  - Right margin note now rendered inside the panel head under CLOSE (Sonnet hid it).
  - OVERVIEW / WHAT WE DEFINE / FRAMEWORK type 5.6/4.9/4.4px; footer circle 31px + pill 30px.
- **REMAINING MISMATCHES:**
  - Face wireframe hero art + five framework icons are existing production PNGs (blocked offline) / Grok slot.
- **GROK DEPENDENCIES:** `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.IDENTITY`
- **RESPONSIVE NOTES:** Panel fits 390×693 with footer 00 below; no overflow.
- **PROOF:** `opus-proof/02_ORIGIN_IDNTY_EXPANDED/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 3. `03_ORIGIN_BLDR_EXPANDED`

- **AUTHORITY ID:** `03_ORIGIN_BLDR_EXPANDED` · route `/ (EXPAND BLDR)`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Same glass-panel geometry as IDENTITY; WHAT WE BUILD 4 columns at 4.9px with 01–04 heads.
- **REMAINING MISMATCHES:**
  - BLDR lattice hero art + framework icons are production PNGs / Grok.
  - Card label BLDR vs panel title BUILDER reproduced as drawn.
- **GROK DEPENDENCIES:** `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.BLDR`
- **RESPONSIVE NOTES:** No overflow.
- **PROOF:** `opus-proof/03_ORIGIN_BLDR_EXPANDED/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 4. `04_ORIGIN_EVOLVE_EXPANDED`

- **AUTHORITY ID:** `04_ORIGIN_EVOLVE_EXPANDED` · route `/ (EXPAND EVOLVE)`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Same panel geometry; CHOOSE YOUR PATH 3 columns; HOW IT WORKS link kept small under the footer.
- **REMAINING MISMATCHES:**
  - Three red-line path vignettes are Grok (current icons are simple live placeholders).
- **GROK DEPENDENCIES:** `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.EVOLVE`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM`
- **RESPONSIVE NOTES:** No overflow.
- **PROOF:** `opus-proof/04_ORIGIN_EVOLVE_EXPANDED/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 5. `01_IDNTY_DIAGNOSTIC_OVERVIEW`

- **AUTHORITY ID:** `01_IDNTY_DIAGNOSTIC_OVERVIEW` · route `/idnty/state`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - State cards: 2×2 (cards cut by the nav) → ONE row of four 86×188 cards like the authority; codes as light plain-zero numerals; CTA pills 18px with outlined/filled arrow discs.
  - Overview machine: orb + tilted orbit + capsule frame at (207,195).
  - IDENTITY INVESTMENT row at y≈610 (authority 600).
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
  - Card glyphs are compact live SVG (authority line art is denser).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** 4-up row holds at 360 (cards 80px) with no clipping.
- **PROOF:** `opus-proof/01_IDNTY_DIAGNOSTIC_OVERVIEW/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 6. `02_IDNTY_STATE_00_FOUNDATION`

- **AUTHORITY ID:** `02_IDNTY_STATE_00_FOUNDATION` · route `/idnty/starting-at-zero`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - Detail body: WHAT THIS MEANS 6.6px, facts row, CTA 28px pill.
- **REMAINING MISMATCHES:**
  - Authority discrepancy (documented, not propagated): this image is drawn in the 941-family scale, ≈8% larger than the FOUNDATION question screens (panel top 388 vs family 363). FOUNDER DECISION (OPUS-SURGICAL-CLEANUP1): family continuity outranks the single inconsistent dimension — State 00 detail is normalised to the FOUNDATION family; hero, machine, rail, panel top/head and nav are measured IDENTICAL to 01_FOUNDATION_PRIMARY_GOAL at 390×693, 360×740, 430×932 and 390×844 (opus-continuity.json).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits 390×693 completely (nav clear).
- **PROOF:** `opus-proof/02_IDNTY_STATE_00_FOUNDATION/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 7. `03_IDNTY_STATE_01_REFINE`

- **AUTHORITY ID:** `03_IDNTY_STATE_01_REFINE` · route `/idnty/some-pieces-exist`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - Tall-phone (≥780px) branch reproduces the 850 family: rail at y≈410, panel at ≈447, panel ×1.16, rail pitch ×1.3, nav ×1.22, machine centred ≈268.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok). Authority detail copy is sentence case; uppercase contract keeps it uppercase.
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** At 390×844 the panel + CTA sit above the nav exactly as the 850×1850 authority.
- **PROOF:** `opus-proof/03_IDNTY_STATE_01_REFINE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 8. `04_IDNTY_STATE_02_EVOLUTION`

- **AUTHORITY ID:** `04_IDNTY_STATE_02_EVOLUTION` · route `/idnty/ready-for-evolution`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - Waveform registered lower in the tall family (centre ≈268).
  - Head title READY FOR / EVOLUTION wraps at the authority width (≈100px column).
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Tall branch; no overflow.
- **PROOF:** `opus-proof/04_IDNTY_STATE_02_EVOLUTION/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 9. `05_IDNTY_STATE_03_BUILD_READY`

- **AUTHORITY ID:** `05_IDNTY_STATE_03_BUILD_READY` · route `/idnty/build-ready`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - Detail machine = star with concentric rings and crosshair beads (domain nodes appear only in the verification flow, as drawn).
  - "NO IDNTY PURCHASE REQUIRED" set as a two-line statement (8.6px) instead of a 3-line price.
- **REMAINING MISMATCHES:**
  - Honesty deviation kept: verification copy + BEGIN VERIFICATION (authority: "locked and verified … ENTER BLDR").
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Tall branch; no overflow.
- **PROOF:** `opus-proof/05_IDNTY_STATE_03_BUILD_READY/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 10. `01_FOUNDATION_PRIMARY_GOAL`

- **AUTHORITY ID:** `01_FOUNDATION_PRIMARY_GOAL` · route `/idnty/starting-at-zero/goal`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - Head third line = QUESTION 01 (OF 04 visually hidden for AT); Sonnet's second QUESTION 01 OF 04 + segment row removed (authority has none for FOUNDATION).
  - Question title 15.7 → 11.8px one line; tiles 58×84 → 61×51, 17px icons, 5.2px labels (two lines max).
  - Footer: BACK 68×24 · ✓ SAVED · CONTINUE 120×25 pinned right.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok). Orb material (glossy) approximated with SVG gradients.
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Whole working surface incl. CONTINUE above the nav at 390×693 (Sonnet: below the fold).
- **PROOF:** `opus-proof/01_FOUNDATION_PRIMARY_GOAL/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 11. `02_FOUNDATION_AUDIENCE`

- **AUTHORITY ID:** `02_FOUNDATION_AUDIENCE` · route `/idnty/starting-at-zero/audience`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Textarea: red 1.5px left rule, YOUR RESPONSE label, 7.3px text; on touch the field keeps a real 16px font-size (no iOS zoom) and is drawn at authority size via transform.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Field + footer above the nav at 390×693.
- **PROOF:** `opus-proof/02_FOUNDATION_AUDIENCE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 12. `03_FOUNDATION_TIMELINE`

- **AUTHORITY ID:** `03_FOUNDATION_TIMELINE` · route `/idnty/starting-at-zero/timeline`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Radio rows 18.5px pitch, 10px radios, 6.4px labels (authority 457→549).
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/03_FOUNDATION_TIMELINE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 13. `04_FOUNDATION_BUDGET`

- **AUTHORITY ID:** `04_FOUNDATION_BUDGET` · route `/idnty/starting-at-zero/budget`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Budget 3×2 cells 107×50, coin icons 17px.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/04_FOUNDATION_BUDGET/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 14. `05_FOUNDATION_REVIEW`

- **AUTHORITY ID:** `05_FOUNDATION_REVIEW` · route `/idnty/starting-at-zero/review`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Review rows 43px with 22px icons; TIMELINE | BUDGET pair with divider; review label muted grey (authority).
  - EDIT links kept (function) but quiet (5.2px grey) — authority shows none.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** SUBMIT reachable above the nav; scrolls 20px at 390×693.
- **PROOF:** `opus-proof/05_FOUNDATION_REVIEW/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 15. `01_REFINE_EXISTING_ASSETS`

- **AUTHORITY ID:** `01_REFINE_EXISTING_ASSETS` · route `/idnty/some-pieces-exist/assets`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - REFINE family rail at y306 / panel 340 (authority) — constant through detail → questions → review.
  - Meta row: REFINE IDENTITY · QUESTION 01 OF 03 · 3 segments (authority keeps this one for REFINE).
  - Partial machine: elongated hex lattice + offset beaded line at x162 (pieces not yet on one axis).
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok); lattice volume material approximated.
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits 390×693.
- **PROOF:** `opus-proof/01_REFINE_EXISTING_ASSETS/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 16. `02_REFINE_CONDITION`

- **AUTHORITY ID:** `02_REFINE_CONDITION` · route `/idnty/some-pieces-exist/cohesion-diagnostic`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Question set on one line (font shrinks with length: 10.9px).
  - Condition cards 108px tall, 36px icons, radio top-right.
- **REMAINING MISMATCHES:**
  - Card art (scattered cubes / stacked plates / missing cube) is denser in the authority — live icons stand in.
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/02_REFINE_CONDITION/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 17. `03_REFINE_GAPS`

- **AUTHORITY ID:** `03_REFINE_GAPS` · route `/idnty/some-pieces-exist/gaps`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Gap cells 40px; selected gaps are now CALLED OUT on the lattice (authority annotation layer).
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/03_REFINE_GAPS/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 18. `04_REFINE_REVIEW`

- **AUTHORITY ID:** `04_REFINE_REVIEW` · route `/idnty/some-pieces-exist/review`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - EXISTING | CURRENT CONDITION + GAPS split with dark divider; REVIEW ASSESSMENT in red (REFINE tone).
- **REMAINING MISMATCHES:**
  - Authority places a target glyph beside CURRENT CONDITION — omitted (decorative).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/04_REFINE_REVIEW/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 19. `01_EVOLUTION_AREAS`

- **AUTHORITY ID:** `01_EVOLUTION_AREAS` · route `/idnty/ready-for-evolution/pathways`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - EVOLUTION family rail at y340 / panel 373.
  - Meta row EVOLVE IDENTITY · QUESTION 01 (no total) · segments; no head glyph (authority).
  - Waveform: 5 nested ellipses + 10 lobes ±95 on the signal line.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/01_EVOLUTION_AREAS/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 20. `02_EVOLUTION_GOALS`

- **AUTHORITY ID:** `02_EVOLUTION_GOALS` · route `/idnty/ready-for-evolution/goals`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Textarea as Foundation audience.
- **REMAINING MISMATCHES:**
  - Authority highlights two red lobes on the waveform — not reproduced (decorative).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/02_EVOLUTION_GOALS/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 21. `03_EVOLUTION_TIMELINE`

- **AUTHORITY ID:** `03_EVOLUTION_TIMELINE` · route `/idnty/ready-for-evolution/timeline`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Timeline 2×3 rows 24px tall with icons and radios.
- **REMAINING MISMATCHES:**
  - —
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/03_EVOLUTION_TIMELINE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 22. `04_EVOLUTION_REVIEW`

- **AUTHORITY ID:** `04_EVOLUTION_REVIEW` · route `/idnty/ready-for-evolution/review`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Selected areas bracketed on the waveform (authority annotation layer).
- **REMAINING MISMATCHES:**
  - Row icons are generic line icons (authority uses mini machine glyphs).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/04_EVOLUTION_REVIEW/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 23. `01_BUILD_READY_VERIFICATION`

- **AUTHORITY ID:** `01_BUILD_READY_VERIFICATION` · route `/idnty/build-ready/verification`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Bottom nav 64 → 60px, 19px icons, 5.9px labels; body margin 8px removed (viewport frame).
  - BUILD READY rail at y321 / panel 352; head: IDENTITY AUTHORITY VERIFICATION, no counter row (authority).
  - Star machine with five identity-domain nodes; node fill = what the PERSON supplied (provisional), never verification.
  - Domain rows 25px: icon · name · mark · status · node glyph · chevron.
- **REMAINING MISMATCHES:**
  - Atrium plate (Grok).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits 390×693 incl. footer.
- **PROOF:** `opus-proof/01_BUILD_READY_VERIFICATION/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 24. `02_BUILD_READY_EVIDENCE`

- **AUTHORITY ID:** `02_BUILD_READY_EVIDENCE` · route `/idnty/build-ready/evidence`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - Evidence rows 29px, quiet chips (4.3px).
  - OPUS-SURGICAL-CLEANUP1 (evidence step only): body top 9→5, question→rows gap 9→4, row 31→29 (padding 2.5→2, status gap 2.5→2), name column fitted to EXPERIENCE (58→52) + icon/chevron columns 22/12→20/10 + chip side padding 4.5→3.5 and tracking .04→.02em so 3 chips + "+N" never wrap; actions top padding 13→6. Type sizes unchanged. Tall phones keep the width-scaled row unit so chips never wrap.
- **REMAINING MISMATCHES:**
  - None structural. CONTINUE pill y607→632 at 390×693 (authority 606→628); rows from y454 at a 29px pitch (authority 452 / 30).
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** CONTINUE fully above the nav at 390×693 (632 ≤ 633), 360×740 (603/683), 430×932 (803/868), 390×844 (748/784); chips on one line at every width.
- **PROOF:** `opus-proof/02_BUILD_READY_EVIDENCE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 25. `03_BUILD_READY_AUTHORITY_CHECK`

- **AUTHORITY ID:** `03_BUILD_READY_AUTHORITY_CHECK` · route `/idnty/build-ready/authority-check`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - AUTHORITY CHECK 03 line; statuses PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED + provisional disclaimer.
- **REMAINING MISMATCHES:**
  - Honesty deviation kept (authority shows AUTHORITY ESTABLISHED + "SITE 00 HAS REVIEWED").
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Disclaimer adds ≈18px; scrolls clear of the nav.
- **PROOF:** `opus-proof/03_BUILD_READY_AUTHORITY_CHECK/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 26. `04_BUILD_READY_REVIEW_VERIFICATION`

- **AUTHORITY ID:** `04_BUILD_READY_REVIEW_VERIFICATION` · route `/idnty/build-ready/review`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PASS
- **MAJOR CHANGES:**
  - Shared unit system (`--u`/`--uv`, authority px) replaced rem sizes ≈1.3× too large; Martian Mono width set back to the host semi-condensed axis (Sonnet forced `normal`, +8% glyph width).
  - Hero: title 29.6px → 22px, question 12.8 → 9px, body 8 → 6px, x 22 → 30; crumb/rule/side note re-spaced to authority y.
  - Machine re-drawn in authority page coordinates (viewBox 0 28 390 300) behind the hero, not stacked under it.
  - 00–03 rail: 330px/28px nodes → 228px/16px nodes (active 20px + halo), centred per family height.
  - Panel: 346px wide @ y≈428 → 354px @ authority y; head 55px with plain-zero SVG numerals (Martian Mono only ships a slashed zero).
  - 5 domain tiles 62×86; EVIDENCE STATUS with the star glyph (authority) instead of a node glyph; REVIEW VERIFICATION in strong black.
- **REMAINING MISMATCHES:**
  - —
- **GROK DEPENDENCIES:** `ENV.IDNTY.ATRIUM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/04_BUILD_READY_REVIEW_VERIFICATION/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 27. `01_BLDR_COMMAND_CENTER`

- **AUTHORITY ID:** `01_BLDR_COMMAND_CENTER` · route `/bldr/state`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Page was 1337px tall (machine 256px stacked under the hero, 2×2 cards 270px tall) → fits 390×693 like the authority.
  - Header carries the existing primary links (EXPLORE · BUILD · EVOLVE · ABOUT) at 4.6px.
  - Tower re-drawn in page coordinates x130→320, y50→310 with the four path panels hugging it.
  - ONE row of four 87×205 cards; titles fitted to one line (EXTENSIONS 11px); CTA pills 16px.
  - NOT SURE bar: glyph · copy · divider · outlined CTA pill (authority).
- **REMAINING MISMATCHES:**
  - Tower glass/material and card vignettes are Grok — they dominate the authority composition.
- **GROK DEPENDENCIES:** `ENV.BLDR.COMMAND_CENTER`, `MACHINE.BLDR.TOWER`, `CARD.BLDR.PATH.SITE`, `CARD.BLDR.PATH.WORLD`, `CARD.BLDR.PATH.SYSTEMS`, `CARD.BLDR.PATH.EXTENSIONS`
- **RESPONSIVE NOTES:** 4-up cards hold at 360 (titles shrink-to-fit).
- **PROOF:** `opus-proof/01_BLDR_COMMAND_CENTER/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 28. `02_BLDR_OVERVIEW`

- **AUTHORITY ID:** `02_BLDR_OVERVIEW` · route `/bldr/state?path=overview`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Hero (SITE 00 / BUILDER / list with red node) at authority scale; panel x15→375 @ y≈250.
  - Pager: BUILDER PATH 1/4 + dots with the active as a red diamond; section index right column.
  - Title fitted (OVERVIEW 35px), body 5.9px, framework 5 columns with 50px glyphs.
- **REMAINING MISMATCHES:**
  - The authority shows path thumbnails inside THE BUILDER PATH columns — Grok (not slotted yet; see Grok handoff).
- **GROK DEPENDENCIES:** `ENV.BLDR.PATH.OVERVIEW`, `ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW`
- **RESPONSIVE NOTES:** Scrolls ≈30px at 390×693; no overflow.
- **PROOF:** `opus-proof/02_BLDR_OVERVIEW/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 29. `03_BLDR_SITE`

- **AUTHORITY ID:** `03_BLDR_SITE` · route `/bldr/state?path=site`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - As OVERVIEW; CLOSE + X at the top right (authority).
- **REMAINING MISMATCHES:**
  - Panel art + plate are Grok.
- **GROK DEPENDENCIES:** `ENV.BLDR.PATH.SITE`, `ILLUSTRATION.BLDR.PATH.PANEL.SITE`
- **RESPONSIVE NOTES:** Fits 390×693.
- **PROOF:** `opus-proof/03_BLDR_SITE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 30. `04_BLDR_WORLD`

- **AUTHORITY ID:** `04_BLDR_WORLD` · route `/bldr/state?path=world`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - As OVERVIEW.
- **REMAINING MISMATCHES:**
  - Panel art + plate are Grok.
- **GROK DEPENDENCIES:** `ENV.BLDR.PATH.WORLD`, `ILLUSTRATION.BLDR.PATH.PANEL.WORLD`
- **RESPONSIVE NOTES:** Scrolls ≈35px.
- **PROOF:** `opus-proof/04_BLDR_WORLD/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 31. `05_BLDR_SYSTEMS`

- **AUTHORITY ID:** `05_BLDR_SYSTEMS` · route `/bldr/state?path=systems`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - As OVERVIEW. SYSTEMS still maps to the ENTERPRISE build class (unchanged).
- **REMAINING MISMATCHES:**
  - Panel art + plate are Grok.
- **GROK DEPENDENCIES:** `ENV.BLDR.PATH.SYSTEMS`, `ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/05_BLDR_SYSTEMS/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 32. `06_BLDR_EXTENSIONS`

- **AUTHORITY ID:** `06_BLDR_EXTENSIONS` · route `/bldr/state?path=extensions`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Title fitted so EXTENSIONS ends before the art (31px).
- **REMAINING MISMATCHES:**
  - Panel art + plate are Grok. EXTENSIONS product definition BLOCKED_FOR_FOUNDER_DECISION (visual converged).
- **GROK DEPENDENCIES:** `ENV.BLDR.PATH.EXTENSIONS`, `ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS`
- **RESPONSIVE NOTES:** Fits + discovery note.
- **PROOF:** `opus-proof/06_BLDR_EXTENSIONS/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 33. `01_EVOLVE_INTERVENTION_CENTER`

- **AUTHORITY ID:** `01_EVOLVE_INTERVENTION_CENTER` · route `/evolve/state`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Page 1010px → fits 390×693; layer labels 01/02/03 run down the left of the property (x≈127) instead of inside the machine.
  - Three 115×205 cards in one row; NOT SURE bar as BLDR.
- **REMAINING MISMATCHES:**
  - Property tower material and card vignettes are Grok. Contextual EVOLVE nav bay kept (authority highlights IDNTY).
- **GROK DEPENDENCIES:** `ENV.EVOLVE.INTERVENTION_CENTER`, `MACHINE.EVOLVE.PROPERTY_TOWER`, `CARD.EVOLVE.PATH.REFINE`, `CARD.EVOLVE.PATH.INSTALL`, `CARD.EVOLVE.PATH.TRANSFORM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/01_EVOLVE_INTERVENTION_CENTER/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 34. `02_EVOLVE_REFINE`

- **AUTHORITY ID:** `02_EVOLVE_REFINE` · route `/evolve/state?path=refine`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Panel at y≈318 (authority 318); 03.01 code; title 33px; triple columns 5.2px; facts row; SOLID red CHOOSE REFINE pill (authority) vs BLDR light pill.
- **REMAINING MISMATCHES:**
  - Plate + panel art are Grok.
- **GROK DEPENDENCIES:** `ENV.EVOLVE.PATH.REFINE`, `ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE`
- **RESPONSIVE NOTES:** Fits 390×693.
- **PROOF:** `opus-proof/02_EVOLVE_REFINE/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 35. `03_EVOLVE_INSTALL`

- **AUTHORITY ID:** `03_EVOLVE_INSTALL` · route `/evolve/state?path=install`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - As REFINE.
- **REMAINING MISMATCHES:**
  - Plate + panel art are Grok.
- **GROK DEPENDENCIES:** `ENV.EVOLVE.PATH.INSTALL`, `ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/03_EVOLVE_INSTALL/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 36. `04_EVOLVE_TRANSFORM`

- **AUTHORITY ID:** `04_EVOLVE_TRANSFORM` · route `/evolve/state?path=transform`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - As REFINE.
- **REMAINING MISMATCHES:**
  - Plate + panel art are Grok.
- **GROK DEPENDENCIES:** `ENV.EVOLVE.PATH.TRANSFORM`, `ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM`
- **RESPONSIVE NOTES:** Fits.
- **PROOF:** `opus-proof/04_EVOLVE_TRANSFORM/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## 37. `01_LOCATIONS_MAIN`

- **AUTHORITY ID:** `01_LOCATIONS_MAIN` · route `/origin/locations`
- **BEFORE STATUS:** PARTIAL (Sonnet)
- **AFTER STATUS:** PARTIAL — GROK DEPENDENCY ONLY
- **MAJOR CHANGES:**
  - Header y46; LOCATIONS 36.8 → 30.5px; rows 316×84 → 296×63 at x57, 71px pitch; spine x40 with 4.5px nodes; arrow discs 18px.
  - Ghost 00 as plain-zero SVG + CONTINUE EXPLORING.
- **REMAINING MISMATCHES:**
  - Row thumbnails + arch plate are Grok. YOUR SPACE section (signed-in destinations) kept below the seven public rows.
- **GROK DEPENDENCIES:** `ENV.LOCATIONS.ARCH`, `CARD.LOCATIONS.BLDR`, `CARD.LOCATIONS.EVOLVE`, `CARD.LOCATIONS.SITES`, `CARD.LOCATIONS.SERVICES`, `CARD.LOCATIONS.SYSTEM`, `CARD.LOCATIONS.ABOUT`, `CARD.LOCATIONS.JOURNAL`
- **RESPONSIVE NOTES:** Public rows end at y≈611 (authority 622).
- **PROOF:** `opus-proof/01_LOCATIONS_MAIN/` (authority.jpg · before.png · after.png · comparison.jpg · comparison.md)

## OPUS-SURGICAL-CLEANUP1 — closing the two Opus-owned partials

Scope: only `02_IDNTY_STATE_00_FOUNDATION` and `02_BUILD_READY_EVIDENCE`. Grok-dependent screens untouched; the other 35 authorities were re-captured and are **pixel-identical** (<0.05% px) to the OPUS-CONVERGENCE1 after-captures.

### State 00 detail — PARTIAL (Opus) → PASS

- **Before:** the 941-family authority is ≈8% larger than the FOUNDATION question screens (panel top 388 vs 363). The live page already used one geometry per state; the difference was unresolved.
- **Founder decision (locked):** family continuity outranks a single inconsistent authority dimension. The discrepancy is documented here and in the forensic map, not propagated.
- **Correction:** none to geometry. The OPUS-CONVERGENCE1 registration is the normalised one, and it is now locked by contract tests:
  - No CSS rule may vary hero / stage / rail by panel mode.
  - Hero + machine markup must be identical between detail and Question 01.
- **Proof:** `scripts/site00-public-redesign-continuity.mjs` → `opus-continuity.json`:
  - State 00 detail vs PRIMARY GOAL: header, hero title, side note, machine, rail, active node, panel top, panel head, state numeral and nav are **identical** at 390×693, 360×740, 430×932 and 390×844.
  - Visual strips: `opus-proof/02_IDNTY_STATE_00_FOUNDATION/continuity-foundation*.jpg`.
- **After:** PASS.

### Build Ready evidence — PARTIAL (Opus) → PASS

- **Before:**
  - Evidence rows ran 31px (authority 30), and EXPERIENCE's chips wrapped to a second line (+13px).
  - The question body carried 9px padding / 9px gap (authority ≈5 / 5).
  - The CONTINUE pill bottom was at y669 at 390×693, ≈36–41px under the nav.
- **Correction (evidence step only, via `data-body-key='question:evidence'` / `.s00pr-vrow--evidence`; type sizes unchanged):**
  - Body top 9→5; question→rows 9→4.
  - Rows 29px.
  - Name column fitted to EXPERIENCE; icon/chevron columns −2.
  - Chip side padding 4.5→3.5 and tracking .04→.02em, so three source chips + "+N" stay on one line.
  - Actions top padding 13→6.
  - Tall phones keep the width-scaled row unit.
- **Result:**
  - CONTINUE pill y607→632 at 390×693 (authority 606→628); nav at 633.
  - 360×740: 603 vs nav 683. 430×932: 803 vs 868. 390×844: 748 vs 784.
  - All five domains, statuses, chips, "+N" expanders and honest provisional wording are intact (contract tests).
- **Panel-family continuity:**
  - Evidence vs VERIFICATION: identical shared landmarks at all four sizes.
  - Vs AUTHORITY CHECK / REVIEW: identical except the panel head, which carries one extra line (AUTHORITY CHECK 03 / REVIEW VERIFICATION) exactly as those authorities draw it. Head +3–6px; numeral re-centres 2–3px.
  - Strip: `opus-proof/02_BUILD_READY_EVIDENCE/continuity-build-ready.jpg`.
- **After:** PASS.

### Final distribution (37)

**22 PASS · 15 PARTIAL — GROK DEPENDENCY ONLY · 0 PARTIAL — OPUS · 0 FAIL.**
