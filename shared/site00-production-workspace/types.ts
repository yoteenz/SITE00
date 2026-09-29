/**
 * P0.SITE00-PRODUCTION-WORKSPACE-RELOCATION-AND-ADMIN-BOUNDARY1
 * Canonical internal production workspace identity (not client-facing).
 */

export type ProductionWorkspaceType = 'DESIGN' | 'EXPERIENCE' | 'EXPRESSION';

export type ProductionSubWorkspaceId = string;

export type ProductionWorkspaceContextState = {
  projectSlug: string;
  brandLabel: string | null;
  projectType: string | null;
  activeWorkspace: ProductionWorkspaceType;
  campaignId: string | null;
  entryId: string | null;
  entryLabel: string | null;
};

export type ProjectProductionPillarSummary = {
  designStatus: string;
  experienceStatus: string;
  expressionStatus: string;
  designReviewRequired: boolean;
  experienceReviewRequired: boolean;
  expressionReviewRequired: boolean;
  latestDesignOutput: string | null;
  latestExperienceOutput: string | null;
  latestExpressionOutput: string | null;
};

export type ProductionWorkspaceRequestKind =
  | 'DESIGN_REVISION'
  | 'EXPERIENCE_WORLD_APPROVAL'
  | 'EXPRESSION_NEW_CHARACTER'
  | 'EXPRESSION_LOOK_APPROVAL'
  | 'EXPRESSION_SET_CHANGE';

export type ProductionWorkspaceRequest = {
  id: string;
  projectSlug: string;
  kind: ProductionWorkspaceRequestKind;
  targetWorkspace: ProductionWorkspaceType;
  targetSubWorkspace: ProductionSubWorkspaceId | null;
  createdAt: string;
  note: string | null;
};
