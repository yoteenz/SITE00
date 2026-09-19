/**
 * B5.5 — Entry 001 format workspace builders.
 */

import type {
  Entry001DeliverableRecord,
  Entry001FormatFamily,
  Entry001FormatPreview,
  Entry001FormatPreviewSlot,
  Entry001FormatWorkspaceStatus,
  Entry001FormatWorkspaceSummary,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { ENTRY001_REQUIRED_DELIVERABLE_TYPES } from '../../../config/entry001CampaignAssets.js';
import {
  ENTRY001_PACKAGE_FORMAT_FAMILIES,
  formatFamilyLabel,
  formatFamilyPlatform,
  getActivePackageDeliverables,
} from './entry001DeliverableStore.js';

const REEL_SLOTS = ['REEL_COVER', 'REEL'] as const;

const REQUIRED_BY_FORMAT: Partial<Record<Entry001FormatFamily, string[]>> = {
  REEL: ['REEL COVER', 'FINAL REEL'],
  CAROUSEL: ['CAROUSEL SLIDES'],
  STORY: ['STORY FRAMES'],
  TIKTOK: ['TIKTOK POST'],
  X: ['X POST'],
  HIGHLIGHT: ['HIGHLIGHT ICON'],
};

function computeFormatStatus(
  active: Entry001DeliverableRecord[],
  requiredLabels: string[],
): {
  status: Entry001FormatWorkspaceStatus;
  assetCount: number;
  approvedAssetCount: number;
  missingAssetCount: number;
  previewable: boolean;
  complete: boolean;
} {
  const assetCount = active.length;
  const approvedAssetCount = active.filter((d) => d.approved && d.filePath).length;
  const missingAssetCount = Math.max(0, requiredLabels.length - approvedAssetCount);

  let status: Entry001FormatWorkspaceStatus = 'NOT_STARTED';
  if (assetCount === 0) status = 'NOT_STARTED';
  else if (approvedAssetCount >= requiredLabels.length && requiredLabels.length > 0) status = 'COMPLETE';
  else if (active.some((d) => d.status === 'AWAITING_REVIEW')) status = 'AWAITING_REVIEW';
  else if (assetCount > 0) status = 'IN_PROGRESS';

  const previewable = assetCount > 0 || requiredLabels.length > 0;
  const complete = status === 'COMPLETE';

  return { status, assetCount, approvedAssetCount, missingAssetCount, previewable, complete };
}

export function buildFormatWorkspaceSummaries(
  deliverables: Entry001DeliverableRecord[],
): Entry001FormatWorkspaceSummary[] {
  const activeAll = getActivePackageDeliverables(deliverables);

  return ENTRY001_PACKAGE_FORMAT_FAMILIES.map((formatFamily) => {
    const active = activeAll.filter((d) => d.formatFamily === formatFamily);
    const requiredLabels = REQUIRED_BY_FORMAT[formatFamily] ?? [];
    const stats = computeFormatStatus(active, requiredLabels);

    const missingSlots: string[] = [];
    if (formatFamily === 'REEL') {
      if (!active.some((d) => d.assetType === 'REEL_COVER' && d.filePath)) missingSlots.push('REEL COVER');
      if (!active.some((d) => d.assetType === 'REEL' && d.filePath)) missingSlots.push('FINAL REEL');
    } else if (formatFamily === 'TIKTOK' && !active.some((d) => d.filePath)) {
      missingSlots.push('TIKTOK POST');
    } else if (formatFamily === 'X' && !active.some((d) => d.filePath)) {
      missingSlots.push('X POST COPY / MEDIA');
    } else if (formatFamily === 'HIGHLIGHT' && !active.some((d) => d.filePath)) {
      missingSlots.push('HIGHLIGHT ICON');
    }

    return {
      formatFamily,
      label: formatFamilyLabel(formatFamily),
      platform: formatFamilyPlatform(formatFamily),
      deliverableIds: active.map((d) => d.deliverableId),
      missingSlots,
      ...stats,
    };
  });
}

export function buildFormatPreview(
  formatFamily: Entry001FormatFamily,
  deliverables: Entry001DeliverableRecord[],
): Entry001FormatPreview {
  const active = getActivePackageDeliverables(deliverables)
    .filter((d) => d.formatFamily === formatFamily)
    .sort((a, b) => (a.sequenceIndex ?? 999) - (b.sequenceIndex ?? 999));

  const summary = buildFormatWorkspaceSummaries(deliverables).find((s) => s.formatFamily === formatFamily)!;
  const slots = buildPreviewSlots(formatFamily, active, summary.missingSlots);

  const caption = active.find((d) => d.caption)?.caption ?? null;
  const copyText =
    formatFamily === 'X'
      ? (active.find((d) => d.caption)?.caption ??
        active.find((d) => d.description)?.description ??
        null)
      : caption;

  return {
    formatFamily,
    label: formatFamilyLabel(formatFamily),
    status: summary.status,
    slots,
    caption,
    copyText,
    sequenceTotal: slots.length,
    sequenceCurrent: Math.min(
      1,
      slots.findIndex((s) => s.deliverable && !s.placeholder) + 1 || 1,
    ),
  };
}

function buildPreviewSlots(
  formatFamily: Entry001FormatFamily,
  active: Entry001DeliverableRecord[],
  _missingSlots: string[],
): Entry001FormatPreviewSlot[] {
  if (formatFamily === 'REEL') {
    const cover = active.find((d) => d.assetType === 'REEL_COVER');
    const finalReel = active.find((d) => d.assetType === 'REEL');
    const upstream = active.filter((d) => d.assetType !== 'REEL_COVER' && d.assetType !== 'REEL');

    const slots: Entry001FormatPreviewSlot[] = [
      {
        slotId: 'reel-cover',
        label: 'REEL COVER',
        deliverable: cover ?? null,
        placeholder: !cover?.filePath,
        placeholderLabel: cover?.filePath ? undefined : 'REEL COVER',
      },
      ...upstream.map((d) => ({
        slotId: d.deliverableId,
        label: d.title,
        deliverable: d,
        placeholder: false,
      })),
      {
        slotId: 'final-reel',
        label: 'FINAL REEL',
        deliverable: finalReel ?? null,
        placeholder: !finalReel?.filePath,
        placeholderLabel: 'VIDEO PENDING',
      },
    ];
    return slots;
  }

  if (formatFamily === 'CAROUSEL' || formatFamily === 'STORY') {
    if (active.length === 0) {
      return [
        {
          slotId: `${formatFamily}-pending-1`,
          label: `${formatFamily} FRAME 01`,
          deliverable: null,
          placeholder: true,
          placeholderLabel: 'PENDING',
        },
      ];
    }
    return active.map((d, i) => ({
      slotId: d.deliverableId,
      label: `${formatFamily === 'CAROUSEL' ? 'SLIDE' : 'FRAME'} ${String(i + 1).padStart(2, '0')}`,
      deliverable: d,
      placeholder: !d.filePath,
      placeholderLabel: d.filePath ? undefined : 'PENDING',
    }));
  }

  if (formatFamily === 'TIKTOK') {
    const video = active.find((d) => d.format === 'VIDEO') ?? active[0];
    return [
      {
        slotId: 'tiktok-video',
        label: 'TIKTOK VIDEO',
        deliverable: video ?? null,
        placeholder: !video?.filePath,
        placeholderLabel: 'TIKTOK PENDING',
      },
    ];
  }

  if (formatFamily === 'X') {
    const media = active.find((d) => d.filePath);
    return [
      {
        slotId: 'x-copy',
        label: 'POST COPY',
        deliverable: active.find((d) => d.caption || d.description) ?? null,
        placeholder: !copyPresent(active),
        placeholderLabel: 'COPY PLACEHOLDER',
      },
      {
        slotId: 'x-media',
        label: 'MEDIA',
        deliverable: media ?? null,
        placeholder: !media?.filePath,
        placeholderLabel: 'OPTIONAL / MISSING',
      },
    ];
  }

  if (formatFamily === 'HIGHLIGHT') {
    const icon = active.find((d) => d.assetType === 'HIGHLIGHT_ICON') ?? active[0];
    return [
      {
        slotId: 'highlight-icon',
        label: 'HIGHLIGHT ICON',
        deliverable: icon ?? null,
        placeholder: !icon?.filePath,
        placeholderLabel: 'ICON PENDING',
      },
    ];
  }

  return active.map((d) => ({
    slotId: d.deliverableId,
    label: d.title,
    deliverable: d,
    placeholder: !d.filePath,
  }));
}

function copyPresent(active: Entry001DeliverableRecord[]): boolean {
  return active.some((d) => d.caption || d.description);
}

export function buildRequiredDeliverablePlaceholders(
  deliverables: Entry001DeliverableRecord[],
): Entry001FormatPreviewSlot[] {
  const active = getActivePackageDeliverables(deliverables);
  const filledTypes = new Set(active.filter((d) => d.approved && d.filePath).map((d) => d.assetType));

  return ENTRY001_REQUIRED_DELIVERABLE_TYPES.filter((t) => !filledTypes.has(t)).map((assetType) => ({
    slotId: `missing-${assetType.toLowerCase()}`,
    label: assetType.replace(/_/g, ' '),
    deliverable: null,
    placeholder: true,
    placeholderLabel: 'PENDING',
  }));
}

export { REEL_SLOTS };
