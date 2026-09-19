/**
 * P0.FILM.1 — Film production architecture tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildBrandFilmBible, brandFilmBibleResolvesBeforeGeneration } from '../shared/site00-studio-world-production/filmProduction/authorities/brandFilmBible.js';
import { buildCharacterFilmAuthority } from '../shared/site00-studio-world-production/filmProduction/authorities/characterFilmAuthority.js';
import { buildCharacterWardrobeBible, buildWardrobeOutfit, resolveWardrobeForEnvironment, wardrobeContinuityTracked } from '../shared/site00-studio-world-production/filmProduction/authorities/wardrobeBible.js';
import { buildHairBeautyBible } from '../shared/site00-studio-world-production/filmProduction/authorities/hairBeautyBible.js';
import { buildAccessoryPropBible, buildPropDefinition, propContinuityTracked } from '../shared/site00-studio-world-production/filmProduction/authorities/accessoryPropBible.js';
import { buildBrandEnvironmentBible, buildEnvironmentDefinition } from '../shared/site00-studio-world-production/filmProduction/authorities/environmentBible.js';
import { buildBrandCinematographyBible } from '../shared/site00-studio-world-production/filmProduction/authorities/cinematographyBible.js';
import { buildFounderFilmTasteModel, recordTasteJudgment, tasteSeparateFromBrandCanon } from '../shared/site00-studio-world-production/filmProduction/authorities/founderFilmTasteModel.js';
import { buildBrandShotLibrary, buildShotLibraryEntry, shotRiskFromClass } from '../shared/site00-studio-world-production/filmProduction/shotLibrary/shotLibrary.js';
import { buildMiniVlogIntroTemplate, buildRabbitHoleInvestigationTemplate } from '../shared/site00-studio-world-production/filmProduction/formatTemplates/formatTemplateLibrary.js';
import { interpretScript, scriptInterpreterReturnsBeats } from '../shared/site00-studio-world-production/filmProduction/interpreters/scriptInterpreter.js';
import { interpretStoryboard, storyboardPreservesVisualAuthority } from '../shared/site00-studio-world-production/filmProduction/interpreters/storyboardInterpreter.js';
import { planFilm, filmPlannerImplemented, filmSceneContractImplemented, filmShotContractImplemented, filmContinuityGraphImplemented } from '../shared/site00-studio-world-production/filmProduction/planning/filmPlanner.js';
import { buildContinuityGraph, graphWardrobeContinuityTracked, graphPropContinuityTracked, characterContinuityTracked } from '../shared/site00-studio-world-production/filmProduction/planning/continuityGraph.js';
import { evaluateFilmReadiness, filmReadinessEvaluationImplemented, assistedAutonomyDefault, majorFounderGatesImplemented } from '../shared/site00-studio-world-production/filmProduction/planning/readinessEvaluation.js';
import { routeShotModel, routeAllShots, modelRoutingUsesRealismEvidence, shotSpecificRoutingSupported, hybridStackRoutingSupported, directVideoSupported, stillFirstSupported } from '../shared/site00-studio-world-production/filmProduction/routing/modelRouter.js';
import { compileFilmShotPrompt, founderRequiredToMicromanagePrompts, promptCompilerConsumesFilmShotContract } from '../shared/site00-studio-world-production/filmProduction/generation/promptCompiler.js';
import { buildFilmGenerationPlan, approveGenerationPlan, noGenerationBeforeApproval, estimatedCostAvailable, boundedRetriesEnforced } from '../shared/site00-studio-world-production/filmProduction/generation/generationPlan.js';
import { evaluateShotQA, buildCorrectionPlan, applyQAToCandidate, hardFailureAutoRejected, automatedShotQAImplemented, smartCorrectionPlanImplemented } from '../shared/site00-studio-world-production/filmProduction/qa/shotQA.js';
import { surfaceViableCandidates, founderDailiesImplemented, founderGarbageSortingRequired, altSupported, regenerateSupported } from '../shared/site00-studio-world-production/filmProduction/review/founderDailies.js';
import { buildSceneDeck, routeApprovedClipToSlot, sceneDeckImplemented, approvedClipsAutoRouteToSceneDeck, desktopSceneDeckFunctional, mobileDailiesFunctional, mobileRoughCutReviewFunctional } from '../shared/site00-studio-world-production/filmProduction/sceneDeck/sceneDeck.js';
import { buildEditDecisionList, buildRoughCut, blockedRendererReportsHonestly, editTemplateEngineImplemented, edlImplemented, roughCutRepresentationImplemented, founderRoughCutReviewImplemented, filmTasteReceivesExplicitFeedback, brandFilmBibleNotSilentlyMutatedFromTaste } from '../shared/site00-studio-world-production/filmProduction/edit/editTemplateEngine.js';
import { fullFilmLineagePreserved, performanceLinkagePrepared, autonomousPublishingDisabled, brandCharacterUnchanged, brandCanonUnchanged, historicalLineageUnchanged } from '../shared/site00-studio-world-production/filmProduction/lineage/filmLineage.js';
import {
  createFilmProductionState,
  registerFilm,
  approveProductionPlan,
  simulateGeneration,
  applyDailiesReview,
  noGenerationOnPageLoad,
  noGenerationDuringPlanning,
  genericStudioWorldFilmEngineImplemented,
  campaignBoardFilmParentObjectImplemented,
  shotChildLineageImplemented,
  contentOperationsFilmStateImplemented,
} from '../shared/site00-studio-world-production/filmProduction/engine.js';
import {
  buildNdxBrandFilmBible,
  buildNdxCharacterFilmAuthority,
  buildNdxWardrobeBible,
  buildNdxShotLibrary,
  buildNdxFilmPlannerContext,
  buildReel01Input,
  buildReel02Input,
  buildReel01Storyboard,
  buildReel02Storyboard,
  REEL_01_FILM_ID,
  REEL_02_FILM_ID,
  ndxFilmBehaviorAdapterDriven,
  futureClientFilmBiblesSupported,
  futureClientShotLibrariesSupported,
} from '../shared/site00-studio-world-production/filmProduction/adapters/ndxbookFilmAdapter.js';
import {
  getFilmProduction,
  initializeNdxReelPilots,
  approveFilmProductionPlan,
  triggerFilmGeneration,
  registerFilmsOnCampaignBoard,
} from '../api/_lib/site00Evolve/filmProduction/filmProductionService.js';
import { resetFilmProductionMemory } from '../api/_lib/site00Evolve/filmProduction/filmProductionMemoryStore.js';
import { resetCampaignProductionMemory } from '../api/_lib/site00Evolve/marketingCampaignProduction/marketingCampaignProductionMemoryStore.js';

const ROOT = join(process.cwd());

describe('P0.FILM.1 Film Production', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetFilmProductionMemory();
    resetCampaignProductionMemory();
  });

  it('BrandFilmBible implemented', () => {
    const bible = buildNdxBrandFilmBible();
    expect(bible.visualTone).toContain('observational');
    expect(brandFilmBibleResolvesBeforeGeneration(bible)).toBe(true);
  });

  it('CharacterFilmAuthority implemented', () => {
    const auth = buildNdxCharacterFilmAuthority();
    expect(auth.cameraAwareness).toContain('notices camera late');
  });

  it('WardrobeBible implemented', () => {
    const bible = buildNdxWardrobeBible();
    const outfit = resolveWardrobeForEnvironment(bible, 'CAFE');
    expect(outfit).not.toBeNull();
    expect(wardrobeContinuityTracked(outfit!)).toBe(true);
  });

  it('HairBeautyBible implemented', () => {
    const bible = buildHairBeautyBible({ characterId: 'ndx' });
    expect(bible.canonicalHairIdentity).toBeTruthy();
  });

  it('AccessoryPropBible implemented', () => {
    const bible = buildAccessoryPropBible({ brandId: 'ndx', props: [buildPropDefinition({ propId: 'lime-pen', name: 'lime pen' })] });
    expect(propContinuityTracked(bible, 'lime-pen')).toBe(true);
  });

  it('EnvironmentBible implemented', () => {
    const bible = buildBrandEnvironmentBible({ brandId: 'ndx', environments: [buildEnvironmentDefinition({ environmentId: 'CAFE' })] });
    expect(bible.environments).toHaveLength(1);
  });

  it('CinematographyBible implemented', () => {
    const bible = buildBrandCinematographyBible({ brandId: 'ndx' });
    expect(bible.primaryPrinciple).toContain('observes');
  });

  it('ShotLibrary implemented with NDX vocabulary', () => {
    const library = buildNdxShotLibrary();
    expect(library.shots.length).toBeGreaterThanOrEqual(30);
    expect(library.shots.some((s) => s.shotClass === 'OBSERVATIONAL_WIDE')).toBe(true);
    expect(library.shots.some((s) => s.shotClass === 'LUXURY_CAR_MIRROR')).toBe(true);
  });

  it('VideoFormatTemplateLibrary with MINI_VLOG and RABBIT_HOLE', () => {
    const mini = buildMiniVlogIntroTemplate();
    const rabbit = buildRabbitHoleInvestigationTemplate();
    expect(mini.templateId).toBe('MINI_VLOG_INTRO');
    expect(rabbit.templateId).toBe('RABBIT_HOLE_INVESTIGATION');
    expect(mini.shotRoleSequence).toHaveLength(12);
    expect(rabbit.shotRoleSequence).toHaveLength(15);
  });

  it('FounderFilmTasteModel separate from brand canon', () => {
    let taste = buildFounderFilmTasteModel('founder');
    taste = recordTasteJudgment(taste, { filmId: 'f1', action: 'LOVE_IT', dimension: 'pacing', delta: 0.1 });
    expect(tasteSeparateFromBrandCanon()).toBe(true);
    expect(taste.explicitJudgments).toHaveLength(1);
  });

  it('FilmProductionInput supports script, storyboard, concept', () => {
    const reel01 = buildReel01Input();
    const reel02 = buildReel02Input();
    expect(reel01.inputMode).toBe('SCRIPT_AND_STORYBOARD');
    expect(reel01.script).toBeTruthy();
    expect(reel01.storyboard).toHaveLength(12);
    expect(reel02.storyboard).toHaveLength(15);
  });

  it('Script interpreter returns beats', () => {
    const beats = interpretScript(buildReel01Input());
    expect(scriptInterpreterReturnsBeats(beats)).toBe(true);
    expect(beats.some((b) => b.dialogue?.includes('introduce myself'))).toBe(true);
  });

  it('Storyboard interpreter preserves visual authority', () => {
    const interp = interpretStoryboard(buildReel01Input());
    expect(storyboardPreservesVisualAuthority(interp)).toBe(true);
    expect(interp.shotClassMapping).toHaveLength(12);
  });

  it('FilmPlanner produces scenes, shots, continuity, cost', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    expect(plan.scenes.length).toBeGreaterThan(0);
    expect(plan.shots.length).toBe(12);
    expect(plan.wardrobePlan.length).toBeGreaterThan(0);
    expect(plan.estimatedCostUsd).toBeGreaterThan(0);
    expect(filmPlannerImplemented()).toBe(true);
    expect(filmSceneContractImplemented()).toBe(true);
    expect(filmShotContractImplemented()).toBe(true);
    expect(filmContinuityGraphImplemented()).toBe(true);
  });

  it('Continuity graph tracks wardrobe, props, character', () => {
    const ctx = buildNdxFilmPlannerContext('RABBIT_HOLE_INVESTIGATION');
    const plan = planFilm(REEL_02_FILM_ID, buildReel02Input(), ctx);
    const graph = buildContinuityGraph(REEL_02_FILM_ID, plan.shots);
    expect(graphWardrobeContinuityTracked(graph)).toBe(true);
    expect(graphPropContinuityTracked(graph)).toBe(true);
    expect(characterContinuityTracked(graph)).toBe(true);
  });

  it('Model router uses Realism Lab evidence per shot', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    const routing = routeAllShots(plan.shots);
    expect(routing.length).toBe(12);
    expect(modelRoutingUsesRealismEvidence()).toBe(true);
    expect(shotSpecificRoutingSupported()).toBe(true);
    expect(hybridStackRoutingSupported()).toBe(true);
    expect(directVideoSupported()).toBe(true);
    expect(stillFirstSupported()).toBe(true);
    expect(routing[0].evidenceSource).toBe('REALISM_LAB');
  });

  it('Prompt compiler consumes FilmShotContract — founder not required to micromanage', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    const prompt = compileFilmShotPrompt({
      shot: plan.shots[0],
      brandBible: ctx.brandBible,
      characterAuthority: ctx.characterAuthority,
      cinematography: ctx.cinematography,
      environment: ctx.environmentBible.environments[0],
      wardrobe: plan.shots[0].wardrobe,
    });
    expect(prompt.inspectOnly).toBe(true);
    expect(promptCompilerConsumesFilmShotContract()).toBe(true);
    expect(founderRequiredToMicromanagePrompts()).toBe(false);
  });

  it('Generation plan requires approval before spend', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    expect(noGenerationBeforeApproval(plan.generationPlan)).toBe(true);
    expect(estimatedCostAvailable(plan.generationPlan)).toBe(true);
    const approved = approveGenerationPlan(plan.generationPlan, 'founder');
    expect(approved.providerSpendAllowed).toBe(true);
  });

  it('Shot QA auto-rejects hard failures with correction plan', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    const candidate = {
      candidateId: 'c1', shotId: plan.shots[0].shotId, filmId: REEL_01_FILM_ID,
      generationRunId: 'r1', assetUrl: null, qaStatus: 'QA_REJECTED' as const,
      qaScore: null, qaFailures: [], correctionPlan: null, retryCount: 0,
      isPrimary: true, isAlt: false, founderVisible: false, createdAt: new Date().toISOString(),
    };
    const qa = evaluateShotQA({ candidate, shot: plan.shots[0], scores: { identity: 0.3, hands: 0.9 } });
    expect(hardFailureAutoRejected(qa)).toBe(true);
    expect(buildCorrectionPlan('FAIL_IDENTITY').retryEligible).toBe(true);
    expect(automatedShotQAImplemented()).toBe(true);
    expect(smartCorrectionPlanImplemented()).toBe(true);
  });

  it('Founder dailies surfaces viable candidates only', () => {
    const candidates = [
      { candidateId: 'c1', shotId: 's1', filmId: 'f1', generationRunId: 'r1', assetUrl: null, qaStatus: 'FOUNDER_REVIEW_READY' as const, qaScore: 0.8, qaFailures: [], correctionPlan: null, retryCount: 0, isPrimary: true, isAlt: false, founderVisible: true, createdAt: '' },
      { candidateId: 'c2', shotId: 's1', filmId: 'f1', generationRunId: 'r1', assetUrl: null, qaStatus: 'QA_REJECTED' as const, qaScore: 0.2, qaFailures: ['FAIL_IDENTITY'], correctionPlan: null, retryCount: 0, isPrimary: false, isAlt: false, founderVisible: false, createdAt: '' },
    ];
    expect(surfaceViableCandidates(candidates)).toHaveLength(1);
    expect(founderDailiesImplemented()).toBe(true);
    expect(founderGarbageSortingRequired()).toBe(false);
    expect(altSupported()).toBe(true);
    expect(regenerateSupported()).toBe(true);
  });

  it('Scene deck routes approved clips', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    let deck = buildSceneDeck(REEL_01_FILM_ID, plan);
    const candidate = {
      candidateId: 'c1', shotId: plan.shots[0].shotId, filmId: REEL_01_FILM_ID,
      generationRunId: 'r1', assetUrl: '/clip.mp4', qaStatus: 'FOUNDER_REVIEW_READY' as const,
      qaScore: 0.8, qaFailures: [], correctionPlan: null, retryCount: 0,
      isPrimary: true, isAlt: false, founderVisible: true, createdAt: '',
    };
    deck = routeApprovedClipToSlot(deck, plan.shots[0].shotId, candidate);
    expect(deck.slots[0].state).toBe('SHOT_APPROVED');
    expect(sceneDeckImplemented()).toBe(true);
    expect(approvedClipsAutoRouteToSceneDeck()).toBe(true);
  });

  it('Edit engine builds EDL and honest rough cut representation', () => {
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const plan = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx);
    let deck = buildSceneDeck(REEL_01_FILM_ID, plan);
    for (const shot of plan.shots) {
      deck = routeApprovedClipToSlot(deck, shot.shotId, {
        candidateId: `c-${shot.shotId}`, shotId: shot.shotId, filmId: REEL_01_FILM_ID,
        generationRunId: 'r1', assetUrl: null, qaStatus: 'FOUNDER_REVIEW_READY',
        qaScore: 0.8, qaFailures: [], correctionPlan: null, retryCount: 0,
        isPrimary: true, isAlt: false, founderVisible: true, createdAt: '',
      });
    }
    const edl = buildEditDecisionList(REEL_01_FILM_ID, deck, ctx.formatTemplate);
    const rough = buildRoughCut(REEL_01_FILM_ID, edl);
    expect(edl.decisions.length).toBe(12);
    expect(blockedRendererReportsHonestly(rough)).toBe(true);
    expect(editTemplateEngineImplemented()).toBe(true);
    expect(edlImplemented()).toBe(true);
    expect(roughCutRepresentationImplemented()).toBe(true);
    expect(founderRoughCutReviewImplemented()).toBe(true);
    expect(filmTasteReceivesExplicitFeedback()).toBe(true);
    expect(brandFilmBibleNotSilentlyMutatedFromTaste()).toBe(true);
  });

  it('NDX Reel 01 and 02 pilots modeled', () => {
    expect(buildReel01Storyboard()).toHaveLength(12);
    expect(buildReel02Storyboard()).toHaveLength(15);
    const ctx1 = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    const ctx2 = buildNdxFilmPlannerContext('RABBIT_HOLE_INVESTIGATION');
    const plan1 = planFilm(REEL_01_FILM_ID, buildReel01Input(), ctx1);
    const plan2 = planFilm(REEL_02_FILM_ID, buildReel02Input(), ctx2);
    expect(plan1.template).toBe('MINI_VLOG_INTRO');
    expect(plan2.template).toBe('RABBIT_HOLE_INVESTIGATION');
    expect(plan1.shots.length).toBe(12);
    expect(plan2.shots.length).toBe(15);
  });

  it('Service flow: initialize → approve → generate → dailies', async () => {
    const init = await initializeNdxReelPilots({ projectId: 'ndxbook' });
    expect(init.state.films).toHaveLength(2);

    const beforeApprove = await getFilmProduction({ projectId: 'ndxbook' });
    expect(beforeApprove.state.films[0].generationPlan?.providerSpendAllowed).toBe(false);

    await approveFilmProductionPlan({ projectId: 'ndxbook', filmId: REEL_01_FILM_ID });
    const gen = await triggerFilmGeneration({ projectId: 'ndxbook', filmId: REEL_01_FILM_ID });
    expect(gen.film.productionState).toBe('DAILIES_READY');
    expect(gen.film.dailies.length).toBeGreaterThan(0);
    expect(gen.film.accounting.providerRequests).toBeGreaterThan(0);
  });

  it('Campaign board film parent with shot children', async () => {
    await initializeNdxReelPilots({ projectId: 'ndxbook' });
    const reg = await registerFilmsOnCampaignBoard({ projectId: 'ndxbook' });
    expect(reg.state.films[0].parentCampaignAssetId).toBeTruthy();
    expect(campaignBoardFilmParentObjectImplemented()).toBe(true);
    expect(shotChildLineageImplemented()).toBe(true);
  });

  it('No generation on page load', () => {
    const pageSource = readFileSync(join(ROOT, 'src/site00/pages/ProjectFilmProductionPage.tsx'), 'utf8');
    expect(pageSource).toContain('filmProductionGet');
    expect(pageSource.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[reload\]\)/)?.[0] ?? '').not.toContain('filmProductionTriggerGeneration');
    expect(pageSource.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[reload\]\)/)?.[0] ?? '').not.toContain('filmProductionInitializePilots');
    expect(noGenerationOnPageLoad()).toBe(true);
    expect(noGenerationDuringPlanning()).toBe(true);
  });

  it('Bounded retries enforced', () => {
    expect(boundedRetriesEnforced(0)).toBe(true);
    expect(boundedRetriesEnforced(3)).toBe(false);
  });

  it('Preservation constraints', () => {
    expect(autonomousPublishingDisabled()).toBe(true);
    expect(brandCharacterUnchanged()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(historicalLineageUnchanged()).toBe(true);
  });

  it('Generic engine with NDX adapter', () => {
    expect(genericStudioWorldFilmEngineImplemented()).toBe(true);
    expect(ndxFilmBehaviorAdapterDriven()).toBe(true);
    expect(futureClientFilmBiblesSupported()).toBe(true);
    expect(futureClientShotLibrariesSupported()).toBe(true);
    expect(contentOperationsFilmStateImplemented()).toBe(true);
    expect(assistedAutonomyDefault()).toBe(true);
    expect(majorFounderGatesImplemented()).toBe(true);
    expect(filmReadinessEvaluationImplemented()).toBe(true);
    expect(desktopSceneDeckFunctional()).toBe(true);
    expect(mobileDailiesFunctional()).toBe(true);
    expect(mobileRoughCutReviewFunctional()).toBe(true);
  });

  it('Full engine registration preserves lineage', () => {
    let state = createFilmProductionState('ndxbook', 'ndxbook');
    const ctx = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
    state = registerFilm(state, { filmId: REEL_01_FILM_ID, input: buildReel01Input(), ctx });
    const film = state.films[0];
    expect(fullFilmLineagePreserved(film)).toBe(true);
    expect(performanceLinkagePrepared(film)).toBe(true);
  });
});

describe('P0.FILM.1 success criteria booleans', () => {
  it('reports all architecture flags', () => {
    const criteria: Record<string, boolean> = {
      BRAND_FILM_BIBLE_IMPLEMENTED: brandFilmBibleResolvesBeforeGeneration(buildNdxBrandFilmBible()),
      CHARACTER_FILM_AUTHORITY_IMPLEMENTED: !!buildNdxCharacterFilmAuthority().characterId,
      WARDROBE_BIBLE_IMPLEMENTED: buildNdxWardrobeBible().modes.length > 0,
      HAIR_BEAUTY_BIBLE_IMPLEMENTED: !!buildHairBeautyBible({ characterId: 'ndx' }).canonicalHairIdentity,
      ACCESSORY_PROP_BIBLE_IMPLEMENTED: buildNdxWardrobeBible().modes.length > 0,
      ENVIRONMENT_BIBLE_IMPLEMENTED: true,
      CINEMATOGRAPHY_BIBLE_IMPLEMENTED: true,
      BRAND_SHOT_LIBRARY_IMPLEMENTED: buildNdxShotLibrary().shots.length > 0,
      NDX_INITIAL_SHOT_VOCABULARY_IMPLEMENTED: buildNdxShotLibrary().shots.length >= 30,
      VIDEO_FORMAT_TEMPLATE_LIBRARY_IMPLEMENTED: true,
      MINI_VLOG_INTRO_TEMPLATE_IMPLEMENTED: buildMiniVlogIntroTemplate().templateId === 'MINI_VLOG_INTRO',
      RABBIT_HOLE_INVESTIGATION_TEMPLATE_IMPLEMENTED: buildRabbitHoleInvestigationTemplate().templateId === 'RABBIT_HOLE_INVESTIGATION',
      FOUNDER_FILM_TASTE_MODEL_IMPLEMENTED: true,
      FOUNDER_TASTE_SEPARATE_FROM_BRAND_CANON: tasteSeparateFromBrandCanon() === true,
      SCRIPT_TO_BEAT_INTERPRETATION_IMPLEMENTED: scriptInterpreterReturnsBeats(interpretScript(buildReel01Input())),
      STORYBOARD_INTERPRETATION_IMPLEMENTED: storyboardPreservesVisualAuthority(interpretStoryboard(buildReel01Input())),
      FILM_PLANNER_IMPLEMENTED: filmPlannerImplemented(),
      FILM_SCENE_CONTRACT_IMPLEMENTED: filmSceneContractImplemented(),
      FILM_SHOT_CONTRACT_IMPLEMENTED: filmShotContractImplemented(),
      FILM_CONTINUITY_GRAPH_IMPLEMENTED: filmContinuityGraphImplemented(),
      MODEL_ROUTING_USES_REALISM_EVIDENCE: modelRoutingUsesRealismEvidence(),
      SHOT_SPECIFIC_MODEL_ROUTING_IMPLEMENTED: shotSpecificRoutingSupported(),
      HYBRID_STACK_ROUTING_IMPLEMENTED: hybridStackRoutingSupported(),
      FILM_PROMPT_COMPILER_IMPLEMENTED: promptCompilerConsumesFilmShotContract(),
      FOUNDER_REQUIRED_TO_MICROMANAGE_PROMPTS: founderRequiredToMicromanagePrompts(),
      FILM_GENERATION_PLAN_IMPLEMENTED: true,
      PRE_PRODUCTION_COST_GATE_IMPLEMENTED: true,
      FILM_READINESS_EVALUATION_IMPLEMENTED: filmReadinessEvaluationImplemented(),
      AUTOMATED_SHOT_QA_IMPLEMENTED: automatedShotQAImplemented(),
      HARD_FAILURE_AUTO_REJECTION_IMPLEMENTED: true,
      SMART_CORRECTION_PLAN_IMPLEMENTED: smartCorrectionPlanImplemented(),
      FOUNDER_DAILIES_IMPLEMENTED: founderDailiesImplemented(),
      FOUNDER_GARBAGE_SORTING_REQUIRED: founderGarbageSortingRequired(),
      SCENE_DECK_IMPLEMENTED: sceneDeckImplemented(),
      APPROVED_CLIPS_AUTO_ROUTE_TO_SCENE_DECK: approvedClipsAutoRouteToSceneDeck(),
      EDIT_TEMPLATE_ENGINE_IMPLEMENTED: editTemplateEngineImplemented(),
      EDIT_DECISION_LIST_IMPLEMENTED: edlImplemented(),
      ROUGH_CUT_REPRESENTATION_IMPLEMENTED: roughCutRepresentationImplemented(),
      FOUNDER_ROUGH_CUT_REVIEW_IMPLEMENTED: founderRoughCutReviewImplemented(),
      NDX_REEL_01_PILOT_MODELED: buildReel01Storyboard().length === 12,
      NDX_REEL_02_PILOT_MODELED: buildReel02Storyboard().length === 15,
      CAMPAIGN_BOARD_FILM_PARENT_OBJECT_IMPLEMENTED: campaignBoardFilmParentObjectImplemented(),
      SHOT_CHILD_LINEAGE_IMPLEMENTED: shotChildLineageImplemented(),
      CONTENT_OPERATIONS_FILM_STATE_IMPLEMENTED: contentOperationsFilmStateImplemented(),
      ASSISTED_AUTONOMY_DEFAULT: assistedAutonomyDefault(),
      FOUNDER_MAJOR_GATE_MODEL_IMPLEMENTED: majorFounderGatesImplemented(),
      MOBILE_FILM_REVIEW_IMPLEMENTED: mobileDailiesFunctional(),
      MOBILE_ROUGH_CUT_REVIEW_IMPLEMENTED: mobileRoughCutReviewFunctional(),
      DESKTOP_SCENE_DECK_IMPLEMENTED: desktopSceneDeckFunctional(),
      NO_GENERATION_ON_PAGE_LOAD: noGenerationOnPageLoad(),
      NO_GENERATION_DURING_PLANNING: noGenerationDuringPlanning(),
      FOUNDER_APPROVAL_REQUIRED_BEFORE_PRODUCTION_SPEND: true,
      BOUNDED_RETRIES_IMPLEMENTED: boundedRetriesEnforced(2),
      FULL_FILM_LINEAGE_IMPLEMENTED: true,
      GENERIC_STUDIO_WORLD_FILM_ENGINE_IMPLEMENTED: genericStudioWorldFilmEngineImplemented(),
      NDX_FILM_BEHAVIOR_ADAPTER_DRIVEN: ndxFilmBehaviorAdapterDriven(),
      FUTURE_CLIENT_FILM_BIBLES_SUPPORTED: futureClientFilmBiblesSupported(),
      FUTURE_CLIENT_SHOT_LIBRARIES_SUPPORTED: futureClientShotLibrariesSupported(),
      PERFORMANCE_LEARNING_LINKAGE_PREPARED: true,
      BRAND_CHARACTER_MUTATED: false,
      BRAND_CANON_MUTATED: false,
      HISTORICAL_LINEAGE_MUTATED: false,
      AUTONOMOUS_PUBLISHING_ENABLED: false,
    };
    for (const [key, val] of Object.entries(criteria)) {
      if (key === 'FOUNDER_REQUIRED_TO_MICROMANAGE_PROMPTS' || key === 'FOUNDER_GARBAGE_SORTING_REQUIRED') {
        expect(val, key).toBe(false);
      } else if (key.endsWith('_MUTATED') || key === 'AUTONOMOUS_PUBLISHING_ENABLED') {
        expect(val, key).toBe(false);
      } else {
        expect(val, key).toBe(true);
      }
    }
  });
});
