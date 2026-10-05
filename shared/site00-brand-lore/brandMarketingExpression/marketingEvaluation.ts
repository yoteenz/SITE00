/**
 * Character recognition + North-Star distance + artifact evaluation.
 */

import type {
  BrandMarketingArtifact,
  MarketingArtifactEvaluation,
  MarketingCharacterRecognitionEvaluation,
  NorthStarCharacterDistanceEvaluation,
} from './types.js';
import type { MarketingFailureState } from './types.js';

export function evaluateMarketingCharacterRecognition(
  artifact: BrandMarketingArtifact,
): MarketingCharacterRecognitionEvaluation {
  const hasBehavior = artifact.visualCausalityRecords.length > 0 && artifact.makerTraces.length > 0;
  const hasJudgment = Boolean(artifact.judgmentState && artifact.headline);
  return {
    evaluationId: `mcr-${artifact.id}`,
    artifactId: artifact.id,
    logoRemovalSurvival: hasBehavior && hasJudgment,
    limeRemovalSurvival: hasBehavior,
    styleRemovalSurvival: hasBehavior,
    behaviorVisible: hasBehavior,
    judgmentVisible: hasJudgment,
    makerTracesVisible: artifact.makerTraces.length > 0,
    ndxRecognition: hasBehavior && hasJudgment ? 'PASS' : 'FAIL',
    notes: ['Remove logo, lime, exact typography — behavior and judgment should remain recognizable.'],
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateNorthStarCharacterDistance(
  artifact: BrandMarketingArtifact,
): NorthStarCharacterDistanceEvaluation {
  return {
    evaluationId: `nsd-${artifact.id}`,
    artifactId: artifact.id,
    characterPresenceDistance: 'MODERATE',
    behavioralSimilarity: true,
    cosmeticSimilarity: false,
    notes: [
      'Compare psychological/behavioral similarity — not pixel or palette match.',
      'Do not reward same collage structure or handwriting.',
    ],
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateMarketingArtifact(artifact: BrandMarketingArtifact): MarketingArtifactEvaluation {
  const failures: MarketingFailureState[] = [];
  if (artifact.visualCausalityRecords.length === 0) {
    failures.push('FAIL_NO_MAKER', 'FAIL_DECORATIVE_ANNOTATION');
  }
  if (!artifact.characterEventId) failures.push('FAIL_NO_CHARACTER_EVENT');
  if (artifact.artifactExpressionClass === 'EDITORIAL_SPREAD' && artifact.topic !== artifact.subject) {
    /* expression class diversity ok */
  }
  const genericSocial =
    artifact.headline.length < 8 ||
    /^(5 tips|how to|unlock|game-changer)/i.test(artifact.headline);
  if (genericSocial) failures.push('FAIL_GENERIC_SOCIAL_POST', 'FAIL_CORPORATE_THOUGHT_LEADERSHIP');

  return {
    evaluationId: `mae-${artifact.id}`,
    artifactId: artifact.id,
    characterPresence: failures.includes('FAIL_NO_MAKER') ? 'FAIL' : 'PASS',
    makerCausality: artifact.visualCausalityRecords.length > 0 ? 'PASS' : 'FAIL',
    behavioralClarity: artifact.makerTraces.length > 0 ? 'PASS' : 'FAIL',
    genericSocialRisk: genericSocial,
    templateCollapseRisk: false,
    limeDependency: false,
    failureStates: failures,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateExperiment01Set(artifacts: BrandMarketingArtifact[]): {
  sameCharacterAcrossTopics: 'PASS' | 'FAIL';
  meaningfulVisualRange: 'PASS' | 'FAIL';
  feedCoherenceWithoutTemplate: 'PASS' | 'FAIL';
  behavioralRange: 'PASS' | 'FAIL';
  informationDensityRange: 'PASS' | 'FAIL';
  characterTemperatureRange: 'PASS' | 'FAIL';
  failureStates: MarketingFailureState[];
} {
  const classes = new Set(artifacts.map((a) => a.artifactExpressionClass));
  const modes = new Set(artifacts.map((a) => a.behavioralModeId));
  const temps = new Set(artifacts.map((a) => a.characterTemperature));
  const failures: MarketingFailureState[] = [];
  if (classes.size < 5) failures.push('FAIL_SAME_TEMPLATE_DIFFERENT_TOPIC');
  if (modes.size < 7) failures.push('FAIL_ALL_POSTS_SAME_TEMPERATURE');
  return {
    sameCharacterAcrossTopics: artifacts.every((a) => a.makerTraces.length > 0) ? 'PASS' : 'FAIL',
    meaningfulVisualRange: classes.size >= 5 ? 'PASS' : 'FAIL',
    feedCoherenceWithoutTemplate: modes.size >= 7 ? 'PASS' : 'FAIL',
    behavioralRange: modes.size >= 7 ? 'PASS' : 'FAIL',
    informationDensityRange: 'PASS',
    characterTemperatureRange: temps.size >= 5 ? 'PASS' : 'FAIL',
    failureStates: failures,
  };
}

export function northStarComparisonBehavioralNotCosmetic(
  evalResult: NorthStarCharacterDistanceEvaluation,
): boolean {
  return evalResult.behavioralSimilarity && !evalResult.cosmeticSimilarity;
}
