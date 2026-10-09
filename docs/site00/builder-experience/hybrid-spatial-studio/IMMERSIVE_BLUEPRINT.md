# Immersive Blueprint

**Sprint:** `P0.SITE00.BLDR.BLUEPRINT.V1-IMMERSIVE-TAB-BEHAVIOR-AND-SPATIAL-INFORMATION-RECOVERY1` · Opus · founder-directed creative recovery.

> THE BLUEPRINT IS NOT A DOCUMENT DRAWER. IT IS AN INTERACTIVE ARCHITECTURAL EXPLORATION OF THE CLIENT'S PROPOSED
> DIGITAL LOCATION.

## Result in one paragraph

Every Blueprint section is now an inspection mode of the live Build Object:
- **OVERVIEW** is the whole place.
- **STRUCTURE** opens the model into its layers (an exploded axonometric) and lights the layer a Blueprint line actually drives.
- **PAGES** lights the volume each page lives in.
- **FEATURES** finds the module each capability belongs to, with its relationships.
- **TIMELINE** assembles the model stage by stage.

A selection lights its part in SITE 00 red, dims the rest to a glass outline, turns and moves the camera toward it, and pins a callout with a red leader to the model. Every selection is reversible.

All bindings come from the canonical contracts and the Builder registry (`buildObject/anatomy.ts`). When a line has no geometry, the panel says **NOT DRAWN IN THE MODEL** instead of pretending.

Estimates, persistence, submission, review states and auth are untouched.

## Before → after

The forensic record of the old behaviour, with measurements and the behaviour matrix, is in `SPATIAL_INTERACTION_MATRIX.md`, Part 1. In short, the old sections behaved like this:
- each section applied one material rule to the whole object;
- no list item drove anything;
- the camera never moved;
- TIMELINE ended where OVERVIEW began.

| | Before (`ab9f1bef`) | After |
|---|---|---|
| Section → model | One material rule per tab. | Per-item bindings: layer, page home, feature module, stage. |
| Selection | None. | Reversible and replaceable. Escape, SHOW ALL, or selecting again returns the section's default exactly. |
| Camera | Fixed framing. | Turns toward the selection and moves part-way in, with the whole place kept as context. |
| On-model information | None. | Indexed markers (L1…, page counts per volume, module tags, the current stage) that follow the model as it turns. The selected one opens a callout. |
| STRUCTURE | Text list L1–L9. | Exploded axonometric, a layer index with sheets, and lines without geometry flagged. |
| PAGES | Page cards. | Spatial atlas: the count, the volumes and how many pages each holds, page plates with a detail sheet (lives in · brought by · part of). |
| FEATURES | Verb list. | The module tree; relationships (comes with · brings along · adds pages) open the related feature. |
| TIMELINE | 191 words of lanes and notes. | A stage rail with play, pause and step over the assembling model. The canonical window and lanes stay; the details are under disclosure. Marked **ILLUSTRATIVE ORDER · NOT A SCHEDULE**. |
| Section index | Plain words, numbering hidden. | `01 OVERVIEW … 05 TIMELINE`, a sliding red index and 44 px targets. Under 360 px the open section keeps its word and the others keep their number. |
| Mobile stage | Scrolls away with the list. | Sticky in the inspection sections. Chosen items land below it (scroll padding follows the pinned stage). |
| Desktop | Panel and stage. | Architectural presentation studio: a large stage with a contextual caption card beside the model. |

## The five modes

**01 OVERVIEW · SEE THE WHOLE PLACE**
- Unchanged reference composition: three canonical facts and YOUR CONFIGURATION.
- The whole model with drag-to-turn and full screen.
- Always restores the full model.

**02 STRUCTURE · UNDERSTAND HOW IT IS BUILT**
- The model opens into an exploded axonometric. Layers L1 FOUNDATION, L2 CORE, L3 ENVELOPE, L4 WINGS, L5 MATERIAL and L6 PACE are pinned on it.
- Each layer sheet lists the canonical lines whose geometry it carries.
- Typography, colour, image world and motion (and delivery at STANDARD) are listed as NOT DRAWN IN THE MODEL; selecting them lights nothing.

**03 PAGES · EXPLORE WHERE EVERYTHING LIVES**
- The canonical pages, in count, order, groups and depth.
- Each page is traced to its home: structure pages live in the glass envelope; capability pages live in the wing of the WORK choice that brings them.
- Groups light the union of their pages' homes.

**04 FEATURES · DISCOVER WHAT THE PLACE CAN DO**
- The core (WEBSITE · MOBILE) and each canonical capability on its module.
- Relationships come from the registry. Chips open the related feature: SELL → TAKE PAYMENT, and back again.

**05 TIMELINE · WATCH HOW IT COMES TO LIFE**
- The model assembles in four stages: 01 CORE → 02 DIRECTION → 03 PAGES → 04 FEATURES, then ✓ COMPLETE.
- It plays itself once on entry, unless the client prefers reduced motion; then it opens complete and is stepped by hand.
- The current stage is lit; later stages stand as outlines.
- No stage has a duration. The window, the lanes and WHAT HAPPENS NEXT are the canonical estimate, unchanged.

## Interaction contract

- **State lives in `BuilderStudio`:** `pick` (the section's selection) and the timeline's `stage` and `playing`. Changing section clears the selection, and changing room resets it.
- **Composition:** `compose('blueprint', spec, { focus, inspect })`. `inspect` is a `BuildInspection` with `lit`, `isolate`, `future`, `enter`, `explode` and `closeness`. It only ever names element ids the composition has.
- **Engine:**
  - lit dressing: red edges, mullions and frames, a faint red glow through glass, brighter acrylic;
  - staged entry (`enter`) in the pace's rhythm;
  - a focus camera (`camera.focus` / `closeness`);
  - projected anchors (`setAnchors`) for the markers;
  - `data-camera` and `data-lit` on the host, for checks.
- **Reused, unchanged:** element diffing, tweening, drag rotation, reset view, full screen, reduced-motion snapping and the reflection environment.
- **Keyboard:**
  - arrows, Home and End move between sections;
  - every item is a button (`aria-pressed`, `aria-expanded` for sheets);
  - Escape returns to the section default.
  The markers stay out of the tab order (the panel holds the same choices), and the mode line announces each selection.

## Evidence

See `immersive-blueprint-qa/`:

| Path | What |
|---|---|
| `before/` | Forensic captures at `ab9f1bef` (390, 393, 834 and 1440), plus `forensics-before.json`. |
| `after-default/` | The same script and states after the change, plus `forensics-after.json`. |
| `after/` | Default, selected, second selection and reset per section (390 and 1440). Full screen with its caption; the sticky stage; tablet and larger-text layouts. |
| `comparisons/before-after-390x844.jpg`, `before-after-1440x900.jpg` | BEFORE · AFTER default · AFTER selected, per section, identical viewport and state. |
| `interaction/blueprint-immersive-walkthrough-390x844.webm` | A screen recording of the walk-through (motion on): STRUCTURE layers, PAGES homes, FEATURES modules, TIMELINE playing. |
| `interaction/timeline-assembly-frames.jpg` | Frames sampled as the timeline plays. |
| `immersive-results.json` | The live suite (`blueprint-immersive.cjs`). |

RESULTS_PLACEHOLDER

## Known limitations

- **Timeline order is illustrative.** The estimator's production phases are not in the client contract. See `COMPOSER_CONTRACT_REQUEST_IMMERSIVE_BLUEPRINT.md` R1 (labels only, no durations).
- **Page provenance is derived in the studio** from the same registry `builderBlueprint` uses, matched by group and label. It is unit-tested for five scopes. R2 asks Composer to expose it on the contract.
- **The two massing volumes carry no data.** They are labelled "for proportion; not features" and are never lit as a page or feature home.
- **OVERVIEW keeps reference-measured micro-labels** (configuration label 7 px, fact label 7.6 px) from Reference Fidelity 2. The new inspection text is ≥ 7.8 px.
- **Inspect controls (turn, full screen) stay round, as drawn in the reference.** Every new control (markers, play/step, chips, SHOW ALL) is square-rounded.
- **Sandbox only:** this browser renders WebGL in software (SwiftShader), which measured 12 fps during assembly. A real-phone check is pending.
- **Grok assets:** GA-05 / GA-01 final plates are still pending (interim plates in use). This sprint adds no new Grok dependency.
- **Codex / Astra GLB:** not injected (Astra V1 needs revision; V2 pending).

## Rollback

- The previous verified state is `ab9f1bef` on `claude/bldr-studio-creative-refinement-8d42xk`, also recorded in PR #1528.
- The founder tunnel was last pinned to `c5e604e5`.
- `preview/tunnel` was at `ecbbb7f6` before this sprint.
