/**
 * P0.VR.CONVERGE.1 — Twin build with forensic warnings (exit pre-build loop).
 */

export const RECONSTRUCTION_EXECUTION_MODES = [
  'HIGH_CONFIDENCE',
  'MEASURED',
  'VISUAL_INFERENCE',
  'CONSERVATIVE_ADAPTATION',
  'FOUNDER_REVIEW_REQUIRED',
] as const;
export type ReconstructionExecutionMode = (typeof RECONSTRUCTION_EXECUTION_MODES)[number];

export const TWIN_BUILD_READINESS_STATUSES = ['READY', 'READY_WITH_WARNINGS', 'BLOCKED'] as const;
export type TwinBuildReadinessStatus = (typeof TWIN_BUILD_READINESS_STATUSES)[number];

export type RegionExecutionDecision = {
  regionId: string;
  regionName: string;
  executionMode: ReconstructionExecutionMode;
  evidenceUsed: string[];
  authorityVersionId: string | null;
  currentComponentTarget: string | null;
  warnings: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'INCLUDED' | 'SKIPPED' | 'WARNING';
};

export type TwinBuildReadiness = {
  authorityReady: boolean;
  captureReady: boolean;
  routeReady: boolean;
  viewportReady: boolean;
  coverageReady: boolean;
  functionContractReady: boolean;
  twinIsolationReady: boolean;
  forensicDepth: { sufficient: number; total: number; pct: number };
  warnings: string[];
  hardBlockers: string[];
  status: TwinBuildReadinessStatus;
};

export type TwinBuildReceipt = {
  sessionId: string;
  sourceLiveVersionId: string;
  authorityVersionId: string;
  captureId: string;
  regionDecisions: RegionExecutionDecision[];
  warnings: string[];
  twinRoute: string;
  twinVersionId: string | null;
  startedAt: string;
  completedAt: string | null;
  status: 'COMPLETE' | 'FAILED' | 'IN_PROGRESS';
};

export type FounderVisualCorrection = {
  correctionId: string;
  sessionId: string;
  regionId: string | null;
  instruction: string;
  createdAt: string;
  status: 'PENDING' | 'APPLIED' | 'DISCARDED';
};

export type VisualRefinementSession = {
  sessionId: string;
  twinVersionId: string | null;
  authorityVersionId: string;
  reviewItems: string[];
  founderNotes: FounderVisualCorrection[];
  status: 'OPEN' | 'REFINING' | 'CLOSED';
};
