/**
 * Campaign Board → Production Wall presentation adapter.
 */

import type {
  CampaignDayPresentation,
  ContentLanePresentation,
  CreativeAssetPresentation,
} from '../../site00-studio-world-production/founderWorkspace/types.js';
import {
  assetAttentionLevel,
  assetStatusLabel,
} from '../../site00-studio-world-production/founderWorkspace/attentionHierarchy.js';
import { NDX_CONTENT_LANE_LABELS } from './ndxFounderWorkspaceConfig.js';
import type { MarketingCampaignProductionRun } from '../../site00-studio-world-production/marketingCampaignProduction/types.js';

function assetToPresentation(
  asset: NonNullable<MarketingCampaignProductionRun['board']>['assets'][number],
  title: string,
): CreativeAssetPresentation {
  return {
    id: asset.assetId,
    title,
    previewUrl: asset.generatedAssetUrl,
    formatLabel: `SLIDE ${asset.sequencePosition}`,
    channelLabel: 'INSTAGRAM FEED',
    attention: assetAttentionLevel(asset.status),
    statusLabel: assetStatusLabel(asset.status),
    internalStatus: asset.status,
  };
}

export function buildCampaignWallDays(
  run: MarketingCampaignProductionRun | null,
  weekStart?: string,
): CampaignDayPresentation[] {
  const board = run?.board;
  const slate = run?.slate;
  if (!board || !slate) return [];

  const start = weekStart ?? new Date().toISOString().slice(0, 10);
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const slide01Assets = board.assets.filter((a) => a.sequencePosition === 1);

  return days.map((dayLabel, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    const pieceIndex = i % slate.entries.length;
    const entry = slate.entries[pieceIndex];
    const asset = slide01Assets.find((a) => a.contentPieceId === entry?.contentPieceId);

    const pages: CreativeAssetPresentation[] = asset
      ? [assetToPresentation(asset, entry?.title ?? asset.contentPieceId)]
      : [];

    const lanes: ContentLanePresentation[] = [
      { laneId: 'FEED', label: NDX_CONTENT_LANE_LABELS.FEED, assets: pages },
      { laneId: 'STORY', label: NDX_CONTENT_LANE_LABELS.STORY, assets: [] },
      { laneId: 'REEL', label: NDX_CONTENT_LANE_LABELS.REEL, assets: [] },
    ];

    return { date, dayLabel, lanes };
  });
}

export function buildCampaignFeedAssets(
  run: MarketingCampaignProductionRun | null,
): CreativeAssetPresentation[] {
  const board = run?.board;
  const slate = run?.slate;
  if (!board || !slate) return [];

  return board.assets
    .filter((a) => a.sequencePosition === 1)
    .map((asset) => {
      const entry = slate.entries.find((e) => e.contentPieceId === asset.contentPieceId);
      return assetToPresentation(asset, entry?.title ?? asset.contentPieceId);
    });
}

export function campaignBoardInspectPayload(run: MarketingCampaignProductionRun | null): Record<string, unknown> {
  const board = run?.board;
  return {
    status: run?.status,
    campaign: run?.campaign?.name,
    slide01Generated: board?.assets.filter((a) => a.sequencePosition === 1 && a.generatedAssetUrl).length,
    slide01Total: board?.assets.filter((a) => a.sequencePosition === 1).length,
    round01: board?.rounds.find((r) => r.sequencePosition === 1)?.status,
    round02: board?.rounds.find((r) => r.sequencePosition === 2)?.status,
    currentRound: board?.currentRoundSequencePosition,
  };
}
