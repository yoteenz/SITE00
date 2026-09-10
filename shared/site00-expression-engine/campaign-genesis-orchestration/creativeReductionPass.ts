/**
 * P0.CGO.2 — CreativeReductionPass: remove elements that don't serve the idea.
 */

import type { CampaignWorldCandidate, CampaignShotRole } from './types.js';
import type { CreativeReductionPass, CreativeReductionItem } from './conceptualEfficiencyTypes.js';

export function runCreativeReductionPass(input: {
  candidate: CampaignWorldCandidate;
  shots?: CampaignShotRole[];
  props?: string[];
}): CreativeReductionPass {
  const items: CreativeReductionItem[] = [];
  const props = input.props ?? input.candidate.propSystem;
  const shots = input.shots ?? [];

  for (const prop of props) {
    const servesMotif = input.candidate.motifs.some((m) => prop.toLowerCase().includes(m.toLowerCase().split(' ')[0]!));
    items.push({
      element: prop,
      elementType: 'PROP',
      servesMeaning: servesMotif || props.length <= 3,
      recommendation: servesMotif || props.length <= 3 ? 'KEEP' : 'REMOVE',
    });
  }

  if (shots.length > 4) {
    const optional = shots.filter((s) => s.requirement === 'OPTIONAL' || s.requirement === 'EXPERIMENTAL');
    for (const s of optional) {
      items.push({
        element: s.shotId,
        elementType: 'SHOT',
        servesMeaning: false,
        recommendation: 'REMOVE',
      });
    }
  }

  if (input.candidate.copyLanguage.length > 2) {
    items.push({
      element: 'Extra copy lines',
      elementType: 'COPY',
      servesMeaning: false,
      recommendation: 'MERGE',
    });
  }

  if (props.length > 5) {
    items.push({
      element: 'Secondary prop system',
      elementType: 'PROP',
      servesMeaning: false,
      recommendation: 'REMOVE',
    });
  }

  const removedCount = items.filter((i) => i.recommendation === 'REMOVE').length;
  const conceptStrengthAfter: CreativeReductionPass['conceptStrengthAfter'] =
    removedCount > 0 ? 'STRONGER' : 'UNCHANGED';

  return {
    question: 'CAN THIS IDEA BE SAID WITH LESS?',
    items,
    removedCount,
    conceptStrengthAfter,
  };
}

export function elementServesMeaning(element: string, candidate: CampaignWorldCandidate): boolean {
  const core = `${candidate.coreConcept} ${candidate.motifs.join(' ')} ${candidate.associationChain.connectiveLogic}`.toLowerCase();
  return core.includes(element.toLowerCase().split(' ')[0] ?? '');
}
