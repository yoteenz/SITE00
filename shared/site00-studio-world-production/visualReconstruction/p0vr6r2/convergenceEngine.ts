/**
 * P0.VR.6R2 — DesignVisualConvergenceEngine
 * Canonical visual convergence service for DESIGN_AUTHORITY + EXACT references.
 */

import type { DesignReferenceFidelityContract } from '../p0vr7/types.js';
import { CORRECTION_PRIORITY_ORDER, DEFAULT_MAX_AUTOMATIC_ITERATIONS } from './constants.js';
import { applyDynamicMasksToDeltas, buildDefaultDynamicMasks } from './dynamicMasking.js';
import {
  countDriftBySeverity,
  exactModeCanVerify,
  measureRegionDeltas,
} from './deltaMeasurement.js';
import { buildVisualComparisonNormalization, generateOverlayArtifact } from './overlayEngine.js';
import { buildRegionRegistryFromDecomposition } from './regionRegistry.js';
import { appendSessionHistory, patchComparisonSession, saveComparisonSession, sessionId } from './sessionStore.js';
import type {
  DesignReferenceComparisonSession,
  DesignVisualVerificationStatus,
  DriftSeverity,
  VisualConvergenceCorrection,
  VisualConvergenceCorrectionPlan,
  VisualConvergenceIteration,
  VisualDeltaMeasurement,
} from './types.js';

function planId(): string {
  return `vcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function iterationRecordId(): string {
  return `vci-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function captureId(): string {
  return `cap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function requiresVisualConvergence(contract: DesignReferenceFidelityContract): boolean {
  return contract.authorityMode === 'DESIGN_AUTHORITY' && contract.fidelityMode === 'EXACT';
}

export function prepareReference(input: {
  contract: DesignReferenceFidelityContract;
  referencePath?: string;
}): DesignReferenceComparisonSession | null {
  const { contract } = input;
  if (!requiresVisualConvergence(contract) || !contract.decomposition) return null;

  const regions = buildRegionRegistryFromDecomposition({
    referenceId: contract.referenceId,
    decomposition: contract.decomposition,
  });
  const dynamicMasks = buildDefaultDynamicMasks(regions);
  const geo = contract.decomposition.globalGeometry;

  const session: DesignReferenceComparisonSession = {
    sessionId: sessionId(),
    contractId: contract.contractId,
    projectId: contract.projectId,
    pageId: contract.pageId,
    assetId: null,
    referenceId: contract.referenceId,
    viewport: contract.viewport,
    authorityMode: contract.authorityMode,
    fidelityMode: contract.fidelityMode,
    targetRoute: contract.route,
    referenceWidth: geo.referenceWidth,
    referenceHeight: geo.referenceHeight,
    liveCaptureId: null,
    iterationNumber: 0,
    maxAutomaticIterations: DEFAULT_MAX_AUTOMATIC_ITERATIONS,
    status: 'NOT_STARTED',
    verificationSource: null,
    normalization: null,
    regions,
    dynamicMasks,
    latestOverlay: null,
    latestDeltas: [],
    latestCorrectionPlan: null,
    iterations: [],
    historyEvents: [],
    numericScore: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  return saveComparisonSession(session);
}

export function captureLiveTarget(
  session: DesignReferenceComparisonSession,
  livePath: string,
): DesignReferenceComparisonSession {
  const cap = captureId();
  const updated = patchComparisonSession(session.sessionId, {
    liveCaptureId: cap,
    status: 'CAPTURE_PENDING',
  })!;
  appendSessionHistory(updated.sessionId, 'LIVE_CAPTURED', livePath);
  return patchComparisonSession(updated.sessionId, { status: 'COMPARISON_PENDING' })!;
}

export function normalizeComparisonPair(
  session: DesignReferenceComparisonSession,
  liveWidth: number,
  liveHeight: number,
): DesignReferenceComparisonSession {
  const normalization = buildVisualComparisonNormalization({
    referenceWidth: session.referenceWidth,
    referenceHeight: session.referenceHeight,
    liveWidth,
    liveHeight,
  });
  return patchComparisonSession(session.sessionId, { normalization })!;
}

export function generateOverlay(
  session: DesignReferenceComparisonSession,
  referencePath: string,
  livePath: string,
): DesignReferenceComparisonSession {
  if (!session.normalization) return session;
  const overlay = generateOverlayArtifact({
    sessionId: session.sessionId,
    iterationNumber: session.iterationNumber + 1,
    referencePath,
    livePath,
    normalization: session.normalization,
  });
  appendSessionHistory(session.sessionId, 'OVERLAY_CREATED', overlay.artifactId);
  return patchComparisonSession(session.sessionId, { latestOverlay: overlay })!;
}

export function measureReferenceDelta(
  session: DesignReferenceComparisonSession,
  liveGeometryHints?: Parameters<typeof measureRegionDeltas>[0]['liveGeometryHints'],
): VisualDeltaMeasurement[] {
  const raw = measureRegionDeltas({ regions: session.regions, liveGeometryHints });
  return applyDynamicMasksToDeltas(raw, session.dynamicMasks);
}

export function classifyVisualDriftFromSession(deltas: VisualDeltaMeasurement[]): DesignVisualVerificationStatus {
  const counts = countDriftBySeverity(deltas);
  if (counts.blocker > 0 || counts.major > 0) return 'DRIFT_FOUND';
  if (counts.moderate > 0 || counts.minor > 0) return 'DRIFT_FOUND';
  return 'HIGH_MATCH';
}

export function buildVisualCorrectionPlan(input: {
  session: DesignReferenceComparisonSession;
  deltas: VisualDeltaMeasurement[];
}): VisualConvergenceCorrectionPlan {
  const actionable = input.deltas.filter(
    (d) => !d.masked && d.severity !== 'ACCEPTABLE_VARIANCE' && d.severity !== 'MINOR',
  );

  const corrections: VisualConvergenceCorrection[] = actionable.map((d) => {
    const requiresAssetChange =
      d.driftType === 'ASSET_FIDELITY_DRIFT' ||
      d.driftType === 'ASSET_SCALE_DRIFT' ||
      d.driftType === 'ASSET_POSITION_DRIFT';
    let instruction = `Correct ${d.componentId ?? d.regionId}: ${d.description}`;
    if (d.deltaHeight && d.deltaHeight > 0) instruction = `Reduce height by ${Math.abs(d.deltaHeight)}px`;
    if (d.deltaWidth && Math.abs(d.deltaWidth) > 8) instruction = `Adjust width by ${-d.deltaWidth}px`;
    if (d.deltaY && Math.abs(d.deltaY) > 4) instruction = `Move up ${Math.abs(d.deltaY)}px`;

    return {
      target: d.regionId,
      instruction,
      requiresCodeChange: !requiresAssetChange,
      requiresAssetChange,
      requiresFounderInput: requiresAssetChange,
    };
  });

  const requiresAssetChange = corrections.some((c) => c.requiresAssetChange);
  const requiresFounderInput = corrections.some((c) => c.requiresFounderInput);

  return {
    planId: planId(),
    comparisonSessionId: input.session.sessionId,
    iteration: input.session.iterationNumber + 1,
    findings: input.deltas,
    corrections,
    priorityOrder: [...CORRECTION_PRIORITY_ORDER],
    estimatedScope: requiresAssetChange ? 'ASSET' : corrections.length ? 'CSS' : 'CSS',
    requiresCodeChange: corrections.some((c) => c.requiresCodeChange),
    requiresAssetChange,
    requiresFounderInput,
    status: requiresFounderInput ? 'BLOCKED' : 'PENDING',
    createdAt: new Date().toISOString(),
  };
}

export function applyCorrectionIteration(
  session: DesignReferenceComparisonSession,
  plan: VisualConvergenceCorrectionPlan,
): { session: DesignReferenceComparisonSession; assetCorrectionRequired: boolean } {
  if (plan.requiresAssetChange && plan.requiresFounderInput) {
    appendSessionHistory(session.sessionId, 'CORRECTION_PLAN_CREATED', 'ASSET_CORRECTION_REQUIRED');
    return {
      session: patchComparisonSession(session.sessionId, {
        status: 'FOUNDER_REVIEW_REQUIRED',
        latestCorrectionPlan: { ...plan, status: 'BLOCKED' },
      })!,
      assetCorrectionRequired: true,
    };
  }

  appendSessionHistory(session.sessionId, 'CORRECTION_APPLIED', plan.planId);
  return {
    session: patchComparisonSession(session.sessionId, {
      status: 'RECAPTURE_PENDING',
      latestCorrectionPlan: { ...plan, status: 'APPLIED' },
    })!,
    assetCorrectionRequired: false,
  };
}

export function recaptureLiveTarget(
  session: DesignReferenceComparisonSession,
  livePath: string,
): DesignReferenceComparisonSession {
  appendSessionHistory(session.sessionId, 'RECAPTURED', livePath);
  return patchComparisonSession(session.sessionId, {
    liveCaptureId: captureId(),
    iterationNumber: session.iterationNumber + 1,
    status: 'COMPARISON_PENDING',
  })!;
}

export function evaluateConvergence(session: DesignReferenceComparisonSession): {
  status: DesignVisualVerificationStatus;
  canAutoVerify: boolean;
  maxIterationsReached: boolean;
} {
  const deltas = session.latestDeltas;
  const counts = countDriftBySeverity(deltas);
  const maxReached = session.iterationNumber >= session.maxAutomaticIterations;

  if (exactModeCanVerify(deltas)) {
    return { status: 'HIGH_MATCH', canAutoVerify: true, maxIterationsReached: false };
  }

  if (maxReached) {
    return { status: 'FOUNDER_REVIEW_REQUIRED', canAutoVerify: false, maxIterationsReached: true };
  }

  if (counts.blocker > 0 || counts.major > 0) {
    return { status: 'DRIFT_FOUND', canAutoVerify: false, maxIterationsReached: false };
  }

  return { status: 'DRIFT_FOUND', canAutoVerify: false, maxIterationsReached: false };
}

export function finalizeReferenceVerification(
  session: DesignReferenceComparisonSession,
  source: 'SYSTEM' | 'FOUNDER',
): DesignReferenceComparisonSession {
  const event = source === 'FOUNDER' ? 'FOUNDER_VERIFIED' : 'SYSTEM_VERIFIED';
  appendSessionHistory(session.sessionId, event);
  if (session.status === 'HIGH_MATCH' || source === 'FOUNDER') {
    appendSessionHistory(session.sessionId, 'HIGH_MATCH');
  }
  return patchComparisonSession(session.sessionId, {
    status: 'VERIFIED',
    verificationSource: source,
    completedAt: new Date().toISOString(),
  })!;
}

export function runConvergenceComparison(input: {
  session: DesignReferenceComparisonSession;
  referencePath: string;
  livePath: string;
  liveWidth: number;
  liveHeight: number;
  liveGeometryHints?: Parameters<typeof measureRegionDeltas>[0]['liveGeometryHints'];
}): DesignReferenceComparisonSession {
  let session = captureLiveTarget(input.session, input.livePath);
  session = normalizeComparisonPair(session, input.liveWidth, input.liveHeight);
  session = generateOverlay(session, input.referencePath, input.livePath);

  const deltas = measureReferenceDelta(session, input.liveGeometryHints);
  appendSessionHistory(session.sessionId, 'DRIFT_DETECTED', `${deltas.length} findings`);

  const plan = buildVisualCorrectionPlan({ session, deltas });
  appendSessionHistory(session.sessionId, 'CORRECTION_PLAN_CREATED', plan.planId);

  const evalResult = evaluateConvergence({ ...session, latestDeltas: deltas });
  session = patchComparisonSession(session.sessionId, {
    latestDeltas: deltas,
    latestCorrectionPlan: plan,
    status: evalResult.status,
  })!;

  const iteration: VisualConvergenceIteration = {
    iterationId: iterationRecordId(),
    comparisonSessionId: session.sessionId,
    iterationNumber: session.iterationNumber + 1,
    captureBeforeId: session.liveCaptureId,
    overlayId: session.latestOverlay?.artifactId ?? null,
    deltaSetId: `deltas-${session.sessionId}-${session.iterationNumber + 1}`,
    correctionPlanId: plan.planId,
    captureAfterId: null,
    statusBefore: 'COMPARISON_PENDING',
    statusAfter: evalResult.status,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  session = patchComparisonSession(session.sessionId, {
    iterations: [...session.iterations, iteration],
  })!;

  return session;
}

export function driftSummaryLabel(deltas: VisualDeltaMeasurement[]): string {
  const counts = countDriftBySeverity(deltas);
  const parts: string[] = [];
  if (counts.minor) parts.push(`${counts.minor} MINOR`);
  if (counts.moderate) parts.push(`${counts.moderate} MODERATE`);
  if (counts.major) parts.push(`${counts.major} MAJOR`);
  if (counts.blocker) parts.push(`${counts.blocker} BLOCKER`);
  return parts.length ? parts.join(', ') : 'NONE';
}

export function severityBlocksExactVerify(severity: DriftSeverity): boolean {
  return severity === 'BLOCKER' || severity === 'MAJOR';
}

/** Executor may not self-declare verified without a completed comparison session. */
export function blockExecutorSelfPass(
  claimedVerified: boolean,
  session: DesignReferenceComparisonSession | null,
): boolean {
  if (!claimedVerified) return false;
  if (!session) return true;
  return session.status !== 'VERIFIED' && session.status !== 'HIGH_MATCH';
}
