/**
 * P0.VR.CONVERGE.1 — When founder may build twin despite incomplete forensic depth.
 */

import type { PageVisualDiagnosis } from '../p0vrCapture1/pageVisualDiagnosis.js';
import type { TwinBuildReadiness, TwinBuildReadinessStatus } from './types.js';

export type TwinBuildSafetyInput = {
  authorityReady: boolean;
  captureReady: boolean;
  routeReady: boolean;
  viewportReady: boolean;
  canonicalRoute: string | null;
  expectedRoute?: string | null;
  functionContractReady?: boolean;
};

export function evaluateTwinBuildReadiness(input: {
  diagnosis: PageVisualDiagnosis | null | undefined;
  safety: TwinBuildSafetyInput;
}): TwinBuildReadiness {
  const coverage = input.diagnosis?.forensicCoverage;
  const hardBlockers: string[] = [];
  const warnings: string[] = [];

  if (!input.safety.authorityReady) hardBlockers.push('DESIGN_AUTHORITY_MISSING');
  if (!input.safety.captureReady) hardBlockers.push('LIVE_CAPTURE_MISSING');
  if (!input.safety.routeReady) hardBlockers.push('ROUTE_NOT_RESOLVED');
  if (!input.safety.viewportReady) hardBlockers.push('VIEWPORT_MISMATCH');
  if (
    input.safety.expectedRoute &&
    input.safety.canonicalRoute &&
    input.safety.canonicalRoute !== input.safety.expectedRoute
  ) {
    hardBlockers.push('ROUTE_MISMATCH');
  }
  if (input.safety.functionContractReady === false) hardBlockers.push('FUNCTION_CONTRACT_UNAVAILABLE');

  const majorTotal = coverage?.majorTotal ?? 0;
  const majorAccounted = coverage?.majorAccounted ?? 0;
  const sufficient = coverage?.majorSufficientDepth ?? 0;
  const depthPct = coverage?.measurementDepthPct ?? 0;
  const coverageReady = majorTotal > 0 && majorAccounted >= majorTotal;

  if (!coverageReady) hardBlockers.push('REGION_COVERAGE_INCOMPLETE');

  if (coverage?.depthGateStatus === 'BLOCK' || coverage?.gateStatus === 'BLOCK') {
    const shallow = Math.max(0, majorTotal - sufficient);
    if (coverageReady && shallow > 0) {
      warnings.push(
        `${shallow} region(s) have shallow forensic depth — twin will use visual inference and require founder review.`,
      );
    } else if (!coverageReady) {
      hardBlockers.push(coverage?.gateReason ?? 'FORENSIC_GATE_BLOCK');
    }
  } else if (coverage?.depthGateStatus === 'WARNING' || coverage?.gateStatus === 'WARNING') {
    warnings.push(coverage.depthGateReason ?? coverage.gateReason ?? 'FORENSIC_DEPTH_INCOMPLETE');
  }

  if (coverage?.scopeMismatch) hardBlockers.push('CAPTURE_SCOPE_MISMATCH');

  let status: TwinBuildReadinessStatus = 'BLOCKED';
  if (hardBlockers.length === 0) {
    status = warnings.length ? 'READY_WITH_WARNINGS' : 'READY';
  }

  return {
    authorityReady: input.safety.authorityReady,
    captureReady: input.safety.captureReady,
    routeReady: input.safety.routeReady,
    viewportReady: input.safety.viewportReady,
    coverageReady,
    functionContractReady: input.safety.functionContractReady !== false,
    twinIsolationReady: true,
    forensicDepth: { sufficient, total: majorTotal, pct: depthPct },
    warnings,
    hardBlockers,
    status,
  };
}

export function founderMayApproveDirectionWithWarnings(readiness: TwinBuildReadiness): boolean {
  return readiness.hardBlockers.length === 0;
}

export function founderMayBuildTwin(readiness: TwinBuildReadiness): boolean {
  return readiness.status === 'READY' || readiness.status === 'READY_WITH_WARNINGS';
}
