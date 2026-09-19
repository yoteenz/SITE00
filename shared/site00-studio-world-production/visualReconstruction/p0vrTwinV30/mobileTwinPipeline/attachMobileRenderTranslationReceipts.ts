import {
  buildMobileImplementationRenderFalPrompt,
  promptIncludesAntiCloneInstruction,
} from './buildMobileTwinFalPrompts.js';
import { evaluateReferenceCloneFirewall } from './referenceCloneFirewall.js';
import { buildReferenceTranslationEvidenceReceipt } from './referenceTranslationEvidence.js';
import type {
  MobileDesignReferenceAuthority,
  MobileImplementationRender,
  MobileTwinCompositionState,
} from './types.js';

export function attachMobileRenderTranslationReceipts(input: {
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  render: MobileImplementationRender;
  refineNotes?: string[];
  regeneration?: boolean;
}): {
  render: MobileImplementationRender;
  translationEvidence: ReturnType<typeof buildReferenceTranslationEvidenceReceipt>;
} {
  const prompt = buildMobileImplementationRenderFalPrompt({
    reference: input.reference,
    composition: input.composition,
    refineNotes: input.refineNotes,
    regeneration: input.regeneration,
  });
  const evidenceId = `rtre-${input.render.id}`;
  const evidence = buildReferenceTranslationEvidenceReceipt({
    receiptId: evidenceId,
    reference: input.reference,
    composition: input.composition,
    render: input.render,
    promptIncludesAntiClone: promptIncludesAntiCloneInstruction(prompt),
  });
  const firewall = evaluateReferenceCloneFirewall({
    reference: input.reference,
    render: input.render,
    composition: input.composition,
    translationEvidence: evidence,
  });

  const render: MobileImplementationRender = {
    ...input.render,
    phaseAOutputRole: 'MOBILE_IMPLEMENTATION_RENDER',
    referenceCloneRisk: firewall.risk,
    referenceTranslationEvidenceReceiptId: evidence.id,
    cloneFirewallBlocked: firewall.blocked,
    failureClassification: firewall.failureClassification,
  };

  return { render, translationEvidence: evidence };
}
