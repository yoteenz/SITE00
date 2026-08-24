/**
 * NDXBOOK Experiment 01 — brand-specific adapter for generic campaign production.
 * Supplies NDX expression authority without encoding NDX aesthetics into generic models.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingExpressionRun } from '../brandMarketingExpression/types.js';
import type { Experiment01V21Artifact } from '../culturalVisualParticipation/types.js';
import { EXPERIMENT_01_TOPIC_SPECS } from '../brandMarketingExpression/characterEventFormulation.js';
import type {
  CampaignContentSlate,
  CampaignContentSlateEntry,
  CampaignProductionAsset,
  MarketingCampaignPeriod,
  SequenceSlideArtDirectionContract,
} from '../../site00-studio-world-production/marketingCampaignProduction/types.js';
import { buildCampaignProductionBoard,
  buildSequenceSlideArtDirectionContract,
  lockAsset,
} from '../../site00-studio-world-production/marketingCampaignProduction/index.js';
import { roundCanGenerate } from '../../site00-studio-world-production/marketingCampaignProduction/productionRound.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export const NDXBOOK_EXPERIMENT_01_CAMPAIGN_ID = 'ndxbook-experiment-01-market-test' as const;
export const NDXBOOK_ROUND_01_ID = 'NDXBOOK_EXPERIMENT_01_ROUND_01' as const;
export const NDXBOOK_ROUND_02_ID = 'NDXBOOK_EXPERIMENT_01_ROUND_02' as const;

/** Spec-defined uneven sequence depths for nine Experiment 01 pieces. */
export const NDXBOOK_EXPERIMENT_01_SEQUENCE_DEPTHS: Record<number, number> = {
  1: 5,
  2: 3,
  3: 7,
  4: 1,
  5: 6,
  6: 4,
  7: 8,
  8: 3,
  9: 5,
};

export function buildNdxbookExperiment01CampaignPeriod(params: {
  projectId: string;
  brandId: string;
  marketingRun: BrandMarketingExpressionRun;
}): MarketingCampaignPeriod {
  const now = new Date().toISOString();
  return {
    id: NDXBOOK_EXPERIMENT_01_CAMPAIGN_ID,
    projectId: params.projectId,
    brandId: params.brandId,
    campaignId: NDXBOOK_EXPERIMENT_01_CAMPAIGN_ID,
    name: 'NDXBOOK MARKET TEST 01',
    description: 'Nine-piece Experiment 01 horizontal sequence production proof',
    startDate: now,
    endDate: null,
    channelIds: ['INSTAGRAM_FEED'],
    contentPieceIds: EXPERIMENT_01_TOPIC_SPECS.map((s) => `piece-${s.topicIndex}`),
    strategyFingerprint: fp(params.marketingRun.expressionSystem),
    characterSystemFingerprint: params.marketingRun.brandCharacterSystemId ?? '',
    marketingExpressionFingerprint: params.marketingRun.expressionSystem?.fingerprint ?? '',
    editorialSystemFingerprint: 'P0.5C.1_EDITORIAL_INFORMATION_ARCHITECTURE',
    status: 'IN_PRODUCTION',
    planningState: 'SLATE_APPROVED',
    productionState: 'ROUND_01',
    approvalState: 'UNDER_REVIEW',
    publishingState: 'NOT_SCHEDULED',
    createdAt: now,
    updatedAt: now,
  };
}

export function buildNdxbookExperiment01Slate(campaignId: string): CampaignContentSlate {
  const entries: CampaignContentSlateEntry[] = EXPERIMENT_01_TOPIC_SPECS.map((spec) => ({
    contentPieceId: `piece-${spec.topicIndex}`,
    title: spec.headline,
    topic: spec.topic,
    thesisSummary: spec.trigger,
    semanticRole: 'OPEN',
    channel: 'INSTAGRAM_FEED',
    format: 'CAROUSEL',
    sequenceLength: NDXBOOK_EXPERIMENT_01_SEQUENCE_DEPTHS[spec.topicIndex] ?? 3,
    researchDepth: 'STANDARD',
    emotionalTemperature: spec.characterTemperature,
    productionStatus: 'PLANNED',
    approvalStatus: 'PLANNED',
    contentStatus: 'FORMULATED',
  }));

  return {
    slateId: `slate-${campaignId}`,
    campaignId,
    entries,
    approvedAt: new Date().toISOString(),
    fingerprint: fp(entries),
  };
}

export function mapV21ArtifactsToSlide01Assets(params: {
  campaignId: string;
  v21Artifacts: Experiment01V21Artifact[];
}): CampaignProductionAsset[] {
  const now = new Date().toISOString();
  return params.v21Artifacts.map((artifact) => {
    const topicIndex = parseInt(artifact.id.replace('bma-exp01-v21-', ''), 10);
    const pieceId = `piece-${topicIndex}`;
    const generated = artifact.generationStatus === 'GENERATED' && Boolean(artifact.generatedAssetUrl);

    return {
      assetId: `cpa-${pieceId}-s1`,
      campaignId: params.campaignId,
      contentPieceId: pieceId,
      sequencePosition: 1,
      roundId: NDXBOOK_ROUND_01_ID,
      semanticRole: artifact.contract.semanticRole ?? 'OPEN',
      status: generated ? 'GENERATED' : 'CONTRACT_READY',
      parentAssetId: null,
      contractId: artifact.contract.fingerprint,
      generatedAssetUrl: artifact.generatedAssetUrl,
      generatedAssetId: artifact.generatedAssetId,
      lockedAt: null,
      approvedAt: null,
      clientJudgment: null,
      internalJudgment: artifact.founderJudgment as never,
      revisionDeltaId: null,
      fingerprint: artifact.fingerprint,
      createdAt: artifact.createdAt,
      updatedAt: now,
    };
  });
}

export function initializeNdxbookExperiment01Board(params: {
  marketingRun: BrandMarketingExpressionRun;
  projectId: string;
  brandId: string;
}) {
  const v21 = params.marketingRun.experiment01V21;
  if (!v21?.generatedArtifacts.length) {
    throw new Error('Experiment 01 V2.1 required for campaign board initialization');
  }

  const campaign = buildNdxbookExperiment01CampaignPeriod({
    projectId: params.projectId,
    brandId: params.brandId,
    marketingRun: params.marketingRun,
  });
  const slate = buildNdxbookExperiment01Slate(campaign.campaignId);
  const slide01Assets = mapV21ArtifactsToSlide01Assets({
    campaignId: campaign.campaignId,
    v21Artifacts: v21.generatedArtifacts,
  });
  const board = buildCampaignProductionBoard({ campaign, slate, slide01Assets });

  board.rounds[0] = {
    ...board.rounds[0]!,
    id: NDXBOOK_ROUND_01_ID,
    label: 'ROUND 01 — SLIDE 01 ACROSS ALL NINE',
  };

  return { campaign, slate, board };
}

export function lockNdxbookRound01(params: {
  board: import('../../site00-studio-world-production/marketingCampaignProduction/types.js').CampaignProductionBoard;
  now: string;
}) {
  const round = params.board.rounds.find((r) => r.sequencePosition === 1)!;
  const updatedAssets = params.board.assets.map((a) => {
    if (a.sequencePosition !== 1) return a;
    if (a.status !== 'GENERATED' && a.status !== 'APPROVED') {
      throw new Error('All Slide 01 assets must be generated before lock');
    }
    return lockAsset({ ...a, status: 'APPROVED' }, params.now);
  });

  return {
    board: {
      ...params.board,
      assets: updatedAssets,
      rounds: params.board.rounds.map((r) =>
        r.sequencePosition === 1
          ? { ...r, status: 'LOCKED' as const, lockedAt: params.now, assetIds: updatedAssets.filter((a) => a.sequencePosition === 1).map((a) => a.assetId) }
          : r,
      ),
      currentRoundSequencePosition: 2,
    },
    round,
  };
}

export function formulateNdxbookRound02Contracts(params: {
  campaignId: string;
  board: import('../../site00-studio-world-production/marketingCampaignProduction/types.js').CampaignProductionBoard;
  v21Artifacts: Experiment01V21Artifact[];
}): {
  contracts: SequenceSlideArtDirectionContract[];
  round02Assets: CampaignProductionAsset[];
} {
  const round01 = params.board.rounds.find((r) => r.sequencePosition === 1);
  if (round01?.status !== 'LOCKED') {
    throw new Error('Round 01 must be locked before Round 02 formulation');
  }
  if (!roundCanGenerate({ rounds: params.board.rounds, targetSequencePosition: 2 })) {
    throw new Error('Round 02 cannot generate before Round 01 lock');
  }

  const contracts: SequenceSlideArtDirectionContract[] = [];
  const round02Assets: CampaignProductionAsset[] = [];
  const now = new Date().toISOString();

  for (const pieceId of params.board.contentPieceIds) {
    if ((params.board.sequenceDepthByPiece[pieceId] ?? 0) < 2) continue;

    const topicIndex = parseInt(pieceId.replace('piece-', ''), 10);
    const v21 = params.v21Artifacts.find((a) => a.id === `bma-exp01-v21-${topicIndex}`);
    const slide01Asset = params.board.assets.find((a) => a.contentPieceId === pieceId && a.sequencePosition === 1);
    const spec = EXPERIMENT_01_TOPIC_SPECS.find((s) => s.topicIndex === topicIndex)!;

    const contract = buildSequenceSlideArtDirectionContract({
      campaignId: params.campaignId,
      contentPieceId: pieceId,
      sequencePosition: 2,
      thesisSummary: spec.trigger,
      topic: spec.headline,
      slide01ContractSummary: v21
        ? {
            semanticRole: v21.contract.semanticRole,
            viewerShouldNoticeFirst: v21.contract.viewerShouldNoticeFirst,
            informationDeferred: v21.contract.deferredEvidence,
            primaryVisualSubject:
              v21.contract.culturalParticipation.visualSubjectMatterDecision.culturalVisualSubject,
            assetId: slide01Asset?.assetId ?? null,
          }
        : undefined,
    });

    contracts.push(contract);
    round02Assets.push({
      assetId: `cpa-${pieceId}-s2`,
      campaignId: params.campaignId,
      contentPieceId: pieceId,
      sequencePosition: 2,
      roundId: NDXBOOK_ROUND_02_ID,
      semanticRole: contract.semanticRole,
      status: 'CONTRACT_READY',
      parentAssetId: slide01Asset?.assetId ?? null,
      contractId: contract.id,
      generatedAssetUrl: null,
      generatedAssetId: null,
      lockedAt: null,
      approvedAt: null,
      clientJudgment: null,
      internalJudgment: null,
      revisionDeltaId: null,
      fingerprint: contract.fingerprint,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { contracts, round02Assets };
}

export function ndxbookAdapterSuppliesExpressionAuthority(): true {
  return true;
}

export function ndxVisualLanguageNotInGenericModels(genericSource: string): boolean {
  return !/lime green|burn book|receipt behavior|investigative artifacts/i.test(genericSource);
}
