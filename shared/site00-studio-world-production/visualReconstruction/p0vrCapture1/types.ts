/**
 * P0.VR.CAPTURE.1 — Page-scoped capture + creative upgrade types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { PageVisualDiagnosis } from './pageVisualDiagnosis.js';
import type { ReconstructionPlan } from './reconstructionPlan.js';

export type { PageVisualDiagnosis } from './pageVisualDiagnosis.js';
export type { ReconstructionPlan } from './reconstructionPlan.js';

export const PAGE_VIEWPORT_CAPTURE_STATUSES = [
  'NO_LIVE_CAPTURE',
  'CAPTURE_READY',
  'CAPTURING',
  'CAPTURE_FAILED',
  'CAPTURE_OUTDATED',
] as const;

export type PageViewportCaptureStatus = (typeof PAGE_VIEWPORT_CAPTURE_STATUSES)[number];

export const CAPTURE_SOURCES = [
  'FOUNDER_CAPTURE_NOW',
  'AUTO_POST_BUILD',
  'BACKGROUND_AUDIT',
  'OTHER',
] as const;

export type CaptureSource = (typeof CAPTURE_SOURCES)[number];

export type PageViewportCapture = {
  pageId: string;
  projectId: string;
  viewport: DesignViewportClass;
  captureId: string;
  route: string;
  resolvedRuntimePath: string;
  width: number;
  height: number;
  capturedAt: string;
  imageRef: string | null;
  status: PageViewportCaptureStatus;
  capturedBuildVersion: string;
  captureSource: CaptureSource;
  screenId?: string;
  artifactProof?: import('../p0vrCapture1R3a/captureArtifactProof.js').CaptureArtifactProof | null;
  designAuthorityVersionId?: string | null;
};

export type CaptureCurrentPageInput = {
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  resolvedRuntimePath?: string;
  viewport: DesignViewportClass;
  currentPageContext?: Record<string, unknown>;
  captureSource?: CaptureSource;
  capturedBuildVersion?: string;
};

export type CaptureCurrentPageResult = {
  captureId: string;
  screenshot: string | null;
  imageRef?: string | null;
  capturedAt: string;
  viewport: DesignViewportClass;
  dimensions: { width: number; height: number };
  route: string;
  pageId: string;
  status: 'CAPTURE_READY' | 'CAPTURE_FAILED';
  jobId: string;
  singlePageJob: true;
  projectRunCreated: false;
  error?: string;
  completion?: import('./captureReceipts.js').CaptureCompletionReceipt;
};

export type CaptureProgressStep =
  | 'OPENING_PAGE'
  | 'RENDERING_VIEWPORT'
  | 'TAKING_SCREENSHOT'
  | 'SAVING_CAPTURE';

export const CAPTURE_NOW_PROGRESS_STEPS: CaptureProgressStep[] = [
  'OPENING_PAGE',
  'RENDERING_VIEWPORT',
  'TAKING_SCREENSHOT',
  'SAVING_CAPTURE',
];

export type PageCreativeUpgradeStatus =
  | 'COMPARE_READY'
  | 'AWAITING_CAPTURE'
  | 'DIAGNOSING'
  | 'DIRECTION_READY'
  | 'DIRECTION_APPROVED'
  | 'APPROVED'
  | 'BUILDING'
  | 'BUILD_COMPLETE'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'REVISION_REQUIRED'
  | 'COMPLETE';

export type PageCreativeUpgradeSession = {
  sessionId: string;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  captureId: string;
  parentAuthorityId: string | null;
  childArchetype: string | null;
  isRoot: boolean;
  currentDiagnosis: PageCreativeDiagnosis | null;
  visualDiagnosis: PageVisualDiagnosis | null;
  reconstructionPlan: ReconstructionPlan | null;
  creativeDirectionPlan: PageCreativeDirectionPlan | null;
  status: PageCreativeUpgradeStatus;
  route: string;
  pagePurpose: string;
  founderNote: string | null;
  approvedAt: string | null;
  afterCaptureId: string | null;
  designAuthorityVersionId?: string | null;
  designAuthorityAssetRef?: string | null;
  captureAssetRef?: string | null;
  beforeImageRenderable?: boolean;
  referenceImageRenderable?: boolean;
};

export type PageCreativeDiagnosisCode =
  | 'GENERIC_SAAS_DRIFT'
  | 'TEXT_DENSITY'
  | 'ADMIN_PANEL_DRIFT'
  | 'VISUAL_HIERARCHY_WEAKNESS'
  | 'PARENT_GRAMMAR_DRIFT'
  | 'CTA_DRIFT'
  | 'SPACING_DRIFT'
  | 'MOBILE_DRIFT'
  | 'DESKTOP_DRIFT'
  | 'CONTENT_OVERLOAD'
  | 'FUNCTION_VISUAL_MISMATCH';

export type PageCreativeDiagnosis = {
  codes: PageCreativeDiagnosisCode[];
  summary: string;
  detectedAt: string;
};

export type PageCreativeDirectionPlan = {
  pagePurpose: string;
  experienceGoal: string;
  parentAuthority: string;
  visualDirection: string;
  compositionDirection: string;
  hierarchyDirection: string;
  interactionDirection: string;
  contentDensityDirection: string;
  visualFirstOpportunities: string[];
  primaryAction: string;
  detailsToHide: string[];
  legacyComponentsToReplace: string[];
  preserveFunction: string[];
  specializedChildRules: string[];
};

export type PageUpgradeNextAction =
  | 'CAPTURE_THIS_PAGE'
  | 'REVIEW_CREATIVE_DIRECTION'
  | 'APPROVE_PAGE'
  | 'VERIFY_BUILD'
  | 'MOVE_TO_NEXT_PAGE'
  | 'RECAPTURE'
  | 'FIX_CAPTURE_SERVICE';

export type PageUpgradeNextActionReceipt = {
  action: PageUpgradeNextAction;
  label: string;
  reason: string;
};
