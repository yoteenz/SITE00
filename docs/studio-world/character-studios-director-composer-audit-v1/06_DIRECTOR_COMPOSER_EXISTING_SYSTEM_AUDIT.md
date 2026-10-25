# 06 — Director Composer existing system audit

No "Director Composer" exists by that name. Shot planning exists in four systems:

- THE EXCHANGE directorial engine (branch);
- the Expression Engine storyboard and keyframe pipeline (NDXBOOK, main);
- FILM production (main, in memory);
- the legacy Campaign Director (main, outside the production frame).

## 1. THE EXCHANGE Directorial Production Engine (PR #1692)

Code: `shared/site00-fiction-production/` (directorial engine 16 files, 1,612 lines). Data: `THE_EXCHANGE/SEASON_1/`. Branch only: PR #1692 is open, stacked on #1690. Each reported capability was checked against the code.

| Reported capability | Verified in code | Evidence | Class |
| --- | --- | --- | --- |
| 86-release season preservation | Yes. The master is built by `seasonMaster.ts`; the audit baseline hashes it, and the promotion layer must strip back to that hash | `seasonMaster.ts`; `audit/baseline.ts`; `SEASON1_86_RELEASE_MASTER_V1.json` (86 releases) | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| 110-scene index | Yes: totals 86 releases, 110 scenes, 7,660 s | `sceneIndex.ts`; `SEASON1_SCENE_INDEX_V1.json` | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Scene dependency graph | Yes: 150 nodes, 403 edges | `dependencyGraph.ts`; `SEASON1_SCENE_DEPENDENCY_GRAPH_V1.json` | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Motion-weighted shot planning | Yes. Bands: HIGH 1–3 s, MODERATE 2–4 s, LOW 2 s+, EMOTIONAL_DIALOGUE 3 s+, ENVIRONMENT 2–6 s. Generation length is screen time plus a 0.5 s handle, rounded up and clamped to 3–15 s | `directorial/motion.ts` (MOTION_GUIDE, GENERATION_LIMITS, generationSeconds, validateMotion) | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| 24 fps frame-authoritative timelines | Yes: frames are the unit, with timecode helpers | `directorial/timecode.ts`; `timeline.ts` placeShots, validateTimeline | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Eight synchronized tracks | Yes: VIDEO_A, VIDEO_B, DIALOGUE, AMBIENCE, FOLEY, SFX, MUSIC, SUBTITLES | `timeline.ts:4` TRACKS; `PRODUCTION_SCENES/S1-01/MULTITRACK_V1.json` | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Camera planning | Yes, per shot: framing, camera height and angle, lens intent, depth of field, movement, speed, direction, composition, screen direction, eyeline, blocking | `directorial/types.ts` ShotDesign; S1-01 shot list | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Keyframe manifests | Yes. S1-01: 22 keyframes (20 generate, 2 extract, 0 reuse), 29 images to generate, all 22 blocked upstream | `directorial/keyframes.ts`; `KEYFRAME_MANIFEST_V1.json` | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Audio and dialogue planning | Yes: dialogue events with speaker, frames and `takeRef`; coverage classes; edit joins (J-cut, L-cut, off-screen only, on camera) | `directorial/types.ts:152`; `timeline.ts` validateCoverage, editJoins | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Music supervision | Yes: cues, hit points, licensing dependencies | `directorial/audio.ts` validateMusicSupervision, licensingDependencies | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Sound-design planning | Yes: cues, sync points, linked shots | `directorial/audio.ts` validateSoundDesign | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Provider routing | Yes as records. Route access is a static claim, and in this session neither the OpenArt MCP nor `FAL_KEY` is present (G-GEN-04) | `directorial/routing.ts` PROVIDER_ROUTES | SCHEMA_OR_INTERFACE_ONLY for execution |
| Production cost estimation | Yes. Credits per shot from dated quotes: 40 credits per image, 35 per video second on kling-3-omni pro. The balance was quoted by hand | `routing.ts` buildBudget, videoCredits; `PRODUCTION_BUDGET_V1.json`; `PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V2.json` | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Founder approval gates | Yes: five steps, element states, change requests that invalidate dependents, and a pre-spend check. No UI, and no runner calls the check | `directorial/review.ts` (AUTHORIZATION_STEPS, requestChange, authorizeGenerationJob at line 160) | IMPLEMENTED_NOT_RUNTIME_VERIFIED |

Also present:
- **Job ledger.** `dispatch.ts` has `precheckProductionDispatch`, `idempotencyKey`, `openJob`, `recordFailure` and `recordSuccess`, all pure functions. Nothing outside `index.ts` calls them.
- **Single-unit progression.** `directorial/progression.ts` keeps one release in founder review at a time.

## 2. Other planning systems

| System | Evidence | What it does | Class |
| --- | --- | --- | --- |
| Expression Engine storyboard and keyframes (NDXBOOK Entry 002) | `api/site00/expression-engine.ts:336-400`; `api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.ts` | Pre-storyboard authorities, final storyboard, founder import, START/MID/END keyframes through fal (ran 2026-09-07) | Keyframes LIVE_AND_VERIFIED (image only); judgments PARTIALLY_IMPLEMENTED (process memory) |
| Expression Engine video routing | `productionRouting.ts:24-31` (`autoDispatch: false`) | Recommends Kling, MiniMax or Runway; no dispatch | SCHEMA_OR_INTERFACE_ONLY |
| FILM production | `shared/site00-studio-world-production/filmProduction/**` (3,546 lines); `filmProductionMemoryStore.ts:7` | Film bible, shot library, script and storyboard interpreters, planner, continuity graph, model router, simulated generation, dailies, EDL | Planning IMPLEMENTED_NOT_RUNTIME_VERIFIED; generation SCHEMA_OR_INTERFACE_ONLY (simulation) |
| Cinematic Realism Lab | `cinematicRealismLab/providerRegistry/registry.ts` | Provider comparison with placeholder assets | SCHEMA_OR_INTERFACE_ONLY |
| Campaign Director (legacy) | `/projects/:p/campaign-director`; `founderWorkspace/campaignDirector/*` | World, Look, Styling, Shots, Sequence, Production, Review screens | PARTIALLY_IMPLEMENTED, outside the production frame |
| Kling 4 cinematic execution (branch) | `cursor/ndxbook-kling4-cinematic-pipeline-8aec` @ d8f3c4ae, PR #1683 (draft) | Reference manifest with hashes, keyframe compiler, paid-generation gate, Artlist packet; `submitJob` returns NOT_SUBMITTED | SCHEMA_OR_INTERFACE_ONLY and BLOCKED |

## 3. What can become shared Studio World services

| Module | Reusable as is | What ties it to THE EXCHANGE |
| --- | --- | --- |
| `timecode.ts` | Yes | Nothing |
| `motion.ts` | Yes | Limits come from one OpenArt form; they should come from the route (Artlist reports Kling 4.0 at 3–30 s, deliverable 13) |
| `timeline.ts` (tracks, placement, coverage, edit joins) | Yes, after types are generalized | Imports Exchange `ProductionPlan` types |
| `keyframes.ts` (requirements, reuse, extraction, blockers, production order) | Yes | Founder-decision references are Exchange IDs |
| `review.ts` (steps, element states, invalidation, pre-spend check) | Yes | Step names fit any scene |
| `routing.ts` | Structure yes; routes no | Routes and quotes are environment- and project-specific |
| `audio.ts`, `spatial.ts`, `intent.ts`, `packet.ts` | Structure yes | Use Exchange canon fields |
| `seasonMaster.ts`, `promotion/`, `sceneIndex.ts`, canon lock | **No** | They are THE EXCHANGE's creative authority package |

**Recommendation (G-SCENE-02).**
- Lift the generic modules into a Studio World production service with a project-authority interface.
- THE EXCHANGE implements that interface with its canon. No Exchange canon goes into a global tool.
- Do this after the Exchange stack merges; doing it earlier would fork the code.

## 4. Motion-weighted generation (sprint §14)

Every S1-01 shot record already carries:
- one primary action;
- a purpose (the visual objective);
- a motion class (the motion risk);
- a camera plan;
- continuity notes;
- a route (the preferred model);
- quoted credits;
- intended screen time against generation length (for example SH07: 69 frames on screen, 4 s generated).

Emotional dialogue has a 3 s minimum and no maximum, so the plan does not force fast cutting. The missing piece is route-specific limits (G-GEN-04): the plan assumes one provider's 3–15 s.

## 5. Audio-first editorial (sprint §16)

THE EXCHANGE can express a ten-second line played across a close-up, a reaction, an insert, a wide shot and back. It does this in plan:
- dialogue sits on its own continuous track;
- each shot has a coverage class (VISIBLE_SPEAKER, OFFSCREEN_SPEAKER, LISTENER_REACTION, OBJECT_INSERT, ENVIRONMENT_INSERT, SILENT_ACTION, plus ESTABLISHING and TRANSITION);
- `validateCoverage` refuses lip-sync on a listener and flags a visible speaking mouth with no lip-sync;
- `editJoins` labels each line J-cut, L-cut, on-camera or off-screen.

Missing for end to end:
- the approved dialogue take (G-AUD-02);
- a lip-sync route (G-LIP-01);
- take records for each shot (G-TAKE-01);
- an editor export that keeps the dialogue track continuous (G-EDIT-01).

S1-01 has no dialogue (DIALOGUE track 0 items), so this path is first exercised by a later release.

## 6. Missing production interactions

- Opening a scene and a shot in the workspace (G-WS-01).
- Changing camera, performance or settings and seeing the quote update.
- Authorizing a step or budget.
- Starting a job and watching it.
- Reviewing takes.
- Selecting for edit.
- Exporting the timeline.

All of the data these need exists in THE EXCHANGE packet. None of the interactions do.
