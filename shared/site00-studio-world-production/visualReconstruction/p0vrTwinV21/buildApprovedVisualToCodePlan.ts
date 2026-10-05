import type { ApprovedVisualToCodePlan, ConceptDirectedTwinSession } from './types.js';

export function buildApprovedVisualToCodePlan(
  session: ConceptDirectedTwinSession,
  approvedVersionId: string,
): ApprovedVisualToCodePlan {
  return {
    planId: `plan-${approvedVersionId}`,
    approvedVersionId,
    bands: session.blueprintGrammar.informationBands,
    shellRules: [
      session.brandContext.hostClientFirewall,
      'Preserve PageFunctionGraph — transplant function only',
    ],
    functionBindingPolicy: 'TRANSPLANT_ONLY',
    assetSlots: session.creativeDirection?.assetPlan ?? [],
  };
}
