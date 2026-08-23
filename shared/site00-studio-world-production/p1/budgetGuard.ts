/**
 * P1 budget guard — minimal run envelope to prevent multiplication risk.
 */

import { DEFAULT_P1_BUDGET } from './constants.js';
import type { P1BudgetSpend, P1ControlledProofBudget } from './types.js';

export function createDefaultP1Budget(override?: Partial<P1ControlledProofBudget>): P1ControlledProofBudget {
  return {
    ...DEFAULT_P1_BUDGET,
    founderOverride: false,
    ...override,
  };
}

export function createEmptyP1Spend(): P1BudgetSpend {
  return {
    visualGenerationAttempts: 0,
    referenceConditionedProofAttempts: 0,
    composerDispatchAttempts: 0,
    fidelityEvaluations: 0,
    revisionLoops: 0,
    estimatedCostUsd: 0,
  };
}

export type BudgetCheckResult = { allowed: true } | { allowed: false; reason: string };

export function checkVisualGenerationBudget(
  budget: P1ControlledProofBudget,
  spend: P1BudgetSpend,
): BudgetCheckResult {
  if (budget.founderOverride) return { allowed: true };
  if (spend.visualGenerationAttempts >= budget.maxVisualGenerationAttempts) {
    return { allowed: false, reason: 'P1 budget: max visual generation attempts exceeded' };
  }
  return { allowed: true };
}

export function checkReferenceConditionedBudget(
  budget: P1ControlledProofBudget,
  spend: P1BudgetSpend,
): BudgetCheckResult {
  if (budget.founderOverride) return { allowed: true };
  if (spend.referenceConditionedProofAttempts >= budget.maxReferenceConditionedProofAttempts) {
    return { allowed: false, reason: 'P1 budget: max reference-conditioned proof attempts exceeded' };
  }
  return { allowed: true };
}

export function checkComposerDispatchBudget(
  budget: P1ControlledProofBudget,
  spend: P1BudgetSpend,
): BudgetCheckResult {
  if (budget.founderOverride) return { allowed: true };
  if (spend.composerDispatchAttempts >= budget.maxComposerDispatchAttempts) {
    return { allowed: false, reason: 'P1 budget: max Composer dispatch attempts exceeded' };
  }
  return { allowed: true };
}

export function checkFidelityEvaluationBudget(
  budget: P1ControlledProofBudget,
  spend: P1BudgetSpend,
): BudgetCheckResult {
  if (budget.founderOverride) return { allowed: true };
  if (spend.fidelityEvaluations >= budget.maxFidelityEvaluations) {
    return { allowed: false, reason: 'P1 budget: max fidelity evaluations exceeded' };
  }
  return { allowed: true };
}

export function checkCostBudget(
  budget: P1ControlledProofBudget,
  spend: P1BudgetSpend,
  additionalCost = 0,
): BudgetCheckResult {
  if (budget.founderOverride) return { allowed: true };
  if (spend.estimatedCostUsd + additionalCost > budget.maxEstimatedCostUsd) {
    return { allowed: false, reason: 'P1 budget: max estimated cost exceeded' };
  }
  return { allowed: true };
}

export function isWithinBudget(budget: P1ControlledProofBudget, spend: P1BudgetSpend): boolean {
  if (budget.founderOverride) return true;
  return (
    spend.visualGenerationAttempts <= budget.maxVisualGenerationAttempts &&
    spend.referenceConditionedProofAttempts <= budget.maxReferenceConditionedProofAttempts &&
    spend.composerDispatchAttempts <= budget.maxComposerDispatchAttempts &&
    spend.fidelityEvaluations <= budget.maxFidelityEvaluations &&
    spend.estimatedCostUsd <= budget.maxEstimatedCostUsd
  );
}
