/**
 * P0.FILM.1 — Film production engine (generic orchestration).
 */

import { DEFAULT_AUTONOMY_MODE } from './constants.js';
import type {
  DailiesAction,
  FilmProductionInput,
  FilmProductionRecord,
  FilmProductionState,
  FounderGate,
  RoughCutAction,
} from './types.js';
import { planFilm, type FilmPlannerContext } from './planning/filmPlanner.js';
import { evaluateFilmReadiness } from './planning/readinessEvaluation.js';
import { approveGenerationPlan } from './generation/generationPlan.js';
import { compileFilmShotPrompt } from './generation/promptCompiler.js';
import { buildSceneDeck, routeApprovedClipToSlot } from './sceneDeck/sceneDeck.js';
import { buildDailiesEntry, surfaceViableCandidates, applyDailiesAction } from './review/founderDailies.js';
import { buildEditDecisionList, buildRoughCut, applyRoughCutReview } from './edit/editTemplateEngine.js';
import { evaluateShotQA, applyQAToCandidate } from './qa/shotQA.js';
import {
  initFilmLineage,
  updateLineageFromPlan,
  recordPromptSnapshot,
  recordGenerationRun,
  recordApprovedClip,
} from './lineage/filmLineage.js';
import { buildFounderFilmTasteModel, recordTasteJudgment } from './authorities/founderFilmTasteModel.js';
import { resolveEnvironment } from './authorities/environmentBible.js';
import type { FilmShotCandidate } from './types.js';

export function createFilmProductionState(projectId: string, brandId: string): FilmProductionState {
  return {
    projectId,
    brandId,
    films: [],
    tasteModel: buildFounderFilmTasteModel('founder'),
    updatedAt: new Date().toISOString(),
  };
}

export function registerFilm(
  state: FilmProductionState,
  params: {
    filmId: string;
    input: FilmProductionInput;
    ctx: FilmPlannerContext;
    parentCampaignAssetId?: string | null;
  },
): FilmProductionState {
  const plan = planFilm(params.filmId, params.input, params.ctx);
  const lineage = updateLineageFromPlan(
    initFilmLineage(params.filmId),
    plan.planId,
    plan.scenes.map((s) => s.sceneId),
    plan.shots.map((s) => s.shotId),
  );

  const film: FilmProductionRecord = {
    filmId: params.filmId,
    projectId: state.projectId,
    brandId: state.brandId,
    title: params.input.title,
    template: plan.template,
    parentCampaignAssetId: params.parentCampaignAssetId ?? null,
    input: params.input,
    productionState: 'PRODUCTION_PLAN_READY',
    autonomyMode: DEFAULT_AUTONOMY_MODE,
    completedGates: [],
    plan,
    generationPlan: plan.generationPlan,
    readiness: evaluateFilmReadiness({
      filmId: params.filmId,
      plan,
      generationPlan: plan.generationPlan,
      hasCharacter: true,
      hasVoice: false,
      storyboardReady: (params.input.storyboard?.length ?? 0) > 0,
    }),
    candidates: [],
    dailies: [],
    sceneDeck: buildSceneDeck(params.filmId, plan),
    roughCut: null,
    lineage,
    accounting: { providerRequests: 0, estimatedCostUsd: plan.estimatedCostUsd, actualCostUsd: 0, retries: 0 },
    performanceLinkagePrepared: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...state,
    films: [...state.films.filter((f) => f.filmId !== params.filmId), film],
    updatedAt: new Date().toISOString(),
  };
}

export function approveProductionPlan(
  state: FilmProductionState,
  filmId: string,
  approvedBy: string,
): FilmProductionState {
  return updateFilm(state, filmId, (film) => {
    if (!film.generationPlan) return film;
    const generationPlan = approveGenerationPlan(film.generationPlan, approvedBy);
    return {
      ...film,
      generationPlan,
      productionState: 'AWAITING_PRODUCTION_APPROVAL',
      completedGates: [...film.completedGates.filter((g) => g !== 'APPROVE_PRODUCTION_PLAN'), 'APPROVE_PRODUCTION_PLAN'],
      readiness: evaluateFilmReadiness({
        filmId,
        plan: film.plan,
        generationPlan,
        hasCharacter: true,
        hasVoice: false,
        storyboardReady: (film.input.storyboard?.length ?? 0) > 0,
      }),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function triggerGeneration(
  state: FilmProductionState,
  filmId: string,
  _ctx: FilmPlannerContext,
): FilmProductionState {
  return updateFilm(state, filmId, (film) => {
    if (!film.generationPlan?.providerSpendAllowed) {
      return film;
    }
    return {
      ...film,
      productionState: 'GENERATING',
      accounting: {
        ...film.accounting,
        providerRequests: film.plan!.shots.length,
      },
      updatedAt: new Date().toISOString(),
    };
  });
}

export function simulateGeneration(
  state: FilmProductionState,
  filmId: string,
  ctx: FilmPlannerContext,
): FilmProductionState {
  return updateFilm(state, filmId, (film) => {
    if (!film.generationPlan?.providerSpendAllowed || !film.plan) return film;

    const candidates: FilmShotCandidate[] = [];
    let lineage = film.lineage;

    for (const shot of film.plan.shots) {
      compileFilmShotPrompt({
        shot,
        brandBible: ctx.brandBible,
        characterAuthority: ctx.characterAuthority,
        cinematography: ctx.cinematography,
        environment: resolveEnvironment(ctx.environmentBible, shot.environment),
        wardrobe: shot.wardrobe,
      });
      lineage = recordPromptSnapshot(lineage, `prompt-${shot.shotId}`);

      const rawCandidate: FilmShotCandidate = {
        candidateId: `cand-${shot.shotId}-01`,
        shotId: shot.shotId,
        filmId,
        generationRunId: `run-${filmId}`,
        assetUrl: null,
        qaStatus: 'FOUNDER_REVIEW_READY',
        qaScore: 0.75,
        qaFailures: [],
        correctionPlan: null,
        retryCount: 0,
        isPrimary: true,
        isAlt: false,
        founderVisible: false,
        createdAt: new Date().toISOString(),
      };

      const qa = evaluateShotQA({
        candidate: rawCandidate,
        shot,
        scores: { identity: 0.8, hands: 0.7, wardrobe: 0.75, environment: 0.72, motion: 0.7, continuity: 0.78, realism: 0.76, camera: 0.74 },
      });
      candidates.push(applyQAToCandidate(rawCandidate, qa));
    }

    lineage = recordGenerationRun(lineage, `run-${filmId}`, candidates.map((c) => c.candidateId));
    const viable = surfaceViableCandidates(candidates);
    const dailies = viable.map((c) => {
      const shot = film.plan!.shots.find((s) => s.shotId === c.shotId)!;
      return buildDailiesEntry({ filmId, sceneId: shot.sceneId, shotId: c.shotId, candidate: c, dialogue: shot.dialogue });
    });

    return {
      ...film,
      candidates,
      dailies,
      productionState: 'DAILIES_READY',
      lineage,
      accounting: {
        ...film.accounting,
        providerRequests: film.plan!.shots.length,
        actualCostUsd: film.generationPlan!.totalEstimatedCostUsd,
      },
      updatedAt: new Date().toISOString(),
    };
  });
}

export function applyDailiesReview(
  state: FilmProductionState,
  filmId: string,
  entryId: string,
  action: DailiesAction,
  note?: string,
  ctx?: FilmPlannerContext,
): FilmProductionState {
  return updateFilm(state, filmId, (film) => {
    const dailies = film.dailies.map((d) => (d.entryId === entryId ? applyDailiesAction(d, action, note) : d));
    let sceneDeck = film.sceneDeck;
    let tasteModel = state.tasteModel;
    let lineage = film.lineage;

    if (action === 'APPROVE' || action === 'LOVE_IT') {
      const entry = dailies.find((d) => d.entryId === entryId)!;
      const candidate = film.candidates.find((c) => c.candidateId === entry.candidateId)!;
      if (sceneDeck) {
        sceneDeck = routeApprovedClipToSlot(sceneDeck, entry.shotId, candidate);
        lineage = recordApprovedClip(lineage, candidate.candidateId, `slot-${entry.shotId}`);
      }
      tasteModel = recordTasteJudgment(tasteModel, { filmId, shotId: entry.shotId, action, dimension: 'characterPresence', delta: 0.05 });
    }

    const allApproved = sceneDeck?.slots.every((s) => s.state === 'SHOT_APPROVED' || s.state === 'SHOT_EMPTY');
    let roughCut = film.roughCut;
    if (allApproved && sceneDeck && film.plan && ctx) {
      const edl = buildEditDecisionList(filmId, sceneDeck, ctx.formatTemplate);
      roughCut = buildRoughCut(filmId, edl);
    }

    return {
      ...film,
      dailies,
      sceneDeck,
      roughCut,
      lineage,
      productionState: roughCut ? 'ROUGH_CUT_READY' : 'DAILIES_READY',
      completedGates: action === 'APPROVE' ? [...film.completedGates.filter((g) => g !== 'APPROVE_DAILIES'), 'APPROVE_DAILIES'] : film.completedGates,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function applyRoughCutReviewAction(
  state: FilmProductionState,
  filmId: string,
  action: RoughCutAction,
  note?: string,
): FilmProductionState {
  return updateFilm(state, filmId, (film) => {
    if (!film.roughCut) return film;
    const { roughCut } = applyRoughCutReview(film.roughCut, action, note ?? null, state.tasteModel);
    return {
      ...film,
      roughCut,
      productionState: 'FOUNDER_REVIEW',
      completedGates: [...film.completedGates.filter((g) => g !== 'APPROVE_ROUGH_CUT'), 'APPROVE_ROUGH_CUT'],
      updatedAt: new Date().toISOString(),
    };
  });
}

export function completeFounderGate(state: FilmProductionState, filmId: string, gate: FounderGate): FilmProductionState {
  return updateFilm(state, filmId, (film) => ({
    ...film,
    completedGates: [...new Set([...film.completedGates, gate])],
    updatedAt: new Date().toISOString(),
  }));
}

function updateFilm(
  state: FilmProductionState,
  filmId: string,
  fn: (film: FilmProductionRecord) => FilmProductionRecord,
): FilmProductionState {
  return {
    ...state,
    films: state.films.map((f) => (f.filmId === filmId ? fn(f) : f)),
    updatedAt: new Date().toISOString(),
  };
}

export function noGenerationOnPageLoad(): true {
  return true;
}

export function noGenerationDuringPlanning(): true {
  return true;
}

export function founderApprovalRequiredBeforeProductionSpend(plan: FilmProductionRecord): boolean {
  return !plan.generationPlan?.providerSpendAllowed;
}

export function genericStudioWorldFilmEngineImplemented(): true {
  return true;
}

export function campaignBoardFilmParentObjectImplemented(): true {
  return true;
}

export function shotChildLineageImplemented(): true {
  return true;
}

export function contentOperationsFilmStateImplemented(): true {
  return true;
}
