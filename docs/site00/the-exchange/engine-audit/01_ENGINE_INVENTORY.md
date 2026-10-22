# 01 — Engine inventory

Evidence from repository structure and import traces on `main`.

## Studio World surfaces (routes)

| Surface | Route pattern | Primary code |
|---------|---------------|--------------|
| Production hub | `/production/:projectSlug/*` | `src/site00/config/routes.ts` (`productionExpression`, etc.) |
| Expression (NDXBOOK entries) | `/production/:projectSlug/expression` | Expression UI + `api/site00/expression-engine.ts` |
| Experience | `/projects/:slug/experience-expression` | Experience engine (parallel pattern to Expression) |
| Library / Activity | Production nav (per artifacts) | Asset + activity modules |
| Film production | Project film routes + API | `shared/site00-studio-world-production/filmProduction/`, `api/site00/projects.ts` (`film_production_*`) |
| Character continuity | `/projects/ndxbook/character/continuity` (NDX default) | `characterContinuityService.ts`, `characterContinuityPipeline/` |
| Visual casting | Project casting APIs | `characterVisualCasting/`, `api/site00/projects.ts` casting actions |
| Cinematic Realism Lab | Project API actions | `cinematicRealismLab/`, `projects.ts` `cinematic_realism_lab_*` |
| Brand / core direction (Evolve) | Admin + project Evolve flows | `api/_lib/site00Evolve/creativeDirection/creativeIntelligence/` |
| Identity / project bible | Identity phase | `site00_identity_*` migrations, `projectBibleCompiler.ts` |
| ASSTS / vault | `/assts`, generation guardrails | `shared/site00-production-guardrails/`, JURNL-specific gates |

## Creative intelligence stack

| Component | Location | Role |
|-----------|----------|------|
| Core direction formation | `creativeIntelligence/` + Anthropic adapter | Brand marketing directions, structured JSON |
| Creative critic | `creativeCritic.ts` | Deterministic anti-generic / lore checks |
| Narrative synthesis (C1.0) | `narrativeSynthesis/*` | Entry-level narrative spine, QA, self-revision (**Entry 002 fixture**) |
| Senior creative judgment (C1.4) | `seniorCreativeJudgment/*` | Metaphor/world scoring + optional LLM reasoning |
| Creative director / continuity (C1.1–C1.3) | `creativeDirector/`, `cinematicContinuity/` | Entry 003–oriented autonomous passes |
| Creative judgment intelligence (CJ) | `creativeJudgmentIntelligence/` | Territory ranking, rejection heuristics |
| Campaign copy reasoning | `campaignCopy/*` | Anthropic copy passes with fallback |
| Chapter continuity types | `shared/site00-expression-engine/chapter-continuity/types.ts` | **Marketing chapter** entry sequences, handoffs |

## Expression production (Entry-shaped)

| Stage | Implementation | NDX coupling |
|-------|----------------|--------------|
| Creative entry record | `entryStore.ts` (**in-memory**) | Types in `shared/site00-expression-engine/types.ts` |
| Pre-storyboard authority | Entry 002 bootstraps B4.7+ | Hard-bound Entry 002 assets |
| Structural storyboard gate | `storyboardGate.ts` | LOVE_IT on 5 boards |
| Reel shot plan / motion | `entry002Reel*.ts` | Entry 002 narrative grammar |
| Keyframes / video routing | `productionRouting.ts`, `entry002ReelProviderRouting.ts` | `autoDispatch: false`; klingBlocked in bootstraps |
| Final cinematic storyboard | `entry002FinalCinematicStoryboard*.ts` | 15–16 panel manifest |
| Cost / spend | `storyboardGenerationCostGuard`, production guardrails gateway | Spend authorization pattern |

## Embodied character / visual

| Module | Path | Status signal |
|--------|------|---------------|
| Generic continuity pipeline | `characterContinuityPipeline/` | Architecture + tests; **pre-casting blocks production gen** |
| NDX adapter | `ndxCharacterContinuityPipeline/` | Default `projectId: 'ndxbook'` |
| Visual casting + bible | `characterVisualCasting/`, FAL dispatch | Live when `FAL_KEY` |
| Character authority / locks | `characterAuthority/` | Face/wardrobe lock evaluation |

## Film / editorial (generic)

| Piece | Path |
|-------|------|
| Film engine | `filmProduction/engine.ts` |
| Planner / continuity graph | `filmProduction/planning/` |
| Rough cut / EDL | `filmProduction/edit/editTemplateEngine.ts` |
| NDX film adapter | `filmProduction/adapters/ndxbookFilmAdapter.ts` |

## Persistence (Supabase — selected)

| Table / migration | Purpose |
|-------------------|---------|
| `site00_brand_lore_profiles` | Brand lore JSON |
| `site00_core_direction_formations` | Core direction canon |
| `site00_identity_phases`, judgment migrations | Identity / territories |
| `site00_creative_entries`, `site00_expression_generation_receipts` | **Schema present** — API store **not wired** (`entryStore.ts` in-memory) |
| `site00_creative_chapters`, `site00_chapter_argument_grammars` | Chapter-level **argument grammar** (not TV season model) |
| `site00_methodology_validation_runs`, `site00_studio_world_execution` | Methodology run records |

## Provider integrations (names only)

| Provider | Config env (names) | Integration locus |
|----------|-------------------|-------------------|
| Anthropic | `ANTHROPIC_API_KEY`, `ANTHROPIC_CREATIVE_MODEL`, `SITE00_CREATIVE_INTELLIGENCE_MODEL` | `creativeIntelligence/config.ts`, expression reasoning providers |
| FAL | `FAL_KEY` | Casting dispatch, expression image routes, loader geometry |
| OpenArt | JURNL admin gateway | Not NDXBOOK expression primary path |
| Elevenlabs / music APIs | Listed in routing | **Routing only** unless separately wired |
| Kling (FAL) | Via `fal-kling*` provider ids | Routing + Entry 002 maps; **no auto dispatch** |
| Kling 4 / Artlist | **Not on `main`** | Draft module on branch `cursor/ndxbook-kling4-cinematic-pipeline-8aec` (#1683) |

## Tests (representative evidence)

| Domain | Test file |
|--------|-----------|
| Expression gates B4x | `tests/site00ExpressionEngineSprintB41.test.ts`–`B50R2.test.ts` |
| Narrative synthesis C1.0 | `tests/site00ExpressionEngineSprintC10.test.ts` |
| Senior judgment C1.4 | `tests/site00ExpressionEngineSprintC14.test.ts` |
| Character continuity P0.5E.5 | `shared/site00-brand-lore/characterContinuityP05E5.test.ts` |
| Film production | `tests/filmProductionP0FILM1.test.ts` |
| Project capabilities | `docs/architecture/SITE00_PROJECT_CAPABILITIES.md`, capability tests |
| API routing smoke | `tests/expressionEngineApiRouting.test.ts` |
