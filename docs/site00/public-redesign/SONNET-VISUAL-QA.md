# SONNET — VISUAL QA

Browser proof outranks test claims. Every one of the 37 active authorities was opened in Chromium at its authority framing (390 CSS px wide; 390×693 for 941×1672 and 1080×1920 authorities, 390×849 for 850×1850), rendered through the real route, and compared side-by-side with its authority. Evidence: `sonnet-proof/<authority-id>/{authority.jpg, render.jpg, render-full.jpg, metrics.json, comparison-notes.md}` (reproduce with `scripts/site00-public-redesign-proof.mjs`).

**Rubric.** PASS = matches the authority within the Sonnet-pass tolerance on structure, order, hierarchy, type family, uppercase, shell *and* the visible art. PARTIAL = structure/order/function correct, with listed visual mismatches. FAIL = a structural element, order or function is missing/wrong.

## Result: 0 PASS · 37 PARTIAL · 0 FAIL

**No screen is graded PASS.** Every screen is structurally complete, but all of them still differ from the authority in photographic plates, bespoke art, material/lighting and pixel-level spacing — which this pass explicitly does not chase. This is **not** a pixel-perfect claim.

| # | Authority | Route | Visual | Structure |
|---|---|---|---|---|
| 1 | `01_ORIGIN_MAIN` | `/` | PARTIAL | STRUCTURE COMPLETE |
| 2 | `02_ORIGIN_IDNTY_EXPANDED` | `/` | PARTIAL | STRUCTURE COMPLETE |
| 3 | `03_ORIGIN_BLDR_EXPANDED` | `/` | PARTIAL | STRUCTURE COMPLETE |
| 4 | `04_ORIGIN_EVOLVE_EXPANDED` | `/` | PARTIAL | STRUCTURE COMPLETE |
| 5 | `01_IDNTY_DIAGNOSTIC_OVERVIEW` | `/idnty/state` | PARTIAL | STRUCTURE COMPLETE |
| 6 | `02_IDNTY_STATE_00_FOUNDATION` | `/idnty/starting-at-zero` | PARTIAL | STRUCTURE COMPLETE |
| 7 | `03_IDNTY_STATE_01_REFINE` | `/idnty/some-pieces-exist` | PARTIAL | STRUCTURE COMPLETE |
| 8 | `04_IDNTY_STATE_02_EVOLUTION` | `/idnty/ready-for-evolution` | PARTIAL | STRUCTURE COMPLETE |
| 9 | `05_IDNTY_STATE_03_BUILD_READY` | `/idnty/build-ready` | PARTIAL | STRUCTURE COMPLETE · HONESTY DEVIATION |
| 10 | `01_FOUNDATION_PRIMARY_GOAL` | `/idnty/starting-at-zero/goal` | PARTIAL | STRUCTURE COMPLETE |
| 11 | `02_FOUNDATION_AUDIENCE` | `/idnty/starting-at-zero/audience` | PARTIAL | STRUCTURE COMPLETE |
| 12 | `03_FOUNDATION_TIMELINE` | `/idnty/starting-at-zero/timeline` | PARTIAL | STRUCTURE COMPLETE |
| 13 | `04_FOUNDATION_BUDGET` | `/idnty/starting-at-zero/budget` | PARTIAL | STRUCTURE COMPLETE |
| 14 | `05_FOUNDATION_REVIEW` | `/idnty/starting-at-zero/review` | PARTIAL | STRUCTURE COMPLETE |
| 15 | `01_REFINE_EXISTING_ASSETS` | `/idnty/some-pieces-exist/assets` | PARTIAL | STRUCTURE COMPLETE |
| 16 | `02_REFINE_CONDITION` | `/idnty/some-pieces-exist/cohesion-diagnostic` | PARTIAL | STRUCTURE COMPLETE |
| 17 | `03_REFINE_GAPS` | `/idnty/some-pieces-exist/gaps` | PARTIAL | STRUCTURE COMPLETE |
| 18 | `04_REFINE_REVIEW` | `/idnty/some-pieces-exist/review` | PARTIAL | STRUCTURE COMPLETE |
| 19 | `01_EVOLUTION_AREAS` | `/idnty/ready-for-evolution/pathways` | PARTIAL | STRUCTURE COMPLETE |
| 20 | `02_EVOLUTION_GOALS` | `/idnty/ready-for-evolution/goals` | PARTIAL | STRUCTURE COMPLETE |
| 21 | `03_EVOLUTION_TIMELINE` | `/idnty/ready-for-evolution/timeline` | PARTIAL | STRUCTURE COMPLETE |
| 22 | `04_EVOLUTION_REVIEW` | `/idnty/ready-for-evolution/review` | PARTIAL | STRUCTURE COMPLETE |
| 23 | `01_BUILD_READY_VERIFICATION` | `/idnty/build-ready/verification` | PARTIAL | STRUCTURE COMPLETE · HONESTY DEVIATION |
| 24 | `02_BUILD_READY_EVIDENCE` | `/idnty/build-ready/evidence` | PARTIAL | STRUCTURE COMPLETE · HONESTY DEVIATION |
| 25 | `03_BUILD_READY_AUTHORITY_CHECK` | `/idnty/build-ready/authority-check` | PARTIAL | STRUCTURE COMPLETE · HONESTY DEVIATION |
| 26 | `04_BUILD_READY_REVIEW_VERIFICATION` | `/idnty/build-ready/review` | PARTIAL | STRUCTURE COMPLETE · HONESTY DEVIATION |
| 27 | `01_BLDR_COMMAND_CENTER` | `/bldr/state` | PARTIAL | STRUCTURE COMPLETE |
| 28 | `02_BLDR_OVERVIEW` | `/bldr/state?path=overview` | PARTIAL | STRUCTURE COMPLETE |
| 29 | `03_BLDR_SITE` | `/bldr/state?path=site` | PARTIAL | STRUCTURE COMPLETE |
| 30 | `04_BLDR_WORLD` | `/bldr/state?path=world` | PARTIAL | STRUCTURE COMPLETE |
| 31 | `05_BLDR_SYSTEMS` | `/bldr/state?path=systems` | PARTIAL | STRUCTURE COMPLETE |
| 32 | `06_BLDR_EXTENSIONS` | `/bldr/state?path=extensions` | PARTIAL | STRUCTURE COMPLETE |
| 33 | `01_EVOLVE_INTERVENTION_CENTER` | `/evolve/state` | PARTIAL | STRUCTURE COMPLETE |
| 34 | `02_EVOLVE_REFINE` | `/evolve/state?path=refine` | PARTIAL | STRUCTURE COMPLETE |
| 35 | `03_EVOLVE_INSTALL` | `/evolve/state?path=install` | PARTIAL | STRUCTURE COMPLETE |
| 36 | `04_EVOLVE_TRANSFORM` | `/evolve/state?path=transform` | PARTIAL | STRUCTURE COMPLETE |
| 37 | `01_LOCATIONS_MAIN` | `/origin/locations` | PARTIAL | STRUCTURE COMPLETE |

## Evidence caveats (read before trusting a render)

- **Remote images are blocked in the proof sandbox.** The Origin landmark plate, Origin panel hero art and Origin framework icons are existing production PNGs on Supabase storage; they render blank offline. The Origin screens therefore could not be visually verified against the landmark — only their layout was.
- **The intake API is mocked** in the proof/flow scripts (route interception) so autosave/submit can run against the real client code. A mocked server proves client behavior, not production persistence.
- **The Mobile/Desktop preview toggle** (existing founder control, `.site00-origin-layout-switch`) overlaps the header on Origin-family routes; it is hidden in proof captures only.
- The authority images are 9:16 mock frames; real phones are taller (390×844). The panel footer is below the fold at 390×693 and visible at 390×844.

## Per-authority mismatches

### 1. `01_ORIGIN_MAIN` — PARTIAL

Route `/` · component `PublicOriginMobile`

- Landmark plate not visible in the sandbox proof: the approved CLEAN plate is a remote Supabase image blocked offline, so the render shows the gradient fallback. Unverified until rendered on a connected build.
- Header nav is larger/bolder than the authority; CHARACTERS / WORLDS / LIBRARY intentionally omitted (no routes; canonical Origin = IDNTY / BLDR / EVOLVE); EVOLVE link added; SEARCH omitted.
- Collapsed cards ~168px tall vs ~139px; thumbnails are placeholders (CARD.ORIGIN.*).
- Hero wordmark uses a Georgia/Cormorant fallback; authority serif not matched.
- Footer TERMS / PRIVACY are labels (no destination), CONTACT → /support.

**Structural questions**
- Should the preview Mobile/Desktop toggle (existing founder control) stay visible over the Origin header? It is hidden in proof captures only.

**Functional notes**
- Card tap expands; swipe-up/SWIPE UP TO ENTER → /origin/locations transition preserved; ENTER SITE 00 (/enter) link no longer on the mobile Origin (authority has none).

### 2. `02_ORIGIN_IDNTY_EXPANDED` — PARTIAL

Route `/` · component `PublicOriginExpandedPanel`

- Hero face wireframe and framework icons are existing production PNGs (blocked offline) → blank boxes in proof; verify on a connected build.
- Panel top starts ~40px lower; authority right-hand vertical side note ("CLARITY CREATES EVERYTHING THAT FOLLOWS.") is not rendered on mobile.
- Glass panel blur/tint approximated; plate behind it is the gradient fallback.

**Functional notes**
- CLOSE / BACK collapse; BEGIN IDENTITY → /idnty/state.

### 3. `03_ORIGIN_BLDR_EXPANDED` — PARTIAL

Route `/` · component `PublicOriginExpandedPanel`

- Same panel mismatches as IDNTY; WHAT WE BUILD shows 4 columns from the authority (SITE/WORLD/SYSTEMS/EXTENSIONS) but current build classes are SITE/WORLD/ENTERPRISE/NOT SURE.
- Framework icons are existing BLDR PNGs (blocked offline).

**Structural questions**
- Panel title reads BUILDER per authority; card/CTA still say BLDR. Confirm intended naming.

**Functional notes**
- BEGIN BLDR → /bldr/state (command center).

### 4. `04_ORIGIN_EVOLVE_EXPANDED` — PARTIAL

Route `/` · component `PublicOriginExpandedPanel`

- Three path illustrations are the existing Evolve placeholder icons (simple geometric), not the authority's red-line vignettes (ILLUSTRATION.ORIGIN.EVOLVE_PATH.* slots).
- Diamond-ended OVERVIEW rule implemented; hero lattice art blocked offline.

**Functional notes**
- START EVOLVE → /evolve/state; HOW IT WORKS → /evolve (existing secondary action kept as a small link).

### 5. `01_IDNTY_DIAGNOSTIC_OVERVIEW` — PARTIAL

Route `/idnty/state` · component `IdentityDiagnosticOverview`

- State cards render 2×2 below 560px (authority: 4-up row, which is unreadable at 390px); 4-up from 560px.
- Card glyphs are simplified SVGs; authority cards carry richer line art.
- Overview machine is the 00 orb scaffold; authority adds node rings and a dais halo.
- INVESTMENT detail expands inline (VIEW DETAILS) — authority shows only the label.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).

**Structural questions**
- Is a 2×2 mobile grid acceptable, or should the four cards scroll horizontally to keep one row?

**Functional notes**
- Default highlight is 00 (visual only; context stays unselected until a tap). Resume banner preserved.

### 6. `02_IDNTY_STATE_00_FOUNDATION` — PARTIAL

Route `/idnty/starting-at-zero` · component `IdentityDiagnosticFlow(mode=detail)`

- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 7. `03_IDNTY_STATE_01_REFINE` — PARTIAL

Route `/idnty/some-pieces-exist` · component `IdentityDiagnosticFlow(mode=detail)`

- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Hex lattice lacks the translucent volume, drop-lines and node cloud.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 8. `04_IDNTY_STATE_02_EVOLUTION` — PARTIAL

Route `/idnty/ready-for-evolution` · component `IdentityDiagnosticFlow(mode=detail)`

- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Waveform lobes are narrower; ring light/vertical bloom missing.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 9. `05_IDNTY_STATE_03_BUILD_READY` — PARTIAL

Route `/idnty/build-ready` · component `IdentityDiagnosticFlow(mode=detail)`

- DEVIATION (intentional): authority copy "Your identity is locked and verified … ENTER BLDR" is replaced with honest verification copy and a BEGIN VERIFICATION CTA — no verification backend exists.
- Deliverables read ASSET VERIFICATION / PRODUCTION FILES REVIEW / BLDR ACCESS AFTER VERIFICATION (authority: … / PROCEED TO BLDR).
- Star is flatter; the five domain nodes + labels are placed on a pentagon (authority labels sit further out).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

**Structural questions**
- Founder to confirm the honest copy for State 03 (and the CTA label) before Opus converges this screen.

### 10. `01_FOUNDATION_PRIMARY_GOAL` — PARTIAL

Route `/idnty/starting-at-zero/goal` · component `IdentityDiagnosticFlow(mode=question)`

- Tile icons are generic live-SVG line icons (authority icons are bespoke).
- Tile labels ~7.5px at 5 columns; authority tiles are taller with more padding.
- Header third line shows the state quote; authority shows QUESTION 01 there (counter lives in the panel body here, per the secondary-progress rule).
- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

**Functional notes**
- Single-select (radio semantics); legacy multi-value goal answers display the first value.

### 11. `02_FOUNDATION_AUDIENCE` — PARTIAL

Route `/idnty/starting-at-zero/audience` · component `IdentityDiagnosticFlow(mode=question)`

- Textarea shows ≥4 lines at 11px (16px on touch devices to prevent iOS zoom-on-focus — intentional deviation).
- Authority machine adds satellite nodes around the orb for this screen.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 12. `03_FOUNDATION_TIMELINE` — PARTIAL

Route `/idnty/starting-at-zero/timeline` · component `IdentityDiagnosticFlow(mode=question)`

- Radio rows are slightly taller; row dividers heavier than the authority.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 13. `04_FOUNDATION_BUDGET` — PARTIAL

Route `/idnty/starting-at-zero/budget` · component `IdentityDiagnosticFlow(mode=question)`

- Coin icons are simplified; authority shows stacked-coin art of increasing height.
- CTA label REVIEW ASSESSMENT matches.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 14. `05_FOUNDATION_REVIEW` — PARTIAL

Route `/idnty/starting-at-zero/review` · component `IdentityDiagnosticFlow(mode=review)`

- Audience copy is the user's own text (authority shows a sample); small EDIT links added (authority has none) to preserve edit-from-review function.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

**Functional notes**
- SUBMIT IDENTITY ASSESSMENT now submits via the existing endpoint; incomplete → routes to first missing question; failure stays on review.

### 15. `01_REFINE_EXISTING_ASSETS` — PARTIAL

Route `/idnty/some-pieces-exist/assets` · component `IdentityDiagnosticFlow(mode=question)`

- Typography/website/social icons are simplified line icons.
- OTHER expands a conditional field (not shown by the authority image, per product correction).
- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 16. `02_REFINE_CONDITION` — PARTIAL

Route `/idnty/some-pieces-exist/cohesion-diagnostic` · component `IdentityDiagnosticFlow(mode=question)`

- Card glyphs (scattered/cohesive/missing) are simplified; authority shows isometric component art.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 17. `03_REFINE_GAPS` — PARTIAL

Route `/idnty/some-pieces-exist/gaps` · component `IdentityDiagnosticFlow(mode=question)`

- Machine callout annotations for selected gaps (UNCLEAR MESSAGING / INCONSISTENT VISUAL SYSTEM / NO BRAND GUIDELINES with leader lines) are NOT implemented — deferred to Opus.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 18. `04_REFINE_REVIEW` — PARTIAL

Route `/idnty/some-pieces-exist/review` · component `IdentityDiagnosticFlow(mode=review)`

- Condition meter is a visual 5-segment bar (not a score); glyph beside it omitted.
- Header lines: REFINE IDENTITY / REVIEW ASSESSMENT now match; small EDIT links added.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 19. `01_EVOLUTION_AREAS` — PARTIAL

Route `/idnty/ready-for-evolution/pathways` · component `IdentityDiagnosticFlow(mode=question)`

- Three identity-domain cards only (per correction); card icons simplified.
- Machine is an SVG scaffold: lacks glossy material/bloom and node density; ~15% smaller than the authority; hero body copy overlaps the machine's left rings (authority keeps the text column ~130px).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 20. `02_EVOLUTION_GOALS` — PARTIAL

Route `/idnty/ready-for-evolution/goals` · component `IdentityDiagnosticFlow(mode=question)`

- Authority shows the machine with two highlighted lobes while typing; not implemented.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 21. `03_EVOLUTION_TIMELINE` — PARTIAL

Route `/idnty/ready-for-evolution/timeline` · component `IdentityDiagnosticFlow(mode=question)`

- Two-column rows with icon + radio match structurally; row height ~10% taller.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 22. `04_EVOLUTION_REVIEW` — PARTIAL

Route `/idnty/ready-for-evolution/review` · component `IdentityDiagnosticFlow(mode=review)`

- Authority machine annotates VISUAL IDENTITY / BRAND MESSAGING with dashed brackets; not implemented.
- Row icons simplified.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 23. `01_BUILD_READY_VERIFICATION` — PARTIAL

Route `/idnty/build-ready/verification` · component `IdentityDiagnosticFlow(mode=question) + BuildReadyVerificationList`

- Per-row mini node glyph is simplified; machine nodes fill only when the user supplied evidence (provisional).
- Statuses are provisional descriptions of user input — not verification.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 24. `02_BUILD_READY_EVIDENCE` — PARTIAL

Route `/idnty/build-ready/evidence` · component `IdentityDiagnosticFlow(mode=question) + BuildReadyEvidenceList`

- Chips are toggleable "I can provide this" source types (authority shows static chips); a per-domain "ask SITE 00 to review" checkbox is added (needed to represent REVIEW REQUIRED honestly).
- No file upload (no backend).
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 25. `03_BUILD_READY_AUTHORITY_CHECK` — PARTIAL

Route `/idnty/build-ready/authority-check` · component `IdentityDiagnosticFlow(mode=question) + BuildReadyAuthorityCheckList`

- DEVIATION (intentional): authority shows AUTHORITY ESTABLISHED and "SITE 00 HAS REVIEWED THE AVAILABLE EVIDENCE". Nothing has been reviewed → shows PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED with a provisional disclaimer.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

### 26. `04_BUILD_READY_REVIEW_VERIFICATION` — PARTIAL

Route `/idnty/build-ready/review` · component `IdentityDiagnosticFlow(mode=review) + BuildReadyReview`

- Domain tile icons are the live-SVG set (authority: eye/heart/graph glyphs).
- EVIDENCE STATUS reads counts only; node glyph simplified.
- Environment plate is a neutral CSS gradient inside an asset slot (the authority plate is a photographic render — Grok).
- Type scale reads ~1.2–1.4× the authority at the authority viewport, so the first view runs ~45–60px longer; the working panel's footer actions sit below the fold at 390×693 (visible at 390×844). Opus: re-measure type/spacing against the authority.

**Functional notes**
- SUBMIT FOR VERIFICATION reports "not available yet" — never navigates, never fakes success.

### 27. `01_BLDR_COMMAND_CENTER` — PARTIAL

Route `/bldr/state` · component `BuilderCommandCenter`

- Tower is a flat slab SVG; authority is a rendered glass assembly with floating path panels (MACHINE.BLDR.TOWER slot).
- Path cards render 2×2 below 560px (authority 4-up); card art are placeholders (CARD.BLDR.PATH.*).
- Header lacks the authority's inline nav links (EXPLORE BUILD …); SEARCH omitted.
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).
- Bottom nav keeps the existing five-bay icon set; labels are ~10% larger than the authority.

**Structural questions**
- STRUCTURAL: authority paths SITE/WORLD/SYSTEMS/EXTENSIONS vs current classes SITE/WORLD/ENTERPRISE/NOT SURE. SYSTEMS → enterprise; EXTENSIONS → discovery. Does EXTENSIONS need its own build class/assessment?

### 28. `02_BLDR_OVERVIEW` — PARTIAL

Route `/bldr/state?path=overview` · component `BuilderPathPanel`

- Scene plate above the panel is a gradient (ENV.BLDR.PATH.OVERVIEW).
- Panel art (cube lattice) overlaps the tagline by ~10px; path-index list sits tighter than the authority.
- Framework glyphs are simple SVGs (one shared set of 5).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

**Structural questions**
- Authority numbering: Overview 02.01 and path 1/4 both; SITE is "02" with CLOSE. Reproduced as drawn — confirm intended numbering.

### 29. `03_BLDR_SITE` — PARTIAL

Route `/bldr/state?path=site` · component `BuilderPathPanel`

- Side note stacks at the panel's right edge (authority aligns it to the art's right).
- Plate gradient; panel is a flatter glass.
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 30. `04_BLDR_WORLD` — PARTIAL

Route `/bldr/state?path=world` · component `BuilderPathPanel`

- Terrace lattice is a generic isometric placeholder.
- Plate gradient (globe/waterfall scene = Grok).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 31. `05_BLDR_SYSTEMS` — PARTIAL

Route `/bldr/state?path=systems` · component `BuilderPathPanel`

- Systems lattice is a generic placeholder.
- SYSTEM ARCHITECTURE / SYSTEM FLOW floating panels belong to the plate (Grok).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 32. `06_BLDR_EXTENSIONS` — PARTIAL

Route `/bldr/state?path=extensions` · component `BuilderPathPanel`

- Slab-stack art overflows its 112px box slightly.
- Waiting note added under CTA: no EXTENSIONS assessment exists yet.
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 33. `01_EVOLVE_INTERVENTION_CENTER` — PARTIAL

Route `/evolve/state` · component `EvolveInterventionCenter`

- Property machine is a three-layer wireframe; authority is a rendered glass building with red intervention blocks (MACHINE.EVOLVE.PROPERTY_TOWER).
- Authority highlights the IDNTY nav bay on this EVOLVE page; implementation highlights a contextual EVOLVE bay (flagged as an authority inconsistency).
- Cards 3-up (matches) but art placeholders (CARD.EVOLVE.PATH.*).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).
- Bottom nav keeps the existing five-bay icon set; labels are ~10% larger than the authority.

### 34. `02_EVOLVE_REFINE` — PARTIAL

Route `/evolve/state?path=refine` · component `EvolvePathPanel`

- Orbit target art simplified; CURRENT STATE / TARGET STATE plate panels are Grok.
- Panel columns (INCLUDES / IDEAL FOR / DELIVERABLES) match; list text ~8% smaller.
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 35. `03_EVOLVE_INSTALL` — PARTIAL

Route `/evolve/state?path=install` · component `EvolvePathPanel`

- Layered lattice simplified; SYSTEM MODULES / INTEGRATION LAYERS panels are plate content (Grok).
- Right-hand hero note absent in the authority (matches).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 36. `04_EVOLVE_TRANSFORM` — PARTIAL

Route `/evolve/state?path=transform` · component `EvolvePathPanel`

- Star/orbit art simplified.
- EXISTING / TRANSFORMED panels are plate content (Grok).
- Header: SEARCH control omitted (no search capability exists). Scan control is a live-SVG bordered glyph (the authority shows a bare bracket glyph with a plus).

### 37. `01_LOCATIONS_MAIN` — PARTIAL

Route `/origin/locations` · component `PublicLocationsDirectory`

- Marble-arch plate and row thumbnails are placeholders (ENV.LOCATIONS.ARCH, CARD.LOCATIONS.*).
- Rows are ~12px shorter than the authority; thumbnail fade starts at 38%.
- Authority numbers SYSTEM and ABOUT both "05"; implementation keeps 05/06/07.
- YOUR SPACE section (existing function) renders below the supplied seven; authority ends at JOURNAL + CONTINUE EXPLORING.
- No bottom nav (matches the authority); header is SITE 00 ◆ + EXIT 00.

## Responsive QA (Phase 11)

Script: `scripts/site00-public-redesign-responsive.mjs` → `responsive-qa.json`. 16 covered routes × 360×740, 390×844, 430×932 (native phone path) and 768×1024, 1024×768, 1440×900 (default **and** Mobile-preview artboard) = 144 probes; 102 rendered the redesign shell.

| Check | Result |
|---|---|
| Horizontal overflow (document) | none in any probe |
| Elements poking past the viewport / artboard | none |
| Fixed bottom nav vs last content (scrollable clear of nav) | clear in all 102 |
| Page errors | none |
| 360px | no overflow; 5-column tiles drop to 3 below 380px; Origin/BLDR cards stay 2–3 up |
| 430px | no overflow; layout stays single column (max-width 640) |
| 768 / 1024 / 1440 default | **Legacy desktop artboard is intentionally preserved** (derived-conservatively rule); BUILD READY verification always uses the redesign (legacy desktop form cannot represent it) and is centered at max 640px |
| 768 / 1024 / 1440 Mobile preview | Phone artboard (390×844) scales; the shell is the scroll container inside the fixed-height artboard; nav + plate stay pinned |
| Safe areas | header/nav add `env(safe-area-inset-*)` |
| Keyboard / input | textarea is 16px on touch devices (prevents iOS zoom-on-focus); focus-visible ring on all controls; radio/checkbox semantics on selectors |
| Scroll position | route change keeps document scroll (panel body fades in); not reset programmatically — Opus to decide |

Not verified (needs a device/real network): iOS Safari keyboard resize behaviour, remote plate loading, true safe-area inset values, swipe-up gesture on touch hardware.

## Functional proof (real browser, mocked intake API)

`scripts/site00-public-redesign-flows.mjs` — **43/43 checks pass**: state continuity (hero/machine/rail/panel DOM nodes persist from detail through review), single 00–03 rail, compact question counter, required-field validation, single/multi selector semantics, textarea counter, conditional OTHER, retired `/project` step redirect, honest submit (success → existing endpoint → `/complete`; failure stays on review; unreachable server shows NOT SAVED and never completes; incomplete assessment routes to the first missing question), Build Ready (no pre-verified domain, provisional statuses only, no percentages, submit reports unavailable, no BLDR link), Origin/BLDR/EVOLVE route integration.
