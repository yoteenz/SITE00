# JURNL center-stage QA report: nav-aligned composition (refinement 3)

**Sprint:** P0.JURNL.MOBILE-COMPOSITION.CENTER-STAGE-NAV-ALIGNED-REFINEMENT3
**Agent:** OPUS
**Base:** `main` at `9b8137c4` (refinement 2 merged)

**Mode.** This sprint changed visual composition only:
- Product logic, data model, routes, nav labels and interaction contracts are unchanged.
- No paid generation was used.

All numbers below come from the live runtime. The before figures are taken from a git worktree of `main` at `9b8137c4` running on its own Vite server.

## 1. The rule

JURNL mobile now has two explicit composition modes. The contract is `runtime/layout/compositionMode.ts`, and each screen declares its mode as `data-jrn-composition` on the screen element.

| Mode | When | What it allows |
|---|---|---|
| **EDGE_LED** | No product nav: F01 entry and welcome, F02 setup and onboarding openers | Left-anchored editorial copy, asymmetry, a side of the screen given to the photograph |
| **CENTER_STAGE** | Every screen carrying the 5-item product nav: roots, child screens, ACCOUNT | The functional field is centred on the `+` axis and shares the nav footprint; the background frames it from the perimeter |

How the mode is chosen:
- If a screen renders the product nav, it is CENTER_STAGE.
- Leaving CENTER_STAGE requires a route-authority override in `COMPOSITION_OVERRIDES`, with a written reason.
- There are none.
- The rule is enforced by `tests/jurnlCenterStage.test.tsx` (59 tests), not by route-specific CSS.

## 2. Inventory (393×852)

| | Count |
|---|---|
| Material routes audited | 54 |
| Nav-bearing routes | **28**, all CENTER_STAGE |
| EDGE_LED | **25** (14 F01, 11 F02) |
| OTHER_INTENTIONAL | 1: the parents review board, a SITE 00 inspection surface with no nav |
| OVERLAY | 30 sheets, drawers and modals, which keep their own overlay contract |
| FOCUSED_TASK | 0: no child page drops the nav today |
| **Unclassified** | **0** |

The same classification holds at 360×780, 430×932, 834×1194 and 1440×900.

## 3. The centre-stage field

**Width.** The field width is `--jrn-stage-w`:
- **Phones:** equal to the nav width, so 340px at 393 and 328px at 360.
- **Tablet:** `min(560px, 100% − 112px)`.
- **Desktop:** 560px.

On tablet and desktop the field is intentionally wider than the nav but on the same axis, rather than forcing phone geometry there.

**Alignment.** Text inside the field keeps its own alignment: the field is centred, not every element.

**Centring.** The field's centre sits on the `+` axis with a 0px offset at all five widths.

**Left-column drift.** Drift means the area-weighted content centroid is more than 10% of the nav width off the axis, or the field centre is more than 6px off it.

| Width | Before | After |
|---|---|---|
| 393 | 3 (F03 −77px, F04 −54px, ACCOUNT −70px) | **0** |
| 360 | 3 | **0** |
| 430 | 16 | **0** |
| 834 | 19 | **0** |
| 1440 | 23 (frame anchored 409px left of the axis) | **0** |

**Bottom clearance** is never negative. The minimum is 52px at 393. ACCOUNT used to sit 2px under the nav; it is now on the paginated frame.

## 4. Families

| Family | Centre-stage composition | Status |
|---|---|---|
| F01 WELCOME | Unchanged, left-led editorial (the founder's example) | **EDGE_LED_PASS** |
| F03 TODAY | Operating board: TODAY and WHAT IS TRUE. on one side, SAFE TO SPEND and the figure on the other, SEE WHY and the attention note beneath. COMING and MOVED follow as full-field rows, then MORE. It fits one screen; it used to need two in a 230px left rail. | **PASS** |
| F05 MONEY | The cabinet plaque sits on the axis, with HELD and OWED as two zones; shelves span the field | **PASS** |
| F09 SAFE TO SPEND | The arched threshold spans the field; the figure is the centre of the decision space | **PASS** |
| F10 PURCHASES | Centred intro; the plinth widens to 88% of the field with DECIDE ON THIS attached; the orbit spans the field | **PASS** |
| F11 TRIPS | The route runs down the axis: FROM HERE left of the line, FUNDING right of it, DESTINATION on the line | **PASS** |
| F13 PAYDOWN | Treads descend down and to the right across the whole field on a clean diagonal; each carries its weight as a bar (its share of the largest balance) | **PASS** |
| F15 AHEAD | The TODAY / NEXT 30 DAYS / LATER band and the dated windows span the field | **PASS** |
| F16 RECORDS | The label holder, find and add controls, and folders span the field | **PASS** |
| F04 · F06 · F07 · F08 · F12 · F14 (secondary audit) | Intros and bodies span the field. F04's search, FILTER and ledger were at 72% width on the left; their 330px intro caps are lifted. | **PASS** |
| Child screens and ACCOUNT | Facts read as a two-column ledger across the field. The MONEY › PLACES text collision is fixed, and ACCOUNT moved onto the frame. | **PASS** |

**Distinctness.**
- **Blur test: PASS.** Every target keeps its own silhouette.
- **Background removal test: PASS.** No pair of targets is identical. The closest pair is F05/F15: occupancy 0.89, type stack 0.58, controls 0.20.
- **No generic cardification.** No screen became a single white rectangle.

## 5. Background: design at the perimeter, function in the centre

There is no new art. All of it uses existing authority plates and CSS.

**1. Focal anchor.** On phones, `object-fit: cover` crops about 86px of a 9:16 plate. Nearly every plate was composed for a left column, so its subject sits to the right. Anchoring the crop **left** (`0% 50%`) pushes the subject to the right edge; `100%` would pull it 43px inward, which I first did by mistake and caught in QA. F06 and F13 keep `50%` because their subject is on the centre line.

**2. Crop zoom from the left.** F05, F11, F14 and F15 also zoom slightly, anchored left, so subjects that still cross the field move further out.

**3. Calm layer.** A soft-focus, slightly tinted copy of the same plate is masked to the safe-zone rectangle. The mask is two feathered gradients intersected, so the corners, outer frames and the nav band keep full detail. Strength follows the plate class:
- CENTER_SAFE: 3px blur, 0.08 tint.
- INCOMPATIBLE: 9px blur, 0.22 tint.

**4. Paper chips.** The chrome wordmark and F04's FILTER sit on the same paper as the controls beside them, so no label stands on beams, foliage or the curtain.

**Salience in the safe-zone core**, measured with the UI hidden:

| | F03 | F05 | F06 | F09 | F10 | F11 | F13 | F15 | F16 |
|---|---|---|---|---|---|---|---|---|---|
| before | 0.124 | 0.251 | 0.270 | 0.139 | 0.184 | **0.427** | **0.429** | 0.220 | 0.107 |
| after | 0.056 | 0.057 | 0.070 | 0.058 | 0.052 | 0.057 | 0.073 | 0.041 | 0.031 |

All 14 nav-bearing family plates pass the safe-zone test:
- core mean ≤ 0.12;
- hot share ≤ 0.05;
- the core is calmer than the perimeter.

The highest after-values are F08 (core 0.083, hot 2.9%) and F13 (0.073).

**Asset classification:**
- CENTER_SAFE (4): F03, F04, F09, F12.
- REPOSITIONABLE (5): F07, F08, F10, F14, F16.
- CROPPABLE (1): F15.
- NEEDS_DERIVED_VARIANT (2): F05, F11.
- INCOMPATIBLE (2): F06, F13.

**BACKGROUND_RECOMPOSITION_REQUIRED** for a later authority pass: F05, F06, F11, F13, F15.

For F06 and F13 the subject is softened in place, not moved. Their perimeter composition is therefore **PARTIAL** until a centre-safe variant exists.

## 6. QA (live)

| Check | Result |
|---|---|
| Composition contract tests (`tests/jurnlCenterStage.test.tsx`) | **59 / 59** |
| JURNL suites | 444 / 448. The 4 failures are pre-existing and fail identically on `main` `9b8137c4`: `jurnlF02Runtime` ×2, the F01 paywall check, and the production debug-surface check. |
| Typecheck | clean |
| Pagination and continuation (`mobile-pagination-qa.mjs`) | **11 / 11**: all fit, overflow, 3+ screens, oversize, error expansion, data change, keyboard, BACK and NEXT, nav centring, safe area, tablet and desktop |
| Frame geometry (`mobile-composition-qa.mjs`) | 84 / 84 rows clean: nav and `+` offset 0, nothing under the nav, no clipped panels, no body scroll |
| SITE 00 DESIGN → VIEWPORT preview vs live | **14 / 14** identical, including NEXT and BACK inside the iframe |
| Text contrast against the rendered backdrop (`center-stage-contrast-qa.mjs`) | **0 failures** across 498 text elements; minimum 5.01:1. The 3 failures before this sprint (F03 4.48, F06 1.85, F13 1.17) are resolved. Background collisions with text: **0**. Four "busy backdrop" hits are UI material, not plate: the FILTER icon and F06's ruled ledger lines. |
| Interactive-text containment (`interactive-text-qa.mjs`, 3 viewports) | **1098 / 1098** |
| Composer full-product E2E gate (`e2e/jurnl`) | **82 / 82** |
| Design STAGE overlay | Works in DESIGN → VIEWPORT (safe zone, nav footprint, `+` axis, perimeter); the product runtime never renders it |
| Paid generations / credits | 0 / 0 |

**Accessibility.** Touch targets, DOM reading order, focus order and focus rings are unchanged. F03's reading order is now TODAY → SAFE TO SPEND → figure → hint → SEE WHY → attention.

## 7. Files

**New**
- `runtime/layout/compositionMode.ts`
- `runtime/jurnl-center-stage.css`
- `tests/jurnlCenterStage.test.tsx`
- `scripts/jurnl/center-stage-qa.mjs`
- `scripts/jurnl/center-stage-contrast-qa.mjs`
- `scripts/jurnl/center-stage-overlay-capture.mjs`

**Changed**
- `JurnlScreen.tsx`: composition mode and calm layer.
- `FamilyFrame.tsx`: `productNav`, plus the `SAFE ZONE` marker.
- `ProductNav.tsx`: the `NAV FOOTPRINT` marker.
- `HomeScreens.tsx`: F03 board, and F04 `productNav`.
- `SettingsScreens.tsx`: ACCOUNT on the frame.
- `PaydownScreens.tsx`: `--weight` and `--last` presentation variables.
- `ParentScreens.tsx`: `productNav`.
- `JurnlRuntimeRoot.tsx`: stylesheet import.
- `DesignChamber.tsx` and `site00-production-project-family.css`: the STAGE toggle.
- `background-blur-test.mjs`: also hides the calm layer.

**Screenshots and boards:** `screenshots/` (see `JURNL_CENTER_STAGE_SCREENSHOT_MANIFEST.json`).
