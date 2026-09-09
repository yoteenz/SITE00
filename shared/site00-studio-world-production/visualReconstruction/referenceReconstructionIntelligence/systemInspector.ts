/**
 * Reference Reconstruction System Inspector state builder.
 */

import { auditExecutionStyleConflicts } from './designExecutionConstraintEngine.js';
import { evaluateCaptureReadiness, defaultSkinsMobileDataState } from './deterministicCapture.js';
import { fidelityFalsePassGuard } from './referenceVerificationEngine.js';
import { evaluateVisualImplementationDelta } from '../p0vr6/visualImplementationNoOpGuard.js';
import { buildSkinsMobileReferenceBlueprint } from './skinsMobileBlueprint.js';
import type { ReferenceReconstructionInspectorState } from './types.js';

export function buildReferenceReconstructionInspectorState(input?: {
  testsPass?: boolean;
  visualQaExecuted?: boolean;
  majorDriftRemaining?: number;
  beforeAfterDelta?: number;
  cssSources?: string[];
}): ReferenceReconstructionInspectorState | null {
  const blueprint = buildSkinsMobileReferenceBlueprint();
  if (!blueprint) return null;

  const styleConflicts = auditExecutionStyleConflicts({
    cssSources: input?.cssSources ?? [],
    authorityGeometry: blueprint.geometrySpecs,
  });

  const capture = evaluateCaptureReadiness({
    fontsReady: true,
    layoutStable: true,
    animationsFrozen: true,
    scrollY: 0,
    expectedScrollY: 0,
    dataState: blueprint.dataState,
    expectedDataState: defaultSkinsMobileDataState(),
    imagesLoaded: blueprint.assetRequirements.some((a) => a.bound),
    hydrationComplete: true,
  });

  const falsePass = fidelityFalsePassGuard({
    testsPass: input?.testsPass ?? true,
    visualQaExecuted: input?.visualQaExecuted ?? false,
    majorDriftRemaining: input?.majorDriftRemaining ?? 4,
  });

  const noOp = evaluateVisualImplementationDelta({
    before: { label: 'before', deltaRatio: input?.beforeAfterDelta ?? 0 },
    after: { label: 'after', deltaRatio: input?.beforeAfterDelta ?? 0 },
  });

  const unboundAssets = blueprint.assetRequirements.filter((a) => a.required && !a.bound).length;

  return {
    authorityId: blueprint.authorityId,
    viewport: blueprint.viewport,
    contentCanvas: {
      width: blueprint.viewportCalibration.referenceViewportWidth,
      height: blueprint.viewportCalibration.referenceViewportHeight,
    },
    devicePixelRatio: blueprint.viewportCalibration.devicePixelRatio,
    regionCount: blueprint.regionTree.length,
    layoutInferenceStatus: blueprint.uncertainties.length ? 'UNCERTAIN' : 'COMPLETE',
    blueprintStatus: blueprint.status,
    assetRequirementCount: blueprint.assetRequirements.length,
    styleConflictCount: styleConflicts.length,
    captureReadyStatus: capture.ready ? 'READY' : 'BLOCKED',
    captureBlockers: capture.blockers,
    convergenceIteration: 0,
    majorDriftCount: unboundAssets,
    minorDriftCount: 0,
    microDriftCount: 0,
    noOpGuard: noOp.materialVisualDelta ? 'PASS' : input?.beforeAfterDelta === 0 ? 'FAIL' : 'NOT_RUN',
    falsePassGuard: falsePass.pass ? 'PASS' : 'FAIL',
    verificationStatus: blueprint.status === 'READY' && unboundAssets === 0 ? 'HIGH_MATCH' : 'BLOCKED',
    failureCodes: [
      ...capture.blockers as ReferenceReconstructionInspectorState['failureCodes'],
      ...(falsePass.failureCode ? [falsePass.failureCode] : []),
    ],
  };
}
