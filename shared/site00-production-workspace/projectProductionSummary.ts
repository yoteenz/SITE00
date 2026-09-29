import type { ProjectProductionPillarSummary } from './types.js';

/** Compact project-facing production summary (no internal workspace machinery). */
export function defaultProjectProductionPillarSummary(
  overrides: Partial<ProjectProductionPillarSummary> = {},
): ProjectProductionPillarSummary {
  return {
    designStatus: 'IN PRODUCTION',
    experienceStatus: 'NOT STARTED',
    expressionStatus: 'NOT STARTED',
    designReviewRequired: false,
    experienceReviewRequired: false,
    expressionReviewRequired: false,
    latestDesignOutput: null,
    latestExperienceOutput: null,
    latestExpressionOutput: null,
    ...overrides,
  };
}

export function createProductionWorkspaceRequest(args: {
  projectSlug: string;
  kind: import('./types.js').ProductionWorkspaceRequestKind;
  note?: string;
}): import('./types.js').ProductionWorkspaceRequest {
  const target =
    args.kind === 'UPLOAD_REFERENCES' ? 'GENERAL'
    : args.kind.startsWith('DESIGN') ? 'DESIGN'
    : args.kind.startsWith('EXPERIENCE') ? 'EXPERIENCE'
    : 'EXPRESSION';
  const sub =
    args.kind === 'EXPRESSION_NEW_CHARACTER' ? 'casting'
    : args.kind === 'EXPRESSION_NEW_CAMPAIGN' ? 'narrative'
    : args.kind === 'EXPRESSION_WARDROBE_UPDATE' ? 'wardrobe'
    : args.kind === 'EXPRESSION_LOOK_APPROVAL' ? 'wardrobe'
    : args.kind === 'EXPRESSION_SET_CHANGE' ? 'sets'
    : args.kind === 'DESIGN_REVISION' ? 'work'
    : args.kind === 'EXPERIENCE_WORLD_APPROVAL' ? 'review'
    : null;
  return {
    id: `pwr-${Date.now().toString(36)}`,
    projectSlug: args.projectSlug,
    kind: args.kind,
    targetWorkspace: target,
    targetSubWorkspace: sub,
    createdAt: new Date().toISOString(),
    note: args.note ?? null,
  };
}
