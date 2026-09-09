/**
 * End-to-end navigation QA (safe interactions only)
 */

import type { PageInteractionContract, PageInteractionGraph } from './types.js';

const DESTRUCTIVE_INTENTS = ['CONFIRM_DELETE', 'SUBMIT_MUTATION'];

export function listSafeNavigationQAContracts(contracts: PageInteractionContract[]): PageInteractionContract[] {
  return contracts.filter((c) => !DESTRUCTIVE_INTENTS.includes(c.intent) && c.affordanceType !== 'DELETE');
}

export function simulateSafeNavQA(input: {
  graph: PageInteractionGraph;
  contracts: PageInteractionContract[];
  primaryRoute: string;
}): { passed: number; failed: number; results: Array<{ interactionId: string; ok: boolean }> } {
  const safe = listSafeNavigationQAContracts(input.contracts);
  const results = safe.map((c) => {
    const edge = input.graph.edges.find((e) => e.interactionId === c.interactionId);
    const ok = c.status === 'IMPLEMENTED' || c.status === 'RESOLVED' ? Boolean(edge || c.targetType.includes('STATE')) : false;
    return { interactionId: c.interactionId, ok };
  });
  return {
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
