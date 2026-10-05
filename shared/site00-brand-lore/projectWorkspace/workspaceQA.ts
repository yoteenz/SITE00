/**
 * Project Workspace QA dimensions.
 */

export const PROJECT_WORKSPACE_QA_DIMENSIONS = [
  'GENERIC_PROJECT_CARD_GRID',
  'EQUAL_WEIGHT_MODULES',
  'DASHBOARD_KPI_BEHAVIOR',
  'STACKED_DESKTOP_MOBILE',
  'CLIENT_EXPRESSION_TOO_WEAK',
  'CLIENT_EXPRESSION_OVERRIDES_HOST',
  'HOST_EXPRESSION_OVERRIDES_CLIENT',
  'ARTWORK_AS_DECORATION_ONLY',
  'ARTWORK_TOO_SMALL_TO_FUNCTION',
  'WORKBENCH_LITERALIZATION',
  'DOSSIER_LITERALIZATION',
  'WORKSPACE_RECOGNITION_LOSS',
] as const;

export type ProjectWorkspaceQAEvaluation = {
  evaluatedAt: string;
  overallResult: 'PASS' | 'WARN' | 'FAIL' | 'NOT_EVALUATED';
  dimensions: Array<{
    dimension: (typeof PROJECT_WORKSPACE_QA_DIMENSIONS)[number];
    result: 'PASS' | 'WARN' | 'FAIL' | 'NOT_EVALUATED';
    notes: string[];
  }>;
};

export function evaluateProjectWorkspaceQA(params: {
  renderedEvidence?: Record<string, unknown> | null;
}): ProjectWorkspaceQAEvaluation {
  if (!params.renderedEvidence) {
    return {
      evaluatedAt: new Date().toISOString(),
      overallResult: 'NOT_EVALUATED',
      dimensions: PROJECT_WORKSPACE_QA_DIMENSIONS.map((dimension) => ({
        dimension,
        result: 'NOT_EVALUATED',
        notes: ['No rendered evidence — never fabricate PASS/FAIL'],
      })),
    };
  }
  return {
    evaluatedAt: new Date().toISOString(),
    overallResult: 'NOT_EVALUATED',
    dimensions: PROJECT_WORKSPACE_QA_DIMENSIONS.map((dimension) => ({
      dimension,
      result: 'NOT_EVALUATED',
      notes: ['Scaffold ready'],
    })),
  };
}

export function stackedDesktopBlocked(bibleMobileNotStacked: boolean): boolean {
  return bibleMobileNotStacked;
}
