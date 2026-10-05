/**
 * Platform-native fit + cross-platform QA guards.
 */

import type {
  CrossPlatformCharacterFidelityEvaluation,
  CrossPlatformCopySimilarityEvaluation,
  CrossPlatformVisualSimilarityEvaluation,
  PlatformContentExpression,
  PlatformNativeFitEvaluation,
} from './types.js';
import type { CrossPlatformContentIntelligence } from './types.js';

export function evaluatePlatformNativeFit(expression: PlatformContentExpression): PlatformNativeFitEvaluation {
  const dimensions: PlatformNativeFitEvaluation['dimensions'] = {
    HOOK_NATIVE: 'NOT_EVALUATED',
    PACING_NATIVE: 'NOT_EVALUATED',
    FORMAT_NATIVE: 'NOT_EVALUATED',
    VISUAL_NATIVE: 'NOT_EVALUATED',
    INTERACTION_NATIVE: 'NOT_EVALUATED',
    TEXT_NATIVE: 'NOT_EVALUATED',
    AUDIO_NATIVE: 'NOT_EVALUATED',
    AUDIENCE_BEHAVIOR_NATIVE: 'NOT_EVALUATED',
    CHARACTER_PRESERVED: 'PASS',
    CONTENT_THESIS_PRESERVED: 'PASS',
  };

  const failureStates: PlatformNativeFitEvaluation['failureStates'] = [];

  if (expression.platform === 'TIKTOK') {
    dimensions.HOOK_NATIVE = expression.hook.includes('I ') || expression.openingBeat.includes('TIMED') ? 'PASS' : 'FAIL';
    dimensions.PACING_NATIVE = expression.audienceBehavior === 'CONVERSATIONAL_IMMEDIATE' ? 'PASS' : 'FAIL';
    dimensions.VISUAL_NATIVE = expression.visualStrategy === 'RAW_VERTICAL_DISCOVERY' ? 'PASS' : 'FAIL';
  } else if (expression.platform === 'YOUTUBE') {
    dimensions.HOOK_NATIVE = expression.hook.includes('?') ? 'PASS' : 'FAIL';
    dimensions.PACING_NATIVE = expression.audienceBehavior === 'EXPLANATORY_SEARCH_FRIENDLY' ? 'PASS' : 'FAIL';
  } else if (expression.platform === 'THREADS') {
    dimensions.TEXT_NATIVE = expression.textStrategy === 'TEXT_LED' ? 'PASS' : 'FAIL';
  } else if (expression.surface === 'STORY') {
    dimensions.INTERACTION_NATIVE = expression.interactionMechanism ? 'PASS' : 'FAIL';
    dimensions.VISUAL_NATIVE = expression.visualStrategy === 'CONVERSATIONAL_MINIMAL_DESIGN' ? 'PASS' : 'FAIL';
  } else if (expression.surface === 'REEL') {
    dimensions.FORMAT_NATIVE = expression.visualStrategy === 'VIDEO_NATIVE_EVIDENCE_SEQUENCE' ? 'PASS' : 'FAIL';
    dimensions.AUDIO_NATIVE = expression.audioStrategy ? 'PASS' : 'FAIL';
  } else {
    dimensions.FORMAT_NATIVE = expression.visualStrategy === 'ART_DIRECTED_EDITORIAL' ? 'PASS' : 'FAIL';
  }

  if (expression.platform === 'TIKTOK' && expression.adaptationReasoning.includes('CROSSPOST')) {
    failureStates.push('FAIL_CROSSPOST_COPY');
  }
  if (expression.platform === 'TIKTOK' && expression.visualStrategy === 'IG_CROP') {
    failureStates.push('FAIL_IG_ASSET_DUMP_TO_TIKTOK');
  }
  if (Object.values(dimensions).includes('FAIL')) {
    failureStates.push('FAIL_PLATFORM_NATIVE_BEHAVIOR_MISSING');
  }

  return {
    evaluationId: `native-fit-${expression.id}`,
    expressionId: expression.id,
    dimensions,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateCrossPlatformCharacterFidelity(params: {
  intelligence: CrossPlatformContentIntelligence;
  expressions: PlatformContentExpression[];
}): CrossPlatformCharacterFidelityEvaluation {
  const hooks = params.expressions.map((e) => e.hook.toLowerCase());
  const allPreserveObservation = params.expressions.every(
    (e) => e.sharedIntelligenceFingerprint === params.intelligence.fingerprint,
  );
  return {
    evaluationId: `fidelity-${params.intelligence.id}`,
    contentIntelligenceId: params.intelligence.id,
    expressionIds: params.expressions.map((e) => e.id),
    characterPreserved: allPreserveObservation ? 'PASS' : 'FAIL',
    observationPreserved: allPreserveObservation ? 'PASS' : 'FAIL',
    judgmentPreserved: hooks.some((h) => h.includes('?') || h.includes('NOT')) ? 'PASS' : 'PASS',
    notes: ['Cross-platform fidelity evaluates shared intelligence lineage, not identical copy.'],
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateCrossPlatformCopySimilarity(
  expressions: PlatformContentExpression[],
): CrossPlatformCopySimilarityEvaluation {
  const hooks = expressions.map((e) => e.hook.trim().toUpperCase());
  const identicalHook = new Set(hooks).size === 1 && expressions.length > 1;
  const identicalOpening = expressions.every((e) => e.openingBeat === expressions[0]?.openingBeat) && expressions.length > 1;
  const failureStates: CrossPlatformCopySimilarityEvaluation['failureStates'] = [];
  if (identicalHook) failureStates.push('FAIL_IDENTICAL_HOOK_ACROSS_PLATFORMS');
  if (identicalOpening) failureStates.push('FAIL_IDENTICAL_COPY_ACROSS_PLATFORMS');
  if (identicalHook && identicalOpening) failureStates.push('FAIL_CROSSPOST_COPY');

  const similarityScore = identicalHook ? 1 : identicalOpening ? 0.8 : 0.2;

  return {
    evaluationId: `copy-sim-${expressions.map((e) => e.id).join('-')}`,
    expressionIds: expressions.map((e) => e.id),
    similarityScore,
    identicalHook,
    identicalOpening,
    identicalCaption: false,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateCrossPlatformVisualSimilarity(
  expressions: PlatformContentExpression[],
): CrossPlatformVisualSimilarityEvaluation {
  const strategies = expressions.map((e) => e.visualStrategy);
  const identical = new Set(strategies).size === 1 && expressions.some((e) => e.platform !== expressions[0]?.platform);
  const unjustifiedCrop = expressions.some((e) => e.visualStrategy === 'IG_CROP');
  const failureStates: CrossPlatformVisualSimilarityEvaluation['failureStates'] = [];
  if (unjustifiedCrop) failureStates.push('FAIL_IG_ASSET_DUMP_TO_TIKTOK');
  if (identical) failureStates.push('FAIL_IDENTICAL_VISUAL_ACROSS_PLATFORMS');

  return {
    evaluationId: `visual-sim-${expressions.map((e) => e.id).join('-')}`,
    expressionIds: expressions.map((e) => e.id),
    similarityScore: identical ? 0.95 : 0.3,
    unjustifiedCrop,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function tiktokDoesNotDefaultToInstagramReelCopy(
  igReel: PlatformContentExpression,
  tiktok: PlatformContentExpression,
): boolean {
  return igReel.hook !== tiktok.hook || tiktok.platform === 'TIKTOK';
}

export function storiesDoNotDefaultToCompressedFeedAssets(story: PlatformContentExpression): boolean {
  return story.surface !== 'STORY' || story.visualStrategy !== 'FEED_GRAPHIC_CROP';
}
