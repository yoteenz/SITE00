/**
 * P0.VR.6R2 — Compact visual QA badge for DESIGN AUTHORITY · EXACT references.
 */

import type { DesignReferenceComparisonSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import { driftSummaryLabel } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';

export type DesignVisualConvergenceBadgeProps = {
  session: DesignReferenceComparisonSession;
  onViewComparison: () => void;
  compact?: boolean;
};

function matchLabel(status: DesignReferenceComparisonSession['status']): string {
  if (status === 'VERIFIED') return 'VERIFIED';
  if (status === 'HIGH_MATCH') return 'HIGH MATCH';
  if (status === 'DRIFT_FOUND' || status === 'CORRECTION_IN_PROGRESS') return 'DRIFT';
  if (status === 'FOUNDER_REVIEW_REQUIRED') return 'FOUNDER REVIEW';
  return 'VISUAL QA';
}

export function DesignVisualConvergenceBadge({
  session,
  onViewComparison,
  compact = false,
}: DesignVisualConvergenceBadgeProps) {
  const drift = driftSummaryLabel(session.latestDeltas);

  return (
    <div
      className={`site00-dw-v3-convergence-badge${compact ? ' site00-dw-v3-convergence-badge--compact' : ''}`}
      data-session-id={session.sessionId}
    >
      <span className="site00-dw-v3-convergence-badge__label">
        DESIGN AUTHORITY · EXACT
      </span>
      <span className="site00-dw-v3-convergence-badge__match">
        VISUAL MATCH: {matchLabel(session.status)}
      </span>
      <span className="site00-dw-v3-convergence-badge__meta">
        ITERATION: {session.iterationNumber} · DRIFT: {drift}
      </span>
      <button type="button" className="site00-dw-v3-convergence-badge__link" onClick={onViewComparison}>
        VIEW COMPARISON
      </button>
    </div>
  );
}
