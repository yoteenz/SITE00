# Blueprint — spatial interaction matrix

Sprint `P0.SITE00.BLDR.BLUEPRINT.V1-IMMERSIVE-TAB-BEHAVIOR-AND-SPATIAL-INFORMATION-RECOVERY1`.

> THE BLUEPRINT IS NOT A DOCUMENT DRAWER. IT IS AN INTERACTIVE ARCHITECTURAL EXPLORATION OF THE CLIENT'S PROPOSED
> DIGITAL LOCATION.

This file has two parts:
- **Part 1** is the forensic record of the Blueprint *before* this sprint, written before any change.
- **Part 2** is the binding contract the five modes now implement.

## Part 1 — Forensic inspection (before)

### How it was captured

- **Source:** the live dev server (`/bldr/studio`, memory intake, preview flags on) at `ab9f1bef`.
- **Selection state:** ADVANCED · MODERN · PAGES + SHOP + PORTAL · STANDARD.
- **Script:** `scripts/site00/builder-studio-qa/blueprint-forensics.cjs`. The same script produces the after-captures.
- **Viewports:** 390×844, 393×852, 834×1194 and 1440×900.
- **Captures** are in `immersive-blueprint-qa/before/`:
  - one viewport capture per section;
  - a stage crop per section;
  - a full-page capture per section at 390;
  - `forensics-before.json`.

**How "stage Δ" is measured:** the share of stage pixels that differ from OVERVIEW by more than 12/255.

### Measured behaviour at 390×844

| Section | Object key suffix | Stage Δ vs OVERVIEW | Page length | Panel | Text blocks | Targets in the section | Do any targets drive the object? |
|---|---|---|---|---|---|---|---|
| OVERVIEW | none | 0 % | 890 px | 256 px | 4 | 5 (edit; 4 config cards that switch tab or room) | No |
| STRUCTURE | `\|STRUCTURE` | 15.4 % | 1147 px | 491 px | 10 | 1 (CHANGE IN ROOM 01) | No |
| PAGES | `\|PAGES` | 19.1 % | 1238 px | 582 px | 18 | 1 (CHANGE IN ROOM 03) | No |
| FEATURES | `\|FEATURES` | 13.8 % | 1125 px | 469 px | 9 | 1 (CHANGE IN ROOM 03) | No |
| TIMELINE | `\|TIMELINE` | 0.6 % at rest (the replay ends where OVERVIEW is) | 1404 px | 748 px | 17 | 1 (CHANGE IN ROOM 04) | No |

**Other viewports:**
- 393×852 matches 390×844 within 1 %.
- At 1440×900 the panel scrolls inside the left column, and the stage changes are the same as on mobile.
- At 834×1194 this run caught the stage before its canvas painted. The section changes are recorded from the mobile and desktop runs.

**Console:** two `ERR_TUNNEL_CONNECTION_FAILED` resource errors. These are external requests refused by this sandbox's proxy, not by the app. There were no script errors.

### Behaviour matrix

| Tab | Current content | Current architectural response | Expected response (founder brief) | Missing binding | Proposed correction |
|---|---|---|---|---|---|
| **OVERVIEW** | Three facts (build type, timeline, investment), a "YOUR CONFIGURATION" head and four thumbnail cards that open other tabs or rooms. | None. The object is idle; drag needs the cube toggle. | **See the whole place:** the complete architecture, rotate and fullscreen, the canonical investment and timeline, no generic cards. | No link between the facts and the object; nothing spatial in the panel. | Keep the canonical figures. Replace the card grid with a **spatial index of the four inspection modes**, read from the object (how many layers, pages and features, and the window). Rotation and fullscreen stay one tap away. Overview always restores the full model. |
| **STRUCTURE** | A BUILD TYPE keystone, then L1–L9: the canonical Blueprint lines as a text list. | Whole-object re-tint: red is ghosted, glass is tinted. No line is connected to any geometry. | **Understand how it is built:** select a layer, light its part, dim the rest, move the camera, show a concise caption, allow return. Indexed layers, guide lines, red illumination, callouts. | No line → element mapping; no selection state; no camera target; no on-model annotation. | **Exploded axonometric.** The model separates into its real layers (foundation, envelope and core, wings, material study). Every canonical line is placed in the layer whose geometry it actually drives. A selected layer lights in red, the rest dims, the camera moves to it and a leader-line callout pins it on the model. Lines with no geometry (typography, colour, image world, motion; delivery at STANDARD) are marked **NOT DRAWN IN THE MODEL** instead of pretending. |
| **PAGES** | A page count, then the page groups as cards (P01 …, depth). | Side volumes and pavilions stay lit; everything else is ghosted. The same for every page. | **Explore where everything lives:** destination index, page markers, clusters, the selected page lit, camera focus on its volume, parent-child relationships. | No page → volume relationship. A side volume stands for a WORK module, but the pages it holds were never traced. | Trace every page to its **real source** in the canonical registry: a structure starter page lives in the glass envelope; a page a capability adds lives in that capability's wing. On-model markers show how many pages each volume holds. Selecting a page or a group lights its volume and moves the camera there. The sheet names the parent (where it lives, what brings it) and its depth. The list, count and order are exactly `snapshot.blueprint.experiences`. |
| **FEATURES** | A CORE bar, then F01–F07: capability verbs with plain copy, plus "COMES WITH YOUR CHOICES". | Red only: the core and modules stay, everything else is ghosted. The same for every feature. | **Discover what the place can do:** select a feature, highlight its module, explain it, show relationships. | No feature → module mapping; "comes with" relationships are not shown as links. | Map each capability to the **WORK module wing** that brings it: directly (SHOP → SELL), through "comes with" (SELL → TAKE PAYMENT) or from the structure (core). Selecting it lights that module, moves the camera there and shows the canonical plain copy plus its relationships: what it comes with and which pages it adds. These come only from the registry. |
| **TIMELINE** | Pace lead, STANDARD and EXPEDITED lanes, confidence, three notes, WHAT COMES FIRST, WHAT HAPPENS NEXT, fine print (191 words). | Replays the PACE assembly once, then rests on the OVERVIEW frame. | **Watch how it comes to life:** a stage-by-stage module reveal, a progress rail, phase illumination, current versus future stages, using the actual estimator and roadmap contracts, with no invented durations. | The assembly order is not exposed and there are no stages. The client estimate exposes no phases (the estimator's `phases` stay internal). | **Stage rail over the model:** FOUNDATION → MAIN EXPERIENCES → CAPABILITIES → FINISH & LAUNCH. Each stage holds real content (core included, structure pages, the chosen wings, the visual system). Built stages are solid, the current stage is lit and future stages are ghosted. It plays in the chosen PACE rhythm, or step by step. The canonical window, the lanes and WHAT HAPPENS NEXT stay. It is labelled **ILLUSTRATIVE ORDER · NOT A SCHEDULE**, with no per-stage durations. |
| **Tab bar** | Five plain words with a red underline; numbering hidden (Reference Fidelity 2). | Not applicable. | Elevated navigation with editorial numbering 01–05, a better active state and touch geometry, no oversized dashboard tabs. | Not applicable. | Numbered tabs (`01 OVERVIEW` …) with the reference type scale, 44 px targets, a sliding red index, and keyboard arrows, Home and End. |

### Root cause

The Blueprint's only binding to the object was `compose('blueprint', spec, { focus: tab })`. That is one material rule per tab (`focusElements`). No per-item state existed anywhere: not in React, not in the composition, not in the engine. The camera could only fit the whole object, so a row in a list had nothing to drive. The fix belongs in three layers:
- **Composition:** an inspection model and honest anatomy.
- **Engine:** emphasis, focus camera and screen anchors.
- **Panel:** selection, captions and the stage rail.

A CSS-only fix would not reach it.

## Part 2 — Binding contract (implemented)

See **"Implemented bindings"** below. Each binding is computed in
`src/site00/builder-studio/buildObject/anatomy.ts` (pure, unit-tested) from the canonical contracts:
- the `BlueprintSessionSnapshot` (`blueprint.lines`, `blueprint.experiences`, `blueprint.capabilities`, `estimate`, `selection`);
- the Builder registry (`STRUCTURE_BY_ID[*].starterExperiences`, `CAPABILITY_BY_ID[*].addsExperiences / comesWith`);
- the studio → selection mapping (`WORK_TO_CAPABILITIES`).

Nothing is inferred from labels, and nothing is drawn that the data does not hold.
