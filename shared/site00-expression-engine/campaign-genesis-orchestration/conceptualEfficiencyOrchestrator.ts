/**
 * P0.CGO.2 — Enriches world candidates with conceptual efficiency + interaction logic.
 */

import type { CampaignWorldCandidate, ProductCategory, WorldGenesisInput } from './types.js';
import type { ConceptualEfficiencyEnrichment, ExecutionLevel } from './conceptualEfficiencyTypes.js';
import { productWorldInteractionEngine } from './productWorldInteractionEngine.js';
import {
  assessOneShotPotential,
  buildMinimalExecutionConcept,
  buildProductVisibilityThroughBehavior,
  computeConceptValueRatio,
  detectForcedProductPlacement,
  inferWorldDistanceFromChain,
  scoreCameraEconomy,
  scoreCampaignExtensibility,
  scoreCategoryEnvironmentDependency,
  scoreConceptualDensity,
  scoreConceptualEfficiency,
  scoreCreativeElementUtility,
  scoreLoopability,
  scoreNaturalProductVisibility,
  scoreProductionComplexity,
} from './conceptualEfficiencyScoring.js';
import { selectMicroNarrativeGrammar, reelDurationForGrammar } from './microNarrativeGrammar.js';
import { getBrandCampaignHistorySummary } from '../../site00-brand-lore/brandCreativeContext/campaignHistoryStore.js';

export function enrichWorldCandidate(
  candidate: CampaignWorldCandidate,
  input: Pick<WorldGenesisInput, 'brandSlug' | 'productCategory' | 'brandContext' | 'objective'>,
): CampaignWorldCandidate {
  const profile = productWorldInteractionEngine.buildInteractionProfile(
    `${input.brandSlug}-${input.productCategory}`,
    input.productCategory,
  );

  const bridge = productWorldInteractionEngine.buildInteractionBridgeFromCandidate(candidate, profile);
  const leapTrace = productWorldInteractionEngine.buildCreativeLeapTrace(candidate, profile);
  const worldDistance = inferWorldDistanceFromChain(candidate.associationChain.connectiveLogic, candidate.setting);

  const behaviorLed = candidate.humanExpression.movement.length > 0 || candidate.humanExpression.gesture.length > 0;
  const naturalVisibility = scoreNaturalProductVisibility({
    behaviorLed,
    presentationPose: /centered|hero|present/i.test(candidate.productIntegration.join(' ')),
    actionStopsForProduct: false,
  });

  const propCount = candidate.propSystem.length;
  const shotCount = candidate.efficiencyEnrichment?.oneShotPotential.viable ? 1 : Math.min(4, 3 + (candidate.tier === 'WILD_CARD' ? 1 : 0));
  const productionComplexity = scoreProductionComplexity({
    locationCount: 1,
    subjectCount: 1,
    propCount,
    cameraSetupCount: shotCount <= 1 ? 1 : 2,
    shotCount,
    effectCount: candidate.tier === 'WILD_CARD' ? 1 : 0,
  });

  const copyNative = !candidate.copyLanguage.some((c) => /luxury that moves|timeless luxury|elevate your/i.test(c));
  const extensibility = scoreCampaignExtensibility(candidate.motifs.length, true);

  const conceptualEfficiency = scoreConceptualEfficiency({
    productionComplexity,
    conceptualYield: candidate.conceptualYield,
    narrativeClarity: candidate.convergenceMap.convergenceCount >= 8 ? 0.85 : 0.6,
    productClarity: naturalVisibility.overall,
    motifCount: candidate.motifs.length,
    copyNative,
    worldClarity: worldDistance !== 'LITERAL' ? 0.8 : 0.45,
    memorability: candidate.originality,
    extensibility: extensibility.overall,
  });

  const categoryDependency = scoreCategoryEnvironmentDependency({
    setting: candidate.setting,
    productCategory: input.productCategory,
    worldDistance,
  });

  const oneShot = assessOneShotPotential({
    conceptClarity: candidate.conceptualYield.overall,
    productVisibility: naturalVisibility.overall,
    worldClarity: worldDistance !== 'LITERAL' ? 0.85 : 0.5,
    memorability: candidate.originality,
  });

  const conceptValueRatio = computeConceptValueRatio({
    conceptualYield: candidate.conceptualYield.overall,
    conceptualEfficiency: conceptualEfficiency.overall,
    brandSpecificity: candidate.brandFit,
    productInteractionNaturalness: naturalVisibility.overall,
    productionComplexity: productionComplexity.overall,
  });

  const visibilityThroughBehavior = buildProductVisibilityThroughBehavior({
    behavior: bridge.behavior,
    moment: candidate.productIntegration[0] ?? `${profile.productCategory} visible during ${bridge.behavior}`,
    naturalness: naturalVisibility.overall,
  });

  const densityElements = [
    { name: candidate.motifs[0] ?? 'motif', roles: ['WORLD', 'MOTIF', 'COPY'] },
    { name: candidate.setting, roles: ['WORLD', 'BEHAVIOR', 'CAMERA'] },
    ...candidate.propSystem.slice(0, 2).map((p) => ({
      name: p,
      roles: candidate.motifs.some((m) => p.toLowerCase().includes(m.toLowerCase().split(' ')[0]!))
        ? ['PROP', 'MOTIF', 'BEHAVIOR']
        : ['PROP'],
    })),
  ];

  const elementUtilities = [
    scoreCreativeElementUtility(candidate.setting, 'LOCATION', ['WORLD', 'MOTIF', 'BEHAVIOR']),
    ...candidate.propSystem.slice(0, 3).map((p) =>
      scoreCreativeElementUtility(
        p,
        'PROP',
        candidate.motifs.some((m) => p.toLowerCase().includes(m.toLowerCase().split(' ')[0]!))
          ? ['WORLD', 'MOTIF', 'BEHAVIOR']
          : ['PROP'],
      ),
    ),
    scoreCreativeElementUtility(candidate.campaignTitleLanguage, 'COPY', ['COPY', 'WORLD']),
  ];

  const grammar = selectMicroNarrativeGrammar({ ...candidate, efficiencyEnrichment: undefined });
  const executionLevel: ExecutionLevel =
    productionComplexity.level === 'LOW' && conceptualEfficiency.overall >= 0.7 ? 'LEAN' : 'STANDARD';

  const enrichment: ConceptualEfficiencyEnrichment = {
    interactionProfile: profile,
    interactionBridge: bridge,
    creativeLeapTrace: leapTrace,
    visibilityThroughBehavior,
    naturalProductVisibility: naturalVisibility,
    categoryEnvironmentDependency: categoryDependency,
    conceptualEfficiency,
    productionComplexity,
    conceptValueRatio,
    minimalExecution: buildMinimalExecutionConcept({ candidate, durationSeconds: reelDurationForGrammar(grammar), shotCount: oneShot.viable ? 1 : 3 }),
    microNarrativeGrammar: grammar,
    bodyStorySurfaces: productWorldInteractionEngine.buildBodyStorySurfaceMap(candidate, profile),
    cameraEconomy: scoreCameraEconomy(oneShot.viable ? 1 : 2, candidate.conceptualYield.overall),
    oneShotPotential: oneShot,
    conceptualDensity: scoreConceptualDensity(densityElements),
    elementUtilities,
    extensibility,
    loopability: scoreLoopability(oneShot.viable, candidate.humanExpression.movement[0] ?? ''),
    executionLevel,
    forcedPlacementFlags: detectForcedProductPlacement(candidate.productIntegration.join(' ')),
    worldDistance,
  };

  return { ...candidate, efficiencyEnrichment: enrichment };
}

export function enrichWorldCandidates(
  candidates: CampaignWorldCandidate[],
  input: Pick<WorldGenesisInput, 'brandSlug' | 'productCategory' | 'brandContext' | 'objective'>,
): CampaignWorldCandidate[] {
  const history = input.brandContext?.campaignHistory ?? getBrandCampaignHistorySummary(input.brandSlug);
  void history;
  return candidates.map((c) => enrichWorldCandidate(c, input));
}

export function sortByConceptValue(candidates: CampaignWorldCandidate[]): CampaignWorldCandidate[] {
  return [...candidates].sort(
    (a, b) =>
      (b.efficiencyEnrichment?.conceptValueRatio.overall ?? 0) - (a.efficiencyEnrichment?.conceptValueRatio.overall ?? 0),
  );
}

export function countNonLiteralBeautyWorlds(candidates: CampaignWorldCandidate[]): number {
  const literal = /SALON|BATHROOM|VANITY|WIG|BEAUTY STUDIO|GETTING READY/i;
  return candidates.filter((c) => !literal.test(c.setting)).length;
}

export function runForensicBenchmarkScoring(
  forensic: CampaignWorldCandidate,
  weak: CampaignWorldCandidate,
  productCategory: ProductCategory,
): {
  forensicEnriched: CampaignWorldCandidate;
  weakEnriched: CampaignWorldCandidate;
  forensicQuadrant: string;
  weakQuadrant: string;
} {
  const base = { brandSlug: 'forensic', productCategory, objective: 'LAUNCH' as const, brandContext: null };
  const forensicEnriched = enrichWorldCandidate(forensic, base);
  const weakEnriched = enrichWorldCandidate(weak, base);
  return {
    forensicEnriched,
    weakEnriched,
    forensicQuadrant: forensicEnriched.efficiencyEnrichment?.conceptValueRatio.quadrant ?? '',
    weakQuadrant: weakEnriched.efficiencyEnrichment?.conceptValueRatio.quadrant ?? '',
  };
}
