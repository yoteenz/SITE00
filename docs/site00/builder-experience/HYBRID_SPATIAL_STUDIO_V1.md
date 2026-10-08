# SITE 00 Builder — Hybrid Spatial Studio V1

**Sprint:** `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-OPUS-APPROVED-EXPERIENCE-DESIGN-AND-VISUAL-IMPLEMENTATION1` · OPUS
**Visual authority:** founder-approved REFERENCE 01 (four rooms) and REFERENCE 02 (Blueprint reveal), mobile.
**Founder approval of this implementation:** **pending review.** Matching the references conceptually is not approval.

> ONE CONTINUOUS ENVIRONMENT. FOUR DISTINCT ROOMS. ONE BLUEPRINT REVEAL.

> **Superseded in part (founder-review sprint):** the studio now lives at **`/bldr/studio/:room`** and runs on Composer's
> server-backed session (`useBuilderSpatialIntakeSession`). The on-device draft engine (`useStudioDraft`), the
> `/bldr/builder` route and the separate submission adapter described below were removed. Current state:
> `HYBRID_SPATIAL_STUDIO_FOUNDER_REVIEW_V1.md`. The visual system, Build Object and fidelity notes below still apply.

---

## 1. Status

| Area | Implemented | Tested | Visually verified (live browser) | Notes |
|---|---|---|---|---|
| Shared shell (wordmark, menu, room id, stage, CTA, progress rail, back, restore) | ✅ | ✅ | ✅ mobile · tablet · desktop | |
| 01 PLACE | ✅ | ✅ | ✅ | |
| 02 FEEL | ✅ | ✅ | ✅ | |
| 03 WORK | ✅ | ✅ | ✅ | |
| 04 PACE | ✅ | ✅ | ✅ | |
| 05 BLUEPRINT (reveal, 5 sections, edit, save, submit) | ✅ | ✅ | ✅ | |
| State-driven Build Object (three.js) | ✅ | ✅ (composition unit tests + live) | ✅ | Procedural materials; see §7 and the Grok manifest |
| Estimator binding (window, investment, priority availability) | ✅ | ✅ | ✅ | All figures from `builderEstimateView` |
| Save / resume (on device) | ✅ | ✅ | ✅ | Per device. Cross-device needs an account draft (C-12) |
| Submission to SITE 00 | ✅ client side | ✅ against a mocked API | ⚠ **live submission not verified** | No Supabase/API backend in the build session (C-07, C-08) |
| AR inspection affordance | ❌ | — | — | **Deferred** (GA-09, C-09) |
| Photoreal materials / backdrops | ❌ | — | — | **Blocked on assets**: Grok manifest GA-01 to GA-08 |
| Public exposure | Off | ✅ flag-off redirect verified | — | Behind `VITE_SITE00_TEMPLATE_SYSTEM_V1` (default off) |

## 2. How to open it

```
VITE_SITE00_TEMPLATE_SYSTEM_V1=1 VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1 npm run dev
open http://localhost:5174/bldr/builder
```

| Flag | Default | Effect |
|---|---|---|
| `VITE_SITE00_TEMPLATE_SYSTEM_V1` (existing) | off | Off: `/bldr/builder/*` redirects to `/bldr`. On: the studio renders. |
| `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` (existing) | off | Off: the Blueprint shows timeline and investment as **AT REVIEW**. On: it shows the estimator's ranges. |

Routes: `/bldr/builder` resumes at the furthest room. Each room has its own route: `/bldr/builder/{place|feel|work|pace|blueprint}`. A locked room redirects to the first room still needing an answer. The new static route takes precedence over `/bldr/:classSlug/*`.

## 3. What was built

| File | Role |
|---|---|
| `src/site00/builder-studio/studioModel.ts` | Rooms, presentation registries and the **pure mapping from room choices to the canonical `BuilderSelection`** (`toSelection`). Also the guard rails, readiness, persistence parsing and display helpers. |
| `src/site00/builder-studio/useStudioDraft.ts` | Draft state, restored on load and written on change, tab hide and unmount. |
| `src/site00/builder-studio/BuilderStudio.tsx` | The studio: shell, persistent stage, room routing and gating, menu, progress rail. |
| `src/site00/builder-studio/rooms.tsx` | Room controls for PLACE, FEEL, WORK and PACE. |
| `src/site00/builder-studio/BlueprintRoom.tsx` | The reveal: inspection controls, the five sections, decisions, save, submission sheet. |
| `src/site00/builder-studio/buildObject/composition.ts` | **Pure configuration → architecture** (elements with stable ids). |
| `src/site00/builder-studio/buildObject/engine.ts` | three.js renderer. Animates element changes, fits the camera to any stage, drag to inspect, thumbnails. |
| `src/site00/builder-studio/buildObject/BuildObjectStage.tsx` | React stage and thumbnail components; reduced-motion hook. |
| `src/site00/builder-studio/submitBlueprint.ts` | Submission over the existing BUILDER intake (`useIntakeSync`). No new endpoint. |
| `src/site00/builder-studio/icons.tsx` | Hairline icon set. |
| `src/site00/pages/builder/BuilderStudioPage.tsx` | Route page and flag gate. |
| `src/site00/styles/site00-builder-studio.css` | All studio styling: mobile first, then tablet and desktop compositions. |
| `public/site00/fonts/anton`, `public/site00/fonts/inter` | Self-hosted display and UI faces, with OFL licences. |
| `src/site00/builder-studio/studioModel.test.ts` | 17 unit tests. |
| `scripts/site00/builder-studio-qa/{capture,functional}.cjs` | Repeatable live-browser capture and the 47-check functional run. |

Shared files touched:

- `src/routes/Site00Routes.tsx`: one lazy import, one route.
- `src/site00/config/routes.ts`: `bldrBuilder`.
- `vite.config.ts`: one line, so three.js gets its own chunk instead of the eagerly loaded `vendor` chunk.
- `package.json` / `package-lock.json`: add `three@0.185.1` and `@types/three@0.185.0`, pinned.

**Bundle impact.** `vendor` stays at 461 kB (134.8 kB gzip). three.js is a separate 530 kB (132.7 kB gzip) chunk, loaded only when `/bldr/builder` opens. The studio's own chunk is 108 kB (36.5 kB gzip) plus 22.5 kB CSS. `index.html` does not preload three.js. Without the chunk change, three.js would have joined `vendor` on every SITE 00 page.

**Unchanged:** the Builder contract (`src/site00/builder-experience/`), the estimator, pricing, Digital Foundation, Studio World, and every other route.

## 4. Reference → canonical contract

The approved rooms ask four questions in client language. The contract (`BUILDER_SELECTION_MODELS.md`) has more decisions. The studio keeps a small draft of room answers and derives the canonical selection from it. Every number comes from the estimator through that selection.

### 01 PLACE — "WHAT ARE WE CREATING?"

The four reference cards are the four journey **paths** in `BUILDER_CLIENT_JOURNEY.md`. They are not commercial categories, and the build level stays **derived** (`deriveBuildLevel`).

| Card | Canonical selection |
|---|---|
| SIMPLE · REFINE AN ESTABLISHED SYSTEM | `build: SITE`, `expression.edition: ESSENTIAL`, `keepItSimple: true` |
| ADVANCED · RESHAPE THE SYSTEM | `build: SITE`, `edition: FULL` (the contract's "full edition develops the system", level ADVANCED) |
| CUSTOM · BUILD FROM ZERO | `build: SITE`, `expression.primary: CUSTOM` (custom creative direction, level CUSTOM); the FEEL choice becomes `secondary`, the starting influence |
| WORLD · CREATE A CONNECTED ENVIRONMENT | `build: WORLD`, `world: DEFAULT_WORLD_SELECTION` (form editable in Blueprint › STRUCTURE) |

### 02 FEEL — "HOW SHOULD IT FEEL?"

Each label is presentation over a canonical visual system:

| Label | Visual system |
|---|---|
| MODERN | ARCHITECTURAL MINIMAL |
| BOLD | POP EDITORIAL |
| EDITORIAL | EDITORIAL OBJECT |
| IMMERSIVE | CINEMATIC LUXURY |
| WARM *(rail, scrolls)* | SOFT ORGANIC |
| OPERATIONAL *(rail, scrolls)* | INDUSTRIAL COMMAND |

- The first four are the reference's own labels. The last two keep every canonical system reachable; their labels need founder approval (D-1).
- Descriptors come from the contract's `feels` copy, except MODERN, which uses the reference's "CLEAN. REFINED. TIMELESS."

### 03 WORK — "WHAT MUST IT DO?"

| Module | Binding |
|---|---|
| SHOP | capability `SELL` (comes with `TAKE PAYMENT`, shown as COMES WITH) |
| BOOKING | capability `BOOK` |
| MEMBER AREA | capability `MEMBERSHIP` (comes with `ACCOUNTS`) |
| PORTAL | capability `DATA_PORTAL` |
| BLOG | experience `JOURNAL` |
| PAGES | experience depth one step deeper (ESSENTIAL → FULL → EXTENSIVE); the page count stays the same and each page is designed in more depth |
| CORE PAGES INCLUDED: WEBSITE · MOBILE · SEO · ANALYTICS | ANALYTICS is bound to `MEASURE` in every selection, so the estimate includes it. WEBSITE = the front-door experiences; MOBILE = `PHONE_AND_DESKTOP`; SEO has no estimator feature (C-05) |

Guard rails:

- **SIMPLE path.** A module that would raise the build level asks first ("SHOP IS PART OF AN ADVANCED BUILD." → ADD IT · ADVANCED BUILD / NOT NOW). It never upgrades silently.
- **WORLD path.** PAGES and BLOG are disabled ("A WORLD IS DESIGNED AS PLACES, NOT PAGES.").
- **Structure.** The reference has no structure room. Structure is **suggested** (SHOP → COMMERCE, otherwise SERVICE) and changeable in Blueprint › STRUCTURE (C-04).
- **No money.** This room shows no dollar figure.

### 04 PACE — "HOW SHOULD WE BUILD IT?"

| Option | Delivery | Rule |
|---|---|---|
| STANDARD | `STANDARD` | Default |
| EXPEDITED | `PRIORITY` | Offered only when the estimator says priority shortens this scope (`PRIORITY_REQUIRES_FEASIBLE_COMPRESSION`); otherwise "NOT AVAILABLE FOR THIS SCOPE" |
| FLEXIBLE | `CUSTOM_SCHEDULE` | Estimated as standard; SITE 00 proposes a schedule. No discount implied (C-03) |
| Optional project notes | Studio draft → submission payload | No canonical field yet (C-02) |

No completion dates are promised anywhere.

### 05 BLUEPRINT — "YOUR BLUEPRINT."

| Element | Source |
|---|---|
| BUILD TYPE | Derived level (SIMPLE / ADVANCED / CUSTOM, or WORLD) with the reasons in STRUCTURE |
| ESTIMATED TIMELINE | `builderEstimateView().productionWindow` (weeks or months, from the estimator formatter) |
| ESTIMATED INVESTMENT | `builderEstimateView().investment`. Display-only change: "$12K–$18K" is written "$12,000 – $18,000" |
| Confidence | INITIAL RANGE, kept visible under both figures |
| Configuration cards | VISUAL DIRECTION → FEEL room · PAGES → PAGES section · FEATURES → FEATURES section · PRIORITY → TIMELINE section · EDIT SELECTIONS → room menu |
| STRUCTURE | The project drawing (canonical Blueprint lines, "from system" marks, level reasons) and the structure / world-form chooser. A change re-estimates immediately |
| PAGES | Experiences grouped by family, with depth words |
| FEATURES | Capabilities with COMES WITH marks, core included, platform-usage disclosure where it applies |
| TIMELINE | Standard vs expedited comparison, why priority is not half the time, the review-SLA note, dependencies, assumptions, what happens next, the client's note, "not a quote", estimator reference |
| CONFIRM & SUBMIT FOR REVIEW | Disabled until ready; open decisions show above it with actions. Opens the submission sheet (email) |
| SAVE FOR LATER | Saves the draft and an estimator record (`createEstimateRecord` → `saveEstimateLocally`) |

**Pricing reveal.** Rooms 01–04 show no money. The Blueprint shows the INITIAL RANGE. The refined range after founder review is the contract's `FOUNDER_REVIEWED` stage and is not set by the client. Builder timelines come from the estimator; no Digital Foundation business-day figures are used (asserted in tests).

## 5. The Build Object

A real-time three.js scene, not a picture:

| Choice | Object response |
|---|---|
| PLACE path | The structural composition: a single pavilion (SIMPLE), two volumes (ADVANCED), offset cantilevered volumes (CUSTOM), a field of pavilions on a broad plinth (WORLD) |
| FEEL direction | The material treatment. The FEEL room shows a study of standing plates; the palette then carries into every later view (glass tint, accent, mass and plinth material) |
| WORK modules | One floor per capability, each with a red module inside, grown into the tower. Removing a module sinks its floor away |
| PACE | The posture of the assembled structure: EXPEDITED raises the red core and adds a vertical red line; FLEXIBLE spreads the volumes |
| BLUEPRINT | The resolved composition, with side volumes and red modules for the chosen capabilities |

How it renders:

- **Stable identity.** Elements keep stable ids, so changes animate (move, resize, grow, sink) instead of cutting.
- **Fitted camera.** The camera fits the composition to the stage, so the same object fills a phone stage or the desktop half-screen.
- **Thumbnails.** Option cards are stills of the **same compositions**, rendered offscreen.
- **Inspection.** The Blueprint's cube button turns on drag-to-turn, with a reset; full screen uses the Fullscreen API with a CSS fallback.
- **Reduced motion.** Transitions snap and the idle sway stops.
- **No WebGL.** The stage shows its text description and the studio stays fully usable.
- **Honesty.** Materials are procedural (canvas-generated marble, stone, concrete, travertine; physically based glass and acrylic). It is a configuration visualization, not a website design, and it does not pretend to be a photographic render.

## 6. Responsive

| Width | Composition |
|---|---|
| Phone (< 700) | The approved mobile authority. A single column; the stage **takes all spare height**, so the object grows on taller phones; the CTA and progress rail sit at the foot. |
| Tablet (700–1099) | One wider column (max 820). Larger stage (44–50vh), four PLACE cards in a row, a six-up FEEL rail. |
| Desktop (≥ 1100) | Two columns: question, controls and CTA on the left (≤ 500px); the object fills the right half full-height, edge-faded into the page. Not a dashboard; the same environment. |

Founder approval covers the **mobile** references only. The tablet and desktop compositions are proposals and **have not been approved**.

## 7. Reference fidelity report (mobile, 390 × 844)

Comparisons: `hybrid-spatial-studio/comparisons/*-reference-vs-implementation.jpg`. The references are scaled to 390px wide with the status bar removed.

**Proportion note.** The reference phones are drawn ~1.33× taller than a real 390×844 viewport (each reference room is ~1,070px of content at 390px wide). Everything is kept at the reference's horizontal scale; the vertical rhythm is compressed and the stage absorbs the difference. Objects are therefore somewhat smaller on a real phone than in the elongated mockups.

| Item | Status |
|---|---|
| Header: SITE 00 / BUILDER, two-line menu glyph | ✅ Matches |
| Room id (red numeral, rule, label) | ✅ Matches |
| Headline (condensed bold, two lines as drawn, red full stop) | ✅ Matches. Anton at ~56px (48px on the Blueprint, which the reference also sets smaller) |
| Lede (tracked uppercase, 4 lines) | ✅ Matches. Line breaks differ by a word in places |
| Architectural object | ◐ **Composition and language match** (glass volumes with white frames, red acrylic, veined marble plinth, scale figures). It is a live object, not a photoreal render; shorter stage on real phones. Closing the realism gap needs GA-01 and GA-02 |
| Background atmosphere | ◐ Simplified: fogged white columns and a faint red mass. The reference's soft architectural backdrop is GA-05 |
| PLACE: 2×2 cards with thumbnail, name, descriptor, red selected border | ✅ Matches. Cards are a little shorter than drawn |
| PLACE: stage carousel arrows | ✅ Functional (they move the selection) |
| FEEL: caption (MODERN / CLEAN. REFINED. TIMELESS.) and four-up thumbnail rail | ✅ Matches. The rail scrolls to two more canonical systems |
| WORK: six labelled + toggles around the tower | ✅ Matches. A toggle turns red with a check when on |
| WORK: CORE PAGES INCLUDED box with four tiles | ✅ Matches. The header expands to the real page list |
| PACE: three rows (icon, label, sub, square check) and a note field | ✅ Matches. Rows are slightly shorter than drawn |
| BLUEPRINT: hero with inspection buttons at right | ◐ 3D and full screen work. **AR is omitted** (deferred) |
| BLUEPRINT: section indicator under the hero | ✅ Synced to the selected section |
| BLUEPRINT: section tabs, three facts, YOUR CONFIGURATION, EDIT SELECTIONS, four cards | ✅ Matches |
| BLUEPRINT: CONFIRM & SUBMIT (red) and SAVE FOR LATER (outline) | ✅ Matches |
| CTA bar (red, tracked label, long arrow) | ✅ Matches |
| Progress rail (red tick, n / 04, room, track) | ✅ Matches; the filled part is red |
| Example values ($12,000 – $18,000; 6 – 10 WEEKS; 12 PAGES; 5 FEATURES; ADVANCED) | Bound to live data. The captured run shows ADVANCED · 3 – 6 MONTHS · $17,000 – $28,000 · 7 PAGES · 4 FEATURES for ADVANCED + MODERN + SHOP + BOOKING |

### Deviations from the references

| # | Deviation | Why |
|---|---|---|
| V-1 | Shorter stage and cards on a real phone | Realistic viewport proportions (sprint §04) |
| V-2 | Live procedural object instead of a photoreal render | State-driven requirement; no matching assets exist. GA-01 to GA-08 requested |
| V-3 | No AR button | No model export pipeline (GA-09 / C-09) |
| V-4 | The inspection buttons are round, as drawn | The reference wins over the doctrine's "no circular action buttons". They are inspection affordances, not primary actions |
| V-5 | PLACE and FEEL start with nothing selected (CONTINUE disabled) | The client's first choice is explicit. The references show the selected state, which is what the screenshots capture |
| V-6 | FEEL rail scrolls to WARM and OPERATIONAL | Keeps every canonical visual system reachable (D-1) |
| V-7 | Fact captions read "Initial range. Based on your current selections and requirements." | Keeps the canonical confidence label visible (contract §18) |
| V-8 | A submission sheet asks for an email | A real guest submission needs a reply address (existing guest-access flow) |
| V-9 | The Builder uses Anton + Inter, not the site-wide Martian Mono test face | The approved references are a condensed display + grotesk, not monospace |

## 8. Functional test report

**Unit (vitest).** `src/site00/builder-studio/studioModel.test.ts`, 17 tests, all passing:

- Room → selection mapping for all paths, modules, paces and the WORLD restriction.
- The SIMPLE guard rail, open decisions and room gating.
- Draft round-trip and tampering.
- Estimator figures equal to `estimateProject`, and recalculation on change.
- The submission payload.
- Build Object composition: floors per module, material-only FEEL changes, path and pace responses.
- Forbidden client terms, including "rush" (a caught copy bug) and business-day timelines.

The Builder contract's own 23 tests and the estimator's tests also pass.

**Live browser.** `scripts/site00/builder-studio-qa/functional.cjs`, Chromium at 390×844: **47 / 47 passed**. Results: `hybrid-spatial-studio/functional-qa-results.json`. Covered:

- **Navigation and persistence:** locked deep link → PLACE; CONTINUE gating; stage arrows; back and forward keep choices; reload restore; resume at the furthest room.
- **Guard rails:** SIMPLE + SHOP decision, both NOT NOW and ADD IT; BOOKING adds without asking; COMES WITH notes; CORE PAGES expand; WORLD disables PAGES.
- **PACE:** STANDARD default; FLEXIBLE and notes persist; EXPEDITED offered and selectable only where the estimator allows.
- **Blueprint estimate:** estimator investment shown; no business-day timelines; derived build type; all five sections have content; the note is echoed; a structure change re-estimates and persists.
- **Blueprint navigation:** card navigation; EDIT SELECTIONS menu; menu navigation.
- **Save and inspect:** SAVE FOR LATER, including the estimator record; 3D toggle and drag without errors.
- **Submission:**
  - An invalid email is caught.
  - With **no backend**, the sheet reports the failure honestly and nothing is marked submitted.
  - With a **mocked API**, the exact call order is start → send-access → update → submit, and the CTA then shows SUBMITTED FOR REVIEW.
- **Start over:** clears every choice and the previous intake, so a new Blueprint becomes a new intake.
- **Accessibility and stability:** every control has an accessible name; no page errors; reduced motion renders and responds.

**Flag off.** `/bldr/builder/place` redirects to `/bldr` and the studio does not render (verified on a second dev server with no flags).

**Typecheck.** `tsc --noEmit` is clean across the repo.

**Production build.** `vite build` succeeds and `verify-production-dist` reports OK (456 JS assets).

**Full repository suite.** 829 files: 756 pass, 73 fail (116 tests). Those **same 73 files fail identically on a clean `origin/main` worktree** (`ba14bdf8`, 116 failing tests). They need Supabase credentials or network access this environment does not have. None of them involves the Builder, its routes or the estimator.

**Not verified here:**
- live submission to the real intake API (no Supabase or API credentials in this environment);
- real-device GPU performance (headless Chromium uses SwiftShader);
- Safari and iOS rendering;
- screen-reader passes beyond accessible names.

## 9. Composer dependency requests (targeted)

| ID | Request |
|---|---|
| C-01 | `builderBlueprint().complete` treats TYPE / COLOR / IMAGE / MOTION as open for a CUSTOM direction, so a custom Blueprint is never "complete". The studio's own readiness excludes them. Proposed fix: skip those lines when `expression.primary === 'CUSTOM'`. |
| C-02 | No canonical project-notes field on `BuilderSelection`. Notes travel in the studio draft inside the submission payload. Add `projectNotes` if it should be canonical. |
| C-03 | No "flexible / extended" delivery mode. FLEXIBLE maps to `CUSTOM_SCHEDULE`, estimated as standard. Confirm, or add a mode. |
| C-04 | No structure room in the approved design. The studio suggests structure (SHOP → COMMERCE, else SERVICE) and lets the client change it in the Blueprint. A canonical `suggestStructure` in `rules.ts` would be cleaner. |
| C-05 | SEO is shown as core-included (reference) but has no estimator feature. Confirm it is part of base production. |
| C-06 | ANALYTICS (`MEASURE`) is now in every studio selection (reference: core included). This adds its scope to every estimate. Confirm. |
| C-07 | Submission writes a versioned `builderStudio` key into the existing BUILDER intake `draftPayload`. Admin intake views and any synthesis should read it. Live submission is unverified. |
| C-08 | Guest submission uses `send-access` with the client's email. Confirm BUILDER guests are allowed and that the access email is sent. |
| C-09 | AR needs a `BuildComposition` → `.glb` / `.usdz` export. Deferred. |
| C-10 | `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` is off by default, so the Blueprint shows "AT REVIEW" for money until it is on. |
| C-11 | `builder` is now a reserved slug under `/bldr/`; the static route wins over `/bldr/:classSlug/*`. |
| C-12 | The draft is per device. Cross-device "save for later" needs an account-backed draft. Server drafts are not created for every visitor on purpose. |

## 10. Founder decisions

| ID | Decision |
|---|---|
| D-1 | Labels for the two extra visual systems (WARM = Soft organic, OPERATIONAL = Industrial command), or hide them |
| D-2 | Keep the round inspection buttons (as drawn) despite the doctrine line |
| D-3 | AR: defer, or prioritise GA-09 / C-09 |
| D-4 | Turn on the estimate preview flag for review builds |
| D-5 | Review and approve (or reject) the tablet and desktop compositions, which are not covered by the approvals |
| D-6 | Approve the Grok asset requests (GA-01 and GA-02 give the largest realism gain) |

## 11. Screenshots

| Set | Path |
|---|---|
| Mobile 390×844 @2x | `hybrid-spatial-studio/screenshots/mobile/{01-place-empty,01-place,02-feel,03-work,03-work-selected,04-pace,05-blueprint}.jpg` |
| Tablet 834×1194 | `hybrid-spatial-studio/screenshots/tablet/…` |
| Desktop 1440×900 | `hybrid-spatial-studio/screenshots/desktop/…` |
| Reference vs implementation | `hybrid-spatial-studio/comparisons/{room1,room2,room3,room4,blueprint}-reference-vs-implementation.jpg`, `all-five-mobile.jpg` |
| Grok handoff | `hybrid-spatial-studio/GROK_ASSET_REQUEST_MANIFEST.md` |
