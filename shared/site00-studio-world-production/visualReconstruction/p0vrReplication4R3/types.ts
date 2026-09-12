import type { P0_VR_REPLICATION_4R3_BUILD } from './constants.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroGeometryDelta } from '../p0vrReplication4R2/types.js';

export type HeroAuthorityGeometryFull = {
  objectId: HeroObjectId;
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  targetLeft: number;
  targetRight: number;
  targetTop: number;
  targetBottom: number;
  targetCenterX: number;
  targetCenterY: number;
  targetBaseline: number | null;
  targetLineCount: number;
  targetParent: string;
  targetZ: number;
};

export type HeroRenderedGeometryFull = {
  objectId: HeroObjectId;
  actualX: number;
  actualY: number;
  actualWidth: number;
  actualHeight: number;
  actualLeft: number;
  actualRight: number;
  actualTop: number;
  actualBottom: number;
  actualCenterX: number;
  actualCenterY: number;
  actualBaseline: number | null;
  actualLineCount: number | null;
  actualZ: number | null;
  actualParent: string;
  actualTextWidth: number | null;
  actualLineHeight: number | null;
};

export type HeroGeometryDeltaFull = {
  objectId: HeroObjectId;
  deltaX: number;
  deltaY: number;
  deltaWidth: number;
  deltaHeight: number;
  leftError: number;
  rightError: number;
  topError: number;
  bottomError: number;
  centerXError: number;
  centerYError: number;
  baselineError: number;
  lineCountMatch: boolean;
  severity: 'GREEN' | 'YELLOW' | 'RED';
  status: 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE';
};

export type HeroMeasuredCorrectionPass = {
  passIndex: number;
  focus: 'ROOT_COLUMNS' | 'TEXT_CTA_NDX_UTILITY' | 'H12_MICRO_LINES';
  maxPositionError: number;
  maxSizeError: number;
  outlierCount: number;
  notes: string;
};

export type HeroGeometryReceipt = {
  objectCount: number;
  measuredCount: number;
  withinToleranceCount: number;
  maxPositionError: number;
  maxSizeError: number;
  meanPositionError: number;
  meanSizeError: number;
  remainingOutliers: HeroObjectId[];
  passes: number;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
};

export type HeroVisualDuplicateAudit = {
  passed: boolean;
  h07DomDuplicate: boolean;
  bakedTextInH06: boolean;
  failureCode: 'H07_DUPLICATE_VISUAL_REPRESENTATION' | null;
  notes: string;
};

export type HeroGeometryConvergenceReport = {
  buildRef: typeof P0_VR_REPLICATION_4R3_BUILD;
  sessionId: string;
  heroAuthorityRootBounds: { x: number; y: number; width: number; height: number };
  authorityGeometry: HeroAuthorityGeometryFull[];
  renderedGeometry: HeroRenderedGeometryFull[];
  geometryDeltas: HeroGeometryDeltaFull[];
  geometryReceipt: HeroGeometryReceipt;
  measuredPasses: HeroMeasuredCorrectionPass[];
  h12BindingGuard: import('./heroAssetBindingGuard.js').HeroAssetBindingGuardResult;
  visualDuplicateAudit: HeroVisualDuplicateAudit;
  /** Legacy panel compatibility */
  legacyGeometryDeltas: HeroGeometryDelta[];
  status: 'PASS' | 'PARTIAL' | 'FAIL';
};
