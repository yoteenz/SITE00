# SITE 00 Builder: template and estimate selection experience

**Sprint:** `P0.SITE00.BUILDER.TEMPLATE-AND-ESTIMATE-SELECTION-EXPERIENCE1` · OPUS · UX / product authority

**Doctrine:** TEMPLATES PROVIDE GRAMMAR, NOT IDENTITY. Reusable structural grammar + reusable visual grammar + the client's brand DNA = a unique digital location.

## Status

This sprint delivers UX authority and a data contract. It is not an implementation.
- **Estimator:** `src/studioos/estimation/` v1.0.0 is unchanged. A test asserts its reference outputs.
- **Public prices:** no public price or public page was changed.
- **Builder:** no route renders the new Builder. `src/site00/builder-experience/` is a contract with tests, ready for the implementation sprint.
- **Update (Hybrid Spatial Studio — founder review):** the four rooms + Blueprint run at `/bldr/studio/:room` on Composer's server-backed session (`useBuilderSpatialIntakeSession`), with submission, client review states, revision/resubmission and a founder Blueprint review in the admin intake inbox. Gated by `VITE_SITE00_TEMPLATE_SYSTEM_V1` (off by default). See `HYBRID_SPATIAL_STUDIO_FOUNDER_REVIEW_V1.md`; recovery onto current `main`, live QA and the founder-preview deployment handoff: `HYBRID_SPATIAL_STUDIO_RECOVERY_AND_PREVIEW_V1.md`.
- **Update (Creative Refinement 1):** Production Workspace typography (Saira Semi Condensed) and cool palette, a distinct architecture for every PLACE / FEEL / WORK choice, PACE shown as assembly motion, a numbered Blueprint section index with object focus, and a proposal-style confirmation. Same journey, contracts and estimates. See `hybrid-spatial-studio/CREATIVE_REFINEMENT_1.md`, `hybrid-spatial-studio/TRANSFORMATION_MATRIX.md` and `hybrid-spatial-studio/GROK_ASSET_REQUEST_MANIFEST.md`.
- **Update (Reference Fidelity 2):** the approved references are the strict authority. Typography is identified by pixel comparison (Oswald / Barlow Semi Condensed / Barlow / Roboto, self-hosted OFL), geometry and colour are measured, and rooms 01–04 fit one 390×844 / 393×852 screen. The live Build Object is composited over photographic plates (interim, from SITE 00's atrium render) in the references' architecture. See `hybrid-spatial-studio/REFERENCE_FIDELITY_2.md` and `hybrid-spatial-studio/reference-fidelity-qa/`.

## Outputs

| # | Output | Where |
|---|---|---|
| 1 | Builder information architecture | `BUILDER_INFORMATION_ARCHITECTURE.md` |
| 2 | Full client journey | `BUILDER_CLIENT_JOURNEY.md` §1 |
| 3 | Simple path | `BUILDER_CLIENT_JOURNEY.md` §2 · `SAMPLE_SIMPLE_SERVICE` |
| 4 | Advanced path | `BUILDER_CLIENT_JOURNEY.md` §3 · `SAMPLE_ADVANCED_EDITORIAL` |
| 5 | Custom path | `BUILDER_CLIENT_JOURNEY.md` §4 · `SAMPLE_CUSTOM_COMMERCE` |
| 6 | World path | `BUILDER_CLIENT_JOURNEY.md` §5 · `SAMPLE_WORLD_SHOWROOM` |
| 7 | Structural template selection model | `BUILDER_SELECTION_MODELS.md` §7 |
| 8 | Visual system selection model | `BUILDER_SELECTION_MODELS.md` §8 |
| 9 | Typography selection model | `BUILDER_SELECTION_MODELS.md` §9 |
| 10 | Colour direction model | `BUILDER_SELECTION_MODELS.md` §10 |
| 11 | Image world model | `BUILDER_SELECTION_MODELS.md` §11 |
| 12 | Motion model | `BUILDER_SELECTION_MODELS.md` §12 |
| 13 | Feature-selection model | `BUILDER_SELECTION_MODELS.md` §13 |
| 14 | Family-selection model | `BUILDER_SELECTION_MODELS.md` §14 |
| 15 | Delivery-selection model | `BUILDER_SELECTION_MODELS.md` §15 |
| 16 | Blueprint experience | `BUILDER_BLUEPRINT_AND_ESTIMATE.md` §16 |
| 17 | Estimate experience | `BUILDER_BLUEPRINT_AND_ESTIMATE.md` §17 |
| 18 | Estimate confidence UX | `BUILDER_BLUEPRINT_AND_ESTIMATE.md` §18 |
| 19 | Pricing communication recommendation | `BUILDER_PRICING_COMMUNICATION.md` |
| 20 | Responsive behaviour | `BUILDER_INFORMATION_ARCHITECTURE.md` §5 |
| 21 | Client ↔ estimator data mapping | `BUILDER_CLIENT_ESTIMATOR_MAPPING.md` + `.json` (generated) |
| — | Wireframes (full journey, phone + desktop) | `wireframes/BUILDER_UX_AUTHORITY.html` (Part A) · `wireframes/BUILDER_WIREFRAMES_1_PLACE_FEEL.png` · `wireframes/BUILDER_WIREFRAMES_2_WORK_PACE_REVEAL.png` |
| — | Authority previews | `wireframes/BUILDER_UX_AUTHORITY.html` (Part B) · `wireframes/BUILDER_AUTHORITY_PREVIEWS.png` |
| — | Pricing evidence (estimator output) | `BUILDER_PRICING_EVIDENCE.json` (generated) |

## Contract code

`src/site00/builder-experience/`:
- `types.ts`: the client selection.
- `registry.ts`: client-language registries over the estimator's own grammars and systems.
- `rules.ts`: dependencies, hybrid limits, build-level derivation and progressive disclosure.
- `toEstimateConfig.ts`: a pure mapping onto estimator enums.
- `clientView.ts`: scope signal, Blueprint and estimate view. Every figure comes from the estimator.
- `samples.ts`: sample selections.
- `builderExperience.test.ts`: 23 tests.

To regenerate the JSON: `npx tsx scripts/site00/builder-experience-export.ts`.

## Recommendations in one line each

- **Interaction architecture.** Four rooms (THE PLACE · THE FEEL · THE WORK · THE PACE) and a reveal (BLUEPRINT → ESTIMATE), with a Blueprint sheet as the progress model. Type, colour, image and motion are tuning layers that Simple clients never have to open.
- **Live estimate.** B: scope words (LIGHT · MODERATE · DEEP · EXPANSIVE) and build level live; money and dates first at the Blueprint reveal; live ranges after the reveal.
- **Pricing.** Option D: engine-anchored "FROM" and "TYPICAL" per build kind, generated from founder-approved reference configurations. No money inside the Builder rooms. INITIAL RANGE at the reveal, REFINED RANGE after Blueprint review.
- **Confidence.** EARLY → INITIAL RANGE · BLUEPRINT → REFINED RANGE · LOCKED → CONFIRMED RANGE. PRODUCTION SCHEDULE is reserved for the founder-issued document.
- **Priority.** Offered only where the estimator says it shortens the project. It is "ABOUT n% SOONER", never half.

## Quality gate

| Check | Result | Evidence |
|---|---|---|
| CLIENT_CAN_VISUALLY_SELECT_STRUCTURE | YES | Structure schematics, compare and preview slots (W02, W03) |
| CLIENT_CAN_VISUALLY_SELECT_EXPRESSION | YES | Specimens with eight facets; compare holding the structure (W04, B1) |
| CLIENT_CAN_UNDERSTAND_DIFFERENCE_BETWEEN_STRUCTURE_AND_STYLE | YES | Schematic (no style) vs specimen (no layout); compare changes one dimension; the Blueprint draws one in the other |
| SIMPLE_PATH_IS_SIMPLE | YES | 8 screens; tuning hidden (`builderSteps` test) |
| ADVANCED_PATH_SUPPORTS_DEEPER_CONFIGURATION | YES | Full edition, tuning screens, secondary influence, advanced capabilities, depth, viewports |
| CUSTOM_PATH_EXISTS | YES | NONE OF THESE → custom creative direction; 3+ systems; custom-only capabilities |
| WORLD_PATH_EXISTS | YES | The Builder transforms; world scope maps to estimator world inputs (test) |
| ESTIMATE_DOES_NOT_EXPOSE_FU | YES | Forbidden-term test over every sample's client output |
| ESTIMATE_USES_RANGES | YES | Estimator formatters; regex test |
| PRIORITY_DOES_NOT_PROMISE_HALF_TIME | YES | Feasibility gate + "why not half" copy; test asserts priority > standard ÷ 2 |
| BLUEPRINT_CONNECTS_TO_SCOPE | YES | Blueprint → reviewed Blueprint → quote → schedule mapped to estimator states |
| CLIENT_UI_CONSUMES_CANONICAL_ESTIMATOR | YES | `toEstimateConfig` → `estimateProject` → `toClientBlueprintEstimate`; no math in the Builder |
| PRICING_DISCREPANCY_FLAGGED | YES | `BUILDER_PRICING_COMMUNICATION.md` §1, F1–F12, E1–E8 |
| READY_FOR_FOUNDER_UX_REVIEW | YES | — |

## Not done (by design)

- No estimator math, coefficient or public price change.
- No public Builder deploy and no backend duplication.
- No change to existing SITE 00 visual authority. The old `/bldr/templates` page and the long intake questionnaires are marked superseded, not removed.
