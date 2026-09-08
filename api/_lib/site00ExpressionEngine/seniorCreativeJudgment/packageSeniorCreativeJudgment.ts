/**
 * C1.6 — Package-level senior creative judgment + cohesion QA.
 */

import type {
  CampaignCreativeDNA,
  PackageChallengeOutcome,
  PackageCloningFailureClass,
  PackageCohesionQA,
  PackageCreativeQualityTier,
  PackageFounderHandholdingRisk,
  PackageSeniorCreativeJudgment,
  UnitCreativeDirection,
  UnitHandoff,
} from '../../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { CampaignResponsibilityBrief } from '../../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { ThinMultiUnitBrief } from './blindMultiUnitFixtures.js';
import type { CreativeRuntimeMode } from './creativeReasoningProvider.js';

function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function detectCloningFailures(units: UnitCreativeDirection[]): PackageCloningFailureClass[] {
  const failures: PackageCloningFailureClass[] = [];
  const headlines = units.map((u) => normalizeForCompare(u.finalDirection.slice(0, 60)));
  const uniqueHeadlines = new Set(headlines);
  if (uniqueHeadlines.size < units.length * 0.6) {
    failures.push('SAME_HEADLINE_EVERYWHERE');
  }
  const worlds = units.map((u) => normalizeForCompare(u.role.whatItIntroduces));
  if (new Set(worlds).size === 1 && units.length > 2) {
    failures.push('SAME_WORLD_MECHANISM_EVERYWHERE');
  }
  const copyStructures = units.map((u) => normalizeForCompare(u.mediumRationale.slice(0, 40)));
  if (new Set(copyStructures).size < Math.min(3, units.length)) {
    failures.push('SAME_COPY_STRUCTURE_EVERYWHERE');
  }
  if (failures.length >= 2) {
    failures.push('PACKAGE_CLONED_ACROSS_FORMATS');
  }
  return [...new Set(failures)];
}

export function evaluatePackageCohesion(
  units: UnitCreativeDirection[],
  handoffs: UnitHandoff[],
): PackageCohesionQA {
  const cloningFailures = detectCloningFailures(units);
  const hero = units.find((u) => u.medium === 'HERO_REEL');
  const carousel = units.find((u) => u.medium === 'CAROUSEL');
  const story = units.find((u) => u.medium === 'STORY_SEQUENCE');
  const xPost = units.find((u) => u.medium === 'X_POST');
  const email = units.find((u) => u.medium === 'EMAIL' || u.medium === 'LANDING_EXPRESSION');

  const heroNotLazyResize =
    Boolean(carousel) &&
    Boolean(hero) &&
    normalizeForCompare(carousel!.finalDirection) !== normalizeForCompare(hero!.finalDirection);

  return {
    feelsLikeOneCampaign: units.length >= 5 && cloningFailures.length < 2,
    unitsHaveDistinctJobs: new Set(units.map((u) => u.role.campaignRole)).size >= 4,
    heroNotLazyResize,
    carouselNative: Boolean(carousel?.mediumRationale.toLowerCase().includes('progression') ||
      carousel?.mediumRationale.toLowerCase().includes('slide') ||
      carousel?.role.whyThisMedium.toLowerCase().includes('carousel')),
    storyNative: Boolean(story?.mediumRationale.toLowerCase().includes('tap') ||
      story?.role.whyThisMedium.toLowerCase().includes('story')),
    xIsPublicDiscourse: Boolean(xPost?.role.campaignRole.toLowerCase().includes('argument') ||
      xPost?.mediumRationale.toLowerCase().includes('discourse') ||
      xPost?.mediumRationale.toLowerCase().includes('provoc')),
    emailAddsPersuasion: Boolean(email?.role.campaignRole.toLowerCase().includes('persuasion') ||
      email?.role.campaignRole.toLowerCase().includes('conversion') ||
      email?.mediumRationale.toLowerCase().includes('trust')),
    unitsEscalate: units.some((u) => u.role.whatItEscalates.length > 10),
    handoffsPresent: handoffs.length >= 3,
    motifNotOverRepeated: cloningFailures.every((f) => f !== 'SAME_REVEAL_EVERYWHERE'),
    cloningFailures,
    passed: cloningFailures.length === 0 && handoffs.length >= 3,
  };
}

export function deriveCampaignCreativeDNA(
  brief: ThinMultiUnitBrief,
  responsibility: CampaignResponsibilityBrief,
  campaignIdea: string,
): CampaignCreativeDNA {
  return {
    coreTension: responsibility.campaignQuestion,
    behavioralTruth: responsibility.audienceStartingBelief,
    emotionalTemperature: brief.tone,
    worldLogic: 'Domestic honesty — plants as emotional receipts, not décor props',
    rhetoricalBehavior: 'Confession before instruction; humor as permission, not mockery',
    visualGrammar: 'Close domestic frames, leaf detail, imperfect light, no greenhouse fantasy',
    motifRules: ['Leaf condition as emotional barometer', 'Confession beats instruction'],
    forbiddenRepetition: ['Same headline on every unit', 'Reel storyboard pasted into carousel slides'],
    callbackRules: ['Return to guilt-to-curiosity shift', 'Reference prior unit proof without repeating composition'],
    handoffRules: ['Each unit opens a question the next unit answers differently'],
    brandSpecificityMarkers: [brief.brandName, 'diagnostic onboarding', 'adaptive care coaching'],
  };
}

export function buildPackageSeniorJudgment(args: {
  brief: ThinMultiUnitBrief;
  responsibility: CampaignResponsibilityBrief;
  units: UnitCreativeDirection[];
  handoffs: UnitHandoff[];
  initialCampaignWinner: string;
  campaignIdea: string;
  runtimeMode: CreativeRuntimeMode;
  reasoningDepthLimited: boolean;
  packageChallengeText?: string;
  packageChallenger?: string;
}): PackageSeniorCreativeJudgment {
  const cohesion = evaluatePackageCohesion(args.units, args.handoffs);
  const hero = args.units.find((u) => u.medium === 'HERO_REEL');
  const handholdingRisks = args.units.map((u) => u.founderHandholdingRisk);
  const highCount = handholdingRisks.filter((r) => r === 'HIGH').length;
  const packageHandholding: PackageFounderHandholdingRisk =
    highCount >= 2 ? 'HIGH' : highCount === 1 ? 'MODERATE' : 'LOW';

  let packageQuality: PackageCreativeQualityTier = 'VALID';
  if (cohesion.passed && packageHandholding === 'LOW' && !args.reasoningDepthLimited) {
    packageQuality = 'EXCEPTIONAL';
  } else if (cohesion.unitsHaveDistinctJobs && packageHandholding !== 'HIGH') {
    packageQuality = 'STRONG';
  }

  const packageOutcome: PackageChallengeOutcome = cohesion.heroNotLazyResize
    ? 'DEEPEN_PACKAGE'
    : 'HYBRIDIZE_PACKAGE';

  return {
    packageJudgmentId: `PKG-SCJ-${args.brief.campaignId}-${Date.now()}`,
    campaignIdea: args.campaignIdea,
    heroConcept: hero?.finalDirection ?? args.initialCampaignWinner,
    initialCampaignWinner: args.initialCampaignWinner,
    packageFirstAnswerChallenge:
      args.packageChallengeText ??
      'First campaign answer may treat every format as the same confession beat — each medium must earn its role.',
    redTeamDiagnosis:
      'A rival agency would push one cinematic hero and resize it across formats instead of native medium expression.',
    packageChallenger:
      args.packageChallenger ?? 'CARE-AS-COMMUNITY PACKAGE',
    packageChallengerIdea:
      'Shift from individual guilt to collective plant rescue — same brand truth, stronger participation architecture.',
    finalCampaignDirection: args.campaignIdea,
    packageOutcome,
    campaignCreativeDNA: deriveCampaignCreativeDNA(args.brief, args.responsibility, args.campaignIdea),
    packageCohesionQA: cohesion,
    packageQualityTier: packageQuality,
    packageFounderHandholdingRisk: packageHandholding,
    campaignEnding: args.responsibility.campaignPayoff,
    campaignEscalation: args.units.map((u) => `${u.role.campaignRole}: ${u.role.whatItEscalates}`),
    runtimeMode: args.runtimeMode,
    reasoningDepthLimited: args.reasoningDepthLimited,
    blocksFounderReview: packageHandholding === 'HIGH',
    status: packageHandholding === 'HIGH' ? 'NEEDS_FOUNDER_DIRECTION' : 'AWAITING_FOUNDER_REVIEW',
  };
}

export function canApproveCreativeDirection(pkg: PackageSeniorCreativeJudgment, units: UnitCreativeDirection[]): boolean {
  if (pkg.blocksFounderReview) return false;
  if (pkg.packageFounderHandholdingRisk === 'HIGH') return false;
  if (!pkg.packageCohesionQA.unitsHaveDistinctJobs) return false;
  const incomplete = units.some(
    (u) =>
      u.reviewType === 'SENIOR_CREATIVE_JUDGMENT' &&
      (u.judgment.firstAnswerChallenge.attackVectors.length < 1 || !u.finalDirection),
  );
  return !incomplete;
}
