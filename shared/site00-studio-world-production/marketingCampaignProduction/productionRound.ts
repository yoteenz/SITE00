/**
 * Production round eligibility — uneven sequence support, no filler slides.
 */

import type {
  CampaignProductionAsset,
  CampaignProductionBoard,
  CampaignProductionRound,
} from './types.js';

export function sequenceDepthForPiece(board: CampaignProductionBoard, contentPieceId: string): number {
  return board.sequenceDepthByPiece[contentPieceId] ?? 0;
}

export function eligibleContentPiecesForRound(params: {
  board: CampaignProductionBoard;
  sequencePosition: number;
}): string[] {
  return params.board.contentPieceIds.filter(
    (id) => sequenceDepthForPiece(params.board, id) >= params.sequencePosition,
  );
}

export function roundHasFillerSlides(params: {
  board: CampaignProductionBoard;
  round: CampaignProductionRound;
}): boolean {
  for (const pieceId of params.round.assetIds.map((aid) => {
    const asset = params.board.assets.find((a) => a.assetId === aid);
    return asset?.contentPieceId;
  })) {
    if (!pieceId) continue;
    if (sequenceDepthForPiece(params.board, pieceId) < params.round.sequencePosition) {
      return true;
    }
  }
  return false;
}

export function buildProductionRound(params: {
  campaignId: string;
  sequencePosition: number;
  board: CampaignProductionBoard;
  existingAssets?: CampaignProductionAsset[];
}): CampaignProductionRound {
  const eligible = eligibleContentPiecesForRound({
    board: params.board,
    sequencePosition: params.sequencePosition,
  });
  const assetIds = eligible.map((pieceId) => {
    const existing = params.existingAssets?.find(
      (a) => a.contentPieceId === pieceId && a.sequencePosition === params.sequencePosition,
    );
    return existing?.assetId ?? `cpa-${pieceId}-s${params.sequencePosition}`;
  });

  return {
    id: `round-${params.campaignId}-s${params.sequencePosition}`,
    campaignId: params.campaignId,
    sequencePosition: params.sequencePosition,
    label: `ROUND ${String(params.sequencePosition).padStart(2, '0')} — SLIDE ${params.sequencePosition}`,
    eligibleContentPieceIds: eligible,
    assetIds,
    status: params.sequencePosition === 1 ? 'CONTRACTS_READY' : 'PLANNED',
    startedAt: null,
    completedAt: null,
    lockedAt: null,
    coherenceEvaluation: null,
    reviewStatus: null,
  };
}

export function roundCanGenerate(params: {
  rounds: CampaignProductionRound[];
  targetSequencePosition: number;
}): boolean {
  if (params.targetSequencePosition <= 1) return true;
  const prior = params.rounds.find((r) => r.sequencePosition === params.targetSequencePosition - 1);
  return prior?.status === 'LOCKED';
}

export function roundCanGenerateBeforePriorLock(): boolean {
  return false;
}

export function unevenSequenceLengthsSupported(depths: number[]): boolean {
  return new Set(depths).size > 1 || depths.some((d) => d === 1);
}

export function noFillerSlideGeneration(params: {
  pieceDepth: number;
  sequencePosition: number;
}): boolean {
  return params.sequencePosition <= params.pieceDepth;
}
