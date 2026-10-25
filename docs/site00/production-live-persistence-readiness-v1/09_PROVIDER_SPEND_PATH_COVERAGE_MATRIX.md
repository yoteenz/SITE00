# 09 — Provider spend-path coverage matrix

Sprint §14. A static audit of every code path in `api/`, `server/`, `shared/` and `scripts/` that can send a billable request to an AI or media provider. Method (exact patterns and the import graph): the `method` field of `PROVIDER_SPEND_PATH_AUDIT_V1.json`, next to this file. Every row cites `file:line`.

- **Nothing was run or called.** No endpoint was called, no provider was contacted, and no repository file was changed.
- **What is still unknown.** Which environment flags and keys are set on Railway decides which rows spend in production today. That could not be inspected (§9).

## 1. Headline

**Most paid paths outside the production spine can be reached without a founder or admin session.** Nothing in front of them adds auth:

- `server/index.ts:51-53` answers every API route with `Access-Control-Allow-Origin: *`;
- `server/routes.ts` mounts the handlers directly.

The repository's provider gateway (`shared/site00-production-guardrails/providerGateway/`) is used only by a path that never calls a provider. No live path checks a quote or budget, apart from Opus Native's per-run cap. The production spine (this sprint) has the full gate, and its only provider route is disabled.

| Status | Paths | Meaning |
| --- | --- | --- |
| UNGATED | 15 | Reachable without an explicit spend action: a read path, or a public action with no spend flag |
| CLIENT_FLAG_ONLY | 10 | Public; spends when the request body says `founderConfirmedSpend: true` or `explicitFounderAction: true` |
| EXPLICIT_UNBUDGETED | 19 | An explicit admin/founder action, with no quote or budget check |
| DISABLED | 6 | Code present that cannot run as configured (includes the spine's OpenArt route) |
| SCRIPT_ONLY | 8 | Run by hand from `scripts/` |
| GATED (live) | 0 | — |

## 2. The five riskiest paths (re-read in the code for this report)

1. **Expression Engine GET phases call Anthropic with no authentication.**
   - `api/site00/expression-engine.ts` has no auth check at all.
   - `?phase=C1.4` (`:565-570`) and the other C1.x phases reach `seniorCreativeJudgment/creativeReasoningProvider.ts`. That calls the Anthropic API unless `SITE00_CREATIVE_REASONING_FORCE_FALLBACK=1` (`:101-104`).
   - The workspace requests several of these on mount.
2. **Public fal endpoints guarded only by a body flag.** `design-asset-reconstruction` `dispatch_skins_candidate` (`:602-627`) runs `openai/gpt-image-2/edit` through fal on any prompt and image URL once `explicitFounderAction: true` is sent. The twin-v2 and twin-v3 generation endpoints follow the same pattern; one POST can run up to 6 jobs.
3. **Opus Native is public.** `api/site00/opus-native.ts` `start` (`:286+`) runs a paid model whenever the request says the founder confirmed the spend. Each run is capped (`modeContracts.ts`); the number of runs is not.
4. **Projects API.**
   - Two GET actions resume interrupted fal rounds after a restart: `character_visual_casting_get` and `founder_creative_ingestion_get`.
   - `founder_creative_ingestion_generate_photo` and the `marketing_expression_experiment_01_v23_*` actions check only for a signed-in user, not an admin.
   - The photo and visual-casting services dispatch by default when `dispatchFal` is omitted. #1696's opt-in fix covered the Expression Engine and ASSTS, not these Evolve modules.
5. **Unauthenticated POSTs with no spend flag at all.** These are:
   - Expression Engine `GENERATE_FINAL_STORYBOARD` (its LOVE_IT precondition is settable through the same public endpoint);
   - twin-v3 `COMPILE_IMPLEMENTATION`;
   - the Sol and Grok design benches.

## 3. Full matrix

Ordered riskiest first. Cells are shortened; full text and evidence are in the JSON.

| Path | Provider | Media | Entry | Trigger | Auth | Spend guard | Quote/budget | Auto-retry | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `evolve-formation-anthropic-on-get` | Anthropic | TEXT | GET /api/site00/projects?action=creative_direction&slug=X (projects.ts:482-498) and GET /api/admin/site00-evo… | READ_PATH | admin email (projects.ts:491; site00-evolve.ts:132) | none beyond admin auth: runs when brand lore present, readiness not blocked and no canoni… | NO | same as POST (JSON retry + re… | **UNGATED** |
| `expression-engine-copy-reasoning` | Anthropic | TEXT | GET ?phase=C1.7 (expression-engine.ts:673) and C1.8 (:681 -> compareDeterministicVsFullReasoning entry003C14P… | READ_PATH | public | env/health only: resolveCopyRuntimeMode -> FULL_REASONING/HYBRID when key configured and … | NO | NO | **UNGATED** |
| `expression-engine-creative-director-llm-on-get` | Anthropic | TEXT | GET /api/site00/expression-engine?phase=C1.1 (expression-engine.ts:754), C1.2 (:746), C1.3 (:738), C1.4 (:567… | READ_PATH | public (no auth in expression-engine handler) | none beyond env: runs whenever ANTHROPIC_API_KEY is set and EXPRESSION_ENGINE_TEST_DETERM… | NO | NO | **UNGATED** |
| `expression-engine-generate-final-storyboard` | fal.ai | IMAGE | POST /api/site00/expression-engine action=GENERATE_FINAL_STORYBOARD (api/site00/expression-engine.ts:359-368) | EXPLICIT_USER_ACTION | public: expression-engine handler has no auth check (api/site00/expression-engine.ts:319-… | handler passes dispatchFal:true, explicitFounderAction:true itself (expression-engine.ts:… | NO | NO | **UNGATED** |
| `expression-engine-meridian-live-job` | Anthropic | TEXT | POST /api/site00/expression-engine action=START_C19R3_MERIDIAN_LIVE_JOB (expression-engine.ts:402-415); GET ?… | EXPLICIT_USER_ACTION … | public | none; the POST job runs runC19R3MeridianLivePostRedeploy, which calls applyMeridianLiveAc… | NO | inherits 1 retry per reasonin… | **UNGATED** |
| `expression-engine-senior-creative-reasoning` | Anthropic | TEXT | GET /api/site00/expression-engine?phase=C1.4 (:567 -> entry003C14Pipeline.ts:20), C1.5 (:573 -> entry003C14Pi… | READ_PATH | public | env only: VITEST or SITE00_CREATIVE_REASONING_FORCE_FALLBACK==='1' forces deterministic (… | NO | YES | **UNGATED** |
| `grok-access-and-timing-probes` | xAI | TEXT | GET /api/site00/twin-test-a-design-bench?action=access_probe/model_access (twin-test-a-design-bench.ts:31-38 … | READ_PATH | public | none; caches 45 s (grokAccessProbe.ts:65, :142-144) and 120 s (grokTimingProbe.ts:19) exc… | NO | NO | **UNGATED** |
| `grok-design-bench-run` | xAI | TEXT | POST /api/site00/twin-test-a-design-bench action start/start_run/retry/retry_grok (api/site00/twin-test-a-des… | EXPLICIT_USER_ACTION | public: no auth (handler only applies capture CORS, twin-test-a-design-bench.ts:20-22) | none (no flag); readiness/runtime-health checks only (service.ts:76-86) | NO | YES | **UNGATED** |
| `projects-experiment-g-formation-get-resume` | Anthropic | TEXT | GET /api/site00/projects?action=experiment_g_get (projects.ts:4305) and ?action=experiment_g_direction_get (p… | READ_PATH | admin email | none: re-enqueues formation when status FORMING, age >= 45 s (experimentGService.ts:44) a… | NO | YES | **UNGATED** |
| `projects-founder-creative-ingestion-get-resume` | fal.ai | IMAGE | GET /api/site00/projects?action=founder_creative_ingestion_get (projects.ts:2390) -> getFounderCreativeIngest… | READ_PATH | admin email (case has canAccessFounderProjectAsOwner per awk scan of projects.ts) | none: resumes remaining slides when tracking RUNNING, no in-process attempt, age between … | NO | YES | **UNGATED** |
| `projects-founder-creative-ingestion-photo` | fal.ai | IMAGE | POST /api/site00/projects action founder_creative_ingestion_generate_photo (projects.ts:2520-2545) | EXPLICIT_USER_ACTION | ANY signed-in Supabase user: getAuthUser only (projects.ts:401-408); this case has NO can… | none required: dispatch defaults ON when dispatchFal omitted ((params.dispatchFal ?? falC… | NO | see projects-founder-creative… | **UNGATED** |
| `projects-marketing-expression-v23-any-user` | fal.ai | IMAGE | POST /api/site00/projects action marketing_expression_experiment_01_v23_generate (projects.ts:1986-2010) / _v… | EXPLICIT_USER_ACTION | ANY signed-in user: no canAccessFounderProjectAsOwner in these two cases (projects.ts:198… | none | NO | NO | **UNGATED** |
| `projects-visual-casting-get-resume` | fal.ai | IMAGE | GET /api/site00/projects?action=character_visual_casting_get&slug=X (projects.ts:3807-3815) -> getVisualCasti… | READ_PATH | admin email (projects.ts:3810) | none: fires when DB tracking says RUNNING, this process has no active attempt, and starte… | NO | YES | **UNGATED** |
| `sol-design-bench` | OpenAI | TEXT | POST /api/site00/sol-design-bench action START_SOL_TEST / RETRY_SOL_TEST / RUN_SOL_STRUCTURED_OUTPUT_PROOF (a… | EXPLICIT_USER_ACTION | public: no auth in handler (api/site00/sol-design-bench.ts:20-139) | none (no spend flag); preconditions: provider readiness + reference must match the expect… | NO | NO | **UNGATED** |
| `twin-v3-mobile-twin-implementation-compile` | fal.ai | IMAGE | POST /api/site00/twin-v3-mobile-twin-implementation action COMPILE_IMPLEMENTATION | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | none: no spend flag on COMPILE_IMPLEMENTATION (api/site00/twin-v3-mobile-twin-implementat… | NO | NO | **UNGATED** |
| `design-asset-reconstruction-live-acceptance` | fal.ai | IMAGE | POST /api/site00/design-asset-reconstruction?action=generate (body.live=true) / action=live_acceptance | EXPLICIT_USER_ACTION | public (no auth in handler) | client flag explicitFounderAction (liveAcceptancePipeline.ts:92; design-asset-reconstruct… | NO | NO | **CLIENT_FLAG_ONLY** |
| `design-asset-reconstruction-skins-candidate` | fal.ai | IMAGE | POST /api/site00/design-asset-reconstruction?action=dispatch_skins_candidate | EXPLICIT_USER_ACTION | public: handler has no auth check at all (api/site00/design-asset-reconstruction.ts:96-65… | client flag explicitFounderAction===true only (api/site00/design-asset-reconstruction.ts:… | NO | NO | **CLIENT_FLAG_ONLY** |
| `experience-compiler-creative-director-run` | OpenAI | TEXT | POST /api/site00/experience-compiler-creative-director?action=run (api/site00/experience-compiler-creative-di… | EXPLICIT_USER_ACTION | public: no auth check in handler (experience-compiler-creative-director.ts:30-196); threa… | client flag founder_initiated===true (experience-compiler-creative-director.ts:115-118; c… | NO | YES | **CLIENT_FLAG_ONLY** |
| `opus-native-run` | Anthropic | TEXT | POST /api/site00/opus-native action start / continue (api/site00/opus-native.ts:286-395) | EXPLICIT_USER_ACTION | public: no auth in handler (api/site00/opus-native.ts:54-69; only CORS helper) | client flag founderConfirmedSpend (runtime.ts:99-100) + per-run token/cost meter with har… | PARTIAL | NO | **CLIENT_FLAG_ONLY** |
| `twin-v2-atomic-concept-generation` | fal.ai | IMAGE | POST /api/site00/twin-v2-atomic-concept-generation | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | client flag founderConfirmedSpend only (api/site00/twin-v2-atomic-concept-generation.ts:3… | NO | NO | **CLIENT_FLAG_ONLY** |
| `twin-v2-fal-parallel-twin-proof` | fal.ai | IMAGE | POST /api/site00/twin-v2-fal-parallel-twin-proof | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | client flag founderConfirmedSpend only (api/site00/twin-v2-fal-parallel-twin-proof.ts:54-… | NO | NO | **CLIENT_FLAG_ONLY** |
| `twin-v2-visual-concept` | fal.ai | IMAGE | POST /api/site00/twin-v2-visual-concept (body.action generate/regenerate/refine) | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | client body flag founderConfirmedSpend only (api/site00/twin-v2-visual-concept.ts:79-82) | NO | NO | **CLIENT_FLAG_ONLY** |
| `twin-v3-design-page-authority` | fal.ai | IMAGE | POST /api/site00/twin-v3-design-page-authority (action GENERATE/REFINE/REGENERATE/REGENERATE_TERRITORY) | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | client flag founderConfirmedSpend only (api/site00/twin-v3-design-page-authority.ts:38-41) | NO | NO | **CLIENT_FLAG_ONLY** |
| `twin-v3-forensic-ui-blueprint` | fal.ai | IMAGE | POST /api/site00/twin-v3-forensic-ui-blueprint action GENERATE_FORENSIC_UI_BLUEPRINT | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | client flag founderConfirmedSpend only (api/site00/twin-v3-forensic-ui-blueprint.ts:48-51) | NO | NO | **CLIENT_FLAG_ONLY** |
| `twin-v3-mobile-twin-pipeline` | fal.ai | IMAGE | POST /api/site00/twin-v3-mobile-twin-pipeline (body.action GENERATE_MOBILE_RENDER, REFINE_MOBILE_RENDER, GENE… | EXPLICIT_USER_ACTION | public: no auth check anywhere in handler; handleTwinV2VisualConceptCors only sets CORS h… | client flag founderConfirmedSpend only (api/site00/twin-v3-mobile-twin-pipeline.ts:56-57;… | NO | NO | **CLIENT_FLAG_ONLY** |
| `assts-generate` | fal.ai | IMAGE | POST /api/admin/site00-assts action generate (site00-assts.ts:185-190) / continue-lineage (:179-183) / regene… | EXPLICIT_USER_ACTION | admin email: resolveAdminAuth (api/admin/site00-assts.ts:63-67) | admin auth only; D-13 fix verified: library GET no longer generates (ensureAutoGeneration… | NO | NO | **EXPLICIT_UNBUDGETED** |
| `assts-loader-post-process` | fal.ai | VIDEO | POST /api/admin/site00-assts action post-process-loader / reprocess-loader (site00-assts.ts:291-300) | EXPLICIT_USER_ACTION | admin email (site00-assts.ts:63) | admin auth; client modelId validated against registry (pipeline.ts:103-104; registry.ts:1… | NO | NO | **EXPLICIT_UNBUDGETED** |
| `astral-world-generation` | fal.ai | IMAGE | POST /api/admin/site00-astral-world-generation action generate / generate-missing / dispatch-p0 / dispatch-p1… | EXPLICIT_USER_ACTION | admin email (site00-astral-world-generation.ts:37-41) | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `evolve-creative-direction-visual-assets` | fal.ai | IMAGE | POST /api/admin/site00-evolve action creative_direction_generate_visual_assets (site00-evolve.ts:471-475) | EXPLICIT_USER_ACTION | admin email: resolveAdminAuth (api/admin/site00-evolve.ts:132-137; api/_lib/adminAuth.ts:… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `evolve-formation-anthropic-post` | Anthropic | TEXT | POST /api/admin/site00-evolve action creative_direction_reform / creative_direction_formation_retry (site00-e… | EXPLICIT_USER_ACTION | admin email: resolveAdminAuth (api/admin/site00-evolve.ts:132-137; api/_lib/adminAuth.ts:… | admin auth only | NO | YES | **EXPLICIT_UNBUDGETED** |
| `evolve-production-jobs-and-pilots` | fal.ai + Anthropic | IMAGE | POST /api/admin/site00-evolve actions creative_direction_complete_v1_directions (:480-487), creative_directio… | EXPLICIT_USER_ACTION | admin email: resolveAdminAuth (api/admin/site00-evolve.ts:132-137; api/_lib/adminAuth.ts:… | admin auth only (dryRun:true optional) | NO | NO | **EXPLICIT_UNBUDGETED** |
| `opus-design-shell-run` | Anthropic | TEXT | POST /api/site00/opus-design-shell action run / request_changes (api/site00/opus-design-shell.ts:136-148, :18… | EXPLICIT_USER_ACTION | founder only: getAuthUser + isFounderPrivilegedAccount (api/site00/opus-design-shell.ts:7… | founderConfirmedRun===true (opus-design-shell.ts:137, :207) | NO | NO | **EXPLICIT_UNBUDGETED** |
| `page-concept-generation` | Anthropic + OpenAI + fal.ai | IMAGE | POST /api/site00/page-concept-generation action start (async background, api/site00/page-concept-generation.t… | EXPLICIT_USER_ACTION | founder only: getAuthUser + isFounderPrivilegedAccount (api/site00/page-concept-generatio… | founderConfirmedSpend===true (page-concept-generation.ts:229-232; startPageConceptGenerat… | NO | YES | **EXPLICIT_UNBUDGETED** |
| `page-concept-viewport-family` | fal.ai + OpenAI | IMAGE | POST /api/site00/page-concept-viewport-family action generateExperienceExpression / regenerateExperienceExpre… | EXPLICIT_USER_ACTION | founder only (api/site00/page-concept-viewport-family.ts:33-42) | founder auth only - no founderConfirmedSpend on any action (Body type :17-28; runPageConc… | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-brand-character-synthesis` | fal.ai + Anthropic | IMAGE | POST /api/site00/projects action experiment_h_synthesis_run (projects.ts:1541-1562, forceRetry) / experiment_… | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-evolve-anthropic-completion` | Anthropic | TEXT | POST /api/site00/projects actions experiment_f_prepare_snapshot/_reform_set (projects.ts:1229, :1284 -> exper… | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-gpt-image2-adapter-consumers` | fal.ai + Anthropic | IMAGE | POST /api/site00/projects action personality_replay_execute (projects.ts:861), personality_replay_six_directi… | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-marketing-expression` | fal.ai | IMAGE | POST /api/site00/projects action marketing_expression_experiment_01[_v2/_v21/_v22/_v23]_generate / _generate_… | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-neural-voice` | fal.ai | VOICE | POST /api/site00/projects action founder_character_discovery_neural_voice_audition (projects.ts:3616-3633) / … | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-visual-casting` | fal.ai | IMAGE | POST /api/site00/projects action character_visual_casting_generate / _retry_fal / _next_round / _regenerate_f… | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only; dispatch defaults ON when the body omits dispatchFal: shouldDispatch = p… | NO | see projects-visual-casting-g… | **EXPLICIT_UNBUDGETED** |
| `projects-visual-development` | fal.ai | IMAGE | POST /api/site00/projects action visual_development_generate (projects.ts:4921-4937) | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `projects-visual-formulation` | fal.ai + Anthropic | IMAGE | POST /api/site00/projects action experiment_g_visual_formulate / experiment_g_visual_generate (projects.ts:45… | EXPLICIT_USER_ACTION | admin email: getAuthUser bearer token (api/site00/projects.ts:401-408) + canAccessFounder… | admin auth only | NO | NO | **EXPLICIT_UNBUDGETED** |
| `studio-world-live-adapter` | Studio World (external prod… | OTHER | marketingEngagements service provisionCampaign / submitClientAction (api/_lib/marketingEngagements/service.ts… | EXPLICIT_USER_ACTION | signed-in user for marketing-engagements (marketing-engagements.ts:31); others not traced | not verified | not verified | not verified | **EXPLICIT_UNBUDGETED** |
| `workspace-self-concept-generation` | Anthropic + OpenAI + fal.ai | IMAGE | POST /api/site00/workspace-self-concept-generation action generate / retry_failed (api/site00/workspace-self-… | EXPLICIT_USER_ACTION | founder only (api/site00/workspace-self-concept-generation.ts:34-43) | founderConfirmedSpend (workspace-self-concept-generation.ts:67; runWorkspaceSelfGeneratio… | NO | NO | **EXPLICIT_UNBUDGETED** |
| `expression-engine-entry002-dispatch-modules` | fal.ai | IMAGE | GET phases B3/B41/B42/B44/B45/B46 only, which now pass dispatchFal=false (expression-engine.ts:811-1174); mod… | READ_PATH | public (if re-enabled) | dispatchFal opt-in | NO | YES | **DISABLED** |
| `fal-image-via-production-gateway` | fal.ai | IMAGE | none: no importer in api/server/shared/scripts/src (grep runFalReferenceImageViaProductionGateway) | AUTOMATIC | n/a | would use runProductionProviderRequest | n/a | NO | **DISABLED** |
| `jurnl-production-gateway` | OpenArt (manual) | IMAGE | POST /api/admin/jurnl-production action issue-spend-authorization / dispatch-dry-run / register-manual-output… | EXPLICIT_USER_ACTION | admin email (jurnl-production.ts:26-30) | provider gateway spendAuthorization (spendAuthorization.ts:49-82) + budget precheck (budg… | PARTIAL | NO | **DISABLED** |
| `production-spine-openart` | OpenArt | IMAGE/VIDEO | POST /api/site00/production-spine (Director Composer jobs) | EXPLICIT_USER_ACTION | admin email + founder or project member role (api/site00/production-spine.ts:224-231; rol… | spine spend gate: founder budget authorization, exact quote, quote age, authorized max, e… | YES | NO | **DISABLED** |
| `studio-builder-generation` | fal.ai | IMAGE | none: submitStudioBuilderFalQueue / generateStudioBuilderAsset have no callers (grep); only poll/result helpe… | AUTOMATIC | n/a | n/a | n/a | NO | **DISABLED** |
| `unmounted-or-dead-provider-modules` | Anthropic / OpenAI / fal.ai | TEXT/IMAGE | none from server/routes.ts or startup (import-graph BFS found no route reaching these files) | AUTOMATIC | n/a | n/a | n/a | NO | **DISABLED** |
| `script-email-intake-fal-smoke` | fal.ai | IMAGE | script only: run manually (node/tsx) with FAL_KEY in env | SCRIPT_ONLY | whoever holds FAL_KEY locally | none (only FAL_KEY presence check) | NO | NO | **SCRIPT_ONLY** |
| `script-email-intake-generate` | fal.ai | IMAGE | script only: run manually (node/tsx) with FAL_KEY in env | SCRIPT_ONLY | whoever holds FAL_KEY locally | none (only FAL_KEY presence check) | NO | NO | **SCRIPT_ONLY** |
| `script-email-intake-remove-background` | fal.ai | IMAGE | script only: run manually (node/tsx) with FAL_KEY in env | SCRIPT_ONLY | whoever holds FAL_KEY locally | none (only FAL_KEY presence check) | NO | NO | **SCRIPT_ONLY** |
| `script-ndxbook-creative-direction-assets` | fal.ai | IMAGE | script only: run manually (node/tsx) with FAL_KEY in env | SCRIPT_ONLY | whoever holds FAL_KEY locally | none (only FAL_KEY presence check) | NO | NO | **SCRIPT_ONLY** |
| `script-reconstruct-skins-ndx-golden` | fal.ai | IMAGE | script only: run manually (node/tsx) with FAL_KEY in env | SCRIPT_ONLY | whoever holds FAL_KEY locally | none (only FAL_KEY presence check) | NO | NO | **SCRIPT_ONLY** |
| `script-test-neural-voice-fal` | fal.ai | VOICE | script only: run manually (node/tsx) with FAL_KEY in env | SCRIPT_ONLY | whoever holds FAL_KEY locally | none (only FAL_KEY presence check) | NO | NO | **SCRIPT_ONLY** |
| `scripts-calling-deployed-spend-endpoints` | fal.ai / Anthropic / OpenAI… | IMAGE/TEXT | scripts that fetch spend endpoints on a running API: scripts/inspectNdxbookFormation.ts, scripts/liveMarkedUp… | SCRIPT_ONLY | as per endpoint | as per endpoint | NO | as per endpoint | **SCRIPT_ONLY** |
| `scripts-importing-server-provider-code` | fal.ai / Anthropic | IMAGE/TEXT | scripts that import api/_lib services and call providers directly from a dev machine (import-graph result): s… | SCRIPT_ONLY | local env keys | as in the imported service (mostly none) | NO | as service | **SCRIPT_ONLY** |

## 4. Read paths that can reach a provider

| Path | Provider | Auth | Called by the UI automatically |
| --- | --- | --- | --- |
| GET /api/site00/expression-engine?phase=C1.1 / C1.2 / C1.3 / C1.4 | Anthropic | public | yes, useExpressionEngineEntry002.ts:51-60 |
| GET /api/site00/expression-engine?phase=C1.4 / C1.5 / C1.6 / C1.7 / C… | Anthropic | public | C1.4, C1.6, C1.7 on mount (useExpressionEngineEntry002.ts:58-60); C1.… |
| GET /api/site00/twin-test-a-design-bench?action=access_probe / runtim… | xAI | public | readiness and runtime_health (grokTwinTestAClient.ts:125, :174) |
| GET /api/site00/projects?action=creative_direction ; GET /api/admin/s… | Anthropic | admin | site00ProjectsApi.ts:140; evolveApi.ts:302-305 |
| GET /api/site00/projects?action=character_visual_casting_get | fal.ai | admin | site00ProjectsApi.ts:2002 |
| GET /api/site00/projects?action=founder_creative_ingestion_get | fal.ai | admin | site00ProjectsApi.ts:1573 |
| GET /api/site00/projects?action=experiment_g_get / experiment_g_direc… | Anthropic | admin | site00ProjectsApi.ts:397, :528 |

Verified NOT dispatching on read: /api/admin/site00-assts GET library/batch/asset/poll (service.ts:451; generation.ts:532-533), expression-engine B3/B41-B46/B49 GET (dispatchFal=false), /api/site00/page-concept-generation GET (read/hydrate only), /api/site00/astral-world-assets (read-only), Grok GET 'latest'/'run', twin endpoints' GET status, ASSTS loader poll.

## 5. Automatic retries of paid calls

| Path | Risk | Evidence |
| --- | --- | --- |
| grok-design-bench-run | re-sends a possibly already-billed request after a lost response | grokProviderRetry.ts:236-330 (3 attempts; network errors with null status retried, :312); constants.ts:14 |
| experience-compiler-creative-director-run | 5xx/timeout re-send of a high-reasoning gpt-5.6-sol call | creativeModelGateway.ts:130-147; modelConfig.ts:47 (2 attempts on 429/500/502/503/504) |
| expression-engine-senior-creative-reasoning | parse-failure retry re-bills a call that already succeeded at the provider; triggered from public GET | creativeReasoningProvider.ts:56, :188-247 (retry once on non-OK, parse failure or thrown error) |
| page-concept-generation CGPT | 429 retries are usually unbilled; repair call is an automatic extra paid call | executePageConceptCgptStage.ts:254-450 (up to 4 attempts, 429 only; pageConceptCgpt429.ts:5) + chained synthe… |
| evolve formation (anthropicProvider) | automatic chained paid calls; reachable from admin GET | anthropicProvider.ts:120-129 (re-call on JSON parse failure); formationService.ts:290-310 (automatic critique… |
| projects-visual-casting-get-resume | resubmits an interrupted paid round after restart/second instance | castingFalBackgroundJob.ts:170-196 (startCastingRoundFalBackgroundJob force:true from GET hydrate) |
| projects-founder-creative-ingestion-get-resume | resubmits remaining paid slides on read | founderCreativeFalBackgroundJob.ts:285-308 |
| projects-experiment-g-formation-get-resume | re-enqueues Anthropic formation on read | experimentGService.ts:473-484 |
| design-asset-reconstruction-live-acceptance (chained) | automatic second paid call (birefnet), not a retry | liveAcceptancePipeline.ts:341 background removal after generation |
| expression-engine-entry002-dispatch-modules (latent) | automatic fallback to a second paid model if these modules are ever re-enabled | entry002ReelStoryboardDispatch.ts:81-120; entry002AnchorDispatch.ts:122-143 |
| twin-v2-fal-parallel-twin-proof (extra call) | paid probe each time, not a retry | dispatchFalParallelTwinGeneration.ts:111 probe with num_images:2 on every request |

## 6. Unknown cost recorded as zero

| Location | Detail |
| --- | --- |
| shared/site00-production-guardrails/providerGateway/spendAuthorizatio… | const est = request.estimatedCostCredits ?? 0 - a missing estimate passes the maxCredits check as zero |
| api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDisco… | failed/thrown neural voice generation recorded with costUsd: 0 even though the provider may have billed (e.g. timeout after accept) |
| api/_lib/site00Evolve/creativeDirection/personalityReplay/sixDirectio… | anthropicRequests += requestCount ?? 0; estimatedCostUsd += tokenUsage.estimatedCostUsd ?? 0 |
| api/_lib/site00Evolve/creativeDirection/brandPresentationConceptExper… | anthropicInputTokens/OutputTokens: usage.* ?? 0 when usage absent (cost is a fixed 0.05 estimate) |
| api/_lib/site00OpusDesignShell/runShellGeneration.ts:170-179 | missing usage fields recorded as 0 tokens (estimatedCostUsd itself is null, :181) |
| api/_lib/site00Assts/postProcess/pipeline.ts:92-96 | estimateVideoBgRemovalCost returns 0 for any model other than bria/ben (registry currently only has those two); duration defaults to 10 s when unknown (:213-21… |
| api/_lib/site00ExpressionEngine/creativeDirector/autonomousCreativeDi… | bootstrap result reports providerDispatchCount: 0 while the run may have made an Anthropic call (llmRequestCount) |
| api/_lib/site00Evolve/creativeDirection/experienceExpressionExperimen… | opposite error: increments anthropicRequests although formExperienceConcepts makes no provider call |

Most fal paths record no cost at all (not zero): twin-*, design-asset-reconstruction, expression-engine B49, page concept, workspace self, ASSTS image jobs, Evolve asset generation. Evolve services that do record cost use fixed constants labelled 'actual' (e.g. brandMarketingExpressionService.ts:655, :683-686; neuralVoiceGenerationService.ts:62, :84) and record nothing when the call throws. Unkno…

## 7. Client exposure

**No provider key is exposed to the browser.** The only `VITE_` key is `VITE_SUPABASE_ANON_KEY`. Provider-key names in `src/` are help text, and the built bundle contains no provider host or key-shaped string. The practical exposure is the public API itself (CORS `*`).

## 8. What this sprint changed, and what it did not

- **Changed: the production spine.** All its paths (the OpenArt transport, the fake transport) pass the full §15 gate. The scene adapter no longer counts an unknown quote as zero.
- **Not changed: the other paths above.** They belong to other product systems: the Expression Engine (NDXBOOK Entry 002/003), Twin, Opus Native, the Projects/Evolve services, the design benches and ASSTS. The sprint forbids modifying unrelated product systems. Closing them also changes how the founder's existing screens call the API (most send no session today), which needs the founder's direction.
- **Status: §14 is PARTIAL.** The audit is complete. "All billable calls pass through an appropriate authorization policy" is true for the production spine and false for the paths above. This is founder decision D-I (deliverable 19).

### Proposed remediation (founder decision D-I), in order

1. **Now, no code.**
   - Set `SITE00_CREATIVE_REASONING_FORCE_FALLBACK=1` on the Railway API service. This stops the creative-reasoning Anthropic dispatch behind the public Expression Engine GETs.
   - Confirm which provider keys the API actually needs, and remove any it does not.
2. **A security branch from `main`, like #1696.**
   - A single server-side guard: an admin session, plus the founder for spend.
   - Apply it to every UNGATED and CLIENT_FLAG_ONLY entry point in §3.
   - Make dispatch opt-in in the Evolve photo and visual-casting services.
   - Stop GET resumes from re-submitting.
   - Replace the zero-cost defaults in §6 with UNKNOWN.
   - Restrict CORS to the site's origins.
   - Wire the founder's screens to send the session.
3. **Then route each surviving spend path through the spine's gate** (quote, budget, authorization, ticket) or the provider gateway.

## 9. Not verified from the repository

- Production environment values were not inspectable: whether SITE00_CREATIVE_REASONING_FORCE_FALLBACK, EXPRESSION_ENGINE_TEST_DETERMINISTIC_CREATIVE_DIRECTOR, ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY, FAL_KEY, SITE00_PROVIDER_EXECUTION are set on Railway…
- Whether api.site00.com sits behind any gateway/WAF/auth proxy in front of Railway (not in repo); findings assume server/index.ts is exposed directly.
- Whether any deployment uses Vercel file-based routing (which would mount unrouted api/*.ts such as api/site00/vision-replication.ts); railway.toml indicates Express + server/routes.ts only.
- Per-call cost recording inside characterVisualCastingService / castingFalBackgroundJob, founderCreativeFalBackgroundJob, canonical range / carousel / replay services, SolDesignBench provider usage accounting - not traced line by line.
- Each individual callAnthropicForCompletion caller in api/_lib/site00Evolve (grouped as projects-evolve-anthropic-completion) and each projects.ts generation action's internal dedupe logic.
- Exact number of MPMD units / multi-unit campaign units per Expression Engine GET (determines how many Anthropic calls one page view makes).
- opus-native write tools / repo mutation authority (security beyond spend) and its GET diagnostics actions beyond confirming provider.ts:133 is the only fetch.
- Studio World external service billing semantics.
- fal.storage.upload calls (generation.ts:85, falEnsureReferenceUrls.ts:104, liveFalProvider.ts:97/166, renderPage*Job uploads, etc.) were treated as non-billable storage uploads, not generation.
- Python/PowerShell scripts were checked only by grep for HTTP clients and provider names; none found calling a billable API.
- Regex import graph can miss computed dynamic imports (import(variable)); call sites were found by direct grep, so this affects only route attribution.
- Tests (*.test.ts, tests/) were excluded; they mostly stub providers via VITEST checks (TEST_ONLY paths not enumerated).
