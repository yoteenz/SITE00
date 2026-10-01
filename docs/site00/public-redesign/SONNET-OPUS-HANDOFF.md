# SONNET → OPUS HANDOFF

**SONNET STRUCTURE COMPLETE** (37/37 active authorities live, routed, interactive, uppercase, responsive).
**OPUS PIXEL CONVERGENCE REQUIRED** (37/37 are PARTIAL against their authority — see `SONNET-VISUAL-QA.md`).

Opus receives the same authority pack. Mandate: visual convergence, not product reinvention.

## What is locked (do not undo)

- **IDNTY continuity:** hero, machine, 00–03 rail, shell stay mounted; only the lower panel transforms (detail → question → review). One component (`IdentityDiagnosticFlow`) is rendered for every segment of `/idnty/:state/*`. Do not split it per page.
- **One progress rail.** Question progress is the compact counter + 3–4 segments inside the panel.
- **Honest Build Ready.** No "verified", no "ESTABLISHED", no BLDR unlock, no percentages. The authority image says otherwise on three screens — see *Deviations* below.
- **Uppercase** is a CSS contract on `.s00pr` (typed content excepted). Don't title-case anything.
- **Assets are slots.** Don't paint plates/art in CSS; leave `AssetSlot` mounts. Grok injects by URL.
- Desktop branches are preserved legacy; do not redesign desktop from these mobile authorities.

## Component map

| Layer | Files (`src/site00/components/public-redesign/`) |
|---|---|
| Shell | `PublicRedesignShell` · `PublicTechnicalHeader` · `SpatialEnvironmentFrame` · `AssetSlot` |
| IDNTY | `IdentityDiagnosticFlow` (detail/question/review) · `IdentityDiagnosticOverview` · `IdentityDiagnosticChrome` (hero, stage, rail, `TransformingStatePanel`) · `IdentityMachines` · `TechnicalControls` · `PanelActions` · `IdentityReviewSummary` · `BuildReadyVerification` · `PublicLineIcon` |
| Origin | `PublicOrigin` (`PublicOriginMobile`, `PublicOriginExpandedPanel`) |
| BLDR / EVOLVE | `PublicServiceLayouts` (`PublicServiceCenter`, `PublicServicePathPanel`) · `PublicServicePages` (`BuilderStateExperience`, `EvolveStateExperience`) · `ServiceMachines` |
| Locations | `PublicLocationsDirectory` |
| Config / data | `config/idnty-public-redesign.ts` · `config/public-redesign-content.ts` · `lib/identityAuthorityVerification.ts` |
| Authority metadata | `src/site00/authority/publicRedesignAuthorityManifest.ts` · `publicRedesignAssetSlots.ts` |
| Styles | `site00-public-redesign.css` · `-origin.css` · `-services.css` |

Dev-only authority badge: append `?authority=1` in `vite dev` to see the current authority id / route / status (compiled out of production).

## Route-by-route refinement queue

1. **Shared geometry first (fixes ~25 screens at once)** — IDNTY family chrome: hero type scale + column width, machine size/placement, progression rail, panel header grid, nav label scale, header glyph. One change in `site00-public-redesign.css` / `IdentityDiagnosticChrome.tsx` cascades to every IDNTY screen.
2. **IDNTY working surfaces** — Tile/card/row heights and icon art, textarea metrics, footer action row so CONTINUE is above the fold at 390×693.
3. **IDNTY machines** — Material/node density/bloom for the four SVG machines; REFINE gap callouts; EVOLUTION area brackets (annotation layers).
4. **Origin (4 screens)** — Hero wordmark, card height, glass panel tint/blur, side notes — after plates load (needs a connected build).
5. **BLDR + EVOLVE centers** — Hero/machine overlap, card art slots, 4-up vs 2×2 decision.
6. **BLDR + EVOLVE path panels** — Panel head grid (title/art/side-note), framework glyph scale, EVOLVE three-column lists.
7. **Locations** — Row height, thumbnail fade, ghost 00 / CONTINUE EXPLORING footer.

## Per-authority handoff

### 1. `01_ORIGIN_MAIN`
- **Route:** `/`  ·  **Component:** `PublicOriginMobile`
- **Current render:** `sonnet-proof/01_ORIGIN_MAIN/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.ORIGIN.COLLAPSED`, `CARD.ORIGIN.IDNTY`, `CARD.ORIGIN.BLDR`, `CARD.ORIGIN.EVOLVE`
- **Structural questions:** Should the preview Mobile/Desktop toggle (existing founder control) stay visible over the Origin header? It is hidden in proof captures only.
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Card tap expands; swipe-up/SWIPE UP TO ENTER → /origin/locations transition preserved; ENTER SITE 00 (/enter) link no longer on the mobile Origin (authority has none).

### 2. `02_ORIGIN_IDNTY_EXPANDED`
- **Route:** `/`  ·  **Component:** `PublicOriginExpandedPanel`
- **Current render:** `sonnet-proof/02_ORIGIN_IDNTY_EXPANDED/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.IDENTITY`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** CLOSE / BACK collapse; BEGIN IDENTITY → /idnty/state.

### 3. `03_ORIGIN_BLDR_EXPANDED`
- **Route:** `/`  ·  **Component:** `PublicOriginExpandedPanel`
- **Current render:** `sonnet-proof/03_ORIGIN_BLDR_EXPANDED/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 2 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.BLDR`
- **Structural questions:** Panel title reads BUILDER per authority; card/CTA still say BLDR. Confirm intended naming.
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** BEGIN BLDR → /bldr/state (command center).

### 4. `04_ORIGIN_EVOLVE_EXPANDED`
- **Route:** `/`  ·  **Component:** `PublicOriginExpandedPanel`
- **Current render:** `sonnet-proof/04_ORIGIN_EVOLVE_EXPANDED/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 2 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.ORIGIN.EXPANDED`, `ILLUSTRATION.ORIGIN.EVOLVE`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.REFINE`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.INSTALL`, `ILLUSTRATION.ORIGIN.EVOLVE_PATH.TRANSFORM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** START EVOLVE → /evolve/state; HOW IT WORKS → /evolve (existing secondary action kept as a small link).

### 5. `01_IDNTY_DIAGNOSTIC_OVERVIEW`
- **Route:** `/idnty/state`  ·  **Component:** `IdentityDiagnosticOverview`
- **Current render:** `sonnet-proof/01_IDNTY_DIAGNOSTIC_OVERVIEW/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** Is a 2×2 mobile grid acceptable, or should the four cards scroll horizontally to keep one row?
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Default highlight is 00 (visual only; context stays unselected until a tap). Resume banner preserved.

### 6. `02_IDNTY_STATE_00_FOUNDATION`
- **Route:** `/idnty/starting-at-zero`  ·  **Component:** `IdentityDiagnosticFlow(mode=detail)`
- **Current render:** `sonnet-proof/02_IDNTY_STATE_00_FOUNDATION/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.FOUNDATION.ORB`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 7. `03_IDNTY_STATE_01_REFINE`
- **Route:** `/idnty/some-pieces-exist`  ·  **Component:** `IdentityDiagnosticFlow(mode=detail)`
- **Current render:** `sonnet-proof/03_IDNTY_STATE_01_REFINE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.PARTIAL.LATTICE`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 8. `04_IDNTY_STATE_02_EVOLUTION`
- **Route:** `/idnty/ready-for-evolution`  ·  **Component:** `IdentityDiagnosticFlow(mode=detail)`
- **Current render:** `sonnet-proof/04_IDNTY_STATE_02_EVOLUTION/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.EVOLUTION.WAVES`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 9. `05_IDNTY_STATE_03_BUILD_READY`
- **Route:** `/idnty/build-ready`  ·  **Component:** `IdentityDiagnosticFlow(mode=detail)`
- **Current render:** `sonnet-proof/05_IDNTY_STATE_03_BUILD_READY/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.AUTHORITY.STAR`
- **Structural questions:** Founder to confirm the honest copy for State 03 (and the CTA label) before Opus converges this screen.
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 10. `01_FOUNDATION_PRIMARY_GOAL`
- **Route:** `/idnty/starting-at-zero/goal`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/01_FOUNDATION_PRIMARY_GOAL/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 6 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.FOUNDATION.ORB`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Single-select (radio semantics); legacy multi-value goal answers display the first value.

### 11. `02_FOUNDATION_AUDIENCE`
- **Route:** `/idnty/starting-at-zero/audience`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/02_FOUNDATION_AUDIENCE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 12. `03_FOUNDATION_TIMELINE`
- **Route:** `/idnty/starting-at-zero/timeline`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/03_FOUNDATION_TIMELINE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 13. `04_FOUNDATION_BUDGET`
- **Route:** `/idnty/starting-at-zero/budget`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/04_FOUNDATION_BUDGET/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 14. `05_FOUNDATION_REVIEW`
- **Route:** `/idnty/starting-at-zero/review`  ·  **Component:** `IdentityDiagnosticFlow(mode=review)`
- **Current render:** `sonnet-proof/05_FOUNDATION_REVIEW/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** SUBMIT IDENTITY ASSESSMENT now submits via the existing endpoint; incomplete → routes to first missing question; failure stays on review.

### 15. `01_REFINE_EXISTING_ASSETS`
- **Route:** `/idnty/some-pieces-exist/assets`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/01_REFINE_EXISTING_ASSETS/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.PARTIAL.LATTICE`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 16. `02_REFINE_CONDITION`
- **Route:** `/idnty/some-pieces-exist/cohesion-diagnostic`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/02_REFINE_CONDITION/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 17. `03_REFINE_GAPS`
- **Route:** `/idnty/some-pieces-exist/gaps`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/03_REFINE_GAPS/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 18. `04_REFINE_REVIEW`
- **Route:** `/idnty/some-pieces-exist/review`  ·  **Component:** `IdentityDiagnosticFlow(mode=review)`
- **Current render:** `sonnet-proof/04_REFINE_REVIEW/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 19. `01_EVOLUTION_AREAS`
- **Route:** `/idnty/ready-for-evolution/pathways`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/01_EVOLUTION_AREAS/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.EVOLUTION.WAVES`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 20. `02_EVOLUTION_GOALS`
- **Route:** `/idnty/ready-for-evolution/goals`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/02_EVOLUTION_GOALS/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 21. `03_EVOLUTION_TIMELINE`
- **Route:** `/idnty/ready-for-evolution/timeline`  ·  **Component:** `IdentityDiagnosticFlow(mode=question)`
- **Current render:** `sonnet-proof/03_EVOLUTION_TIMELINE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 22. `04_EVOLUTION_REVIEW`
- **Route:** `/idnty/ready-for-evolution/review`  ·  **Component:** `IdentityDiagnosticFlow(mode=review)`
- **Current render:** `sonnet-proof/04_EVOLUTION_REVIEW/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 23. `01_BUILD_READY_VERIFICATION`
- **Route:** `/idnty/build-ready/verification`  ·  **Component:** `IdentityDiagnosticFlow(mode=question) + BuildReadyVerificationList`
- **Current render:** `sonnet-proof/01_BUILD_READY_VERIFICATION/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`, `MACHINE.IDNTY.AUTHORITY.STAR`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 24. `02_BUILD_READY_EVIDENCE`
- **Route:** `/idnty/build-ready/evidence`  ·  **Component:** `IdentityDiagnosticFlow(mode=question) + BuildReadyEvidenceList`
- **Current render:** `sonnet-proof/02_BUILD_READY_EVIDENCE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 25. `03_BUILD_READY_AUTHORITY_CHECK`
- **Route:** `/idnty/build-ready/authority-check`  ·  **Component:** `IdentityDiagnosticFlow(mode=question) + BuildReadyAuthorityCheckList`
- **Current render:** `sonnet-proof/03_BUILD_READY_AUTHORITY_CHECK/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 26. `04_BUILD_READY_REVIEW_VERIFICATION`
- **Route:** `/idnty/build-ready/review`  ·  **Component:** `IdentityDiagnosticFlow(mode=review) + BuildReadyReview`
- **Current render:** `sonnet-proof/04_BUILD_READY_REVIEW_VERIFICATION/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.IDNTY.ATRIUM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** SUBMIT FOR VERIFICATION reports "not available yet" — never navigates, never fakes success.

### 27. `01_BLDR_COMMAND_CENTER`
- **Route:** `/bldr/state`  ·  **Component:** `BuilderCommandCenter`
- **Current render:** `sonnet-proof/01_BLDR_COMMAND_CENTER/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.BLDR.COMMAND_CENTER`, `MACHINE.BLDR.TOWER`, `CARD.BLDR.PATH.SITE`, `CARD.BLDR.PATH.WORLD`, `CARD.BLDR.PATH.SYSTEMS`, `CARD.BLDR.PATH.EXTENSIONS`
- **Structural questions:** STRUCTURAL: authority paths SITE/WORLD/SYSTEMS/EXTENSIONS vs current classes SITE/WORLD/ENTERPRISE/NOT SURE. SYSTEMS → enterprise; EXTENSIONS → discovery. Does EXTENSIONS need its own build class/assessment?
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 28. `02_BLDR_OVERVIEW`
- **Route:** `/bldr/state?path=overview`  ·  **Component:** `BuilderPathPanel`
- **Current render:** `sonnet-proof/02_BLDR_OVERVIEW/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 4 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.BLDR.PATH.OVERVIEW`, `ILLUSTRATION.BLDR.PATH.PANEL.OVERVIEW`, `ILLUSTRATION.BLDR.FRAMEWORK.STEP`
- **Structural questions:** Authority numbering: Overview 02.01 and path 1/4 both; SITE is "02" with CLOSE. Reproduced as drawn — confirm intended numbering.
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 29. `03_BLDR_SITE`
- **Route:** `/bldr/state?path=site`  ·  **Component:** `BuilderPathPanel`
- **Current render:** `sonnet-proof/03_BLDR_SITE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.BLDR.PATH.SITE`, `ILLUSTRATION.BLDR.PATH.PANEL.SITE`, `ILLUSTRATION.BLDR.FRAMEWORK.STEP`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 30. `04_BLDR_WORLD`
- **Route:** `/bldr/state?path=world`  ·  **Component:** `BuilderPathPanel`
- **Current render:** `sonnet-proof/04_BLDR_WORLD/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.BLDR.PATH.WORLD`, `ILLUSTRATION.BLDR.PATH.PANEL.WORLD`, `ILLUSTRATION.BLDR.FRAMEWORK.STEP`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 31. `05_BLDR_SYSTEMS`
- **Route:** `/bldr/state?path=systems`  ·  **Component:** `BuilderPathPanel`
- **Current render:** `sonnet-proof/05_BLDR_SYSTEMS/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.BLDR.PATH.SYSTEMS`, `ILLUSTRATION.BLDR.PATH.PANEL.SYSTEMS`, `ILLUSTRATION.BLDR.FRAMEWORK.STEP`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 32. `06_BLDR_EXTENSIONS`
- **Route:** `/bldr/state?path=extensions`  ·  **Component:** `BuilderPathPanel`
- **Current render:** `sonnet-proof/06_BLDR_EXTENSIONS/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.BLDR.PATH.EXTENSIONS`, `ILLUSTRATION.BLDR.PATH.PANEL.EXTENSIONS`, `ILLUSTRATION.BLDR.FRAMEWORK.STEP`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 33. `01_EVOLVE_INTERVENTION_CENTER`
- **Route:** `/evolve/state`  ·  **Component:** `EvolveInterventionCenter`
- **Current render:** `sonnet-proof/01_EVOLVE_INTERVENTION_CENTER/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.EVOLVE.INTERVENTION_CENTER`, `MACHINE.EVOLVE.PROPERTY_TOWER`, `CARD.EVOLVE.PATH.REFINE`, `CARD.EVOLVE.PATH.INSTALL`, `CARD.EVOLVE.PATH.TRANSFORM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 34. `02_EVOLVE_REFINE`
- **Route:** `/evolve/state?path=refine`  ·  **Component:** `EvolvePathPanel`
- **Current render:** `sonnet-proof/02_EVOLVE_REFINE/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.EVOLVE.PATH.REFINE`, `ILLUSTRATION.EVOLVE.PATH.PANEL.REFINE`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 35. `03_EVOLVE_INSTALL`
- **Route:** `/evolve/state?path=install`  ·  **Component:** `EvolvePathPanel`
- **Current render:** `sonnet-proof/03_EVOLVE_INSTALL/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.EVOLVE.PATH.INSTALL`, `ILLUSTRATION.EVOLVE.PATH.PANEL.INSTALL`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 36. `04_EVOLVE_TRANSFORM`
- **Route:** `/evolve/state?path=transform`  ·  **Component:** `EvolvePathPanel`
- **Current render:** `sonnet-proof/04_EVOLVE_TRANSFORM/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 3 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.EVOLVE.PATH.TRANSFORM`, `ILLUSTRATION.EVOLVE.PATH.PANEL.TRANSFORM`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

### 37. `01_LOCATIONS_MAIN`
- **Route:** `/origin/locations`  ·  **Component:** `PublicLocationsDirectory`
- **Current render:** `sonnet-proof/01_LOCATIONS_MAIN/render.jpg` (+ `render-full.jpg`) vs `authority.jpg`
- **Visual status:** PARTIAL — **SONNET STRUCTURE COMPLETE / OPUS PIXEL CONVERGENCE REQUIRED**
- **Known mismatches:** 5 (see `comparison-notes.md`)
- **Asset placeholders:** `ENV.LOCATIONS.ARCH`, `CARD.LOCATIONS.BLDR`, `CARD.LOCATIONS.EVOLVE`, `CARD.LOCATIONS.SITES`, `CARD.LOCATIONS.SERVICES`, `CARD.LOCATIONS.SYSTEM`, `CARD.LOCATIONS.ABOUT`, `CARD.LOCATIONS.JOURNAL`
- **Structural questions:** none
- **Responsive notes:** No overflow at 360/390/430; footer actions below the fold at 390×693 (authority framing).
- **Functional notes:** Function preserved (see route map).

## Deviations from the authority images (intentional — founder decision needed)

1. **State 03 detail** (`05_IDNTY_STATE_03_BUILD_READY`): image says "locked and verified … ENTER BLDR"; implemented as honest verification copy + **BEGIN VERIFICATION**.
2. **Build Ready authority check** (`03_…`): image shows **AUTHORITY ESTABLISHED** + "SITE 00 HAS REVIEWED"; implemented as **PENDING REVIEW / GAP IDENTIFIED / REVIEW REQUIRED** + provisional disclaimer.
3. **Header nav links** CHARACTERS / WORLDS / LIBRARY omitted (no routes; Origin = IDNTY / BLDR / EVOLVE only). SEARCH omitted (no capability).
4. **EVOLVE center nav bay:** authority highlights IDNTY on an EVOLVE page; implemented as a contextual EVOLVE bay (BLDR pages: BUILDER).
5. **Textarea 16px on touch** (iOS zoom guard).
6. **Locations:** SYSTEM / ABOUT numbered 05/06 (authority repeats 05); YOUR SPACE section kept.

## Structural questions for the founder

- BLDR: should **EXTENSIONS** become a real build class/assessment? Today SYSTEMS → `enterprise`, EXTENSIONS → `/bldr/not-sure`.
- BLDR panel numbering as drawn (02 / 02.01 / 02.02 …) is internally inconsistent; reproduced verbatim.
- Overview cards: 2×2 on mobile vs horizontally scrolling single row.
- `TERMS` / `PRIVACY` footer items have no destination yet.

## Grok handoff (asset slots only — NO generation performed)

52 stable slots in `SONNET-ASSET-SLOT-MANIFEST.json` (33 required for fidelity; 52 Grok-required; 19 could be replaced by SVG/CSS). Register URLs in `PUBLIC_REDESIGN_ASSET_URLS`.

## Composer blockers (backend / productionization)

See the final receipt §AB: identity-authority verification backend (snapshot read + submit-for-verification + evidence storage), BLDR unlock authority, EXTENSIONS class, pricing source for BLDR/EVOLVE panels, server confirmation semantics of `submit` (lifecycle/commercial activation) for IDNTY branches.
