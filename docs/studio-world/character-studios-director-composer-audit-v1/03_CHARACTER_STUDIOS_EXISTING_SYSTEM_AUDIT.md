# 03 — Character Studios existing system audit

Baseline `origin/main` 159c0fa9. Branch evidence is named by branch and tip. Classifications use the sprint's eight levels. A passing unit test is recorded as test coverage, not as runtime proof.

## 1. Capabilities

| # | Capability | Class | File path | Branch / commit | Runtime deps | Database | UI | Tests | Unresolved blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Acting catalogue model and seed (Actor, Character, Look, ShotCast types; 7 actors) | PARTIALLY_IMPLEMENTED | `shared/site00-studio-world/acting-catalogue/types.ts`, `seedCatalogue.ts` | main (PR #1246, merged 2026-09-29) | none | none | EXPRESSION Casting and Look families, `ExpressionEngineCastPanel`, Library | `p0StudioWorldActorCatalogueCasting1` (17) | Every identity view has `storagePath: null`, `previewUrl: null` (seedCatalogue.ts L22–27); no create, edit or persistence |
| 2 | Casting intelligence, cast gate, continuity validator, handoffs | IMPLEMENTED_NOT_RUNTIME_VERIFIED | `acting-catalogue/castingIntelligence.ts`, `castGate.ts`, `characterContinuity.ts`, `handoffs.ts` | main | none | none | `ExpressionEngineCastPanel` (always the Entry 002 fixture) | same 17 | Runs only over the seed and the Entry 002 fixture |
| 3 | Modular production engine (layers, libraries) | SCHEMA_OR_INTERFACE_ONLY | `shared/site00-studio-world/modular-production-engine/*` | main | none | none | none | `p0SwModularProductionEngine1` (9) | Doc marks phases 2–6 as specification |
| 4 | Operational layers (Actor Genesis, role-first casting, wardrobe, hair and makeup, scene assembly) | SCHEMA_OR_INTERFACE_ONLY | `modular-production-engine/operational/actorGenesis.ts`, `roleFirstCasting.ts`, `wardrobeDepartment.ts`, `hairMakeupDepartment.ts`, `sceneAssemblyOperational.ts` | main | none | none | none | `p0SwModularProductionEngineMissingLayers1` (17) | No generation, persistence or UI |
| 5 | Character Fabrication, 8 stations (Identity, Body, Look, Hair and Makeup, Character, Performance, Simulation, Authority) | PARTIALLY_IMPLEMENTED | `shared/site00-character-fabrication/*`, `src/site00/components/characterFabrication/*` | main | browser | none (localStorage, `src/site00/state/characterFabricationRepository.ts:6`) | `/production/:p/expression/character-fabrication` | `p0CharacterFabricationMachine1` (17) | "FINAL GENERATION — not implemented" (`docs/character-fabrication/CHARACTER_FABRICATION_HANDOFF.md`); body readouts are fixtures |
| 6 | Fabrication image receipts (82) and slot manifest (106 slots, 27 unfilled) | PARTIALLY_IMPLEMENTED | `shared/site00-character-fabrication/assets.ts` | main | static files | none | `CfImage` | same | Authority images conflict with SW-017's record (handoff doc L19–20); receipts for SW-022, SW-034, SW-042, which are not in the catalogue |
| 7 | Live character runtime (manifest, protocol, mock and Unreal adapters, capture rig, `CharacterViewport`) | IMPLEMENTED_NOT_RUNTIME_VERIFIED | `shared/studio-world-live-character-runtime/*`, `src/site00/characterRuntime/CharacterViewport.tsx` | main (blobs identical to `live-character-runtime-architecture-1b86` @ d67e2cc5) | `VITE_SITE00_UNREAL_COMMAND_WS`, `?liveRuntime=1` | none | Static authority by default; `/__dev/live-character-runtime` (development only) | `liveCharacterRuntimeP0` (6, mock only) | Only the mock adapter has run |
| 8 | Unreal, MetaHuman, Pixel Streaming, capture host | BLOCKED | `docs/studio-world/live-character-runtime/LOCAL-UNREAL-SETUP.md` | — | Founder's Windows machine (UE 5.8.2) | — | — | — | Not reachable from the cloud; MEMORY L12824–12833 "BLOCKED — founder local execution required" |
| 9 | CAST NDX visual casting (identity lock, anchor, isolate, 12-angle turnaround, Character Bible pack) | IMPLEMENTED_NOT_RUNTIME_VERIFIED | `shared/site00-studio-world-production/characterVisualCasting/*`, `api/_lib/site00Evolve/characterVisualCasting/castingFalDispatch.ts` | main (PRs #420–#467, 2026-08-25) | `FAL_KEY`, Supabase storage, Railway API | `site00_methodology_validation_runs` (JSONB) | `/projects/:slug/character/casting` | `imageReferenceCastingP05E4E1` (31), `identityLockCastingP05E4E` (16) and others, fal mocked | NDXBOOK-specific; drift QA uses fixed scores (`identityAnchorCasting.ts:241-244`); founder runs on 2026-08-25 got stuck; no output IDs committed |
| 10 | Embodied and founder character discovery, Character Bible pipeline | PARTIALLY_IMPLEMENTED | `embodiedCharacterDiscovery/`, `embodiedCharacterFounderDiscovery/`, `characterContinuityPipeline/` | main | Railway API, Supabase | `site00_methodology_validation_runs` | `/projects/:slug/embodied-character`, `/character/discovery`, `/character/continuity` | brand-lore P05E3/E4/E5 suites | Continuity runs in PRE_CASTING mode with zero character generations; mock fixtures only |
| 11 | Voice Lab (fal MiniMax TTS auditions) | IMPLEMENTED_NOT_RUNTIME_VERIFIED | `embodiedCharacterVoice/neuralVoiceCasting.ts`, `api/_lib/site00Evolve/founderCharacterDiscovery/neuralVoiceGenerationService.ts` | main | `FAL_KEY` | JSONB run record; audio stays on the fal URL | inside `/character/discovery` | `embodiedCharacterVoiceP05E4B1` and others | No request or audio IDs committed; request body always MiniMax-shaped (line 73) |
| 12 | Studio World actor-to-voice link | SCHEMA_OR_INTERFACE_ONLY | `VoiceProfile` type; `shared/studio-world-live-character-runtime/fabricationBridge.ts:47` (`voiceAuthorityId: null`) | main | — | — | — | — | No actor has a voice |
| 13 | Season 1 resident catalogue projected into casting | PARTIALLY_IMPLEMENTED (branch only) | `resident-intelligence/season1-ensemble`, `productionCastingCatalogue.ts` | `expression-actor-catalogue-resident-authority1` @ 538c0d23 (PR #1327, not on main) | — | none | Casting and fabrication (branch) | branch suites | Names FSBW as authority (not vendored) |
| 14 | Resident fabrication and geometry-complete OpenArt packs | PARTIALLY_IMPLEMENTED (branch only) | `GENERATION_AUDIT.json`, `geometry_complete_master_manifest.json` | `studio-world-resident-geometry-complete-production-injection1` @ a11622d1 (PRs #1313–#1329 stacked) | OpenArt via MCP or CLI | none | Expression and Library (branch) | branch suites | All frames IN_REVIEW, none approved; SW-003 to SW-008 not generated |
| 15 | Library character detail and image inspector | PARTIALLY_IMPLEMENTED (branch only) | `realm/LibraryScreen.tsx`, `LibraryCharacterImageInspector.tsx` | `library-character-detail-media-hierarchy-inspector1` @ 888da3ea (PR #1328) | — | none | branch | branch suite | Unmerged |
| 16 | THE EXCHANGE facial identity masters | LIVE_AND_VERIFIED, as committed reference files only | `THE_EXCHANGE/MANIFEST/CHARACTER_VISUAL_REGISTRY_V1.json` | main | files | none | none | — | Four files re-hashed on 2026-10-25 and match (Sloane ×2, Gideon ×2); Richard, Vivienne and Nadine are FOUNDER_REFINEMENT_PROVISIONAL; no app reads them |
| 17 | THE EXCHANGE cast registry, edit log, just-in-time cast | IMPLEMENTED_NOT_RUNTIME_VERIFIED (branch only) | `shared/site00-fiction-production/castRegistry.ts`, `jitCast.ts`, `THE_EXCHANGE/SEASON_1/CAST_REGISTRY_V1.json`, `CAST_REGISTRY_EDITS_V1.json`, `scripts/the-exchange/edit-cast.ts` | PR #1692 (open) | Node file system | none | CLI only | `theExchangeCastRegistry` (5) | 12 BLOCKER findings (G-ID-06) |
| 18 | THE EXCHANGE ElevenLabs voice IDs | SCHEMA_OR_INTERFACE_ONLY (branch only) | same registry, `voice` block | PR #1692 | none | none | none | same | CONNECTOR_VERIFIED through the founder's ChatGPT connector; "composerIndependentVerification: NOT_PERFORMED" |
| 19 | Take, candidate and dailies records | PARTIALLY_IMPLEMENTED | `filmProduction/types.ts` (`FilmShotCandidate`, `FounderDailiesEntry`), `api/_lib/site00Evolve/filmProduction/filmProductionMemoryStore.ts:7` | main | Railway | none (in memory) | film-production page | FILM suite | Not linked to the catalogue; lost on restart |
| 20 | One-click fill of missing references | NOT_FOUND | — | — | — | — | — | — | Nearby: `characterGrokSlots()` in `assets.ts`, CAST NDX skip-existing, resident CLI scripts (branch) |

## 2. Branch status

| Branch | Tip | PR | On main |
| --- | --- | --- | --- |
| `studio-world-actor-catalogue-casting1-87ed` | 6825606c | #1246 (merged) | Yes |
| `live-character-runtime-architecture-1b86` | d67e2cc5 | #1263 (merged into the unified review branch) | Yes, blobs identical |
| `expression-actor-catalogue-resident-authority1` | 538c0d23 | #1327 | No |
| `library-character-detail-media-hierarchy-inspector1` | 888da3ea | #1328 | No |
| `expression-character-fabrication-end-to-end-resident-wiring1` | c1de7441 | none found; #1329's body says it was folded in | No |
| `studio-world-resident-geometry-complete-production-injection1` | a11622d1 | #1329 | No |
| Seven `studio-world-resident-*-openart*` branches | various | #1313–#1326, merged into each other 2026-10-05 | No |
| THE EXCHANGE stack | f43aa1f0 / d1f41ae3 | #1690, #1692, #1693, #1694 | No |

## 3. Competing sources of truth

| # | Registry | Where | Conflict |
| --- | --- | --- | --- |
| 1 | `acting-catalogue/seedCatalogue.ts` (SW-008, 017, 019, 031, 044, 052, 063) | main | Base for UI and fabrication |
| 2 | Fabrication receipts (SW-017 plus orphans SW-022, 034, 042) | main | Images contradict SW-017; orphans have no actor |
| 3 | `src/site00/productionAssets/studioWorldResidents.ts` (SW-001 to 008) | main | **SW-008 is Helena Voss here and Elio Vahn in #1** |
| 4 | `resident-intelligence/season1-ensemble` | branch | Replaces #1 on the fabrication path |
| 5 | Entry 002 cast state (`entry002RetroactiveMapping.ts`) | main | Its NDX actor is not in #1 |
| 6 | CAST NDX state and NDX visual authority | main, Supabase | Defined independently of #5 |
| 7 | THE EXCHANGE visual, dialogue, asset and cast registries | main (visual) and branch | No link to Studio World |
| 8 | Astral avatar library | main | Separate domain (end-user avatars) |
| 9 | `bridgeActingCatalogue.ts` | main | Projection of #1; not new data |

## 4. Ownership against the sprint's boundary (§28)

| Boundary item | Owner today |
| --- | --- |
| Actor identity | Catalogue types (no data); CAST NDX for NDXBOOK; THE EXCHANGE visual registry |
| Character identity and assignment | Catalogue `ProductionCharacter`; THE EXCHANGE cast registry |
| Appearance and approved Looks | Catalogue `CharacterCampaignLook` (unversioned); fabrication (browser) |
| Facial and body references | CAST NDX (Supabase); THE EXCHANGE (repository); residents (branch) |
| Voice associations | THE EXCHANGE only |
| Reusable performance identity | Operational types only |
| Digital-human fabrication | Fabrication plus runtime (mock) |

The boundary the sprint describes matches the type design. The data sits in three places that do not reference each other. Recommendation (deliverables 09 and 20): pick one canonical actor registry (D-05) and make the others projections; do not add a tenth.

## 5. Unknowns

- Whether any CAST NDX anchor reached APPROVED in production Supabase (not queried).
- Whether Voice Lab audio still exists on fal.
- Whether the founder's Unreal host works.
- What the FSBW resident canon contains (not in this repository).
