/**
 * ConceptMechanismProof — conceptual reasoning gate.
 */

import type {
  ConceptMechanismProof,
  CreativeJudgmentInput,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

const GENERIC_MARKERS = [
  'cool',
  'elevate',
  'reimagine',
  'inspire',
  'transform your',
  'unlock',
  'journey',
  'storytelling',
  'authentic',
  'community',
];

export function buildConceptMechanismProof(input: CreativeJudgmentInput): ConceptMechanismProof {
  const t = input.territory;
  const combined = `${t.conceptName} ${t.oneSentenceIdea} ${t.mechanism} ${t.argument}`.toLowerCase();
  const genericHits = GENERIC_MARKERS.filter((m) => combined.includes(m));
  const hasMechanism = t.mechanism.length > 8 && (t.mechanism.includes('→') || t.mechanism.length > 12);
  const hasTension = t.emotionalArc.includes('→') || t.argument.includes('hide') || t.argument.includes('contradict');
  const brandReason =
    input.brandId === 'ndxbook'
      ? 'Mechanism belongs to cultural editorial grammar — responsibility shift is NDX-native'
      : `${input.brandId} specificity: ${t.visualWorld} cannot swap to editorial door logic without breaking brand`;

  const whyNotTwenty =
    genericHits.length >= 2
      ? null
      : `Non-obvious mechanism (${t.mechanism}) + world (${t.visualWorld}) tied to ${input.brandId} argument`;

  let proofStatus: ConceptMechanismProof['proofStatus'] = 'PROVEN';
  if (genericHits.length >= 2 || !hasMechanism) proofStatus = 'MISSING';
  else if (genericHits.length === 1 || !hasTension) proofStatus = 'WEAK';

  return {
    tension: t.emotionalArc.split('→')[0]?.trim() ?? t.argument,
    humanTruth: t.oneSentenceIdea,
    contradiction: t.argument,
    mechanism: t.mechanism,
    obviousAnswer: genericHits.length ? `Topic-level ${genericHits[0]} campaign` : 'Surface category cliché',
    nonObviousAnswer: t.conceptName,
    brandSpecificityReason: brandReason,
    evidenceLogic: input.artifactRole ?? 'World + artifact provide legible receipt',
    conceptCompression: t.oneSentenceIdea,
    proofStatus,
    whyNotTwentyOtherCampaigns: whyNotTwenty,
  };
}

export function failsGenericConceptRejection(proof: ConceptMechanismProof): boolean {
  return proof.proofStatus === 'MISSING' || !proof.whyNotTwentyOtherCampaigns;
}
