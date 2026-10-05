import { buildMobileImplementationRenderFalPrompt } from './buildMobileTwinFalPrompts.js';
import { buildActualPageOnlyPresentationFirewallBlock } from './actualPresentationFirewall.js';
import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';

export function buildNbpCorrectedActualFalPrompt(input: {
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
}): string {
  const base = buildMobileImplementationRenderFalPrompt({
    reference: input.reference,
    composition: input.composition,
  });
  return [base, '', buildActualPageOnlyPresentationFirewallBlock()].join('\n');
}
