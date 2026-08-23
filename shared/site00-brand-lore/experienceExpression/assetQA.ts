/**
 * Experience Asset QA dimensions.
 */

export const EXPERIENCE_ASSET_QA_DIMENSIONS = [
  'ASSET_ROLE_FIDELITY',
  'BRAND_FIDELITY',
  'EXPERIENCE_CONCEPT_FIDELITY',
  'SURFACE_ART_DIRECTION_FIDELITY',
  'HOST_CLIENT_SEPARATION',
  'GENERIC_DECORATION_RISK',
  'STOCK_LIKE_ASSET_RISK',
  'ASSET_OVERUSE',
  'ASSET_UNDERUSE',
  'RESPONSIVE_ASSET_FIDELITY',
  'PRODUCTION_READINESS',
  'ACCESSIBILITY_RISK',
] as const;

export type ExperienceAssetQADimension = (typeof EXPERIENCE_ASSET_QA_DIMENSIONS)[number];

export type ExperienceAssetQAEvaluation = {
  evaluatedAt: string;
  overallResult: 'PASS' | 'WARN' | 'FAIL' | 'NOT_EVALUATED';
  dimensions: Array<{
    dimension: ExperienceAssetQADimension;
    result: 'PASS' | 'WARN' | 'FAIL' | 'NOT_EVALUATED';
    notes: string[];
  }>;
};

export function evaluateExperienceAssetQA(params: {
  assetEvidence?: Record<string, unknown> | null;
  requirementEvidence?: Record<string, unknown> | null;
}): ExperienceAssetQAEvaluation {
  if (!params.assetEvidence || !params.requirementEvidence) {
    return {
      evaluatedAt: new Date().toISOString(),
      overallResult: 'NOT_EVALUATED',
      dimensions: EXPERIENCE_ASSET_QA_DIMENSIONS.map((dimension) => ({
        dimension,
        result: 'NOT_EVALUATED',
        notes: ['Insufficient evidence — never fabricate PASS/FAIL'],
      })),
    };
  }

  return {
    evaluatedAt: new Date().toISOString(),
    overallResult: 'NOT_EVALUATED',
    dimensions: EXPERIENCE_ASSET_QA_DIMENSIONS.map((dimension) => ({
      dimension,
      result: 'NOT_EVALUATED',
      notes: ['Scaffold ready — autonomous scoring disabled until evidence pipeline connected'],
    })),
  };
}

export function assetQANeverFabricatesPass(evaluation: ExperienceAssetQAEvaluation): boolean {
  if (evaluation.overallResult === 'NOT_EVALUATED') return true;
  return evaluation.dimensions.every((d) => d.result !== 'FAIL' || d.notes.length > 0);
}
