/**
 * CreativeBlindComparison + CreativeReasoningEfficiency
 */

import type {
  CreativeBlindComparison,
  CreativeJudgmentInput,
  CreativeReasoningEfficiency,
  CreativeReasoningMode,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { runCreativeJudgmentIntelligence } from './creativeJudgmentIntelligenceEngine.js';

const comparisons: CreativeBlindComparison[] = [];

export function resetCreativeBlindComparisonsForTest(): void {
  comparisons.length = 0;
}

export function runCreativeBlindComparison(
  briefId: string,
  input: CreativeJudgmentInput,
  modeA: CreativeReasoningMode = 'DETERMINISTIC',
  modeB: CreativeReasoningMode = 'HYBRID',
): CreativeBlindComparison {
  const judgmentA = runCreativeJudgmentIntelligence({ ...input, reasoningMode: modeA });
  const judgmentB = runCreativeJudgmentIntelligence({ ...input, reasoningMode: modeB });
  const comparison: CreativeBlindComparison = {
    comparisonId: `blind-${Date.now()}`,
    briefId,
    engineA: { mode: modeA, judgment: judgmentA },
    engineB: { mode: modeB, judgment: judgmentB },
    founderPreferred: null,
    revealedAfterJudgment: false,
    createdAt: new Date().toISOString(),
  };
  comparisons.push(comparison);
  return comparison;
}

export function recordBlindComparisonFounderPreference(
  comparisonId: string,
  preferred: 'A' | 'B' | 'NEITHER',
): CreativeBlindComparison | null {
  const c = comparisons.find((x) => x.comparisonId === comparisonId);
  if (!c) return null;
  c.founderPreferred = preferred;
  c.revealedAfterJudgment = true;
  return c;
}

export function buildCreativeReasoningEfficiency(input: {
  qualityScore: number;
  providerCost: number;
  latencyMs: number;
  founderApproval: boolean;
  rescueRequired: boolean;
  reasoningMode: CreativeReasoningMode;
}): CreativeReasoningEfficiency {
  return { ...input };
}
