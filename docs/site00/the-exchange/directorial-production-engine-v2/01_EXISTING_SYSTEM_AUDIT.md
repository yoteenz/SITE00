# 01 — Existing system audit

**Sprint:** `P0.THE-EXCHANGE.COMPOSER.CAST-VOICE-SYNC-AND-DIRECTORIAL-PRODUCTION-ENGINE.V2` · **Authorization:** production planning approved; no credit-consuming generation without approved job costs · **Branch:** `cursor/the-exchange-directorial-production-engine-8aec`, stacked on [PR #1690](https://github.com/yoteenz/SITE00/pull/1690) (`cursor/the-exchange-canon-lock-screenplay-8aec` at `3466534f0`). PR #1690 is not merged by this sprint.

**Result:** the engine extends the existing `shared/site00-fiction-production` package. It does not start a parallel one. `THE_EXCHANGE/FOUNDER_SOURCE/` and `THE_EXCHANGE/MANIFEST/` are byte-identical to the baseline (`git diff --name-status 3466534f0..HEAD -- THE_EXCHANGE/FOUNDER_SOURCE THE_EXCHANGE/MANIFEST` is empty). No credits were spent.

## What existed at the baseline, and what this sprint did with it

| System | Where | At the baseline | This sprint |
| --- | --- | --- | --- |
| Season master (86 releases, 127:40) | `seasonMaster.ts`, `SEASON1_86_RELEASE_MASTER_V1.json` | Story structure approved | Read only. It is the sole source of the Level A scene index. |
| Fountain parser and screenplay checks | `fountain.ts`, `screenplay.ts`, `check-screenplays.ts` | Five drafts, S1-01 to S1-05 | Reused unchanged. S1-01 v2 parses with the same parser; v1 is kept in `SCREENPLAYS/HISTORY/`. |
| Auto shot planner | `shotPlanner.ts`, `SHOT_LISTS/` | Shot lists for S1-01 to S1-05 from screenplay text | Kept. For S1-01 only, the list now records `supersededBy` the directed plan and stays as history. S1-02 to S1-05 are unchanged in kind. |
| Production manifests | `manifest.ts`, `PRODUCTION_MANIFESTS/` | Voice blocker said "no approved voice" | The blocker now separates a linked voice identity from an approved recorded take. |
| Owner registries | `registries.ts`; dialogue style, asset, set/wardrobe/prop and character visual registries | Voice ids `null` | Still the owners. Three voice ids linked as `CONNECTOR_VERIFIED` with evidence (CE-0001 to CE-0003). The validator rejects a connector-verified id without source, date and scope. |
| Continuity validator | `continuity.ts` | 15 checks | Reused. Current result: 0 hard conflicts, 1 warning, 7 open questions. |
| Approvals and pipeline | `approvals.ts`, `pipeline.ts`, `APPROVAL_STATE_V1.json`, `PIPELINE_STATE_V1.json` | `CHARACTER_VOICE` not submitted | Voice identity approved for Sloane, Gideon and Kai from the founder's directive (identity only). Pipeline lineage for S1-01 points at the directed shot list. |
| Spend gate | `dispatch.ts` | Pre-spend authorization type and job record | Reused by the new routing and review gates. No job was dispatched. |
| Provider audit and quotes | `providers.ts`, `PROVIDER_PRICE_QUOTES_V1.json` | ElevenLabs `NOT_VERIFIED` | ElevenLabs row is now `BLOCKED_NO_CREDENTIALS` with the connector evidence. V1 quotes kept; `PROVIDER_PRICE_QUOTES_V2.json` added, including that `kling-4-omni` is not offered through the OpenArt connection. |
| Kai's Note screen test | `PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json` | `PRODUCTION_TEST_ONLY` | Untouched and kept separate from S1-01 (§29). |
| Docs helpers | `scripts/the-exchange/canon-lock-docs/md.ts` | Markdown table and bullet helpers | Reused by the V2 renderer. |

## What was missing

Frame-accurate timing; a multitrack timeline; shot length driven by motion; keyframe provenance; room, person and prop continuity across shots; music supervision with silence as a decision; sound design; picture-to-sound sync; provider routing that says who can actually reach a model; cost with retake risk; partial approvals and plain-language change requests; a ten-section scene packet; an index of every scene in the season; a dependency graph; cast tracked just in time; one cast view over the owner registries; and a rule that only one unit is in founder review.

## What was added

| Area | Files |
| --- | --- |
| Engine | `shared/site00-fiction-production/directorial/`: `timecode`, `timeline`, `events`, `motion`, `keyframes`, `spatial`, `audio`, `routing`, `review`, `packet`, `intent`, `knowledgeBase`, `progression`, `schemas`, `types` |
| Directed scene | `shared/site00-fiction-production/scenes/s1-01/` (shots, keyframes, spatial, music, intent, decisions) and `scenes/index.ts` |
| Season level | `sceneIndex.ts`, `dependencyGraph.ts`, `jitCast.ts`, `castRegistry.ts` |
| Scripts | `build-directorial-production.ts`, `edit-cast.ts`, `render-directorial-docs.ts` with `directorial-docs/` |
| Data | `CAST_REGISTRY_V1.json`, `CAST_REGISTRY_EDITS_V1.json`, `SEASON1_SCENE_INDEX_V1.json`, `SEASON1_SCENE_DEPENDENCY_GRAPH_V1.json`, `FUTURE_PRODUCTION_DEPENDENCIES_V1.json`, `PRODUCTION_KNOWLEDGE_BASE_V1.json`, `ACTIVE_PRODUCTION_V1.json`, `PRODUCTION_SCENES/S1-01/` (9 files) |
| Tests | `theExchangeCastRegistry`, `theExchangeSeasonSceneIndex`, `theExchangeDirectorialTimeline`, `theExchangeScenePacketProduction`, `theExchangeDirectorialDocs` |

## Existing files changed, and why

| File | Change |
| --- | --- |
| `registries.ts` | `VoiceLink` type and `voiceLinkProblem()` so a connector-verified voice must carry evidence. |
| `providers.ts` | ElevenLabs row: credentials absent here; the founder's voices live in the founder workspace. |
| `manifest.ts` | Voice blocker wording (identity linked versus take approved). |
| `index.ts` | Re-exports the new modules. |
| `build-season1-production.ts` | Uses the directed plan for S1-01 lineage and cost when one exists; refuses to build if the plan and screenplay versions differ. |
| `CHARACTER_DIALOGUE_STYLE_REGISTRY_V1.json`, `PRODUCTION_ASSET_REGISTRY_V1.json` | Three voice ids with evidence. Nothing else in those rows changed. |
| `SCREENPLAYS/S1-01_DUSK.fountain` | v2, still `DRAFT — FOUNDER REVIEW REQUIRED`. v1 kept in `HISTORY/`. |
| Backlog, manifests, approvals, pipeline, capability audit | Regenerated by the existing build script. The S1-01 runtime estimate moved from 41.5 s to 45.1 s. The auto-planner total across the five drafts moved from $178.22 / 26,236 credits to $188.02 / 27,797 because the S1-01 text changed. |
| `theExchangeProductionPipeline`, `theExchangeScreenplaySystem` tests | Assertions updated for the linked voices and the new totals; two negative cases added (connector-verified id without evidence; voice id with no verification). |

## Conventions followed

| Convention | Applied |
| --- | --- |
| The repository is the store for The Exchange (no fiction tables in Supabase) | All records are versioned JSON, CSV, Fountain and Markdown under `THE_EXCHANGE/` and `docs/site00/the-exchange/`. |
| One owner per fact | The cast registry is a view. Edits go through `edit-cast.ts` to the owner registry and an append-only log. |
| Generated outputs are reproducible | Every JSON and CSV is built by a script from typed sources; the builds are idempotent and the tests compare committed files to fresh output. |
| Deliverables do not fork data | Deliverables 02, 05, 06, 21, 22 and 23 are byte copies of the canonical files; a test fails if they drift. |
| Module style | Node `fs`, `process.cwd()` roots, `.js` import suffixes, strict TypeScript, flat re-exports plus `Directorial` namespace. |
| History is never rewritten | Founder packages and earlier screenplay versions are kept as they were; superseded items point at their replacement. |

## Not verified here

- The ElevenLabs voices are linked from the founder's connector check, not verified by this environment, and nothing here edits the ElevenLabs voice library.
- No generation workflow (image, video, voice, music or assembly) was run end to end.
- Founder-held assets marked `UNIMPORTED` (for example Kai's ten close-up angles) are not in the repository and were not reconstructed.
