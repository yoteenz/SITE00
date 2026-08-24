/**
 * Behavior-first FAL prompt compiler for character artifact proofs.
 */

import { createHash } from 'node:crypto';
import type { BrandCharacterArtifactProof, BrandCharacterSynthesis } from './types.js';

export const FAL_PROMPT_SECTION_ORDER = [
  'WHAT_HAPPENED',
  'WHO_NDX_IS',
  'WHY_NDX_CARED',
  'WHAT_NDX_THOUGHT',
  'WHAT_NDX_DID',
  'WHAT_TRACES_REMAIN',
  'WHAT_INFORMATION_OBJECTS_PRESENT',
  'MATERIAL_CONDITIONS',
  'COMPOSITIONAL_CONDITIONS',
  'RENDERING_CONDITIONS',
  'NEGATIVE_CONSTRAINTS',
] as const;

export function compileBehaviorFirstFalPrompt(params: {
  proof: Omit<BrandCharacterArtifactProof, 'falPromptContract'>;
  synthesis: BrandCharacterSynthesis;
}): BrandCharacterArtifactProof['falPromptContract'] {
  const sections: string[] = [
    `WHAT HAPPENED: ${params.proof.situation}`,
    `WHO NDX IS: ${params.synthesis.characterEssence}`,
    `WHY NDX CARED: ${params.proof.whatNDXNoticed}`,
    `WHAT NDX THOUGHT: ${params.proof.whatNDXThought}`,
    `WHAT NDX DID: ${params.proof.whatNDXDid}`,
    `WHAT TRACES REMAIN: ${params.proof.traces.map((t) => t.visibleManifestation).join('; ')}`,
    `WHAT INFORMATION / OBJECTS ARE PRESENT: ${params.proof.artifactContents.join('; ')}`,
    `MATERIAL CONDITIONS: evidence surfaces NDX would actually use — annotated screenshots, highlighted passages, stacked references, not decorative collage`,
    `COMPOSITIONAL CONDITIONS: maker intervention visible; causality readable; same character temperature as scenario ${params.proof.scenarioLabel}`,
    `RENDERING CONDITIONS: documentary artifact evidence; human working traces; no logo board; no final identity system`,
    `NEGATIVE CONSTRAINTS: no random collage; no Burn Book clone; no Mean Girls IP; no lime-green as default palette; no scrapbook aesthetic as substitute for character; no decorative annotation without cause`,
  ];
  const prompt = sections.join('\n\n');
  const negativePrompt =
    'decorative collage, random receipts, random redaction, Burn Book clone, Mean Girls, pink scrapbook, logo board, moodboard, generic editorial, sterile corporate, academic poster, lime green default, style without behavior';
  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_PROMPT_SECTION_ORDER],
  };
}

export function falPromptBeginsFromBehavior(contract: BrandCharacterArtifactProof['falPromptContract']): boolean {
  return contract.sectionOrder[0] === 'WHAT_HAPPENED' && contract.prompt.startsWith('WHAT HAPPENED');
}

export function artifactSurvivesLimeRemovalConceptually(synthesis: BrandCharacterSynthesis): boolean {
  const blob = synthesis.characterEssence + synthesis.makerBehaviors.join(' ');
  return blob.length > 80 && !/lime green is ndx/i.test(blob);
}
