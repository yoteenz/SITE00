# 20 — Prioritized implementation roadmap

Nothing here is authorized. Each phase starts only after founder approval (deliverable 22).

## Why the order differs from the sprint's suggestion

The sprint suggests identity integration first. The evidence says the first blocker to real footage is different: no take, no job write-back, no permanent copy and no enforced authorization. And the active scene, S1-01, needs no principal identity: it has no principal cast on screen and no dialogue. So the production record spine moves to Phase 1. Identity integration follows in Phase 2, before any principal-cast or dialogue release.

| Sprint phase | This roadmap |
| --- | --- |
| 0 Forensic audit and source reconciliation | Phase 0 |
| 1 Actor / Character / Look identity integration | Phase 2 |
| 2 Scene-aware Director Composer | Phase 3 |
| 3 Keyframe and provider handoffs | Phase 1 (the runner, for one route) and Phase 4 (breadth) |
| 4 Audio / performance / lip-sync | Phase 2 (dialogue take import) and Phase 5 |
| 5 Take review and continuity validation | Phase 1 (takes, minimal dailies) and Phase 5 (continuity checks) |
| 6 Scene assembly and production archive | Phase 6 |

**The live digital human (path B) is a separate track.** No phase depends on it, and every path A acceptance criterion below holds with path B absent.

## Smallest viable production path

**First approved take: S1-01-SH01** (establishing shot, 4 s on screen, 5 s generated).

| Step | Detail |
| --- | --- |
| 1 | Founder approves the screenplay (FD-S101-01), the city reference (FD-S101-08) and generation for SH01 (FD-S101-11). Authorizes 255 credits plus retake allowance |
| 2 | Phase 1 is built |
| 3 | Two city reference candidates are generated (80 credits) |
| 4 | Founder approves one; it is stored with its hash |
| 5 | SH01 video is generated (175 credits) |
| 6 | The take arrives in dailies, is stored and hashed, and the founder approves it |
| 7 | The record shows provider creation ID, inputs, quoted and actual credits, and the stored file |

**Second: SH05 → SH07.** After the S1-01 patch plan is accepted and the teenager's step is choreographed. It proves frame extraction at zero credits; about 365 more credits.

## Phase 0 — Forensic audit and source reconciliation (this sprint)

| Item | Detail |
| --- | --- |
| Scope | This audit; founder decisions D-01 to D-15; read-only database status (S-01) |
| Gaps closed | G-DATA-03 (when the database answers; otherwise before Phase 3), G-WS-04, G-WS-05 (founder confirmations) |
| Dependencies | none |
| Reusable | — |
| Missing | Decisions |
| Acceptance | The decisions needed for Phase 1 (D-01, D-02, D-03, D-04, D-07, D-08, D-11, D-13, D-14) are recorded |
| Complexity | S |
| Risk | Low |
| Verification | Decision record in the repository |

## Phase 1 — Production record spine and first footage

| Item | Detail |
| --- | --- |
| Scope | **1a Safety:** close the ungated paths (C-01); fix the two open policies on a branch (S-02).<br>**1b Runner:** an agent-session runner for the OpenArt routes the plan already quotes (option A, deliverable 13). It calls `authorizeGenerationJob` and `precheckProductionDispatch` first, writes the job record, copies the output to private storage and hashes it.<br>**1c Takes:** record and state machine, including HOLD and SELECTED_FOR_EDIT; repository JSON for the pilot (D-03).<br>**1d Dailies:** mount takes in `performance/takes`; establish THE EXCHANGE in EXPRESSION.<br>**1e Authorization:** founder steps and budget in REVIEW + HANDOFF.<br>**1f Extraction:** last frame of an approved take becomes the next start frame (for pilot 2).<br>**1g Route checks:** dated runtime check for each route |
| Gaps closed | G-GEN-01, G-TAKE-01, G-TAKE-02, G-ASSET-01, G-COST-02 (P0); G-COST-03, G-DATA-02, G-ASSET-02, G-WS-01, G-TAKE-03, G-GEN-04, G-KF-01 (P1) |
| Dependencies | D-02, D-03, D-04, D-07, D-08, D-11, D-13, D-14 |
| Reusable | `dispatch.ts` job ledger; `review.ts` authorization, element states and invalidation; provider gateway (`runProductionProviderRequest.ts`); OpenArt CLI scripts (`scripts/jurnl/f09-openart-generate-from-json.mjs`); PR #1683 hashed reference manifest; `ExpressionFamilyShell`, `Btn` with `disabled` and `reason`, `Filmstrip`, `DecisionRow` and ledger; the takes authority |
| Missing | Runner, take store, copy and hash step, private bucket, takes UI, authorization UI, frame extraction |
| Acceptance | 1. An unauthorized SH01 job is refused before any provider call, and the refusal is logged.<br>2. An authorized SH01 job runs with no hand copying.<br>3. The take is stored, its hash matches, and it re-downloads without the provider URL.<br>4. The founder approves it on a 390-px phone with no page scroll.<br>5. Actual credits match provider history.<br>6. Neither ungated path can call a provider |
| Complexity | L |
| Risk | The runner depends on an agent session holding the OpenArt connector. The database is unreachable, so the pilot uses repository records |
| Verification | Unit tests (state machine, gate, extraction); existing EXPRESSION no-scroll suite extended to takes; one founder-authorized real job |

## Phase 2 — Actor, Character and Look identity integration; principal readiness

| Item | Detail |
| --- | --- |
| Scope | One canonical actor registry and a uniqueness check (D-05); persisted identity views with hashes; THE EXCHANGE project-authority adapter (D-06: principals stay project-local or become catalogue Actors); versioned Looks; voice on Character; import THE EXCHANGE's founder-held references; identity pack (fill missing only); resolve SW-017; manual dialogue take import with stored masters |
| Gaps closed | G-ID-06, G-LOOK-04 (founder inputs), G-AUD-02 (P0); G-ID-01, G-ID-02, G-ID-03, G-ID-05, G-LOOK-01, G-LOOK-02, G-VOICE-01 (P1); G-ID-04, G-ID-07, G-ID-08, G-LOOK-03 (P2) |
| Dependencies | Phase 1; D-05, D-06; founder supplies files and approves Looks |
| Reusable | Acting catalogue types and tests; reuse-before-create logic; `assertWorkingDraft` pattern; CAST NDX identity locks; THE EXCHANGE cast registry, edit log and hash validator |
| Missing | Registry persistence, adapter, Look versions, pack workflow, dialogue take import |
| Acceptance | 1. An Exchange character resolves to Actor, Character, Look version and voice with no duplicated identity data.<br>2. The uniqueness check passes.<br>3. The cast registry has 0 BLOCKER findings.<br>4. The identity pack proposes only missing views.<br>5. A lip-sync job can reference only an approved dialogue take |
| Complexity | L |
| Risk | Merging the resident branch stack; creating catalogue identities without approval (guarded by D-06) |
| Verification | Uniqueness and resolution tests; founder review of each imported or approved item |

## Phase 3 — Scene-aware Director Composer

| Item | Detail |
| --- | --- |
| Scope | Generic directorial modules lifted into a Studio World production service (after the Exchange stack merges); scene context for any project; shot detail route (after authority approval); reference purpose and tray; scene cost preview with job purpose; additive Supabase schema (after S-01); server-side workspace decisions |
| Gaps closed | G-SCENE-01, G-SCENE-02, G-REF-01, G-KF-04, G-PROJ-01, G-DATA-01, G-COST-01, G-COST-04, G-ASSET-03 (P1); G-WS-02, G-WS-03, G-WS-06, G-DATA-04 (P2–P3) |
| Dependencies | Phases 1–2; PRs #1690 to #1694 merged; D-12 authorities approved |
| Reusable | `timeline.ts`, `motion.ts`, `keyframes.ts`, `review.ts`, `timecode.ts`; `SceneSelector`, `NodeInspector`, `buildInspectorView`; expression route resolver |
| Missing | Project-authority interface, scene resolver, shot detail UI, reference tray, cost preview, schema |
| Acceptance | 1. The same service resolves a full scene context for one Exchange scene and one NDXBOOK entry, with sources.<br>2. Generic modules compile with no Exchange canon import; Exchange tests pass unchanged.<br>3. The shot route passes the no-scroll suite at 5 viewports |
| Complexity | XL |
| Risk | Forking the Exchange engine if started before merge; schema against an unknown database state |
| Verification | Cross-project resolution test; convergence suite; schema review |

## Phase 4 — Keyframe and provider breadth

| Item | Detail |
| --- | --- |
| Scope | Keyframe write-back everywhere; cross-release reuse; one provider capability registry; a second route family (Artlist through PR #1683, or a backend adapter, per D-02); route-specific limits; honest provider IDs; suggest-only reference-to-direction |
| Gaps closed | G-KF-02, G-KF-03, G-GEN-02, G-GEN-03, G-REF-02 (P2) |
| Dependencies | Phase 3 |
| Reusable | PR #1683 adapter and gateway; existing vision providers |
| Acceptance | 1. Kling 4.0 limits come from the route.<br>2. No record holds an invented provider ID.<br>3. Extracted direction never changes identity, wardrobe or set |
| Complexity | L |
| Risk | Provider account sprawl |
| Verification | Route capability tests; one authorized job per new route |

## Phase 5 — Audio, performance, lip-sync and continuity validation

| Item | Detail |
| --- | --- |
| Scope | Backend ElevenLabs credential and read-only voice verification (D-09); forced alignment for word timing; lip-sync route for VISIBLE_SPEAKER shots; reusable performance style; post-generation continuity checks (advisory first) |
| Gaps closed | G-AUD-01, G-LIP-01, G-CONT-01 (P1); G-PERF-01, G-AUD-03 (P2) |
| Dependencies | Phases 1–2 |
| Reusable | Coverage classes, edit joins, `validateCoverage`; dialogue style registry |
| Acceptance | 1. Three voice IDs verified and dated.<br>2. Each visible speaking shot plans one lip-sync job from an approved dialogue take.<br>3. Each take shows check results with method, and no fixed score |
| Complexity | L |
| Risk | Check quality; credential handling |
| Verification | Coverage tests; founder comparison of check results against their own judgment on 10 takes |

## Phase 6 — Scene assembly and production archive

| Item | Detail |
| --- | --- |
| Scope | Timeline export (FCPXML or OTIO; EDL minimum); edit versions; captions from approved dialogue; final library entry for edited masters; one job and asset registry for Composer work |
| Gaps closed | G-EDIT-01 (P1); G-EDIT-02, G-EDIT-04, G-ASSET-04 (P2); G-EDIT-03 optional (P3) |
| Dependencies | Phases 1, 2 and 5; D-10 |
| Reusable | `buildMultitrack`, `editJoins`, timecode |
| Acceptance | 1. S1-01 opens in the chosen editor with every clip at its planned frame.<br>2. The edited master is stored with lineage to its takes |
| Complexity | M |
| Risk | Editor format quirks |
| Verification | Round trip of S1-01 in the chosen editor |

## Path B — Live digital human (separate track)

G-DH-01, G-DH-02, G-DH-03. It starts when the founder's local host is available. It shares the Actor identity record and approved views with path A, and it never blocks path A.

## Next recommended sprint

`P0.SITE00.STUDIOWORLD.PRODUCTION-RECORD-SPINE-AND-FIRST-TAKE.V1`: Phase 1.

Preconditions:
- The founder has recorded D-01, D-02, D-03, D-04, D-07, D-08, D-11, D-13 and D-14.
- Spend is limited to founder-authorized SH01 jobs.
