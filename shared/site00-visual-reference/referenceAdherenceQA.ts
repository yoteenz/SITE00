/**
 * Reference adherence QA dimensions — never fabricate PASS when vision unavailable.
 */

export type ReferenceAdherenceDimension =
  | 'REFERENCE_ROLE_ADHERENCE'
  | 'HOST_VISUAL_FIDELITY'
  | 'HOST_COLOR_FIDELITY'
  | 'HOST_TYPOGRAPHY_FIDELITY'
  | 'HOST_SPATIAL_FIDELITY'
  | 'HOST_NAVIGATION_FIDELITY'
  | 'STRUCTURAL_REFERENCE_FIDELITY'
  | 'NEGATIVE_REFERENCE_AVOIDANCE'
  | 'CLIENT_REFERENCE_FIDELITY'
  | 'REFERENCE_CONTAMINATION';

export type ReferenceAdherenceResult = {
  overallResult: 'NOT_EVALUATED' | 'PASS' | 'FAIL';
  dimensions: Array<{
    dimension: ReferenceAdherenceDimension;
    result: 'NOT_EVALUATED' | 'PASS' | 'FAIL';
    notes: string | null;
  }>;
};

export const REFERENCE_ADHERENCE_DIMENSIONS: ReferenceAdherenceDimension[] = [
  'REFERENCE_ROLE_ADHERENCE',
  'HOST_VISUAL_FIDELITY',
  'HOST_COLOR_FIDELITY',
  'HOST_TYPOGRAPHY_FIDELITY',
  'HOST_SPATIAL_FIDELITY',
  'HOST_NAVIGATION_FIDELITY',
  'STRUCTURAL_REFERENCE_FIDELITY',
  'NEGATIVE_REFERENCE_AVOIDANCE',
  'CLIENT_REFERENCE_FIDELITY',
  'REFERENCE_CONTAMINATION',
];

export function evaluateReferenceAdherence(params: {
  visionEvaluationAvailable: boolean;
}): ReferenceAdherenceResult {
  if (!params.visionEvaluationAvailable) {
    return {
      overallResult: 'NOT_EVALUATED',
      dimensions: REFERENCE_ADHERENCE_DIMENSIONS.map((dimension) => ({
        dimension,
        result: 'NOT_EVALUATED',
        notes: 'Vision scoring unavailable — never fabricate PASS',
      })),
    };
  }
  return {
    overallResult: 'NOT_EVALUATED',
    dimensions: REFERENCE_ADHERENCE_DIMENSIONS.map((dimension) => ({
      dimension,
      result: 'NOT_EVALUATED',
      notes: null,
    })),
  };
}

export function classifySciFiWorkbenchProof(): {
  structuralAuthority: true;
  styleAuthority: false;
  negativeStyle: true;
  approvalStatus: 'STRUCTURAL_REFERENCE';
} {
  return {
    structuralAuthority: true,
    styleAuthority: false,
    negativeStyle: true,
    approvalStatus: 'STRUCTURAL_REFERENCE',
  };
}
