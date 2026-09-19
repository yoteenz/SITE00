/**
 * Composite synthesis readiness gate — separate from territory formation gate.
 * Retrospective NDXBOOK: historical six territories + ≥3 deepening answers → PARTIAL for synthesis.
 */

export function canProceedToCompositeSynthesis(state: string, override: boolean): boolean {
  if (override) return true;
  return state === 'CHARACTER_READY' || state === 'CHARACTER_PARTIAL';
}

export function resolveSynthesisEligibleReadinessState(params: {
  evaluatedState: string;
  deepeningAnswerCount: number;
  historicalFormationComplete: boolean;
  override: boolean;
}): string {
  if (params.override) return params.evaluatedState;
  if (canProceedToCompositeSynthesis(params.evaluatedState, false)) return params.evaluatedState;
  if (
    params.historicalFormationComplete &&
    params.deepeningAnswerCount >= 3 &&
    params.evaluatedState === 'CHARACTER_INSUFFICIENT'
  ) {
    return 'CHARACTER_PARTIAL';
  }
  return params.evaluatedState;
}
