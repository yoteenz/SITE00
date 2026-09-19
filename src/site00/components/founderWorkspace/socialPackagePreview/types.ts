/**
 * B5.8 — Generic social package preview model (entry-agnostic).
 */

export type SocialFormatFamily = 'REEL' | 'CAROUSEL' | 'STORY' | 'TIKTOK' | 'X' | 'HIGHLIGHT';

export type SocialPreviewStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AWAITING_REVIEW'
  | 'COMPLETE'
  | 'COPY_PENDING'
  | 'VIDEO_PENDING'
  | 'COVER_ONLY'
  | 'READY';

export type SocialPreviewSlot = {
  slotId: string;
  label: string;
  sequenceNumber: number | null;
  filePath: string | null;
  mediaType: 'IMAGE' | 'VIDEO' | 'NONE';
  title: string;
  placeholder: boolean;
  placeholderLabel: string | null;
  deliverableId: string | null;
  assetRole: string | null;
  assetType: string | null;
  approvalState: string | null;
  dimensions: { width: number; height: number } | null;
  source: string | null;
  version: string | null;
  notes: string | null;
};

export type SocialFormatPreviewModel = {
  formatFamily: SocialFormatFamily;
  label: string;
  shortLabel: string;
  platform: string;
  status: SocialPreviewStatus;
  slots: SocialPreviewSlot[];
  caption: string | null;
  copyText: string | null;
  altCaptionA: string | null;
  altCaptionB: string | null;
  ctaCopy: string | null;
  whyThisCopy: string | null;
  slideCount: number;
  assetCount: number;
  complete: boolean;
};

export type SocialPackageFlowStep = {
  label: string;
  formatFamily: SocialFormatFamily;
  status: SocialPreviewStatus;
};

export type SocialPackageActivityEvent = {
  at: string;
  label: string;
  formatFamily: SocialFormatFamily | null;
};

export type SocialPackagePreviewModel = {
  entryNumber: string;
  entryTitle: string;
  entrySubject: string;
  entrySubtitle: string;
  brandTagline: string | null;
  packageStatusLabel: string;
  accountHandle: string;
  accountDisplayName: string;
  formats: SocialFormatPreviewModel[];
  completeCount: number;
  totalCount: number;
  flowSteps: SocialPackageFlowStep[];
  recentActivity: SocialPackageActivityEvent[];
  previewReadiness: string;
  campaignBoardEligible: boolean;
};

export type SocialPreviewPaths = {
  packagePath: string;
  campaignBoardPath: string;
  formatPath: (family: SocialFormatFamily) => string;
  carouselSequencePath: string;
  storySequencePath: string;
  deliverablePath: (deliverableId: string) => string;
};

export const SOCIAL_PREVIEW_FORMAT_ORDER: SocialFormatFamily[] = [
  'REEL',
  'CAROUSEL',
  'STORY',
  'TIKTOK',
  'X',
  'HIGHLIGHT',
];
