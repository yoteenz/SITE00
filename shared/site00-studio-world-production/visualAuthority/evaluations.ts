/**
 * P0.5C.6 — Visual authority evaluations (generation gates).
 */

import type {
  EvidenceCompositionRoleEvaluation,
  FeedArtisticRangeEvaluation,
  TextRemovalVisualIntegrityEvaluation,
  TopicSpecificArtDirectionEvaluation,
  VisualAuthorityEvaluationBundle,
  VisualAuthorityFailureState,
  WouldIStopBeforeReadingEvaluation,
} from './types.js';
import type { FeedArtisticBehavior } from './types.js';
import { buildBespokeArtDirectionContract } from './bespokeArtDirection.js';

export function evaluateWouldIStopBeforeReading(params: {
  artifactId: string;
  imageHero: boolean;
  objectHero: boolean;
  humanPresence: boolean;
  participationMode: string;
  visualAppetiteOverall: string;
}): WouldIStopBeforeReadingEvaluation {
  const imageLed = ['IMAGE_DOMINANT', 'IMAGE_PLUS_TYPOGRAPHY', 'IMAGE_PLUS_EVIDENCE', 'PHOTOGRAPHIC_ASSEMBLAGE', 'ARTIFACT_DOMINANT', 'MIXED_MEDIA', 'ILLUSTRATION_DOMINANT'].includes(params.participationMode);
  const typeLed = params.participationMode === 'TYPOGRAPHY_DOMINANT';
  const modeLedVisual = ['MIXED_MEDIA', 'ILLUSTRATION_DOMINANT', 'PHOTOGRAPHIC_ASSEMBLAGE', 'ARTIFACT_DOMINANT'].includes(params.participationMode);
  const credibleReason =
    params.imageHero ||
    params.objectHero ||
    params.humanPresence ||
    typeLed ||
    imageLed ||
    modeLedVisual ||
    params.visualAppetiteOverall === 'STRONG' ||
    params.visualAppetiteOverall === 'SUFFICIENT';

  return {
    evaluationId: `wis-${params.artifactId}`,
    artifactId: params.artifactId,
    question: 'WOULD I STOP ON THIS PAGE BEFORE I KNEW WHAT IT SAID?',
    humanInterest: params.humanPresence,
    objectInterest: params.objectHero,
    culturalInterest: imageLed,
    photographicInterest: params.imageHero,
    artisticInterest: imageLed || typeLed,
    compositionalInterest: true,
    emotionalInterest: params.humanPresence || params.objectHero,
    surprise: params.participationMode === 'MIXED_MEDIA' || params.participationMode === 'ILLUSTRATION_DOMINANT',
    curiosity: credibleReason,
    passes: credibleReason,
    failureState: credibleReason ? null : 'FAIL_NO_PRE_READING_VISUAL_APPETITE',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateTextRemovalVisualIntegrity(params: {
  artifactId: string;
  imageHero: boolean;
  objectHero: boolean;
  participationMode: string;
}): TextRemovalVisualIntegrityEvaluation {
  const typeLed = params.participationMode === 'TYPOGRAPHY_DOMINANT';
  const imageParticipating = ['IMAGE_DOMINANT', 'IMAGE_PLUS_TYPOGRAPHY', 'IMAGE_PLUS_EVIDENCE', 'PHOTOGRAPHIC_ASSEMBLAGE', 'ARTIFACT_DOMINANT', 'MIXED_MEDIA', 'ILLUSTRATION_DOMINANT'].includes(params.participationMode);
  let result: TextRemovalVisualIntegrityEvaluation['result'] = 'VIABLE';
  if (params.imageHero || params.objectHero) result = 'STRONG';
  else if (typeLed) result = 'TEXT_DEPENDENT_BUT_JUSTIFIED';
  else if (imageParticipating) result = 'VIABLE';
  else if (!params.imageHero && !params.objectHero && !typeLed) result = 'TOO_TEXT_DEPENDENT';

  const typographyDominantIntentional = typeLed;
  const passes = result === 'STRONG' || result === 'VIABLE' || (result === 'TEXT_DEPENDENT_BUT_JUSTIFIED' && typographyDominantIntentional);

  return {
    evaluationId: `trv-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    typographyDominantIntentional,
    passes,
    failureState: passes ? null : 'FAIL_TEXT_AS_DEFAULT_VISUAL_INTEREST',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateEvidenceCompositionRole(params: {
  artifactId: string;
  participationMode: string;
  participationBalance: string;
  evidenceDominatesThesis: boolean;
}): EvidenceCompositionRoleEvaluation {
  let role: EvidenceCompositionRoleEvaluation['role'] = 'SUPPORTING';
  if (params.evidenceDominatesThesis) role = 'DOMINANT_JUSTIFIED';
  else if (params.participationBalance === 'EVIDENCE_LED' && !params.evidenceDominatesThesis) role = 'DOMINANT_UNJUSTIFIED';
  else if (params.participationMode === 'IMAGE_PLUS_EVIDENCE') role = 'INTEGRATED';
  else if (params.participationBalance === 'IMAGE_LED') role = 'SUPPORTING';

  const evidenceIsComposition = role === 'DOMINANT_UNJUSTIFIED';
  const passes = role !== 'DOMINANT_UNJUSTIFIED';

  return {
    evaluationId: `ecr-${params.artifactId}`,
    artifactId: params.artifactId,
    role,
    evidenceIsComposition,
    passes,
    failureState: passes ? null : 'FAIL_EVIDENCE_BECAME_DEFAULT_COMPOSITION',
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateTopicSpecificArtDirection(params: {
  artifactId: string;
  topic: string;
  artisticPremise: string;
  artifactForm: string;
  genericNotebookOnly: boolean;
}): TopicSpecificArtDirectionEvaluation {
  const reusable = params.genericNotebookOnly && !params.artisticPremise.includes(params.topic);
  return {
    evaluationId: `tsa-${params.artifactId}`,
    artifactId: params.artifactId,
    reusableAcrossTopics: reusable,
    passes: !reusable,
    failureState: reusable ? 'FAIL_REUSABLE_TEMPLATE_COMPOSITION' : null,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateFeedArtisticRange(params: {
  boardId: string;
  modes: string[];
}): FeedArtisticRangeEvaluation {
  const behaviors = params.modes as FeedArtisticBehavior[];
  const unique = new Set(behaviors);
  const failures: VisualAuthorityFailureState[] = [];
  if (unique.size < 4) failures.push('FAIL_ARTISTIC_RANGE_COLLAPSE');
  if (unique.size <= 2) failures.push('FAIL_NINE_VARIATIONS_OF_ONE_LAYOUT');
  const docHeavy = behaviors.filter((m) => m === 'ARTIFACT_DOMINANT' || m === 'IMAGE_PLUS_EVIDENCE').length;
  if (docHeavy >= 7) failures.push('FAIL_DOCUMENT_FEED_CONVERGENCE');
  const typeHeavy = behaviors.filter((m) => m === 'TYPOGRAPHY_DOMINANT').length;
  if (typeHeavy >= 7) failures.push('FAIL_TYPOGRAPHY_FEED_CONVERGENCE');

  return {
    evaluationId: `far-${params.boardId}`,
    boardId: params.boardId,
    behaviors,
    uniqueBehaviorCount: unique.size,
    convergenceDetected: failures.length > 0,
    failureStates: failures,
    passes: failures.length === 0,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateVisualAuthorityBundle(params: {
  artifactId: string;
  topic: string;
  subject: string;
  primaryHook: string;
  visualSubject: string;
  participationMode: string;
  participationBalance: string;
  humanPresence: boolean;
  imageHero: boolean;
  objectHero: boolean;
  artifactForm: string;
  whyNotTemplate: string;
  visualAppetiteOverall: string;
  evidenceDominatesThesis: boolean;
  genericNotebookOnly: boolean;
}): VisualAuthorityEvaluationBundle {
  const bespoke = buildBespokeArtDirectionContract({
    artifactId: params.artifactId,
    topic: params.topic,
    subject: params.subject,
    primaryHook: params.primaryHook,
    visualSubject: params.visualSubject,
    participationMode: params.participationMode,
    humanPresence: params.humanPresence,
    imageHero: params.imageHero,
    objectHero: params.objectHero,
    artifactForm: params.artifactForm,
    whyNotTemplate: params.whyNotTemplate,
  });

  const wouldIStop = evaluateWouldIStopBeforeReading({
    artifactId: params.artifactId,
    imageHero: params.imageHero,
    objectHero: params.objectHero,
    humanPresence: params.humanPresence,
    participationMode: params.participationMode,
    visualAppetiteOverall: params.visualAppetiteOverall,
  });

  const textRemoval = evaluateTextRemovalVisualIntegrity({
    artifactId: params.artifactId,
    imageHero: params.imageHero,
    objectHero: params.objectHero,
    participationMode: params.participationMode,
  });

  const evidenceRole = evaluateEvidenceCompositionRole({
    artifactId: params.artifactId,
    participationMode: params.participationMode,
    participationBalance: params.participationBalance,
    evidenceDominatesThesis: params.evidenceDominatesThesis,
  });

  const topicSpecific = evaluateTopicSpecificArtDirection({
    artifactId: params.artifactId,
    topic: params.topic,
    artisticPremise: bespoke.artisticPremise,
    artifactForm: params.artifactForm,
    genericNotebookOnly: params.genericNotebookOnly,
  });

  const failureStates: VisualAuthorityFailureState[] = [
    wouldIStop.failureState,
    textRemoval.failureState,
    evidenceRole.failureState,
    topicSpecific.failureState,
  ].filter(Boolean) as VisualAuthorityFailureState[];

  const visualAppetiteGatePasses = wouldIStop.passes && textRemoval.passes && evidenceRole.passes && topicSpecific.passes;

  return {
    bespokeArtDirection: bespoke,
    wouldIStopBeforeReading: wouldIStop,
    textRemovalIntegrity: textRemoval,
    evidenceCompositionRole: evidenceRole,
    topicSpecificArtDirection: topicSpecific,
    visualAppetiteGatePasses,
    generationReadinessBlocked: !visualAppetiteGatePasses,
    failureStates,
  };
}

export function materialityAsMediumNotPremise(artifactForm: string, artisticPremise: string): boolean {
  if (artisticPremise.includes('Typographic art direction')) return true;
  if (artisticPremise.includes('leads the page')) return true;
  const materialOnly =
    /NOTEBOOK|RECEIPT|PHOTOCOPY|TEAR|PAPER/i.test(artifactForm) &&
    !artisticPremise.includes('leads') &&
    !artisticPremise.includes('Typographic');
  return !materialOnly;
}

export function evidenceDefaultCompositionBlocked(eval_: EvidenceCompositionRoleEvaluation): boolean {
  return eval_.passes;
}

export function textDefaultVisualInterestBlocked(eval_: TextRemovalVisualIntegrityEvaluation): boolean {
  return eval_.passes || eval_.typographyDominantIntentional;
}

export function reusableTemplateCompositionBlocked(eval_: TopicSpecificArtDirectionEvaluation): boolean {
  return eval_.passes;
}
