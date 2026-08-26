import { useCallback, useEffect, useState } from 'react';
import type { MarketingCampaignProductionRun } from '../../../shared/site00-studio-world-production/marketingCampaignProduction/types';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { formatCampaignCreatedLabel } from '../utils/campaignBoardWeekCalendar';

export type CampaignBoardMobileStatus = {
  statusLabel: string;
  statusHint: string;
  createdLabel: string;
  updatedHint: string;
  pagesCount: number;
  motionCount: number;
  round01Locked: boolean;
  canGenerateSlide01: boolean;
  canLockRound01: boolean;
};

function deriveStatus(run: MarketingCampaignProductionRun | null): CampaignBoardMobileStatus {
  const board = run?.board;
  const slide01Assets = board?.assets.filter((a) => a.sequencePosition === 1) ?? [];
  const round01 = board?.rounds.find((r) => r.sequencePosition === 1);

  let statusLabel = 'PLANNED — NOT INITIALIZED';
  let statusHint = 'Ready to build.';
  if (run?.status === 'IN_PRODUCTION') {
    statusLabel = 'IN PRODUCTION';
    statusHint = 'Campaign active.';
  } else if (run?.status === 'INITIALIZED') {
    statusLabel = 'INITIALIZED';
    statusHint = 'Ready to produce.';
  } else if (run?.status === 'ROUND_LOCKED') {
    statusLabel = 'ROUND LOCKED';
    statusHint = 'Round 01 locked.';
  } else if (run?.campaign?.status) {
    statusLabel = run.campaign.status.replace(/_/g, ' ');
    statusHint = 'Campaign board loaded.';
  }

  const createdAt = run?.campaign?.createdAt ? new Date(run.campaign.createdAt) : null;
  const createdLabel = createdAt ? formatCampaignCreatedLabel(createdAt) : formatCampaignCreatedLabel(new Date());

  return {
    statusLabel,
    statusHint,
    createdLabel,
    updatedHint: 'Last updated today',
    pagesCount: slide01Assets.length || 9,
    motionCount: board?.assets.filter((a) => a.sequencePosition >= 2).length || 3,
    round01Locked: round01?.status === 'LOCKED',
    canGenerateSlide01: Boolean(board && round01?.status === 'LOCKED'),
    canLockRound01: Boolean(board && round01?.status !== 'LOCKED'),
  };
}

export function useCampaignBoardMobileRun(projectSlug: string) {
  const [run, setRun] = useState<MarketingCampaignProductionRun | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const result = await site00ProjectsApi.campaignProductionGet(projectSlug);
      setRun((result.run as MarketingCampaignProductionRun | null) ?? null);
    } catch {
      setRun(null);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      setRun((result.run as MarketingCampaignProductionRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const status = deriveStatus(run);

  const mapPageStatus = (assetId: string | undefined, fallback: string): string => {
    if (!assetId || !run?.board) return fallback;
    const asset = run.board.assets.find((a) => a.assetId === assetId);
    if (!asset) return fallback;
    return asset.status.replace(/_/g, ' ');
  };

  return {
    run,
    busy,
    status,
    reload,
    lockRound01: () => act(() => site00ProjectsApi.campaignProductionLockRound01(projectSlug)),
    initialize: () => act(() => site00ProjectsApi.campaignProductionInitialize(projectSlug)),
    mapPageStatus,
  };
}
