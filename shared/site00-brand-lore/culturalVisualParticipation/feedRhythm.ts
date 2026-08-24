/**
 * Feed cultural + emotional rhythm + board-level diversity guards.
 */

import type {
  AmendedFirstSlideContract,
  FeedCulturalRhythm,
  FeedCulturalRhythmType,
  FeedEmotionalRhythm,
  FeedEmotionalTemperature,
  MarketingVisualDiversityEvaluation,
  VisualParticipationMode,
} from './types.js';
import type { CulturalFailureState } from './types.js';

function modeToRhythmType(mode: VisualParticipationMode): FeedCulturalRhythmType {
  if (mode === 'TYPOGRAPHY_DOMINANT') return 'TYPOGRAPHIC';
  if (mode === 'DATA_DOMINANT') return 'DATA';
  if (mode === 'ARTIFACT_DOMINANT') return 'OBJECT';
  if (mode === 'ILLUSTRATION_DOMINANT') return 'ILLUSTRATIVE';
  if (mode === 'MIXED_MEDIA') return 'MIXED_MEDIA';
  if (mode === 'PHOTOGRAPHIC_ASSEMBLAGE') return 'PHOTOGRAPHIC';
  if (mode.includes('IMAGE')) return 'PHOTOGRAPHIC';
  return 'DOCUMENTARY';
}

const TOPIC_EMOTIONAL: Record<number, FeedEmotionalTemperature> = {
  1: 'CURIOUS',
  2: 'SUSPICIOUS',
  3: 'REFLECTIVE',
  4: 'OBSESSIVE',
  5: 'SERIOUS',
  6: 'NOSY',
  7: 'SURPRISED',
  8: 'NOSTALGIC',
  9: 'PLAYFUL',
};

export function buildFeedCulturalRhythm(params: {
  boardId: string;
  contracts: AmendedFirstSlideContract[];
}): FeedCulturalRhythm {
  const distribution = {} as Record<FeedCulturalRhythmType, number>;
  for (const c of params.contracts) {
    const t = modeToRhythmType(c.culturalParticipation.visualParticipationMode);
    distribution[t] = (distribution[t] ?? 0) + 1;
  }

  const types = Object.keys(distribution).length;
  const typographic = distribution.TYPOGRAPHIC ?? 0;
  const documentary = distribution.DOCUMENTARY ?? 0;
  const textDoc = typographic + documentary;

  return {
    boardId: params.boardId,
    distribution,
    variationAdequate: types >= 3,
    textDocumentMonotony: textDoc >= params.contracts.length - 1,
  };
}

export function buildFeedEmotionalRhythm(params: {
  boardId: string;
  topicIndices: number[];
}): FeedEmotionalRhythm {
  const temperatures = params.topicIndices.map((i) => TOPIC_EMOTIONAL[i] ?? 'CURIOUS');
  const unique = new Set(temperatures);

  return {
    boardId: params.boardId,
    temperatures,
    variationAdequate: unique.size >= 4,
    emotionallyFlat: unique.size <= 2,
  };
}

export function evaluateBoardVisualDiversity(params: {
  contracts: AmendedFirstSlideContract[];
}): MarketingVisualDiversityEvaluation {
  const modes = params.contracts.map((c) => c.culturalParticipation.visualParticipationMode);
  const balances = params.contracts.map((c) => c.culturalParticipation.visualParticipationBalance);
  const failures: CulturalFailureState[] = [];

  const typeDominant = modes.filter((m) => m === 'TYPOGRAPHY_DOMINANT').length;
  const evidenceLed = balances.filter((b) => b === 'EVIDENCE_LED').length;
  const imageLed = modes.filter((m) => m.includes('IMAGE') || m === 'ARTIFACT_DOMINANT' || m === 'PHOTOGRAPHIC_ASSEMBLAGE').length;
  const human = params.contracts.filter((c) => c.culturalParticipation.visualSubjectMatterDecision.humanPresence).length;

  if (typeDominant + evidenceLed >= params.contracts.length - 1) failures.push('FAIL_TEXT_DOMINANT_FEED');
  if (evidenceLed >= params.contracts.length - 2) failures.push('FAIL_DOCUMENT_DOMINANT_FEED');
  if (human === 0) failures.push('FAIL_NO_HUMAN_PRESENCE');
  if (imageLed === 0) failures.push('FAIL_NO_CULTURAL_IMAGE');
  if (new Set(modes).size <= 2) failures.push('FAIL_VISUALLY_MONOTONOUS');

  return {
    evaluationId: 'board-visual-diversity',
    imageTypeBalance: new Set(modes).size >= 3 ? 'PASS' : 'FAIL',
    humanPresence: human >= 2 ? 'PASS' : 'FAIL',
    artisticRange: modes.some((m) => m === 'MIXED_MEDIA' || m === 'ILLUSTRATION_DOMINANT') ? 'PASS' : 'FAIL',
    culturalRange: imageLed >= 3 ? 'PASS' : 'FAIL',
    photographicRange: imageLed >= 2 ? 'PASS' : 'FAIL',
    densityVariation: 'PASS',
    emotionalVariation: 'PASS',
    failureStates: failures,
    evaluatedAt: new Date().toISOString(),
  };
}

export function textDominantFeedGuard(rhythm: FeedCulturalRhythm): boolean {
  return !rhythm.textDocumentMonotony;
}

export function documentDominantFeedGuard(balances: string[]): boolean {
  const evidenceLed = balances.filter((b) => b === 'EVIDENCE_LED').length;
  return evidenceLed < balances.length - 2;
}

export function inferVisualParticipationBalance(mode: VisualParticipationMode): import('./types.js').VisualParticipationBalance {
  if (mode === 'IMAGE_DOMINANT' || mode === 'PHOTOGRAPHIC_ASSEMBLAGE') return 'IMAGE_HEAVY';
  if (mode.includes('IMAGE') || mode === 'ARTIFACT_DOMINANT') return 'IMAGE_LED';
  if (mode === 'TYPOGRAPHY_DOMINANT') return 'TYPE_LED';
  if (mode === 'DATA_DOMINANT') return 'DATA_LED';
  if (mode === 'MIXED_MEDIA') return 'BALANCED';
  return 'BALANCED';
}

export function inferPhotographyBehavior(mode: VisualParticipationMode): import('./types.js').PhotographyBehavior | null {
  if (mode === 'IMAGE_DOMINANT') return 'REASSESS';
  if (mode === 'PHOTOGRAPHIC_ASSEMBLAGE') return 'COMPARE';
  if (mode === 'IMAGE_PLUS_EVIDENCE') return 'DOCUMENT';
  if (mode === 'ARTIFACT_DOMINANT') return 'ISOLATE';
  return null;
}

export function buildImageLedReadingPath(params: {
  imageSubject: string;
  primaryHook: string;
  evidence: string;
  trace: string;
  metadata: string;
}): import('../editorialInformationArchitecture/types.js').ArtifactReadingPath {
  return {
    firstLook: params.imageSubject,
    secondLook: params.primaryHook,
    thirdLook: params.evidence || params.trace,
    optionalDiscovery: params.metadata,
    articulated: true,
  };
}
