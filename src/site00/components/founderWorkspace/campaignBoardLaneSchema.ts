/**
 * Campaign Board lane geometry — derived from canonical slate / Experiment 01 schema.
 */

import { NDX_CONTENT_LANE_LABELS } from '../../../../shared/site00-brand-lore/founderWorkspace/ndxFounderWorkspaceConfig.js';
import type {
  CampaignProductionAsset,
  CampaignContentSlateEntry,
  MarketingCampaignProductionRun,
} from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';

export type CampaignBoardLaneId = 'PAGES' | 'MARGINS' | 'MOTION';
export type GhostSlotVariant = 'page' | 'margin' | 'motion';
export type CampaignAssetFormat = 'PAGE' | 'MARGIN' | 'MOTION';

export type CampaignBoardSlot = {
  slotId: string;
  contentPieceId: string;
  title: string;
  format: CampaignAssetFormat;
  asset: CampaignProductionAsset | null;
};

export type CampaignBoardLane = {
  laneId: CampaignBoardLaneId;
  label: string;
  ghostVariant: GhostSlotVariant;
  slots: CampaignBoardSlot[];
};

/** Canonical Experiment 01 lane split — matches populated board asset grouping. */
export const CAMPAIGN_BOARD_LANE_SPLITS: ReadonlyArray<{
  laneId: CampaignBoardLaneId;
  label: string;
  count: number;
  ghostVariant: GhostSlotVariant;
  format: CampaignAssetFormat;
}> = [
  { laneId: 'PAGES', label: NDX_CONTENT_LANE_LABELS.FEED, count: 3, ghostVariant: 'page', format: 'PAGE' },
  { laneId: 'MARGINS', label: NDX_CONTENT_LANE_LABELS.STORY, count: 4, ghostVariant: 'margin', format: 'MARGIN' },
  { laneId: 'MOTION', label: NDX_CONTENT_LANE_LABELS.REEL, count: 2, ghostVariant: 'motion', format: 'MOTION' },
];

function plannedSlateEntries(): Pick<CampaignContentSlateEntry, 'contentPieceId' | 'title'>[] {
  const total = CAMPAIGN_BOARD_LANE_SPLITS.reduce((sum, lane) => sum + lane.count, 0);
  return Array.from({ length: total }, (_, i) => ({
    contentPieceId: `piece-${i + 1}`,
    title: `Planned content piece ${i + 1}`,
  }));
}

export function resolveCampaignBoardLanes(run: MarketingCampaignProductionRun | null): CampaignBoardLane[] {
  const entries = run?.slate?.entries ?? plannedSlateEntries();
  const slide01Assets = run?.board?.assets.filter((a) => a.sequencePosition === 1) ?? [];

  let offset = 0;
  return CAMPAIGN_BOARD_LANE_SPLITS.map((split) => {
    const slice = entries.slice(offset, offset + split.count);
    offset += split.count;
    const slots: CampaignBoardSlot[] = slice.map((entry) => {
      const asset = slide01Assets.find((a) => a.contentPieceId === entry.contentPieceId) ?? null;
      return {
        slotId: `${split.laneId}-${entry.contentPieceId}`,
        contentPieceId: entry.contentPieceId,
        title: entry.title,
        format: split.format,
        asset,
      };
    });
    return {
      laneId: split.laneId,
      label: split.label,
      ghostVariant: split.ghostVariant,
      slots,
    };
  });
}

export type CampaignIdentityPresentation = {
  campaignLabel: string | null;
  periodLabel: string | null;
  statusLabel: string;
  cadenceLabel: string | null;
};

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return iso.slice(0, 10);
  }
}

export function resolveCampaignIdentity(run: MarketingCampaignProductionRun | null): CampaignIdentityPresentation {
  const campaign = run?.campaign;
  let periodLabel: string | null = null;

  if (campaign?.startDate && campaign.endDate) {
    periodLabel = `${formatShortDate(campaign.startDate)} – ${formatShortDate(campaign.endDate)}`;
  } else if (campaign?.startDate) {
    periodLabel = `From ${formatShortDate(campaign.startDate)}`;
  } else if (campaign?.planningState) {
    periodLabel = campaign.planningState.replace(/_/g, ' ');
  }

  return {
    campaignLabel: campaign?.name ?? null,
    periodLabel,
    statusLabel: run?.status ?? 'NOT_STARTED',
    cadenceLabel: campaign?.channelIds?.length ? campaign.channelIds.join(' · ') : null,
  };
}
