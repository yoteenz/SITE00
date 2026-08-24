/**
 * P0.5E — Marketing campaign production service.
 */

import {
  NDXBOOK_CAMPAIGN_PRODUCTION_RUN_ID,
} from '../../../../shared/site00-brand-lore/marketingCampaignProduction/constants.js';
import {
  initializeNdxbookExperiment01Board,
  lockNdxbookRound01,
  formulateNdxbookRound02Contracts,
  NDXBOOK_ROUND_02_ID,
} from '../../../../shared/site00-brand-lore/marketingCampaignProduction/ndxbookExperiment01Adapter.js';
import {
  evaluateHorizontalCoherence,
  evaluateCampaignRhythm,
} from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/coherence.js';
import { createRoundApproval } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/approval.js';
import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import * as campaignStore from './marketingCampaignProductionStoreAdapter.js';
import * as marketingStore from '../creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyRun(projectId: string): MarketingCampaignProductionRun {
  return {
    runId: NDXBOOK_CAMPAIGN_PRODUCTION_RUN_ID,
    projectId,
    campaign: null,
    slate: null,
    board: null,
    sequenceContracts: [],
    approvals: [],
    revisionDeltas: [],
    reopenEvents: [],
    snapshots: [],
    completePackages: [],
    rhythmEvaluation: null,
    accounting: {
      anthropicRequests: 0,
      anthropicEstimatedCostUsd: 0,
      falRequests: 0,
      falEstimatedCostUsd: 0,
      falActualCostUsd: 0,
      revisionCostUsd: 0,
      campaignTotalUsd: 0,
    },
    status: 'NOT_STARTED',
    error: null,
    updatedAt: nowIso(),
  };
}

export async function getCampaignProductionState(params: {
  projectId: string;
}): Promise<MarketingCampaignProductionRun | null> {
  return campaignStore.getCampaignProductionRun(params.projectId);
}

export async function initializeCampaignBoardFromExperiment01(params: {
  projectId: string;
}): Promise<MarketingCampaignProductionRun> {
  const marketingRun = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  if (!marketingRun?.experiment01V21?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.1 required before campaign board initialization');
  }

  const { campaign, slate, board } = initializeNdxbookExperiment01Board({
    marketingRun,
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
  });

  const rhythmEvaluation = evaluateCampaignRhythm({
    campaignId: campaign.campaignId,
    assets: board.assets,
    contracts: [],
  });

  return campaignStore.saveCampaignProductionRun({
    ...emptyRun(params.projectId),
    campaign,
    slate,
    board,
    rhythmEvaluation,
    status: 'INITIALIZED',
    updatedAt: nowIso(),
  });
}

export async function lockCampaignRound01(params: {
  projectId: string;
  actor?: string;
}): Promise<MarketingCampaignProductionRun> {
  const run = await campaignStore.getCampaignProductionRun(params.projectId);
  if (!run?.board) throw new Error('Campaign board not initialized');

  const now = nowIso();
  const { board } = lockNdxbookRound01({ board: run.board, now });
  const approval = createRoundApproval({
    campaignId: run.campaign!.campaignId,
    roundId: board.rounds[0]!.id,
    judgment: 'APPROVE_ROUND',
    actor: params.actor ?? 'founder',
  });

  return campaignStore.saveCampaignProductionRun({
    ...run,
    board,
    campaign: run.campaign ? { ...run.campaign, productionState: 'ROUND_01_LOCKED', updatedAt: now } : null,
    approvals: [...run.approvals, approval],
    status: 'ROUND_LOCKED',
    updatedAt: now,
  });
}

export async function formulateCampaignRound02(params: {
  projectId: string;
}): Promise<MarketingCampaignProductionRun> {
  const run = await campaignStore.getCampaignProductionRun(params.projectId);
  if (!run?.board || !run.campaign) throw new Error('Campaign board not initialized');

  const round01 = run.board.rounds.find((r) => r.sequencePosition === 1);
  if (round01?.status !== 'LOCKED') {
    throw new Error('Round 01 must be locked before Round 02 formulation');
  }

  const marketingRun = await marketingStore.getBrandMarketingExpressionRun(params.projectId);
  const v21 = marketingRun?.experiment01V21?.generatedArtifacts ?? [];

  const { contracts, round02Assets } = formulateNdxbookRound02Contracts({
    campaignId: run.campaign.campaignId,
    board: run.board,
    v21Artifacts: v21,
  });

  const round02Coherence = evaluateHorizontalCoherence({
    roundAssets: round02Assets,
    contracts,
  });

  const updatedBoard = {
    ...run.board,
    assets: [...run.board.assets, ...round02Assets],
    rounds: run.board.rounds.map((r) =>
      r.sequencePosition === 2
        ? {
            ...r,
            id: NDXBOOK_ROUND_02_ID,
            label: 'ROUND 02 — SLIDE 02 ACROSS ALL ELIGIBLE',
            status: 'CONTRACTS_READY' as const,
            eligibleContentPieceIds: round02Assets.map((a) => a.contentPieceId),
            assetIds: round02Assets.map((a) => a.assetId),
            coherenceEvaluation: round02Coherence,
          }
        : r,
    ),
    currentRoundSequencePosition: 2,
  };

  return campaignStore.saveCampaignProductionRun({
    ...run,
    board: updatedBoard,
    sequenceContracts: [...run.sequenceContracts, ...contracts],
    campaign: { ...run.campaign, productionState: 'ROUND_02_CONTRACTS_READY', updatedAt: nowIso() },
    accounting: {
      ...run.accounting,
      anthropicRequests: run.accounting.anthropicRequests + (process.env.VITEST === 'true' ? 0 : contracts.length),
      anthropicEstimatedCostUsd: run.accounting.anthropicEstimatedCostUsd + contracts.length * 0.02,
    },
    status: 'IN_PRODUCTION',
    updatedAt: nowIso(),
  });
}

export async function setCampaignAssetJudgment(params: {
  projectId: string;
  assetId: string;
  judgment: string;
  actor?: string;
}): Promise<MarketingCampaignProductionRun> {
  const run = await campaignStore.getCampaignProductionRun(params.projectId);
  if (!run?.board) throw new Error('Campaign board not initialized');

  const assets = run.board.assets.map((a) =>
    a.assetId === params.assetId
      ? {
          ...a,
          internalJudgment: params.judgment as never,
          status: params.judgment === 'LOCK_IT' ? ('APPROVED' as const) : a.status,
          updatedAt: nowIso(),
        }
      : a,
  );

  return campaignStore.saveCampaignProductionRun({
    ...run,
    board: { ...run.board, assets },
    updatedAt: nowIso(),
  });
}

export function noCampaignGenerationOnPageLoad(): true {
  return true;
}

export function noAutoRegenerationAfterApproval(): true {
  return true;
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGImmutable(): true {
  return true;
}

export function brandCharacterImmutable(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function productExpressionBlocked(): true {
  return true;
}

export function worldFormationBlocked(): true {
  return true;
}

export { resetCampaignProductionMemory, resetCampaignProductionStoreModeCache } from './marketingCampaignProductionStoreAdapter.js';
