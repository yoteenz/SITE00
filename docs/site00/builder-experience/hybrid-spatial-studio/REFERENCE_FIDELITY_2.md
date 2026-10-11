# Builder Hybrid Spatial Studio — Reference Fidelity 2

**Context.** After Creative Refinement 1 (PR #1528), the founder said: *"you're supposed to be copying the reference images pixel perfect so they look EXACTLY the same."*

**Decisions recorded with the founder:**
1. **Scene imagery: reference-led hybrid.**
   - The approved references are the strict visual authority.
   - Existing assets are recovered first; Grok produces the missing high-resolution plates, textures and lighting.
   - The live Three.js Build Object stays integrated in every room, with real selection-driven transformations. It is composited into photographic environments, never flattened into a static reference crop.
   - Text, navigation and controls stay live.
2. **Proportions: responsive reference fidelity.**
   - The drawn phones in the four-room reference are about 1.3× taller than a real phone.
   - Hierarchy, horizontal proportions, the architectural stage and the editorial rhythm follow the reference. Vertical geometry adapts.
   - Rooms 01–04 target one comfortable screen with CONTINUE visible, scrolling naturally only when needed (for example at larger text sizes).
   - Validated at 390×844 and 393×852, including larger text.

**Authority files:**
- `wireframes/BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg` (rooms 01–04, plus a small 05)
- `wireframes/BUILDER_APPROVED_BLUEPRINT_REVEAL.jpg` (05, highest resolution)

## 1. Typography — identified, not guessed

**Method:**
1. Cut reference text into ink masks at native resolution (adaptive threshold, neutral ink only, so the red full stop is excluded).
2. Render **24 open-licence candidate faces** (fontsource packages, used for identification only) in headless Chromium at the reference cap height.
3. Fit tracking to the reference width.
4. Score glyph-mask overlap (IoU), then stroke density, then untracked width error.
5. Confirm with side-by-side letterform sheets.

Scripts and data live in the session scratchpad; the results are below.

| Role | Reference samples | Result | Evidence |
|---|---|---|---|
| **Display headline** | "YOUR", "BLUEPRINT" (Blueprint reveal, 57–58 px tall natively) | **Oswald 600**, tracking −0.027em | Overlap alone is a near-tie: YOUR → Barlow Condensed 700 0.816 / Oswald 500 0.807; BLUEPRINT → Teko 500 0.848 / Oswald 600 0.791. Letterforms decide: the reference has a **square full stop** (Barlow Condensed's is round), a straight diagonal R leg, a narrow oval O (Saira's is squared) and a round-bottomed U. Stroke density 0.57 → Oswald 600 0.557 (500: 0.516, 700: 0.60). Untracked width error is 4.9–5.9%, with no tracking needed. The earlier Saira Semi Condensed scored 0.39 and needs −8% width. |
| **Values** (fact figures, card and option titles, CTA) | "ADVANCED", "$12,000 – $18,000", "6 – 10 WEEKS" | **Barlow Semi Condensed 700** (CTA 600), tracked 0.02–0.1em | Highest or near-highest on all three: 0.714 · 0.645 · 0.584 |
| **Wordmark** | "SITE 00" | **Barlow 700**, 0.22em | 0.816 (next Roboto 700 0.79) |
| **UI text** (lede, labels, tabs, sub-labels) | 14 samples: all six lede lines, YOUR CONFIGURATION, EDIT SELECTIONS, fact labels, tabs | **Roboto 400**, about 0.18em (lede 0.27em) | Highest mean overlap 0.430 (DM Sans 500 0.425, Inter 500 0.417, Saira Semi Condensed 500 0.415). The samples are only 7–11 px tall natively, so the margin is small. |

**Files.** All four faces are SIL OFL 1.1 and self-hosted, loaded only by the studio's lazy CSS chunk under studio-scoped family names (`BS Display / BS Value / BS Mark / BS Sans`). No external font request.

| Face | Location |
|---|---|
| Oswald 500, 600 | `public/site00/fonts/oswald/` (new) |
| Barlow 400, 500, 700 | `public/site00/fonts/barlow/` (new) |
| Barlow Semi Condensed 700 | `public/site00/fonts/barlow-semi-condensed/` (added beside the repo's existing 300–600, which are byte-identical to the same source) |
| Roboto 400, 500 | `public/site00/fonts/roboto/` (new) |

**Cap ratios measured:** Oswald 0.81 · Roboto 0.71 · Barlow / Barlow Semi Condensed 0.70.

> This supersedes Creative Refinement 1's Production-Workspace face (Saira Semi Condensed). The founder's later instruction makes the reference the authority, and the reference is not set in Saira.

## 2. Measured geometry (CSS px of a 393-wide phone)

Screen bounds come from bezel detection in the reference files: rooms 01–04 are 262–273 px wide natively, scaled ×1.44–1.50; the reveal is 634 px, scaled ×0.62. Text rows come from ink projection; components were read off a 10 px grid overlay.

| Element | Rooms 01–04 (reference → studio) | Blueprint 05 (reveal → studio) |
|---|---|---|
| Text gutter | 33 → 33 (scales to 20 on narrow screens) | 30 → 33 |
| Wordmark | cap 13 → Barlow 700 18.5px / 0.22em; BUILDER cap 8.5 → 12.5px | same |
| Room index | "01" cap 14 → Oswald 500 17.5px; label cap 9.5 → Roboto 13px | same |
| Headline | cap 44–46, pitch 51–52 → Oswald 600 `min(54px, 13.85vw)`, line-height 0.94 | cap 36, pitch 41 → `min(44.5px, 11.4vw)`, 0.92 |
| Lede | cap 9–9.4, pitch 19.4–19.6, 10.8 px per character → Roboto 13.2px / 19.6px / 0.27em, measure 318 | cap 6.8, pitch 13.8 → 10px / 13.8px / 0.21em, measure 236 |
| PLACE cards | 2×2, 20px edge, 11 / 10 gap → same | — |
| FEEL strip | four ~85px cards, 8px gap → same | — |
| PACE rows | 30px icon, title cap 12, 27px check → same (row 58px) | — |
| CTA | 340 × 48 (PACE 52), 4px radius → same | 44 high, outline twin below |
| Tabs | — | Plain words. The active tab is red with a red underline under the word; inactive tabs are one grey (numbers hidden). The reference draws PAGES a little darker than its neighbours, but that is image noise, not a state, so it is not copied. |
| Facts | — | Three columns reaching 15px from the edge, a rule between columns, a clear gutter either side. Figures cap ≈9.3px → Barlow Semi Condensed 700 at 13.2px. They stack below 360px. |
| Configuration cards | — | four across, reaching 17px from the edge (two per row below 360px) |

**Vertical fit.** The drawn phones are 1,076–1,122 CSS px tall. The studio redistributes:
- smaller stage minimums, which then fill whatever space is left;
- the stage rising behind the last lede line, as the reference objects do;
- tighter intro margins.

Measured on the live page: **every room 01–04 is exactly one screen at 390×844 and 393×852, with CONTINUE fully visible** (`creative-interactions.cjs` L-*-4).

## 3. Colour — sampled

| Swatch | Reference sample | Studio |
|---|---|---|
| Page | Blueprint reveal `#F3F1F2` → `#F8F6F7`; the four-room composite reads warmer (`#F5F2ED`–`#F9F5F2`, photographed) | `#F5F3F3`, near-neutral and faintly warm: not the rejected beige, and not CR1's cool `#F4F4F6` |
| Red | CTA `#E50107` (composite `#E70506`) | `#E50107` |
| Headline ink | `#050505` | `#0A0A0A` |

## 4. The stage — live 3D composited into photographic environments

- **Plates (interim, recovered asset).**
  - Source: SITE 00's own atrium render, `production-design-atrium-authority-v1.jpg`. Only its lower storeys are used (glass balconies and the polished floor), never the red rod or the ring ceiling.
  - Processing: defocused and lifted into the references' background band.
  - Output: five per-room plates (4–5 KB each) as a CSS layer behind a **transparent** canvas, faded into the page on all four edges.
  - Built by `scripts/site00/builder-studio-qa/build-env-plates.cjs` into `public/site00/builder-studio/env/`.
  - Grok's GA-05 replaces them.
- **Reflections.** The same render as an equirectangular reflection map (21 KB) through PMREM. The procedural `RoomEnvironment` remains the fallback. Grok's GA-01 HDRI replaces it.
- **Floor.** A shadow catcher: the plate's floor shows through, and only the object's soft shadow is drawn.
- **Materials.**
  - Carrara becomes a crack-veined procedural texture: bold angular dark veins on a mid-grey ground, as drawn.
  - New charcoal **slate** and warm **taupe marble** for the FEEL study; a grey veined **stone** for the Blueprint slabs.
  - **Option stills** (PLACE cards, FEEL strip, Blueprint configuration) render transparent and sit on the room's photographic plate, as the reference cards read. They are still live renders of each option, not photographs.
  - Glass and red acrylic carry **pane grids** (mullions, about 1.05 units per pane), matching the references' subdivided glazing. One cached grid geometry per pane count, scaled with the node, so there's no per-frame cost.
  - Thin silver glass frames; dark-red acrylic edges; drafting **hairlines**.
- **Compositions, reshaped to the references** (selection-driven transformations and their tested invariants unchanged):
  - **PLACE · SIMPLE:** a large framed glass room holding an inner glass chamber, a white partition and a **white arched wall** across the back (round arches built from piers and stepped haunches), a red acrylic volume at its front-right corner (its red runs down the slab face) and a figure, on one thick Carrara slab. The camera looks almost straight at the slab's front face (az −17°).
  - **ADVANCED / CUSTOM / WORLD:** the same slab and materials, each with its own architecture.
  - **FEEL · MODERN:** six panels hung in the air on a receding diagonal (slate, grey stone, glass, the tallest in red acrylic, glass, taupe marble) over a glass shelf, before a glass screen, with two visitors beneath.
  - **WORK:** a six-floor stacked tower of glass floors on Carrara slabs, each shifted off the one below, red acrylic inside, on a stepped base. Drafting lines run out toward the toggles, and capability modules cantilever from the tower face beside their toggle.
  - **PACE / BLUEPRINT:** a glass envelope with a tall red acrylic core and a lower red wing, glass volumes stepping down either side, and a long thick slab. The Blueprint stands grey veined stone slabs at the left; PACE has smoky glass there.

## 5. Status by area

| Area | Status | Notes |
|---|---|---|
| TYPOGRAPHY | **IMPLEMENTED · VISUALLY VERIFIED** | Identified faces, measured sizes; T01–T03 live checks |
| SPACING AND ALIGNMENT | **IMPLEMENTED · VISUALLY VERIFIED** | Horizontal geometry as measured; one screen at 390×844 / 393×852 |
| COLOR | **IMPLEMENTED · VISUALLY VERIFIED** | Sampled values |
| PLACE | **IMPLEMENTED · VISUALLY VERIFIED** · **PARTIALLY COMPLETE** | Interior arches are now built. The object is still smaller than drawn (stage 232px at 393×852 against the drawn 270px, because the real phone is shorter). Photographic glass reflections need GA-05 / GA-01. |
| FEEL | **IMPLEMENTED · VISUALLY VERIFIED** · **PARTIALLY COMPLETE** | The stone faces are procedural (GA-02 to GA-04). The FEEL card stills now sit on the photographic plate, but they are live renders, not the reference's photographs. |
| WORK | **IMPLEMENTED · VISUALLY VERIFIED** | The reference's core-pages panel shows four tiles (WEBSITE, MOBILE, SEO, ANALYTICS); the contract provides two, so two are shown — **CONTRACT BLOCKED** (not invented). |
| PACE | **IMPLEMENTED · VISUALLY VERIFIED** | Motion behaviour unchanged |
| BLUEPRINT | **IMPLEMENTED · VISUALLY VERIFIED** · AR **CONTRACT BLOCKED** | The reference's AR button is not shipped (GA-09 / no contract field). Micro-labels are floored at 7–8px for legibility. |
| MATERIALS | **IMPLEMENTED** · **PARTIALLY COMPLETE** | Photographic PBR textures are **ASSET BLOCKED** (GA-02 to GA-04, GA-08) |
| ASSET GAPS | **ASSET BLOCKED** | Interim plates and reflections come from 1 recovered asset; the final GA-05 / GA-01 must come from Grok |

**Header save chip.** The live header shows `SAVED · time`, which the reference doesn't draw. It stays because it reports the real server save state ("do not conceal unresolved integration behind fake UI").

## 6. Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| vitest (builder-experience, builder-studio, site00Intakes, builder pages) | 9 files, **114 passed** (composition invariants unchanged) |
| `vite build` | OK. `vendor` byte-identical (`vendor.D1FxG_Wm.js`); `three` lazy (533.05 kB, +3.4 kB for the stage changes) |
| `creative-interactions.cjs` (live) | **35/35**: layout at 390, 393, 834 and 1440, plus larger text 115% (339×734) and 130% (300×649); fonts loaded; tab keyboard; object focus; reduced motion; confirmation sheet; one screen with CONTINUE at 390×844 / 393×852 |
| `preview-recovery.cjs` (live) | **20/20**. Q19/Q20 now compare pixels with a tolerance instead of an exact hash. The transparent canvas over the CSS plate lets the compositor round about 0.02% of channels by ±1 between passes, so "still" means a maximum channel delta ≤ 2 (measured: 1) and "sways" means more than 1,000 channels move more than 8 levels (measured: about 55,000). The stage also reports `data-env` once its reflections are applied, and checks and captures wait for it. |
| `founder-loop.cjs` (live, client ↔ founder) | **32/32** |
| Transformation matrix | Every PLACE / FEEL / WORK / PACE / Blueprint change is visible. Every reversal returns the same frame (mean diff ≤ 0.01, i.e. compositor rounding). See `reference-fidelity-qa/matrix/`. |

**Evidence** in `hybrid-spatial-studio/reference-fidelity-qa/`:

| Folder | Contents |
|---|---|
| `overlays/` | Reference · live · 50% overlay per room at 393×852 |
| `stages/` | Reference stage beside the live stage |
| `after/` | Full capture set: mobile journey, 393, tablet, desktop |
| `matrix/` | Every selection and its reversal |
| `regression/` | Results JSON |
