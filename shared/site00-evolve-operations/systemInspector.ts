/**
 * System inspector — debug why the engine made a decision.
 */

import type { EvolveSystemInspectorEntry } from './types.js';

export function inspectDecision(
  domain: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  policyId: string | null,
  reasons: EvolveSystemInspectorEntry['reasons'],
): EvolveSystemInspectorEntry {
  return {
    domain,
    inputSummary: input,
    outputSummary: output,
    policyId,
    reasons,
  };
}
