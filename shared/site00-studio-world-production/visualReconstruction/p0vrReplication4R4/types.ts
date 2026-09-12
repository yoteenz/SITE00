import type { P0_VR_REPLICATION_4R4_BUILD } from './constants.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroMeasurementSource } from '../p0vrReplication4R3R1/types.js';

export type HeroConvergenceBaseline = {
  twinId: string;
  authorityId: string;
  captureTime: string;
  measurementSource: HeroMeasurementSource;
  objectCount: number;
  passCount: number;
  outlierCount: number;
  outliers: HeroObjectId[];
  maxPositionError: number;
  maxSizeError: number;
  meanPositionError: number;
  meanSizeError: number;
};

export type HeroOutlierRankEntry = {
  objectId: HeroObjectId;
  visualSeverity: number;
  positionError: number;
  sizeError: number;
  impactScore: number;
  delta: HeroGeometryDeltaFull;
};

export type HeroOutlierCorrection = {
  objectId: HeroObjectId;
  beforeDelta: HeroGeometryDeltaFull;
  rootCause: string;
  sourceFile: string;
  cssPropertyChanged: string;
  oldValue: string;
  newValue: string;
  expectedEffect: string;
  afterDelta: HeroGeometryDeltaFull | null;
  status: 'APPLIED' | 'SKIPPED_PASSING';
};

export type HeroConvergencePassResult = {
  passIndex: number;
  focus: 'PARENT_COLUMNS' | 'OVERLAYS_UTILITY' | 'H12_MICRO';
  outlierIds: HeroObjectId[];
  corrections: HeroOutlierCorrection[];
};

export type HeroConvergenceReceipt = {
  baselineOutliers: HeroObjectId[];
  pass1Outliers: HeroObjectId[];
  pass2Outliers: HeroObjectId[];
  pass3Outliers: HeroObjectId[];
  finalOutliers: HeroObjectId[];
  baselineMaxError: number;
  finalMaxError: number;
  baselineMeanError: number;
  finalMeanError: number;
  objectsChanged: HeroObjectId[];
  objectsUntouched: HeroObjectId[];
  status: 'GEOMETRY_CONVERGED' | 'PARTIAL' | 'FAIL';
};

export type HeroOutlierConvergenceReport = {
  buildRef: typeof P0_VR_REPLICATION_4R4_BUILD;
  sessionId: string;
  baseline: HeroConvergenceBaseline;
  ranking: HeroOutlierRankEntry[];
  passes: HeroConvergencePassResult[];
  receipt: HeroConvergenceReceipt;
  cssPatch: Record<string, string>;
  measurementSource: HeroMeasurementSource;
  status: 'GEOMETRY_CONVERGED' | 'PARTIAL' | 'FAIL' | 'PENDING_LIVE_CONVERGENCE';
};
