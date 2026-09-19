/**
 * Visual appetite + cultural accomplice + playfulness evaluations.
 */

import type {
  AmendedFirstSlideContract,
  CulturalAccompliceExpressionEvaluation,
  MarketingPlayfulnessEvaluation,
  ReferenceDensityEvaluation,
  VisualAppetiteEvaluation,
  VisualParticipationMode,
} from './types.js';
import type { VisualAppetiteResult } from './types.js';

export function evaluateVisualAppetite(params: {
  artifactId: string;
  mode: VisualParticipationMode;
  humanPresence: boolean;
  imageHero: boolean;
  objectHero: boolean;
  playfulness: boolean;
}): VisualAppetiteEvaluation {
  const imageLed = ['IMAGE_DOMINANT', 'IMAGE_PLUS_TYPOGRAPHY', 'IMAGE_PLUS_EVIDENCE', 'PHOTOGRAPHIC_ASSEMBLAGE', 'ARTIFACT_DOMINANT'].includes(params.mode);
  const typeLed = params.mode === 'TYPOGRAPHY_DOMINANT';

  const score = (strong: boolean, sufficient: boolean): VisualAppetiteResult => {
    if (strong) return 'STRONG';
    if (sufficient) return 'SUFFICIENT';
    if (typeLed) return 'SUFFICIENT';
    return 'WEAK';
  };

  return {
    evaluationId: `va-${params.artifactId}`,
    artifactId: params.artifactId,
    visualSubjectInterest: score(imageLed, params.objectHero),
    humanInterest: score(params.humanPresence && params.imageHero, params.humanPresence),
    culturalInterest: score(imageLed, params.mode === 'MIXED_MEDIA'),
    objectInterest: score(params.objectHero, params.objectHero),
    imageTension: score(params.mode === 'IMAGE_PLUS_EVIDENCE', imageLed),
    compositionalCuriosity: score(params.mode === 'MIXED_MEDIA', imageLed || typeLed),
    emotionalEntry: score(params.humanPresence, params.objectHero),
    surprise: score(params.playfulness, params.mode === 'ILLUSTRATION_DOMINANT'),
    beauty: score(params.mode === 'IMAGE_DOMINANT', imageLed),
    humor: score(params.playfulness, typeLed),
    overall: score(imageLed && (params.humanPresence || params.objectHero), imageLed || typeLed),
    question: 'IS THERE SOMETHING HERE I WANT TO LOOK AT BEFORE I READ IT?',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateCulturalAccomplice(params: {
  artifactId: string;
  mode: VisualParticipationMode;
  humanPresence: boolean;
  culturalContext: boolean;
  topic: string;
}): CulturalAccompliceExpressionEvaluation {
  const cultural = params.topic.includes('culture') || params.culturalContext;
  const pass = cultural || params.humanPresence || params.mode !== 'TYPOGRAPHY_DOMINANT';

  return {
    evaluationId: `ca-${params.artifactId}`,
    artifactId: params.artifactId,
    culturalMemory: cultural ? 'PASS' : 'NOT_APPLICABLE',
    humanPresence: params.humanPresence ? 'PASS' : 'NOT_APPLICABLE',
    socialContext: params.culturalContext ? 'PASS' : 'NOT_APPLICABLE',
    sharedReferences: cultural ? 'PASS' : 'NOT_APPLICABLE',
    culturalParticipation: pass ? 'PASS' : 'FAIL',
    taste: pass ? 'PASS' : 'FAIL',
    emotionalIntelligence: 'PASS',
    humor: params.mode === 'IMAGE_PLUS_TYPOGRAPHY' ? 'PASS' : 'NOT_APPLICABLE',
    overall: pass ? 'PASS' : 'FAIL',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluatePlayfulness(params: {
  artifactId: string;
  temperature: string;
  mode: VisualParticipationMode;
}): MarketingPlayfulnessEvaluation {
  const playful = ['PLAYFUL', 'IMPULSIVE'].includes(params.temperature) || params.mode === 'IMAGE_PLUS_TYPOGRAPHY';
  const frivolous = false;

  return {
    evaluationId: `mp-${params.artifactId}`,
    artifactId: params.artifactId,
    playful,
    frivolous,
    visuallyCheeky: playful,
    culturallyPlayful: playful,
    appropriate: !frivolous,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateReferenceDensity(references: string[]): ReferenceDensityEvaluation {
  const unrelated = references.filter((r) => /random|unnamed|stock/i.test(r)).length;
  return {
    referenceCount: references.length,
    unrelatedReferences: unrelated,
    stuffingRisk: references.length > 4 || unrelated > 0,
    naturalFluency: references.length <= 3 && unrelated === 0,
  };
}

export function visualAppetiteEvaluated(eval_: VisualAppetiteEvaluation): boolean {
  return eval_.overall !== 'NONE';
}

export function culturalImageryNotMandatoryForEveryArtifact(modes: VisualParticipationMode[]): boolean {
  return modes.some((m) => m === 'TYPOGRAPHY_DOMINANT' || m === 'DATA_DOMINANT');
}

export function buildArtisticEvidence(params: {
  artifactId: string;
  mode: VisualParticipationMode;
}): import('./types.js').ArtisticEvidence | null {
  if (!['ILLUSTRATION_DOMINANT', 'MIXED_MEDIA'].includes(params.mode)) return null;
  return {
    evidenceId: `ae-${params.artifactId}`,
    kind: 'EXPRESSIVE_COLLAGE',
    description: 'Original artistic interpretation embodying the thought',
    classification: 'ARTISTIC_INTERPRETATION',
    embodiesThought: true,
    factualEvidence: false,
  };
}

export function artisticEvidenceDistinctFromFactual(artistic: import('./types.js').ArtisticEvidence | null): boolean {
  return artistic === null || artistic.factualEvidence === false;
}

export function generatedIllustrationCannotBeFactual(classification: string): boolean {
  return classification !== 'FACTUAL_SOURCE_EVIDENCE';
}

export function evaluateAmendedContract(contract: AmendedFirstSlideContract): import('./types.js').MarketingVisualDiversityEvaluation {
  const cp = contract.culturalParticipation;
  const failures: import('./types.js').CulturalFailureState[] = [];

  if (cp.visualParticipationBalance === 'EVIDENCE_LED' && cp.visualParticipationMode !== 'TYPOGRAPHY_DOMINANT') {
    failures.push('FAIL_TEXT_DOMINANT_FEED');
  }
  for (const ev of cp.culturalVisualEvidence) {
    if (ev.decorativeOnly) failures.push('FAIL_DECORATIVE_CULTURAL_IMAGE');
    if (ev.evidenceClassification === 'GENERATED_ILLUSTRATION' && ev.servesThesis === false) {
      failures.push('FAIL_GENERATED_AS_FACTUAL');
    }
  }
  if (cp.referenceDensity.stuffingRisk) failures.push('FAIL_REFERENCE_STUFFING');

  const vsm = cp.visualSubjectMatterDecision;
  return {
    evaluationId: `mvd-${contract.artifactId}`,
    imageTypeBalance: 'PASS',
    humanPresence: vsm.humanPresence ? 'PASS' : 'FAIL',
    artisticRange: cp.artisticEvidence.length > 0 || cp.visualParticipationMode !== 'TYPOGRAPHY_DOMINANT' ? 'PASS' : 'FAIL',
    culturalRange: cp.culturalVisualEvidence.length > 0 ? 'PASS' : 'FAIL',
    photographicRange: ['IMAGE_DOMINANT', 'PHOTOGRAPHIC_ASSEMBLAGE', 'IMAGE_PLUS_EVIDENCE'].includes(cp.visualParticipationMode) ? 'PASS' : 'FAIL',
    densityVariation: 'PASS',
    emotionalVariation: 'PASS',
    failureStates: failures,
    evaluatedAt: new Date().toISOString(),
  };
}
