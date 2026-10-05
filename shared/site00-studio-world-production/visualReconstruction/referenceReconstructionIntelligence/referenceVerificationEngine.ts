/**
 * Layer 5 — Reference Verification Engine
 */

import type {
  DriftClassification,
  FidelityThresholdProfile,
  ReferenceReconstructionBlueprint,
  RegionVisualDelta,
  RriFailureCode,
} from './types.js';

export const EXACT_FIDELITY_THRESHOLDS: FidelityThresholdProfile = {
  profileId: 'exact-default',
  fidelityMode: 'EXACT',
  rootGeometryPx: 4,
  majorRegionGeometryPx: 8,
  typographySizePx: 1,
  lineBreakTolerance: 0,
  surfaceColorDelta: 8,
  alignmentPx: 4,
  assetPresenceRequired: true,
};

export function evaluateVerification(input: {
  blueprint: ReferenceReconstructionBlueprint;
  deltas: RegionVisualDelta[];
  visualQaExecuted: boolean;
  captureDeterministic: boolean;
  fontReady: boolean;
  layoutStable: boolean;
  dataStateMatch: boolean;
  noOpGuardPass: boolean;
}): {
  status: 'NOT_STARTED' | 'BLOCKED' | 'HIGH_MATCH' | 'VERIFIED';
  failureCodes: RriFailureCode[];
  majorCount: number;
  minorCount: number;
  microCount: number;
} {
  const failureCodes: RriFailureCode[] = [];
  const majorCount = input.deltas.filter((d) => d.severity === 'MAJOR').length;
  const minorCount = input.deltas.filter((d) => d.severity === 'MINOR').length;
  const microCount = input.deltas.filter((d) => d.severity === 'MICRO').length;

  if (input.blueprint.status !== 'READY' && input.blueprint.status !== 'IMPLEMENTING') {
    failureCodes.push('REFERENCE_BLUEPRINT_MISSING');
  }
  if (!input.blueprint.viewportCalibration.viewportMatch) {
    failureCodes.push('REFERENCE_VIEWPORT_MISMATCH');
  }
  if (!input.fontReady) failureCodes.push('REFERENCE_FONT_NOT_READY');
  if (!input.layoutStable) failureCodes.push('REFERENCE_LAYOUT_NOT_STABLE');
  if (!input.captureDeterministic) failureCodes.push('REFERENCE_CAPTURE_NONDETERMINISTIC');
  if (!input.dataStateMatch) failureCodes.push('REFERENCE_DATA_STATE_MISMATCH');
  if (!input.noOpGuardPass) failureCodes.push('REFERENCE_IMPLEMENTATION_NO_OP');

  const hardBlockers = evaluateHardVerificationBlockers({
    deltas: input.deltas,
    blueprint: input.blueprint,
    visualQaExecuted: input.visualQaExecuted,
    majorCount,
  });
  failureCodes.push(...hardBlockers);

  if (failureCodes.length > 0 || majorCount > 0) {
    return { status: 'BLOCKED', failureCodes, majorCount, minorCount, microCount };
  }
  if (minorCount > 0) {
    return { status: 'HIGH_MATCH', failureCodes: [], majorCount, minorCount, microCount };
  }
  return { status: 'VERIFIED', failureCodes: [], majorCount, minorCount, microCount };
}

export function evaluateHardVerificationBlockers(input: {
  deltas: RegionVisualDelta[];
  blueprint: ReferenceReconstructionBlueprint;
  visualQaExecuted: boolean;
  majorCount: number;
}): RriFailureCode[] {
  const codes: RriFailureCode[] = [];
  if (!input.visualQaExecuted) codes.push('REFERENCE_FALSE_PASS');
  if (input.majorCount > 0 && input.visualQaExecuted) {
    /* major drift blocks verify */
  }
  const missingAsset = input.blueprint.assetRequirements.some((a) => a.required && !a.bound);
  if (missingAsset) codes.push('REFERENCE_INTRINSIC_SIZE_DRIFT');
  return codes;
}

export function fidelityFalsePassGuard(input: {
  testsPass: boolean;
  visualQaExecuted: boolean;
  majorDriftRemaining: number;
}): { pass: boolean; failureCode: RriFailureCode | null } {
  if (input.testsPass && (!input.visualQaExecuted || input.majorDriftRemaining > 0)) {
    return { pass: false, failureCode: 'REFERENCE_FALSE_PASS' };
  }
  return { pass: true, failureCode: null };
}

export function classifyLineBreakDrift(expected: string[], live: string[]): RriFailureCode | null {
  if (expected.join('|') !== live.join('|')) return 'REFERENCE_LINE_BREAK_DRIFT';
  return null;
}

export function exceedsThreshold(delta: number, classification: DriftClassification, profile: FidelityThresholdProfile): boolean {
  if (classification === 'MAJOR') return delta > profile.majorRegionGeometryPx;
  if (classification === 'MINOR') return delta > profile.alignmentPx;
  return delta > 2;
}
