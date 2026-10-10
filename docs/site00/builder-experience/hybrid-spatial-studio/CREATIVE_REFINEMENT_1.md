# Builder Hybrid Spatial Studio — Creative Refinement 1 (founder review summary)

**Sprint:** `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-OPUS-CREATIVE-FIDELITY-AND-INTERACTION-REFINEMENT1`
**Branch:** `claude/bldr-studio-creative-refinement-8d42xk`. Stacked on draft #1525 (`claude/bldr-studio-reconciliation-8d42xk` @ `82060164`), with `origin/main` @ `e9779def` merged in (#1526 tunnel pin).
**Route:** `/bldr/studio/:room`. Same flags; still gated off in production builds.
**Production release:** none. **Founder approval:** pending visual review.

> Founder direction: *KEEP THE EXPERIENCE. ELEVATE THE CREATIVE LAYER. PRESERVE ALL WORKING FUNCTIONALITY.*
>
> The journey and every component are unchanged: four rooms, then the Blueprint. So are persistence, submission and estimates. This sprint changed only type, colour, spacing, the Build Object's architecture, the Blueprint section design and the confirmation sheet.

> **Superseded in part by Reference Fidelity 2** (`REFERENCE_FIDELITY_2.md`). The founder then made the approved references the strict authority ("copy the reference images pixel perfect"). Typography, palette, stage compositing and the Build Object forms were re-derived from the references by measurement. The Production-Workspace face and cool palette below are no longer current. The journey, contracts, Blueprint index behaviour, confirmation sheet and status track are unchanged.

## How to review

| What | Where |
|---|---|
| Reference · before · after, one per room | `creative-refinement-qa/comparisons/reference-before-after-{place,feel,work,pace,blueprint}.jpg` |
| Before / after by area | `creative-refinement-qa/comparisons/before-after-{typography,place,feel,work-pace,blueprint-tabs,confirmation,desktop,tablet}.jpg` |
| Every required AFTER capture | `creative-refinement-qa/after/`: mobile 390×844 (full journey), 393×852, tablet 834×1194, desktop 1440×900 |
| BEFORE captures | `creative-refinement-qa/before/` (the unmodified studio at sprint start) |
| Transformation evidence | `creative-refinement-qa/matrix/` and `TRANSFORMATION_MATRIX.md` |
| Regression results | `creative-refinement-qa/regression/*.json` |

All captures are live browser renders of the dev server, configured like the tunnel's dev mode. **No reference image is used in the UI or as evidence of implementation.** The reference crops appear only in the comparison sheets, labelled REFERENCE.

## Review by area

| Area | Status | What changed | Evidence |
|---|---|---|---|
| **TYPOGRAPHY** | **IMPLEMENTED · VISUALLY VERIFIED** | Anton + Inter are replaced by the Production Workspace face, **Saira Semi Condensed** (300–700). It loads from the workspace's own files (`src/site00/assets/fonts/saira-semi-condensed/`, OFL), which Vite emits once and shares, so nothing is duplicated and nothing is externally hosted. The family stack is identical to the workspace's `--pxa-font`, and the workspace's uppercase, tracked system applies: headline 700, tight leading; labels 600 at .12–.36em; lede 400 at .14em. The old `public/site00/fonts/{anton,inter}` are removed; the twin pages load Anton from Google themselves and never used them. | `before-after-typography.jpg`; live checks T01–T03 (face applied, Saira 400–700 actually loaded, no Anton/Inter) |
| **SPACING AND ALIGNMENT** | **IMPLEMENTED · VISUALLY VERIFIED** | Every headline sets as the reference's two lines. Each line is `nowrap`, sized with `clamp()` so it fits from 320 px up; desktop uses 72px so "WE CREATING?." stays inside its 500px column. The lede is capped at 318px with `text-wrap: pretty`. There are **no `<br>` line breaks**. Intro rhythm, card padding, tab grid, proposal rows and the CTA are re-spaced to the workspace's 4/8 rhythm. | Live checks L-*: no sideways scroll, no wrapped headline line, and no text overflowing its box in any room at 390, 393, 834 and 1440. Headlines also checked at 320, 360, 414 and 430. |
| **COLOR** | **IMPLEMENTED · VISUALLY VERIFIED** | The warm beige system (`#F2F0EC` page, `#D8121F` red, warm greys) is replaced by the workspace palette: page `#F4F4F6`, card `#FFF`, ink `#111114`/`#3A3A40`, muted `#6E6E76`, line `#E2E2E6`, red `#E5231B`. The scene follows: background, floor, banding, stone and marble textures, glass and light are all cool neutral. The radial "band" behind the stage is removed. | All comparison sheets |
| **PLACE** | **IMPLEMENTED · VISUALLY VERIFIED** · reference atmosphere **ASSET BLOCKED** | Each path is a different site, not a bigger one: SIMPLE is one pavilion; ADVANCED two interlocking volumes on a red spine; CUSTOM rotated cantilevers with a red halo frame; WORLD a campus with pavilions, glass bridges and a red tower. | `matrix-place.jpg` (diffs 11–16, reversal identical), `before-after-place.jpg` |
| **FEEL** | **IMPLEMENTED · VISUALLY VERIFIED** · reference marble depth and atmosphere **ASSET BLOCKED** | Four architectural directions, each with its own geometry, element set and camera: MODERN a strict fan of plates; BOLD red monoliths under a cantilevered red slab; EDITORIAL layered planes, steel frames and a red rule; IMMERSIVE a passage of gates ending in red light. | `matrix-feel.jpg` (pair diffs 14–44), `before-after-feel.jpg`, `reference-before-after-feel.jpg` |
| **WORK** | **IMPLEMENTED · VISUALLY VERIFIED** | Each capability builds its own module beside its toggle: PAGES a plate stack; BLOG a rack of leaves; SHOP a vitrine; MEMBER AREA a closed dark-glass chamber; BOOKING a colonnade; PORTAL receding frames. They are metaphors, and none implies an unsupported feature. PAGES stays on by default (contract). | `matrix-work.jpg` (every removal pixel-identical), `before-after-work-pace.jpg` |
| **PACE** | **IMPLEMENTED · VISUALLY VERIFIED** | Each pace is shown as a way of assembling: STANDARD rises floor by floor; EXPEDITED arrives almost at once from above, with thin steel sequencing caps; FLEXIBLE slides in laterally with visible joints. EXPEDITED adds **no volume and no red** (unit-tested). Visual pacing never computes or shows a duration, and EXPEDITED availability is the estimator's call. | `matrix-pace.jpg`, `matrix-pace-motion.jpg` (180/520 ms frames) |
| **BLUEPRINT** | **IMPLEMENTED · VISUALLY VERIFIED** · AR **CONTRACT BLOCKED** (GA-09) · CUSTOM submit **CONTRACT BLOCKED** (R-01, unchanged) | See the Blueprint section below. | `before-after-blueprint-tabs.jpg`, `before-after-confirmation.jpg`, `matrix-blueprint.jpg` |
| **MATERIALS** | **IMPLEMENTED** · photographic texture **PARTIALLY COMPLETE** (ASSET BLOCKED: GA-02 to GA-04, GA-08) | Procedural materials are retuned cool:<ul><li>Carrara `#ECEEF0` with grey veins; nero `#1C1E21`.</li><li>Glass `#E4EBEE` at 22% opacity, with stronger edges.</li><li>Red acrylic `#E5141E` with emissive depth; solid red.</li><li>Steel at metalness .9; graphite figures.</li><li>A new `ghost` material for Blueprint inspection.</li></ul>No textures added and no new runtime cost. | All Build Object captures |
| **ASSET GAPS** | **ASSET BLOCKED** | 0 assets recovered as mountable. The P1 assets (GA-05 atmosphere plates, GA-01 atrium HDRI) are what most separate the render from the references, along with GA-02 Carrara and GA-06 figures. The manifest is rewritten with full production briefs in the new cool palette. | `GROK_ASSET_REQUEST_MANIFEST.md` |
| **FOUNDER REVIEW URL** | **CONTRACT BLOCKED (deployment)** | The tunnel is pinned to `c5e604e5` (#1524). This sprint's SHA has to be pinned by Composer; this session cannot reach the tunnel host. | §Tunnel handoff below |

## Blueprint, in detail

| Part | Before | After |
|---|---|---|
| **Section tabs** | Five plain words with an underline | A **numbered section index** (01–05, five equal columns) with a sliding red indicator and a mode line ("02 — ARCHITECTURAL BREAKDOWN"). Keyboard support is complete: ←/→ wrap, Home/End, roving tabindex (checks K01–K03). The panel reveals on change (static under reduced motion, R01). |
| **Object focus** | The object ignored the tab | Each section **re-lights the same structure** (F01, F03): STRUCTURE ghosts the capabilities, PAGES shows only the page volumes, FEATURES shows only the red capabilities, TIMELINE replays the assembly at the client's pace. |
| **OVERVIEW** | Facts and configuration cards | Same content, re-set in workspace type (facts, estimator figures, configuration thumbnails, EDIT SELECTIONS) |
| **STRUCTURE** | A list | A **keystone** (build type and its consequences) over numbered strata (L1…, one per contract line, foundation up), each tagged OPEN or FROM SYSTEM exactly as the contract reports it |
| **PAGES** | A long list | A **count** ("11 pages assembled…") and page groups as numbered plates P01…, each with its depth (e.g. FULL) as the contract reports it |
| **FEATURES** | A list | A **core root** (WEBSITE · MOBILE) with numbered branches F01… and "COMES WITH YOUR CHOICES" links |
| **TIMELINE** | Rows | **Pace lanes**: STANDARD and EXPEDITED side by side, YOUR PACE marked, NOT AVAILABLE with the estimator's reason. Then the confidence label and numbered "what comes first" steps. **The figures and timeline math are unchanged.** |
| **Confirmation** | A list sheet | A **proposal sheet**: eyebrow "05 BLUEPRINT PROPOSAL", a live Blueprint thumbnail plate, indexed rows 01 PLACE – 04 PACE (the PLACE row no longer repeats "BUILD"), and an ink range plate carrying the same canonical estimate as the Blueprint (D03). Guest-email capture, the locked submit (D04) and Escape-to-close (D05) are unchanged. |
| **Received / submitted** | A heading | A red seal and a **status track**: SUBMITTED → FOUNDER REVIEW → SITE 00 REPLIES. It is derived **only** from the record's review stage (`reviewTrack()`, unit-tested). Nothing is marked done before the record holds it, and ACCEPTED does not imply an opened project. |

No business information, figure or capability was invented. Every value still comes from the estimator and the contract.

## Deliverables A–R

| ID | Deliverable | Status |
|---|---|---|
| A | Production Workspace typography match | Implemented · verified |
| B | Corrected mobile type and spacing | Implemented · verified (L checks) |
| C | Reference-matched colour system | Implemented · verified |
| D | Refined shared shell | Implemented: header, room index, intro, CTA, footer progress |
| E | More distinct PLACE | Implemented · verified |
| F | Distinct FEEL transformations | Implemented · verified |
| G | Capability-specific WORK | Implemented · verified |
| H | Refined PACE visualization | Implemented · verified (motion frames) |
| I | Elevated Blueprint tabs | Implemented · verified |
| J | Refined Blueprint content | Implemented · verified |
| K | Elevated final confirmation | Implemented · verified |
| L | Improved materials | Implemented (procedural); PBR asset blocked |
| M | Grok asset handoff | `GROK_ASSET_REQUEST_MANIFEST.md` |
| N | Updated transformation matrix | `TRANSFORMATION_MATRIX.md` |
| O | Mobile, tablet and desktop captures | `creative-refinement-qa/after/` |
| P | Reference comparisons | `creative-refinement-qa/comparisons/` |
| Q | Interaction regression tests | See the next section |
| R | Founder review summary | This file |

## Regression (functionality preserved)

| Suite | Result |
|---|---|
| `tsc --noEmit` | clean |
| vitest: builder-experience, builder-studio, site00Intakes, builder pages | 9 files · **114 tests** pass. This includes 17 new composition tests and the new status-track test. |
| `vite build` | OK. `vendor` chunk byte-identical (`vendor.D1FxG_Wm.js`); `three` lazy (529.67 kB) |
| `preview-recovery.cjs` (live) | **20/20**: rooms, back/forward, server draft, estimator figures, rotate, fullscreen, save, resume, isolation, submission failure, real submit, duplicate protection, reduced motion |
| `founder-loop.cjs` (live, client ↔ founder) | **32/32**: guest email, versioned submission, review states, revision → resubmission, stale-decision refusal, project activation still gated |
| `creative-interactions.cjs` (live, new) | **27/27**: layout at four viewports, typography loading, tab keyboard, object focus, reduced motion, confirmation sheet |
| Console | 0 application errors. The only console messages are proxy-blocked external resources. |

## Known limitations

1. **Not yet seen on a real phone.** Every capture is headless Chromium with SwiftShader WebGL. The runtime cost is unchanged (no textures, shared geometry, at most ~52 elements), but the founder's device is the real test.
2. **Reference fidelity is partial until the P1 assets exist.**
   - The references' photographic atrium, the depth of their veined stone and their figure silhouettes are not reproducible procedurally (GA-05, GA-01, GA-02, GA-06).
   - **The experience is not claimed to be fully reference-faithful.**
3. **Headline letterforms.** The generated references letter headlines in a narrower, compressed display face. Following the founder's direction, the studio now uses the Production Workspace face, which sets wider. *FOUNDER DECISION REQUIRED* only if the compressed reference lettering is preferred over workspace parity.
4. **EXPEDITED** appears only where the estimator offers priority; the mobile journey's scope does not. The matrix shows it on ADVANCED + PAGES + SHOP + PORTAL.
5. **Carried, unchanged contract items:**
   - R-01: a CUSTOM Blueprint is never submittable.
   - Supabase-backed persistence is not exercised from this environment.
   - There is no AR control (GA-09).

## Composer contract requests (this sprint)

| ID | Request | Owner |
|---|---|---|
| CR-1 | **Pin this branch on the founder tunnel** (handoff below). Preserve rollback to the current pin (`c5e604e5`). | Composer |
| CR-2 | No new data contract is needed. The status track reads the existing `ClientReviewStage`, and the Blueprint sections read the existing `BlueprintSessionSnapshot`. | — |
| CR-3 | Carried: R-01 (CUSTOM submission), R-02 (server-side expected-version on admin actions), R-03 (refined estimate), R-06 (client read exposure). These are listed in `HYBRID_SPATIAL_STUDIO_FOUNDER_REVIEW_V1.md` §15. | Composer |

## Tunnel handoff (for Composer)

The tunnel currently serves the pinned ref `c5e604e5` (#1524), in dev mode with the in-process intake API on the memory store (#1526).

```bash
# 1. Pin the creative refinement (dev mode, flags on, as today)
SITE00_PREVIEW_PIN_REF=origin/claude/bldr-studio-creative-refinement-8d42xk \
  bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh
#    (or pin the exact SHA from the PR head). Run `npm ci` in the pinned worktree if the lockfile changed: it did not in this sprint.

# 2. Smoke test
#    https://site00.fsbw-dev.com/bldr/studio → room 01 shows the SITE 00 / BUILDER header in Saira, a cool grey page, SAVED.
#    Choose ADVANCED → FEEL: the four directions build four different structures.

# 3. Rollback (either)
SITE00_PREVIEW_PIN_REF=c5e604e52ea8ba078a1595bb6615dd5f29b37e95 bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh
bash .cursor/scripts/serve-site00-preview-from-main.sh   # back to preview/tunnel
```

Nothing in this sprint changes flags, the server, the API base, the intake store or the lockfile. Only studio front-end files, tests, QA scripts and docs changed.
