# Build Object transformation matrix — Creative Refinement 1

**Sprint:** `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-OPUS-CREATIVE-FIDELITY-AND-INTERACTION-REFINEMENT1`
**Code:** `src/site00/builder-studio/buildObject/composition.ts` (pure configuration → elements) · `engine.ts` (renderer)

**Evidence:**
- `creative-refinement-qa/matrix/` holds a live capture per selection, reversal captures, pace-motion frames and `matrix-diff.json`.
- `buildObject/composition.test.ts` holds 17 unit tests.

Every room's Build Object is **composed from the client's choices**, so a selection changes the architecture itself. The sprint ruled out these shortcuts, and none is used:
- rescaling one model
- changing opacity globally
- raising height generically
- repeating one animation
- arbitrary colours
- random geometry

## Reference Fidelity 2 update

The compositions were reshaped to the approved references; the selection logic and every tested invariant are unchanged. The stage is now composited: a transparent live canvas over a photographic plate, with reflections, a shadow-catcher floor, crack-veined Carrara and pane grids. See `REFERENCE_FIDELITY_2.md`.

| Room | Reference form now built |
|---|---|
| PLACE | One thick Carrara slab under every path (was a stepped plinth). SIMPLE is the reference pavilion: a large framed glass room, an inner glass chamber, a white partition, and a red acrylic volume at the front-right corner running down the slab face. The camera looks almost straight at the slab (az −17°, el 11°). |
| FEEL · MODERN | Six panels hung in the air on a receding diagonal (slate, grey stone, glass, the tallest in red acrylic, glass, taupe marble) over a glass shelf, before a glass screen, two visitors beneath (az −6°, el 2°). BOLD, EDITORIAL and IMMERSIVE keep their own architectures. |
| WORK | A six-floor stacked tower: glass floors on Carrara slabs, each shifted off the one below, a red shaft, a red room and a red slab inside, on a stepped base. Drafting hairlines (excluded from camera framing) run out toward the toggles. Modules cantilever from the tower face at their toggle's level (top · middle · ground). |
| PACE | A glass envelope with a tall red acrylic core and a lower red wing, stepped glass side volumes (one per capability + 2), smoky glass masses at the left, on a long slab |
| BLUEPRINT | The PACE structure at reveal scale, with **grey veined stone slabs** standing at the left (as drawn) |

**Measured diffs** (live, 390×844, `reference-fidelity-qa/matrix/matrix-diff.json`):

| Room | Pair | Mean diff |
|---|---|---|
| PLACE | SIMPLE → ADVANCED → CUSTOM → WORLD | 30.9 · 23.8 · 22.6 (SIMPLE ↔ WORLD 33.2) |
| FEEL | pairs | 26.9–48.0 |
| WORK | +BLOG / +SHOP / +MEMBER AREA / +BOOKING / +PORTAL | 12.8 / 18.9 / 20.3 / 4.1 / 27.5 |
| PACE | STANDARD → FLEXIBLE / → EXPEDITED | 13.8 / 3.6 (EXPEDITED adds only flat steel marks) |
| BLUEPRINT | OVERVIEW → STRUCTURE / PAGES / FEATURES | 17.3 / 22.0 / 9.6 |

Every reversal returns the same frame (mean diff 0–0.01; anything above 0 is compositor rounding of the transparent canvas over its plate).

**Element counts:** PLACE 7–14 · FEEL 9–20 · WORK 25–65 (tower 25 with drafting lines; all six modules 65) · PACE 15–21 · Blueprint up to 28.

The sections below describe the Creative Refinement 1 grammar these forms grew from. Where they differ, this update is current.

## Shared mechanics

| Aspect | How it works |
|---|---|
| **Diffing** | Elements carry stable ids. On a change the engine **adds** new ids (entering), **tweens** persisting ids to their new size, position and material, and **removes** missing ids (collapse, ≤ 520 ms). |
| **Geometry cost** | One shared unit `BoxGeometry` and one shared `EdgesGeometry` (`engine.ts`). Each element is a transform of the unit box. Materials are created once per stage. **No geometry or material is created on a state update**: only meshes are added or removed. |
| **Motion** | Each composition carries `motion {duration, stagger, entry, replay}`. Each element may carry `seq` (assembly order); its entry delay = `seq × stagger`. |
| **Reduced motion** | `prefers-reduced-motion: reduce` snaps to the final state: no tween, no stagger, no idle sway, no tab reveal. Live-tested by `preview-recovery.cjs` Q19/Q20 and `creative-interactions.cjs` R01. |
| **Reversal** | Compositions are pure functions of the selection, so choosing A → B → A returns exactly A. Proven by unit test (`toEqual`) and live pixel diff = 0 (PLACE, every WORK module). |
| **Accessibility** | The object is a labelled image (`role="img"`, with an `aria-label` from `objectDescription()` naming the current structure). Every change is also stated in text: the selection label and descriptor (FEEL caption is `aria-live`), the WORK toggle states (`aria-pressed`), the PACE radio rows, and the Blueprint `bs-mode` line (`aria-live="polite"`). Inspect and fullscreen are real labelled buttons. |
| **Colour rule** | Red (`red`, `redSolid`) is reserved for the client's **capabilities and the core**. Structure is glass, stone and marble. Pacing marks are steel. |

Mean diff (below) is the mean absolute per-channel difference between two 195×160 stage captures (0–255), taken with `transformation-matrix.cjs` at 390×844. Values above ~2 are visible on a phone.

---

## 01 PLACE: a different site, not a bigger one

| Selection | Geometry (module) | Materials | Camera / light | Elements | Animation |
|---|---|---|---|---|---|
| **SIMPLE** | One pavilion: a single glass volume with an inner partition. Two stone walls. A red core plane and a return. | Glass, stone, red (MODERN default) | Fitted, az −30° / el 9° | 9 | Persisting ids tween; new ids grow from their base (760 ms) |
| **ADVANCED** | An established system reshaped: two interlocking volumes, a glass deck between them, a red spine through both (core + core-2) tied by a red beam, a stone wall, a figure on the deck | Glass, stone, red | Same | 11 | Same |
| **CUSTOM** | From first principles: three volumes **rotated** off-grid (0.18 / −0.36 / 0.52 rad) with a cantilevered upper volume and a red **halo frame** held in the air | Glass, stone, red | Same | 13 | Same |
| **WORLD** | A connected environment: a wider campus plinth, four pavilions, a red tower, three glass **bridges**, a ground path, three figures | Glass, stone, red | Distance +1.6 for the campus | 15 | Same |

**Reversal:** SIMPLE → … → SIMPLE is pixel-identical (diff 0).

**Measured diffs:**
| From → to | Mean diff |
|---|---|
| SIMPLE → ADVANCED | 12.9 |
| ADVANCED → CUSTOM | 12.5 |
| CUSTOM → WORLD | 11.2 |
| SIMPLE → WORLD | 16.4 |

**Evidence:** `matrix/matrix-place.jpg`, `comparisons/before-after-place.jpg`.

## 02 FEEL: an architectural direction, not a palette swap

Each direction has its **own composition, its own element set and its own camera**. The unit test asserts four distinct geometries, four distinct id sets, and more than one camera.

| Selection | Composition grammar | Materials | Camera | Elements |
|---|---|---|---|---|
| **MODERN** | Controlled geometry: six parallel plates fanned at **one strict interval** on a common lifted datum, with plinth, datum and plate line all parallel. One red plate. | Concrete, glass, stone, **red**, glass, Carrara | az −16° / el 6° | 11 |
| **BOLD** | Sculptural contrast: three **solid red monoliths** of falling height, a **cantilevered red slab** across them, a nero marble mass, one glass fin | Solid red, nero, glass, concrete | az −26° / el 9° (lower, heroic) | 9 |
| **EDITORIAL** | Layered planes: an asymmetric spread of thin panels at different depths, a fine red **rule**, two steel **picture frames** | Carrara, glass, stone, red, steel | az −6° / el 4° (frontal, page-like) | 17 |
| **IMMERSIVE** | Spatial enclosure: a **passage** of four portal gates receding into depth, tinted glass walls, a ceiling plane, a red light plate at the end of the passage, a nero runner | Tinted glass, nero, red, steel | az −32° / el 7° (into the passage) | 20 |

**Animation:** 820 ms per element, 30 ms stagger, entering from the base. The direction change reads as the room rebuilding.

**Measured diffs:**
| Pair | Mean diff |
|---|---|
| MODERN ↔ BOLD | 37.3 |
| MODERN ↔ EDITORIAL | 14.4 |
| MODERN ↔ IMMERSIVE | 40.7 |
| BOLD ↔ EDITORIAL | 41.2 |
| BOLD ↔ IMMERSIVE | 38.6 |
| EDITORIAL ↔ IMMERSIVE | 44.2 |

The lowest pair (MODERN ↔ EDITORIAL) is still a different structure: a strict fan against a layered spread with frames.

**Evidence:** `matrix/matrix-feel.jpg`, `comparisons/before-after-feel.jpg`, `comparisons/reference-before-after-feel.jpg`.

## 03 WORK: each capability adds its own module, where its toggle sits

The base is a four-floor glass core tower with stone slabs and a red core shaft. **PAGES is on by default** (the contract's `emptySpatialState()`); every other capability starts off. Modules are **visual metaphors** for what a capability adds to the place, not literal backend functions. No module implies an unsupported feature.

| Capability | Module (where) | Geometry | Materials | Elements added | Animation |
|---|---|---|---|---|---|
| **PAGES** | Upper left (level 2) | Four stacked floor plates cantilevered from a spine (spatial divisions); the top plate is red | Glass, stone, red | 5 | Slides in laterally, 620 ms, 60 ms stagger by `seq` |
| **BLOG** | Upper right (level 2) | An editorial rack: a ledge with six marble leaves of falling height, the newest red | Stone, Carrara, red | 7 | Same |
| **SHOP** | Middle left (level 1) | A display gallery: a glass vitrine on a stone base, three red objects inside | Stone, glass, red | 5 | Same |
| **MEMBER AREA** | Middle right (level 1) | An enclosed chamber: a closed dark-glass room with a red door portal (entry by invitation) | Dark glass, red | 4 | Same |
| **BOOKING** | Ground left | Timed access: a double colonnade of eight marble posts under a red lintel, on a red floor strip | Carrara, red | 10 | Same |
| **PORTAL** | Ground right | A deeper threshold: three frames receding into the base, the first red | Red, steel | 9 | Same |

**Reversal:** adding then removing each module returns a pixel-identical stage (diff 0 for all five), and the unit test asserts `toEqual`.

**Measured diffs (default → +module):**
| Module | Mean diff |
|---|---|
| BLOG | 2.0 |
| SHOP | 6.3 |
| MEMBER AREA | 9.0 |
| BOOKING | 2.6 |
| PORTAL | 8.1 |
| PAGES (off → on, with BLOG) | 2.2 |

BLOG, BOOKING and PAGES are thin-element modules (leaves, posts, plates): clearly visible on the phone (see `matrix-work.jpg`) but low in mean diff.

**All six on:** 52 elements (the heaviest composition), with shared geometry.

**Evidence:** `matrix/matrix-work.jpg`, `comparisons/before-after-work-pace.jpg`.

## 04 PACE: how the structure assembles, not what it contains

Visual pacing is **separate from commercial duration**: no timeline figure is computed or shown from motion. The estimator alone decides whether EXPEDITED is offered. It is disabled with the estimator's reason when priority would not shorten the scope.

| Pace | Motion (`PACE_MOTION`) | Static difference | Must not imply |
|---|---|---|---|
| **STANDARD** | Measured progression: 620 ms per element, **85 ms stagger**, rising from the base, floor by floor | Baseline: core, side volumes (one per capability + 2), masses | — |
| **EXPEDITED** | Immediate assembly: **340 ms**, **12 ms stagger**, settling **from above** almost together | Thin **steel sequencing caps** (0.03 tall) on each volume and over the core. **No added volume, no size change, no added red.** | More product. Unit test: extra elements are only `-mark`s ≤ 0.05 tall, never red, red count unchanged, every shared element keeps its size. |
| **FLEXIBLE** | Modular: **860 ms**, **105 ms stagger**, parts **slide in laterally** | The same volumes **spread** (×1.2), with a steel **joint** where each meets the plinth (parts that can move) | Unit test: same volume ids, wider spread, joints present |

Every pace **replays** the whole assembly when chosen, so the rhythm itself is the visualization.

**Measured diffs:**
| From → to | Mean diff |
|---|---|
| STANDARD → FLEXIBLE | 9.8 |
| STANDARD → EXPEDITED | 4.7 |
| EXPEDITED → FLEXIBLE | 12.4 |

These are measured on ADVANCED + PAGES + SHOP + PORTAL, a scope where the estimator offers priority.

**Motion evidence:** `matrix/matrix-pace-motion.jpg` shows frames at 180 ms and 520 ms after choosing, motion on. Rows are FLEXIBLE, EXPEDITED and STANDARD:
- FLEXIBLE: parts mid-slide at 180 ms.
- EXPEDITED: complete at 180 ms.
- STANDARD: still rising at 180 ms.

## 05 BLUEPRINT: sections re-light the same structure

The resolved structure is the PACE assembly at Blueprint scale, plus a second figure. Each section is an **inspection focus** on the **same** elements: the unit test asserts identical geometry across all five sections. Only materials change, tweened over 520 ms.

| Section | What comes forward | What steps back | Measured diff vs OVERVIEW |
|---|---|---|---|
| **OVERVIEW** | Everything | — | — |
| **STRUCTURE** | Volumes and masses (glass lifted to tinted glass) | Red core and modules → **ghost** (white, 5% opacity, faint edges) | 10.2 |
| **PAGES** | Side volumes and pavilions (one per page group) | Core, masses, modules → ghost | 10.9 |
| **FEATURES** | Only the red core and capability modules | All structure → ghost | 3.5 (the red was already dominant; the change is the structure vanishing) |
| **TIMELINE** | Everything | — (the assembly **replays at the client's pace**) | motion |

The focus is part of the composition key (`…|STRUCTURE`), so the engine treats it as a re-light, not a rebuild. Returning to OVERVIEW restores the overview composition (live check F03).

**Evidence:** `matrix/matrix-blueprint.jpg`, `comparisons/before-after-blueprint-tabs.jpg`.

## Performance

| Item | Value |
|---|---|
| Elements per composition | PLACE 7–14 · FEEL 9–20 · WORK 25–65 · PACE 15–21 · BLUEPRINT up to 28 (Reference Fidelity 2) |
| Draw calls | ≤ 3 per element (mesh; edge lines; pane grid on glass and acrylic; framed glass and acrylic add 12 instanced-geometry frame members), so about 200 at the WORK maximum |
| Textures | Procedural canvases created once per stage (Carrara 1024²; slate and taupe 512²), plus the 21 KB reflection map, loaded once. Stage plates are CSS images (4–5 KB each). Pane grids use one cached geometry per pane count, so there's no per-frame geometry work. |
| Bundle | `three` chunk 533.05 kB (133.82 kB gzip), lazy. `vendor` chunk unchanged (`vendor.D1FxG_Wm.js` 461.02 kB, identical hash). |
| Devices | Verified in headless Chromium (SwiftShader) at 390, 393, 834 and 1440 widths. **Not yet verified on a real phone.** See the known limitations in `CREATIVE_REFINEMENT_1.md`. |
