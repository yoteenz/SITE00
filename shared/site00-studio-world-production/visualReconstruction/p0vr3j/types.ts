/**
 * P0.VR.3J — Composer draft backfill + NDXBOOK design-pilot reconciliation types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type {
  ComposerReviewQueueEntry,
  ComposerReviewSet,
  ReviewDimension,
  RepoOwnedProjectId,
} from '../p0vr3h/types.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../p0vr3h/constants.js';
import { P0_VR_3J_LINEAGE } from './constants.js';

export { P0_VR_3J_LINEAGE };

export type ComposerDraftReadinessStatus =
  | 'IMPLEMENTED_DRAFT'
  | 'READY_FOR_REVIEW'
  | 'NEEDS_CREATIVE_DIRECTION'
  | 'NEEDS_FUNCTIONAL_REVIEW'
  | 'SCREENSHOT_REVIEW_BLOCKED'
  | 'NEEDS_CONTENT_REVIEW'
  | 'CREATIVE_DIRECTION_REQUIRED'
  | 'FUNCTIONAL_REVIEW_REQUIRED';

export type DesignPilotGapType =
  | 'EXISTING_ROUTE_UNREGISTERED'
  | 'EXISTING_SCREEN_UNREGISTERED'
  | 'DESIGN_FAMILY_UNMAPPED'
  | 'EXPERIENCE_PAGE_UNMAPPED'
  | 'REFERENCE_BINDING_MISSING'
  | 'SNAPSHOT_BINDING_MISSING'
  | 'DUPLICATE_REGISTRATION'
  | 'STALE_REGISTRATION'
  | 'TRUE_IMPLEMENTATION_MISSING'
  | 'UNKNOWN_REVIEW_REQUIRED';

export type DesignPilotGapResolutionStatus =
  | 'UNRESOLVED'
  | 'REGISTERED'
  | 'ALREADY_REGISTERED'
  | 'REMAPPED'
  | 'DUPLICATE_PREVENTED'
  | 'TRUE_MISSING'
  | 'STALE_EXTERNAL'
  | 'READY_FOR_CAPTURE'
  | 'REFERENCE_MISSING';

export type DesignPilotRegistrationGapRecord = {
  gapId: string;
  projectId: RepoOwnedProjectId;
  expectedDesignTarget: string;
  candidateRoute: string;
  candidateScreen: string;
  candidateFamily: string;
  implementationExists: boolean;
  registrationExists: boolean;
  referenceBindingExists: boolean;
  snapshotBindingExists: boolean;
  gapType: DesignPilotGapType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionStatus: DesignPilotGapResolutionStatus;
  existingImplementationPath?: string;
  blockedReason?: string;
};

export type DesignPilotRegistrationReceipt = {
  receiptId: string;
  gapId: string;
  route: string;
  screen: string;
  experiencePage: string | null;
  family: string;
  resolution: DesignPilotGapResolutionStatus;
  existingImplementationPreserved: boolean;
  newRouteCreated: boolean;
  sourceEvidence: string[];
  resolvedAt: string;
  lineage: typeof P0_VR_3J_LINEAGE;
};

export type ComposerDraftCaptureResult = {
  targetCount: number;
  attempted: number;
  successful: number;
  failed: number;
  mobile: { attempted: number; successful: number };
  tablet: { attempted: number; successful: number };
  desktop: { attempted: number; successful: number };
  snapshots: Array<{ screenId: string; viewport: DesignViewportClass; status: string; publicUrl: string }>;
  failures: Array<{ screenId: string; viewport: DesignViewportClass; error: string }>;
  storage: typeof COMPOSER_DRAFT_SNAPSHOT_LABEL;
  label: typeof COMPOSER_DRAFT_SNAPSHOT_LABEL;
};

export type ComposerDraftScreenshotQa = {
  wrongRoute: number;
  authRedirect: number;
  blank: number;
  brokenAssets: number;
  fontFailures: number;
  viewportFailures: number;
  other: number;
};

export type AuthFunctionalValidationResult = {
  pageId: string;
  route: string;
  passed: boolean;
  checks: {
    formPresent: boolean;
    validationAttributes: boolean;
    submitControl: boolean;
    backToSignInLink: boolean;
    responsiveShell: boolean;
  };
  issues: string[];
};

export type ComplexShellReviewBrief = {
  pageId: string;
  route: string;
  status: ComposerDraftReadinessStatus;
  purpose: string;
  entryExit: string;
  knownWorkflow: string;
  familyCandidates: string[];
  requiredContentZones: string[];
  requiredStates: string[];
  dependencies: string[];
  unknownCreativeDecisions: string[];
  missingReferenceNeeds: string[];
  composerCreated: string[];
  placeholders: string[];
  inherited: string[];
  requiresFounderDirection: string[];
};

export type EnrichedComposerReviewQueueEntry = ComposerReviewQueueEntry & {
  readinessStatus: ComposerDraftReadinessStatus;
  badges: string[];
  inferredContentCount: number;
  functionalDependencies: string[];
  dimensionStatus: Record<ReviewDimension, 'PENDING' | 'PASS' | 'BLOCKED'>;
  screenshotComplete: boolean;
  contentPlaceholders: string[];
  captureFailures: string[];
};

export type EnrichedComposerReviewSet = ComposerReviewSet & {
  sharedFamily: string;
  sharedTemplate: string;
  sharedShell: string;
  individualContentDifferences: Record<string, string[]>;
  inferredContent: Record<string, number>;
  unresolvedPlaceholders: string[];
  viewportQa: { mobile: boolean; tablet: boolean; desktop: boolean };
  functionalQa: boolean;
  readyForReview: boolean;
  screenshotsComplete: boolean;
};

export type NdxbookReconciliationDashboard = {
  total: number;
  resolved: number;
  trueMissing: number;
  duplicates: number;
  unknown: number;
  readyForCapture: number;
  gaps: DesignPilotRegistrationGapRecord[];
  receipts: DesignPilotRegistrationReceipt[];
};

export type ComposerDraftBackfillCoverage = {
  expected: number;
  attempted: number;
  successful: number;
  failed: number;
  byViewport: {
    mobile: { attempted: number; successful: number };
    tablet: { attempted: number; successful: number };
    desktop: { attempted: number; successful: number };
  };
};
