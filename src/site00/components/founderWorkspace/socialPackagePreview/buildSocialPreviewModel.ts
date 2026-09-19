/**
 * B5.8 — Generic social preview model builders.
 */

import type {
  SocialFormatFamily,
  SocialFormatPreviewModel,
  SocialPackageActivityEvent,
  SocialPackageFlowStep,
  SocialPreviewSlot,
  SocialPreviewStatus,
} from './types.js';
import { SOCIAL_PREVIEW_FORMAT_ORDER } from './types.js';

const FLOW_VERBS: Record<SocialFormatFamily, string> = {
  REEL: 'HOOK REEL',
  CAROUSEL: 'BUILD CAROUSEL',
  STORY: 'ENGAGE STORY',
  TIKTOK: 'EXPAND TIKTOK',
  X: 'POST ON X',
  HIGHLIGHT: 'COVER HIGHLIGHT',
};

export function mapWorkspaceStatusToPreviewStatus(
  status: string,
  formatFamily: SocialFormatFamily,
  slots: SocialPreviewSlot[],
): SocialPreviewStatus {
  if (formatFamily === 'REEL') {
    const hasCover = slots.some((s) => s.slotId === 'reel-cover' && !s.placeholder);
    const hasVideo = slots.some((s) => s.slotId === 'final-reel' && !s.placeholder);
    if (hasCover && !hasVideo) return 'COVER_ONLY';
    if (!hasVideo && status !== 'NOT_STARTED') return 'VIDEO_PENDING';
  }
  if (status === 'NOT_STARTED') return 'NOT_STARTED';
  if (status === 'COMPLETE') return 'COMPLETE';
  if (status === 'AWAITING_REVIEW') return 'AWAITING_REVIEW';
  if (status === 'NEEDS_REVISION') return 'IN_PROGRESS';
  return 'IN_PROGRESS';
}

export function buildPackageFlowSteps(formats: SocialFormatPreviewModel[]): SocialPackageFlowStep[] {
  return SOCIAL_PREVIEW_FORMAT_ORDER.map((family) => {
    const fmt = formats.find((f) => f.formatFamily === family);
    return {
      label: FLOW_VERBS[family],
      formatFamily: family,
      status: fmt?.status ?? 'NOT_STARTED',
    };
  });
}

export function buildRecentActivityFromDeliverables(
  items: Array<{
    title: string;
    formatFamily: SocialFormatFamily;
    updatedAt: string;
    createdAt: string;
    history?: Array<{ at: string; status: string; title: string }>;
  }>,
): SocialPackageActivityEvent[] {
  const events: SocialPackageActivityEvent[] = [];
  for (const d of items) {
    if (d.updatedAt) {
      events.push({
        at: d.updatedAt,
        label: `${d.title} updated`,
        formatFamily: d.formatFamily,
      });
    }
    for (const h of d.history ?? []) {
      if (h.at) {
        events.push({
          at: h.at,
          label: `${d.title} — ${h.status}`,
          formatFamily: d.formatFamily,
        });
      }
    }
  }
  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);
}

export function formatStatusLabel(status: SocialPreviewStatus): string {
  return status.replace(/_/g, ' ');
}

export function countCompleteFormats(formats: SocialFormatPreviewModel[]): number {
  return formats.filter((f) => f.complete || f.status === 'COMPLETE').length;
}

export function derivePackageStatusLabel(completeCount: number, totalCount: number): string {
  if (completeCount >= totalCount) return 'PACKAGE COMPLETE';
  if (completeCount === 0) return 'PACKAGE NOT STARTED';
  return 'PACKAGE IN PROGRESS';
}

export function nextFormatFamily(current: SocialFormatFamily): SocialFormatFamily | null {
  const idx = SOCIAL_PREVIEW_FORMAT_ORDER.indexOf(current);
  if (idx < 0 || idx >= SOCIAL_PREVIEW_FORMAT_ORDER.length - 1) return null;
  return SOCIAL_PREVIEW_FORMAT_ORDER[idx + 1] ?? null;
}
