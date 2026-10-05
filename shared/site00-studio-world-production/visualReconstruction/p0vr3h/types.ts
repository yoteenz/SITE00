/**
 * P0.VR.3H — Missing route completion types.
 */

import type { ExperiencePageFamily } from '../p0vr3g/types.js';
import { P0_VR_3H_LINEAGE } from './constants.js';

export { P0_VR_3H_LINEAGE };

export type RepoOwnedProjectId = 'SITE00' | 'NDXBOOK';

export type ExternalRepoOwnedProjectId = 'FRONTAL_SLAYER' | 'ALL_IN_ONE_ENTERPRISES' | 'STUDIO_WORLD_FSBW';

export type MissingPageSourceRepo = 'SITE00_REPO' | 'EXTERNAL_REPO_OWNED';

export type MissingPageCompletionMode =
  | 'FAMILY_DERIVED_SIMPLE'
  | 'STRUCTURAL_COMPLEX'
  | 'CREATIVE_COMPLEX'
  | 'FUNCTIONAL_COMPLEX'
  | 'UNKNOWN_REVIEW_REQUIRED'
  | 'BLOCKED_EXISTING_IMPLEMENTATION'
  | 'EXTERNAL_REPO_OWNED';

export type ComposerAuthorType = 'COMPOSER' | 'FOUNDER' | 'MIXED';

export type PageReviewStatus = 'UNREVIEWED' | 'IN_REVIEW' | 'APPROVED_FOR_RELEASE' | 'REJECTED';

export type PagePublishStatus = 'PREVIEW_ONLY' | 'APPROVED_FOR_RELEASE' | 'LIVE';

export type ContentProvenanceClass =
  | 'SOURCE_CANON'
  | 'SOURCE_EXISTING_ROUTE'
  | 'SOURCE_DATABASE'
  | 'SOURCE_PROJECT_DOC'
  | 'COMPOSER_INFERRED'
  | 'CONTENT_REQUIRED';

export type ReviewDimension = 'VISUAL' | 'CONTENT' | 'FUNCTION';

export type MissingPagePlanEntry = {
  entryId: string;
  projectId: RepoOwnedProjectId;
  sourceRepo: MissingPageSourceRepo;
  screenId: string;
  displayName: string;
  route: string;
  family: ExperiencePageFamily | 'OTHER';
  completionMode: MissingPageCompletionMode;
  authorType: ComposerAuthorType;
  createdBySprint: typeof P0_VR_3H_LINEAGE;
  reviewStatus: PageReviewStatus;
  publishStatus: PagePublishStatus;
  contentProvenance: ContentProvenanceClass[];
  implementationStatus: 'MISSING' | 'IMPLEMENTED_DRAFT' | 'BLOCKED' | 'SKIPPED';
  reviewDimensions: ReviewDimension[];
  creativeDirectionRequired: boolean;
  functionalReviewRequired: boolean;
  existingImplementationPath?: string;
  blockedReason?: string;
  sourceEvidence: string[];
};

export type RepoScopedMissingPageCompletionPlan = {
  planId: string;
  lineage: typeof P0_VR_3H_LINEAGE;
  compiledAt: string;
  sourceRepo: 'SITE00_REPO';
  ownedProjects: RepoOwnedProjectId[];
  entries: MissingPagePlanEntry[];
  externalSkipped: { projectId: ExternalRepoOwnedProjectId; reason: string }[];
  summary: {
    site00: ProjectCompletionSummary;
    ndxbook: ProjectCompletionSummary;
  };
};

export type ProjectCompletionSummary = {
  missing: number;
  simple: number;
  complex: number;
  built: number;
  shellOnly: number;
  blocked: number;
  reviewSets: string[];
};

export type PageCreationReceipt = {
  receiptId: string;
  pageId: string;
  projectId: RepoOwnedProjectId;
  route: string;
  family: ExperiencePageFamily | 'OTHER';
  completionMode: MissingPageCompletionMode;
  authorType: ComposerAuthorType;
  createdBySprint: typeof P0_VR_3H_LINEAGE;
  reviewStatus: PageReviewStatus;
  publishStatus: PagePublishStatus;
  contentProvenance: ContentProvenanceClass[];
  componentPath: string;
  previewOnly: boolean;
  productionNavBlocked: boolean;
  createdAt: string;
};

export type PageReviewReceipt = {
  receiptId: string;
  pageId: string;
  projectId: RepoOwnedProjectId;
  route: string;
  reviewStatus: PageReviewStatus;
  dimensionsReviewed: ReviewDimension[];
  decidedAt: string;
  decidedBy: 'FOUNDER' | 'COMPOSER';
  notes?: string;
};

export type PageReviewSetReceipt = {
  receiptId: string;
  setId: string;
  setLabel: string;
  projectId: RepoOwnedProjectId;
  pageIds: string[];
  batchApprovalAllowed: boolean;
  createdAt: string;
};

export type ComposerReviewQueueEntry = {
  queueId: string;
  pageId: string;
  projectId: RepoOwnedProjectId;
  route: string;
  family: ExperiencePageFamily | 'OTHER';
  completionMode: MissingPageCompletionMode;
  authorType: ComposerAuthorType;
  contentProvenance: ContentProvenanceClass[];
  reviewStatus: PageReviewStatus;
  reviewDimensions: ReviewDimension[];
  screenshots: {
    mobile: string | null;
    tablet: string | null;
    desktop: string | null;
  };
  snapshotLabel: 'CURRENT · COMPOSER DRAFT';
  readyForApproval: boolean;
};

export type ComposerReviewSet = {
  setId: string;
  label: string;
  projectId: RepoOwnedProjectId;
  familyConfirmed: boolean;
  pageIds: string[];
  batchApprovalAllowed: boolean;
};

export type DraftRouteGuardResult = {
  route: string;
  previewOnly: true;
  productionNavBlocked: boolean;
  publishStatus: PagePublishStatus;
  publiclyNavigable: false;
};
