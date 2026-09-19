/**
 * P0.FILM.1 — Film production API service.
 */

import {
  createFilmProductionState,
  registerFilm,
  approveProductionPlan,
  simulateGeneration,
  applyDailiesReview,
  applyRoughCutReviewAction,
  completeFounderGate,
} from '../../../../shared/site00-studio-world-production/filmProduction/engine.js';
import {
  buildNdxFilmPlannerContext,
  buildReel01Input,
  buildReel02Input,
  REEL_01_FILM_ID,
  REEL_02_FILM_ID,
} from '../../../../shared/site00-studio-world-production/filmProduction/adapters/ndxbookFilmAdapter.js';
import type { FilmProductionState, DailiesAction, RoughCutAction, FounderGate } from '../../../../shared/site00-studio-world-production/filmProduction/types.js';
import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';
import * as filmStore from './filmProductionStoreAdapter.js';
import * as campaignStore from '../marketingCampaignProduction/marketingCampaignProductionStoreAdapter.js';

async function ensureState(projectId: string): Promise<FilmProductionState> {
  const existing = await filmStore.getFilmProductionState(projectId);
  if (existing) return existing;
  const state = createFilmProductionState(projectId, 'ndxbook');
  return filmStore.saveFilmProductionState(state);
}

export async function getFilmProduction(params: { projectId: string }) {
  const state = await ensureState(params.projectId);
  return { state };
}

export async function initializeNdxReelPilots(params: { projectId: string }) {
  let state = await ensureState(params.projectId);

  const ctx01 = buildNdxFilmPlannerContext('MINI_VLOG_INTRO');
  const ctx02 = buildNdxFilmPlannerContext('RABBIT_HOLE_INVESTIGATION');

  state = registerFilm(state, {
    filmId: REEL_01_FILM_ID,
    input: buildReel01Input(),
    ctx: ctx01,
    parentCampaignAssetId: 'parent-ndx-reel-01',
  });

  state = registerFilm(state, {
    filmId: REEL_02_FILM_ID,
    input: buildReel02Input(),
    ctx: ctx02,
    parentCampaignAssetId: 'parent-ndx-reel-02',
  });

  state = await filmStore.saveFilmProductionState(state);
  return { state };
}

export async function compileProductionPlan(params: { projectId: string; filmId: string }) {
  const state = await ensureState(params.projectId);
  const film = state.films.find((f) => f.filmId === params.filmId);
  if (!film) throw new Error('Film not found');
  return { state, film, plan: film.plan };
}

export async function approveFilmProductionPlan(params: { projectId: string; filmId: string; approvedBy?: string }) {
  let state = await ensureState(params.projectId);
  state = approveProductionPlan(state, params.filmId, params.approvedBy ?? 'founder');
  state = await filmStore.saveFilmProductionState(state);
  const film = state.films.find((f) => f.filmId === params.filmId)!;
  return { state, film };
}

export async function triggerFilmGeneration(params: { projectId: string; filmId: string }) {
  let state = await ensureState(params.projectId);
  const film = state.films.find((f) => f.filmId === params.filmId);
  if (!film?.generationPlan?.providerSpendAllowed) {
    throw new Error('Production plan must be approved before generation');
  }

  const ctx = film.template === 'MINI_VLOG_INTRO'
    ? buildNdxFilmPlannerContext('MINI_VLOG_INTRO')
    : buildNdxFilmPlannerContext('RABBIT_HOLE_INVESTIGATION');

  state = simulateGeneration(state, params.filmId, ctx);
  state = await filmStore.saveFilmProductionState(state);
  return { state, film: state.films.find((f) => f.filmId === params.filmId)! };
}

export async function applyDailiesJudgment(params: {
  projectId: string;
  filmId: string;
  entryId: string;
  action: DailiesAction;
  note?: string;
}) {
  let state = await ensureState(params.projectId);
  const film = state.films.find((f) => f.filmId === params.filmId)!;
  const ctx = film.template === 'MINI_VLOG_INTRO'
    ? buildNdxFilmPlannerContext('MINI_VLOG_INTRO')
    : buildNdxFilmPlannerContext('RABBIT_HOLE_INVESTIGATION');

  state = applyDailiesReview(state, params.filmId, params.entryId, params.action, params.note, ctx);
  state = await filmStore.saveFilmProductionState(state);
  return { state, film: state.films.find((f) => f.filmId === params.filmId)! };
}

export async function applyRoughCutJudgment(params: {
  projectId: string;
  filmId: string;
  action: RoughCutAction;
  note?: string;
}) {
  let state = await ensureState(params.projectId);
  state = applyRoughCutReviewAction(state, params.filmId, params.action, params.note);
  state = await filmStore.saveFilmProductionState(state);
  return { state, film: state.films.find((f) => f.filmId === params.filmId)! };
}

export async function completeFilmGate(params: { projectId: string; filmId: string; gate: FounderGate }) {
  let state = await ensureState(params.projectId);
  state = completeFounderGate(state, params.filmId, params.gate);
  state = await filmStore.saveFilmProductionState(state);
  return { state, film: state.films.find((f) => f.filmId === params.filmId)! };
}

export async function registerFilmsOnCampaignBoard(params: { projectId: string }) {
  const state = await ensureState(params.projectId);
  const run = await campaignStore.getCampaignProductionRun(params.projectId);
  if (!run) {
    return { state, run: null };
  }

  const filmParentAssets = state.films.map((film) => ({
    assetId: film.parentCampaignAssetId ?? `parent-${film.filmId}`,
    campaignId: run.campaign?.campaignId ?? 'ndxbook-reels',
    contentPieceId: film.filmId,
    sequencePosition: 1,
    roundId: null,
    semanticRole: 'HERO' as const,
    status: film.productionState === 'LOCKED' ? ('LOCKED' as const) : ('IN_PROGRESS' as const),
    parentAssetId: null,
    contractId: film.plan?.planId ?? null,
    generatedAssetUrl: film.roughCut?.renderUrl,
    generatedAssetId: film.roughCut?.roughCutId ?? null,
    lockedAt: null,
    approvedAt: null,
    clientJudgment: null,
    internalJudgment: null,
    revisionDeltaId: null,
    fingerprint: film.filmId,
    createdAt: film.createdAt,
    updatedAt: film.updatedAt,
  }));

  const childShotAssets = state.films.flatMap((film) =>
    (film.plan?.shots ?? []).map((shot, index) => ({
      assetId: `shot-${shot.shotId}`,
      campaignId: run.campaign?.campaignId ?? 'ndxbook-reels',
      contentPieceId: film.filmId,
      sequencePosition: index + 1,
      roundId: null,
      semanticRole: 'SUPPORT' as const,
      status: 'PLANNED' as const,
      parentAssetId: film.parentCampaignAssetId ?? `parent-${film.filmId}`,
      contractId: shot.shotId,
      generatedAssetUrl: film.sceneDeck?.slots.find((s) => s.shotId === shot.shotId)?.clipUrl ?? null,
      generatedAssetId: null,
      lockedAt: null,
      approvedAt: null,
      clientJudgment: null,
      internalJudgment: null,
      revisionDeltaId: null,
      fingerprint: shot.shotId,
      createdAt: film.createdAt,
      updatedAt: film.updatedAt,
    })),
  );

  const existingAssets = run.board?.assets ?? [];
  const newAssetIds = new Set([...filmParentAssets, ...childShotAssets].map((a) => a.assetId));
  const mergedAssets = [
    ...existingAssets.filter((a) => !newAssetIds.has(a.assetId)),
    ...filmParentAssets,
    ...childShotAssets,
  ];

  const saved = await campaignStore.saveCampaignProductionRun({
    ...run,
    board: run.board
      ? { ...run.board, assets: mergedAssets, contentPieceIds: [...new Set([...run.board.contentPieceIds, ...state.films.map((f) => f.filmId)])] }
      : null,
    filmProduction: state,
    updatedAt: new Date().toISOString(),
  });

  return { state, run: saved };
}
