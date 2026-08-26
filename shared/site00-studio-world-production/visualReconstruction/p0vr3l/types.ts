/**
 * P0.VR.3L-SITE00 — Missing-target family derivation + shell propagation types.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  P0_VR_3L_LINEAGE,
} from './constants.js';

export { P0_VR_3L_LINEAGE, FAMILY_SOURCE_SNAPSHOT_LABEL, COMPOSER_DERIVED_DRAFT_LABEL };

export type RepoOwnedProjectId = 'SITE00' | 'NDXBOOK';

export type MissingDesignTargetType =
  | 'UNIQUE_EXPERIENCE'
  | 'FAMILY_DERIVED_PAGE'
  | 'MATERIAL_SCREEN'
  | 'TAB_STATE'
  | 'VISUAL_STATE'
  | 'CONTENT_INSTANCE'
  | 'DATA_INSTANCE'
  | 'ASSET_VARIANT'
  | 'UNKNOWN_REVIEW_REQUIRED';

export type MissingTargetQueueStatus =
  | 'READY_FOR_DERIVATION'
  | 'NEEDS_SOURCE_SIBLING'
  | 'NEEDS_SOURCE_CAPTURE'
  | 'NEEDS_CREATIVE_DIRECTION'
  | 'NEEDS_FUNCTIONAL_DIRECTION'
  | 'STATE_INSTANCE_ONLY'
  | 'TRUE_MISSING_ROUTE'
  | 'DERIVED_DRAFT'
  | 'EXISTING_UNREGISTERED';

export type ShellPropagationScope = 'TARGET_ONLY' | 'DESIGN_FAMILY' | 'SHARED_SHELL_GLOBAL';

export type SharedShellType =
  | 'PUBLIC_WEBSITE_SHELL'
  | 'AUTH_SHELL'
  | 'WORKSPACE_SHELL'
  | 'LAB_SHELL'
  | 'INFORMATION_SHELL'
  | 'ACCOUNT_SHELL'
  | 'PROJECT_INTERNAL_SHELL';

export type ComposerAuthorType = 'COMPOSER' | 'FOUNDER' | 'MIXED';

export type PageReviewStatus = 'UNREVIEWED' | 'IN_REVIEW' | 'APPROVED_FOR_RELEASE' | 'REJECTED';

export type PagePublishStatus = 'PREVIEW_ONLY' | 'APPROVED_FOR_RELEASE' | 'LIVE';

export type MissingDesignTargetRecord = {
  targetId: string;
  projectId: RepoOwnedProjectId;
  targetType: MissingDesignTargetType;
  displayName: string;
  experiencePageId: string | null;
  materialScreenId: string | null;
  visualStateId: string | null;
  route: string | null;
  queueStatus: MissingTargetQueueStatus;
  sourceEvidence: string[];
};

export type FamilyDerivedMissingTargetRecord = {
  targetId: string;
  projectId: RepoOwnedProjectId;
  targetType: MissingDesignTargetType;
  experiencePageId: string | null;
  materialScreenId: string | null;
  visualStateId: string | null;
  sourceFamilyId: string;
  sourceSiblingId: string;
  sourceRoute: string;
  sourceSnapshotId: string | null;
  sourceComponents: string[];
  sharedShellId: string;
  preservedProperties: string[];
  allowedDifferences: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  createdBy: ComposerAuthorType;
  reviewStatus: PageReviewStatus;
  publishStatus: PagePublishStatus;
  createdBySprint: typeof P0_VR_3L_LINEAGE;
  derivedAt: string;
  authorType: ComposerAuthorType;
};

export type SharedShellRecord = {
  shellId: string;
  projectId: RepoOwnedProjectId;
  shellType: SharedShellType;
  componentPaths: string[];
  consumerFamilyIds: string[];
  consumerPageIds: string[];
  materialScreenIds?: string[];
  responsiveAuthority: string;
  version: number;
};

export type SharedShellDependencyGraph = {
  projectId: RepoOwnedProjectId;
  shells: SharedShellRecord[];
  edges: Array<{
    shellId: string;
    familyId?: string;
    pageId?: string;
    materialScreenId?: string;
    route?: string;
  }>;
};

export type ShellPropagationImpact = {
  scope: ShellPropagationScope;
  projectId: RepoOwnedProjectId;
  shellId: string;
  familyId: string | null;
  pages: string[];
  families: string[];
  materialScreens: string[];
  states: string[];
  routes: string[];
  viewports: DesignViewportClass[];
  references: string[];
  snapshots: string[];
  exceptions: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  blastRadiusSummary: string;
};

export type ShellPropagationExceptionRecord = {
  exceptionId: string;
  shellId: string;
  consumerId: string;
  reason: string;
  createdAt: string;
  persists: true;
};

export type FamilyShellChangeRecord = {
  changeId: string;
  shellId: string;
  familyId: string;
  projectId: RepoOwnedProjectId;
  previousVersion: number;
  nextVersion: number;
  scope: ShellPropagationScope;
  createdAt: string;
  lineage: typeof P0_VR_3L_LINEAGE;
};

export type ShellPropagationReceipt = {
  receiptId: string;
  scope: ShellPropagationScope;
  projectId: RepoOwnedProjectId;
  shellId: string;
  familyId: string | null;
  targetId: string | null;
  affectedPages: string[];
  exceptions: string[];
  confirmedByFounder: boolean;
  rolledBack: boolean;
  createdAt: string;
  lineage: typeof P0_VR_3L_LINEAGE;
};

export type ShellPropagationRecapturePlan = {
  planId: string;
  projectId: RepoOwnedProjectId;
  consumerIds: string[];
  viewports: DesignViewportClass[];
  fullProjectRecapture: false;
};

export type FamilyDerivationReceipt = {
  receiptId: string;
  targetId: string;
  projectId: RepoOwnedProjectId;
  sourceSiblingId: string;
  sharedShellId: string;
  sourceSnapshotLabel: typeof FAMILY_SOURCE_SNAPSHOT_LABEL;
  targetSnapshotLabel: typeof COMPOSER_DERIVED_DRAFT_LABEL;
  createdAt: string;
  lineage: typeof P0_VR_3L_LINEAGE;
};

export type FamilyFidelityQaResult = {
  targetId: string;
  passed: boolean;
  shellDrift: boolean;
  geometryDrift: boolean;
  responsiveDrift: boolean;
  referenceConflict: boolean;
  issues: string[];
};

export type DuplicatedFamilyImplementationSignal = {
  familyId: string;
  projectId: RepoOwnedProjectId;
  duplicatedPaths: string[];
  sharedShellCandidate: string | null;
  recommendation: 'PROPAGATE_PATCH' | 'REFACTOR_TO_SHARED_SHELL';
};

export type DeriveMissingTargetResult = {
  record: FamilyDerivedMissingTargetRecord;
  receipt: FamilyDerivationReceipt;
  queueStatus: MissingTargetQueueStatus;
  newRouteCreated: boolean;
  registrationOnly: boolean;
};

export type SiblingCaptureDecision = {
  captureRequired: boolean;
  reason: 'SNAPSHOT_MISSING' | 'SNAPSHOT_STALE' | 'VISUAL_CONFIRMATION' | 'SIBLING_AMBIGUITY' | 'REUSE_EXISTING';
  existingSnapshotId: string | null;
};
