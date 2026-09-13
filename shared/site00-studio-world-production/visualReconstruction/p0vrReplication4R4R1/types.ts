import type { P0_VR_REPLICATION_4R4R1_BUILD } from './constants.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroMeasurementSource } from '../p0vrReplication4R3R1/types.js';

export type HeroOutlierSnapshotEntry = {
  objectId: HeroObjectId;
  deltaX: number;
  deltaY: number;
  deltaWidth: number;
  deltaHeight: number;
  leftError: number;
  rightError: number;
  topError: number;
  bottomError: number;
  severity: HeroGeometryDeltaFull['severity'];
  visibleMismatch: string;
};

export type HeroOutlierSnapshot = {
  twinId: string;
  captureTimestamp: string;
  measurementSource: HeroMeasurementSource;
  measuredCount: number;
  renderedCount: number;
  passCount: number;
  outlierCount: number;
  outliers: HeroOutlierSnapshotEntry[];
};

export type HeroOutlierPatch = {
  objectId: HeroObjectId;
  beforeDelta: HeroGeometryDeltaFull;
  rootCause: string;
  sourceFile: string;
  property: string;
  oldValue: string;
  newValue: string;
  expectedEffect: string;
  afterDelta: HeroGeometryDeltaFull | null;
  status: 'APPLIED' | 'SKIPPED' | 'REVERTED';
};

export type HeroConvergenceLimitClass =
  | 'FONT_METRIC_LIMIT'
  | 'ASSET_CROP_LIMIT'
  | 'BROWSER_RENDERING_LIMIT'
  | 'BLUEPRINT_MEASUREMENT_LIMIT'
  | 'CSS_LAYOUT_DEPENDENCY'
  | 'UNKNOWN';

export type HeroConvergencePlateau = {
  detected: boolean;
  consecutivePassesWithoutImprovement: number;
  status: 'NONE' | 'CONVERGENCE_PLATEAU';
  lastOutlierCount: number;
  lastMaxError: number;
  lastMeanError: number;
};

export type HeroLockGuard = {
  heroState: 'OPEN' | 'LOCKED';
  allowsHeroCssMutation: boolean;
  allowsHeroAssetMutation: boolean;
  allowsHeroLayoutMutation: boolean;
};

export type HeroOutlierConvergenceRunReport = {
  buildRef: typeof P0_VR_REPLICATION_4R4R1_BUILD;
  sessionId: string;
  initialSnapshot: HeroOutlierSnapshot;
  pass1Patches: HeroOutlierPatch[];
  pass1OutlierCount: number;
  pass2Patches: HeroOutlierPatch[];
  pass2OutlierCount: number;
  pass3Patches: HeroOutlierPatch[];
  finalOutlierIds: HeroObjectId[];
  finalDeltas: HeroGeometryDeltaFull[];
  plateau: HeroConvergencePlateau;
  limitClassifications: Partial<Record<HeroObjectId, HeroConvergenceLimitClass>>;
  regressions: HeroObjectId[];
  heroLockGuard: HeroLockGuard;
  cssPatch: Record<string, string>;
  status: 'GEOMETRY_CONVERGED' | 'PARTIAL' | 'CONVERGENCE_PLATEAU' | 'OUTLIER_SNAPSHOT_UNAVAILABLE' | 'FAIL';
};
