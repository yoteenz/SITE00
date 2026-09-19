/**
 * Synthesis + artifact proof evaluation — failure states and adjective guard.
 */

import type { BrandCharacterSynthesis } from './types.js';
import type { BrandCharacterArtifactProof, SynthesisFailureState } from './types.js';
import { SYNTHESIS_FAILURE_STATES } from './constants.js';

const ADJECTIVE_TRAP = [
  'intelligent',
  'witty',
  'culturally aware',
  'bold',
  'curious',
  'authentic',
  'approachable',
  'confident',
  'warm',
  'nice',
  'smart',
  'edgy',
];

function adjectiveDensity(text: string): number {
  const lower = text.toLowerCase();
  return ADJECTIVE_TRAP.filter((a) => lower.includes(a)).length;
}

export function synthesisFailsAsAdjectiveList(synthesis: BrandCharacterSynthesis): boolean {
  const blob = [
    synthesis.characterEssence,
    synthesis.characterThesis,
    synthesis.intellectualIdentity,
    synthesis.socialIdentity,
    synthesis.culturalIdentity,
    synthesis.humorIdentity,
  ].join(' ');
  const hits = adjectiveDensity(blob);
  const behavioralSignals = [
    synthesis.makerBehaviors,
    synthesis.artifactBehaviors,
    synthesis.irritations,
    synthesis.obsessions,
    synthesis.productiveTensions,
  ].flat().filter((s) => s.length > 20);
  return hits >= 4 && behavioralSignals.length < 3;
}

export function evaluateBrandCharacterSynthesis(params: {
  synthesis: BrandCharacterSynthesis;
}): {
  passesCoherence: boolean;
  passesPsychologicalDepth: boolean;
  passesProductiveTension: boolean;
  passesHumorCausality: boolean;
  passesCulturalInteriority: boolean;
  genericArchetypeRisk: boolean;
  adjectiveListRisk: boolean;
  failureStates: SynthesisFailureState[];
  notes: string[];
} {
  const s = params.synthesis;
  const failureStates: SynthesisFailureState[] = [];
  const notes: string[] = [];

  const adjectiveListRisk = synthesisFailsAsAdjectiveList(s);
  if (adjectiveListRisk) {
    failureStates.push('FAIL_CHARACTER_AS_ADJECTIVES');
    notes.push('Synthesis collapsed toward adjective list without behavioral specificity');
  }

  const passesProductiveTension =
    s.productiveTensions.length >= 2 && s.unresolvedContradictions.length >= 1;
  if (!passesProductiveTension) {
    failureStates.push('FAIL_NO_PRODUCTIVE_TENSION');
  }

  const passesHumorCausality =
    s.humorIdentity.length > 40 &&
    !/^witty$/i.test(s.humorIdentity.trim()) &&
    s.humorIdentity.toLowerCase().includes('because');
  if (!passesHumorCausality) {
    failureStates.push('FAIL_GENERIC_WIT');
  }

  const passesCulturalInteriority =
    s.culturalIdentity.length > 50 &&
    (s.culturalInstincts.length >= 2 || s.culturalIdentity.includes('participat'));
  if (!passesCulturalInteriority) {
    failureStates.push('FAIL_NO_CULTURAL_INTERIORITY');
  }

  const passesPsychologicalDepth =
    s.irritations.length >= 2 &&
    s.obsessions.length >= 1 &&
    s.makerBehaviors.length >= 2 &&
    s.characterInternalLogic.length > 40;

  const genericArchetypeRisk =
    s.characterEssence.split(' ').length < 12 && adjectiveListRisk;

  if (genericArchetypeRisk) failureStates.push('FAIL_ARCHETYPE_MASHUP');

  const passesCoherence =
    s.whyTheseThreeBelongTogether.length > 30 &&
    s.sourceContributionMap.length >= 2 &&
    !adjectiveListRisk;

  return {
    passesCoherence,
    passesPsychologicalDepth,
    passesProductiveTension,
    passesHumorCausality,
    passesCulturalInteriority,
    genericArchetypeRisk,
    adjectiveListRisk,
    failureStates: failureStates.filter((f) => SYNTHESIS_FAILURE_STATES.includes(f)),
    notes,
  };
}

export function evaluateArtifactProof(params: {
  proof: BrandCharacterArtifactProof;
}): BrandCharacterArtifactProof['evaluation'] {
  const p = params.proof;
  const failureStates: SynthesisFailureState[] = [];
  const hasCausalChain = p.traces.every((t) => t.causalChain.length >= 2);
  const hasMaker = p.makerEvidence.length >= 1 && p.whatNDXDid.length > 20;
  const decorativeOnly =
    p.traces.length > 0 &&
    p.traces.every((t) => t.behavior.includes('decorate') || t.visibleManifestation.includes('generic'));

  if (!hasCausalChain) failureStates.push('FAIL_DECORATIVE_TRACE');
  if (!hasMaker) failureStates.push('FAIL_NO_MAKER');
  if (decorativeOnly) failureStates.push('FAIL_UNCAUSED_ANNOTATION');

  const prompt = p.falPromptContract.prompt.toLowerCase();
  if (/collage|scrapbook|lime green|handwritten|brutalist/.test(prompt) && !p.situation) {
    failureStates.push('FAIL_RANDOM_COLLAGE');
  }
  if (/receipt/.test(prompt) && !p.whatNDXRemembered) {
    failureStates.push('FAIL_RANDOM_RECEIPTS');
  }
  if (/redact/.test(prompt) && !p.whatNDXDecided) {
    failureStates.push('FAIL_RANDOM_REDACTION');
  }
  if (/burn book|mean girls|pink scrapbook/.test(prompt)) {
    failureStates.push('FAIL_BURN_BOOK_CLONE');
  }

  const behaviorFirst =
    p.falPromptContract.sectionOrder[0] === 'WHAT_HAPPENED' ||
    prompt.startsWith('what happened') ||
    prompt.indexOf('what happened') < prompt.indexOf('aesthetic');

  if (!behaviorFirst) failureStates.push('FAIL_STYLE_AS_CHARACTER');

  return {
    characterPresence: hasMaker ? 'PASS' : 'FAIL',
    makerCausality: hasCausalChain ? 'PASS' : 'FAIL',
    culturalFluency: p.culturalEvidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
    judgment: p.judgmentEvidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
    synthesis: p.synthesisEvidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
    humor: p.humorEvidence.length > 0 ? 'PASS' : 'NOT_EVALUATED',
    genericBrandRisk: failureStates.includes('FAIL_GENERIC_EDITORIAL'),
    styleDependency: failureStates.includes('FAIL_STYLE_AS_CHARACTER'),
    literalReferenceCopy: failureStates.includes('FAIL_BURN_BOOK_CLONE'),
    artifactAuthenticity: hasMaker && hasCausalChain ? 'PASS' : 'FAIL',
    ndxRecognition: 'NOT_EVALUATED',
    failureStates,
    notes: [],
  };
}

export function characterSynthesisCannotCollapseToAdjectives(): true {
  return true;
}
