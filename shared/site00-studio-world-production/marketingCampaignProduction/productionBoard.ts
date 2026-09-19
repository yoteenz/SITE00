/**
 * Campaign board builder + feed preview helpers.
 */

import { createHash } from 'node:crypto';
import type {
  CampaignContentSlate,
  CampaignProductionAsset,
  CampaignProductionBoard,
  MarketingCampaignPeriod,
} from './types.js';
import { buildProductionRound } from './productionRound.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildCampaignProductionBoard(params: {
  campaign: MarketingCampaignPeriod;
  slate: CampaignContentSlate;
  slide01Assets?: CampaignProductionAsset[];
}): CampaignProductionBoard {
  const sequenceDepthByPiece: Record<string, number> = {};
  for (const entry of params.slate.entries) {
    sequenceDepthByPiece[entry.contentPieceId] = entry.sequenceLength;
  }

  const maxSequenceDepth = Math.max(...Object.values(sequenceDepthByPiece), 1);
  const assets: CampaignProductionAsset[] = params.slide01Assets ?? [];

  for (const entry of params.slate.entries) {
    if (!assets.some((a) => a.contentPieceId === entry.contentPieceId && a.sequencePosition === 1)) {
      assets.push({
        assetId: `cpa-${entry.contentPieceId}-s1`,
        campaignId: params.campaign.campaignId,
        contentPieceId: entry.contentPieceId,
        sequencePosition: 1,
        roundId: `round-${params.campaign.campaignId}-s1`,
        semanticRole: 'OPEN',
        status: 'PLANNED',
        parentAssetId: null,
        contractId: null,
        generatedAssetUrl: null,
        generatedAssetId: null,
        lockedAt: null,
        approvedAt: null,
        clientJudgment: null,
        internalJudgment: null,
        revisionDeltaId: null,
        fingerprint: fp(entry),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const board: CampaignProductionBoard = {
    boardId: `board-${params.campaign.campaignId}`,
    campaignId: params.campaign.campaignId,
    contentPieceIds: params.slate.entries.map((e) => e.contentPieceId),
    maxSequenceDepth,
    sequenceDepthByPiece,
    assets,
    rounds: [],
    currentRoundSequencePosition: 1,
    fingerprint: '',
  };

  for (let pos = 1; pos <= maxSequenceDepth; pos++) {
    board.rounds.push(
      buildProductionRound({
        campaignId: params.campaign.campaignId,
        sequencePosition: pos,
        board,
        existingAssets: assets,
      }),
    );
  }

  board.fingerprint = fp(board);
  return board;
}

export function feedPreviewUsesFirstSlideAssetsOnly(assets: CampaignProductionAsset[]): CampaignProductionAsset[] {
  return assets.filter((a) => a.sequencePosition === 1);
}

export function campaignWallAssetAt(params: {
  board: CampaignProductionBoard;
  contentPieceId: string;
  sequencePosition: number;
}): CampaignProductionAsset | undefined {
  return params.board.assets.find(
    (a) => a.contentPieceId === params.contentPieceId && a.sequencePosition === params.sequencePosition,
  );
}

export function roundViewAssets(params: {
  board: CampaignProductionBoard;
  sequencePosition: number;
}): CampaignProductionAsset[] {
  return params.board.assets
    .filter((a) => a.sequencePosition === params.sequencePosition)
    .filter((a) => params.board.sequenceDepthByPiece[a.contentPieceId]! >= params.sequencePosition);
}

export function boardIsNotSpreadsheetPresentation(mode: string): boolean {
  return mode !== 'SPREADSHEET';
}
