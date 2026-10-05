import type { ReconciliationOutcome } from './types.js';

export type ReconciliationSuggestion = {
  declaredState: string;
  observedEvidenceSummary: string;
  suggestedState: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  outcome: ReconciliationOutcome;
  requiresAdminApproval: true;
};

export function suggestReconciliation(input: {
  declaredState: string;
  evidenceTitles: string[];
  requirementTitle: string;
}): ReconciliationSuggestion {
  const hasEvidence = input.evidenceTitles.length > 0;
  const evidenceSummary = hasEvidence
    ? input.evidenceTitles.join('; ')
    : 'No evidence recorded';

  let suggestedState = input.declaredState;
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let outcome: ReconciliationOutcome = 'MISSING_EVIDENCE';

  if (hasEvidence) {
    if (input.declaredState === 'BUILDING' && input.evidenceTitles.length >= 2) {
      suggestedState = 'READY_FOR_REVIEW';
      confidence = 'HIGH';
      outcome = 'PROBABLE';
    } else if (input.declaredState === 'NOT_STARTED' && hasEvidence) {
      suggestedState = 'BUILDING';
      confidence = 'MEDIUM';
      outcome = 'NEWLY_DISCOVERED';
    } else {
      suggestedState = input.declaredState;
      confidence = 'MEDIUM';
      outcome = 'CONFIRMED';
    }
  }

  return {
    declaredState: input.declaredState,
    observedEvidenceSummary: evidenceSummary,
    suggestedState,
    confidence,
    outcome,
    requiresAdminApproval: true,
  };
}

/** Evidence never auto-completes a requirement */
export function evidenceImpliesCompletion(): false {
  return false;
}

export function applyReconciliationDecision(
  suggestion: ReconciliationSuggestion,
  decision: 'ACCEPT' | 'REJECT' | 'MODIFY',
  modifiedState?: string,
): { applied: boolean; newState: string; outcome: ReconciliationOutcome } {
  if (decision === 'REJECT') {
    return {
      applied: false,
      newState: suggestion.declaredState,
      outcome: 'REQUIRES_REVIEW',
    };
  }
  if (decision === 'MODIFY' && modifiedState) {
    return { applied: true, newState: modifiedState, outcome: 'CONFIRMED' };
  }
  if (decision === 'ACCEPT') {
    return { applied: true, newState: suggestion.suggestedState, outcome: suggestion.outcome };
  }
  return { applied: false, newState: suggestion.declaredState, outcome: 'REQUIRES_REVIEW' };
}
