/**
 * B5.8 — Entry 001 adapter for generic social package preview.
 */

import type {
  Entry001DeliverableRecord,
  Entry001FormatPreview,
  Entry001FormatWorkspaceSummary,
  Entry001PackagePreviewComposition,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { ENTRY_001_SUBJECT, ENTRY_001_TITLE } from '../../../../../shared/site00-expression-engine/constants.js';
import {
  site00ProjectCampaignBoardEntryCarouselPath,
  site00ProjectCampaignBoardEntryDeliverablePath,
  site00ProjectCampaignBoardEntryFormatPath,
  site00ProjectCampaignBoardEntryPath,
  site00ProjectCampaignBoardEntryStoryPath,
  site00ProjectContentOperationsCampaignBoardPath,
} from '../../../config/routes.js';
import {
  buildPackageFlowSteps,
  buildRecentActivityFromDeliverables,
  countCompleteFormats,
  derivePackageStatusLabel,
  mapWorkspaceStatusToPreviewStatus,
} from '../socialPackagePreview/buildSocialPreviewModel.js';
import type {
  SocialFormatFamily,
  SocialFormatPreviewModel,
  SocialPackagePreviewModel,
  SocialPreviewPaths,
  SocialPreviewSlot,
} from '../socialPackagePreview/types.js';
import { SOCIAL_PREVIEW_FORMAT_ORDER } from '../socialPackagePreview/types.js';
import { entry001NarrativeDescriptor } from './entry001NarrativeContinuity.js';
import { getActivePackageDeliverables } from './entry001DeliverableStore.js';

const SHORT_LABELS: Record<SocialFormatFamily, string> = {
  REEL: 'REEL',
  CAROUSEL: 'CAROUSEL',
  STORY: 'STORY',
  TIKTOK: 'TIKTOK',
  X: 'X',
  HIGHLIGHT: 'HIGHLIGHT',
};

function toSlot(
  slot: Entry001FormatPreview['slots'][0],
  index: number,
): SocialPreviewSlot {
  const d = slot.deliverable;
  return {
    slotId: slot.slotId,
    label: slot.label,
    sequenceNumber: d?.sequenceIndex ?? index + 1,
    filePath: d?.filePath ?? null,
    mediaType: d?.format === 'VIDEO' ? 'VIDEO' : d?.filePath ? 'IMAGE' : 'NONE',
    title: d?.title ?? slot.label,
    placeholder: slot.placeholder,
    placeholderLabel: slot.placeholderLabel ?? null,
    deliverableId: d?.deliverableId ?? null,
    assetRole: d?.assetRole ?? null,
    assetType: d?.assetType ?? null,
    approvalState: d?.approved ? 'APPROVED' : d?.status ?? null,
    dimensions: null,
    source: d?.source ?? null,
    version: d?.version ?? null,
    notes: d?.description ?? null,
  };
}

function toFormatModel(
  preview: Entry001FormatPreview,
  summary: Entry001FormatWorkspaceSummary | undefined,
): SocialFormatPreviewModel {
  const family = preview.formatFamily as SocialFormatFamily;
  const slots = preview.slots.map(toSlot);
  const status = mapWorkspaceStatusToPreviewStatus(preview.status, family, slots);
  const sequenceSlots = slots.filter((s) => !['reel-cover', 'final-reel', 'x-copy', 'x-media', 'tiktok-video'].includes(s.slotId));

  return {
    formatFamily: family,
    label: preview.label,
    shortLabel: SHORT_LABELS[family],
    platform: summary?.platform ?? family,
    status,
    slots,
    caption: preview.caption,
    copyText: preview.copyText,
    altCaptionA: null,
    altCaptionB: null,
    ctaCopy: null,
    whyThisCopy: null,
    slideCount: sequenceSlots.length || slots.length,
    assetCount: slots.filter((s) => !s.placeholder).length,
    complete: summary?.complete ?? status === 'COMPLETE',
  };
}

export function buildEntry001SocialPreviewModel(args: {
  entryNumber: string;
  composition: Entry001PackagePreviewComposition;
  formatSummaries: Entry001FormatWorkspaceSummary[];
  deliverables: Entry001DeliverableRecord[];
  brandTagline?: string | null;
  accountHandle?: string;
  accountDisplayName?: string;
}): SocialPackagePreviewModel {
  const {
    entryNumber,
    composition,
    formatSummaries,
    deliverables,
    brandTagline = 'Same platforms. Different story.',
    accountHandle = 'ndxbook',
    accountDisplayName = 'ndxbook',
  } = args;

  const formats = SOCIAL_PREVIEW_FORMAT_ORDER.map((family) => {
    const preview = composition.formats.find((f) => f.formatFamily === family);
    const summary = formatSummaries.find((s) => s.formatFamily === family);
    if (!preview) {
      return {
        formatFamily: family,
        label: SHORT_LABELS[family],
        shortLabel: SHORT_LABELS[family],
        platform: family,
        status: 'NOT_STARTED' as const,
        slots: [],
        caption: null,
        copyText: null,
        altCaptionA: null,
        altCaptionB: null,
        ctaCopy: null,
        whyThisCopy: null,
        slideCount: 0,
        assetCount: 0,
        complete: false,
      };
    }
    return toFormatModel(preview, summary);
  });

  const completeCount = countCompleteFormats(formats);
  const totalCount = formats.length;
  const active = getActivePackageDeliverables(deliverables);

  return {
    entryNumber,
    entryTitle: ENTRY_001_TITLE,
    entrySubject: ENTRY_001_SUBJECT,
    entrySubtitle: entry001NarrativeDescriptor(),
    brandTagline,
    packageStatusLabel: derivePackageStatusLabel(completeCount, totalCount),
    accountHandle,
    accountDisplayName,
    formats,
    completeCount,
    totalCount,
    flowSteps: buildPackageFlowSteps(formats),
    recentActivity: buildRecentActivityFromDeliverables(
      active.map((d) => ({
        title: d.title,
        formatFamily: d.formatFamily as SocialFormatFamily,
        updatedAt: d.updatedAt,
        createdAt: d.createdAt,
        history: d.history.map((h) => ({ at: h.at, status: h.status, title: h.title })),
      })),
    ),
    previewReadiness: composition.previewReadiness,
    campaignBoardEligible: composition.campaignBoardEligibility,
  };
}

export function buildEntry001SocialPreviewPaths(projectSlug: string, entryNumber = '001'): SocialPreviewPaths {
  return {
    packagePath: site00ProjectCampaignBoardEntryPath(projectSlug, entryNumber),
    campaignBoardPath: site00ProjectContentOperationsCampaignBoardPath(projectSlug),
    formatPath: (family) =>
      site00ProjectCampaignBoardEntryFormatPath(projectSlug, entryNumber, family.toLowerCase()),
    carouselSequencePath: site00ProjectCampaignBoardEntryCarouselPath(projectSlug, entryNumber),
    storySequencePath: site00ProjectCampaignBoardEntryStoryPath(projectSlug, entryNumber),
    deliverablePath: (id) => site00ProjectCampaignBoardEntryDeliverablePath(projectSlug, entryNumber, id),
  };
}
