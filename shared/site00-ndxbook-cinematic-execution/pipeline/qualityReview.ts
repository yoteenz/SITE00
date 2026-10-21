export type QualityDimensionGrade = 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_ASSESSABLE';

export type CreativeQualityReport = {
  reportId: string;
  jobId: string | null;
  shotId: string;
  grades: Record<string, QualityDimensionGrade>;
  defects: Array<{ timestampSec: number | null; description: string }>;
  overallAutomatedQa: 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_RUN';
  founderApprovalSeparate: true;
};

export function createEmptyQualityReport(shotId: string): CreativeQualityReport {
  const dimensions = [
    'characterIdentity',
    'faceConsistency',
    'hairConsistency',
    'wardrobeAccuracy',
    'nailAccuracy',
    'periodAccuracy',
    'propContinuity',
    'sceneContinuity',
    'cameraCompliance',
    'actionCompliance',
    'keyframeCompliance',
    'physicalPlausibility',
    'imageQuality',
    'motionQuality',
    'temporalStability',
    'audioAccuracy',
    'narrativeRelevance',
  ];
  const grades = Object.fromEntries(dimensions.map((d) => [d, 'NOT_ASSESSABLE' as QualityDimensionGrade]));
  return {
    reportId: `qa_${shotId.toLowerCase()}`,
    jobId: null,
    shotId,
    grades,
    defects: [],
    overallAutomatedQa: 'NOT_RUN',
    founderApprovalSeparate: true,
  };
}
