/**
 * P0.CGO.2 — Conceptual efficiency, production complexity, and related scores.
 */

import type { CampaignWorldCandidate, ConceptualYieldScore, ProductCategory } from './types.js';
import type {
  CameraEconomyScore,
  CampaignExtensibilityScore,
  CategoryEnvironmentDependencyScore,
  ConceptualDensityScore,
  ConceptualEfficiencyScore,
  ConceptValueRatio,
  CreativeElementUtility,
  ForcedPlacementFlag,
  LoopabilityScore,
  MinimalExecutionConcept,
  NaturalProductVisibilityScore,
  OneShotCampaignPotential,
  ProductionComplexityLevel,
  ProductionComplexityScore,
  ProductVisibilityThroughBehavior,
  YieldEfficiencyQuadrant,
  WorldCategoryDistance,
} from './conceptualEfficiencyTypes.js';
import { LITERAL_BEAUTY_WORLDS } from './conceptualEfficiencyTypes.js';

export function scoreNaturalProductVisibility(input: {
  behaviorLed: boolean;
  presentationPose: boolean;
  actionStopsForProduct: boolean;
}): NaturalProductVisibilityScore {
  let overall = 0.5;
  if (input.behaviorLed) overall += 0.35;
  if (input.presentationPose) overall -= 0.4;
  if (input.actionStopsForProduct) overall -= 0.25;
  overall = Math.max(0, Math.min(1, overall));
  return {
    overall: Math.round(overall * 100) / 100,
    classification: overall >= 0.75 ? 'HIGH' : overall >= 0.5 ? 'MEDIUM' : 'LOW',
    reason: input.behaviorLed
      ? 'Product becomes visible because action naturally exposes it'
      : 'Product visibility relies on presentation pose',
  };
}

export function detectForcedProductPlacement(description: string): ForcedPlacementFlag[] {
  const flags: ForcedPlacementFlag[] = [];
  const d = description.toLowerCase();
  if (/present.*product|hold.*toward camera|product hero|centered product/i.test(d)) {
    flags.push('MODEL_PRESENTATION_POSE', 'PRODUCT_CENTERED_NO_BEHAVIOR');
  }
  if (/irrelevant prop|random prop/i.test(d)) flags.push('IRRELEVANT_PROP');
  if (/inserted after|added in post/i.test(d)) flags.push('PRODUCT_INSERTED_POST_CONCEPT');
  if (/stops.*show product|freeze.*reveal/i.test(d)) flags.push('ACTION_STOPS_FOR_PRODUCT');
  if (/backdrop only|never intersect/i.test(d)) flags.push('WORLD_PRODUCT_NEVER_INTERSECT');
  return [...new Set(flags)];
}

export function scoreCategoryEnvironmentDependency(input: {
  setting: string;
  productCategory: ProductCategory;
  worldDistance: WorldCategoryDistance;
}): CategoryEnvironmentDependencyScore {
  const setting = input.setting.toUpperCase();
  const cat = input.productCategory;
  let literalMatch = false;
  if (cat === 'JEWELRY' && /JEWEL|VANITY|DRESSING|LUXURY STUDIO/i.test(setting)) literalMatch = true;
  if (cat === 'HAIR' && LITERAL_BEAUTY_WORLDS.some((w) => setting.includes(w.replace(' ', '')))) literalMatch = true;

  const distancePenalty: Record<WorldCategoryDistance, number> = {
    LITERAL: 0.85,
    ADJACENT: 0.55,
    LATERAL: 0.25,
    UNEXPECTED: 0.15,
    ABSURD: 0.2,
  };

  let overall = literalMatch ? 0.9 : distancePenalty[input.worldDistance] ?? 0.4;
  if (!literalMatch && input.worldDistance !== 'LITERAL') overall = Math.min(overall, 0.35);

  return {
    overall: Math.round(overall * 100) / 100,
    classification: overall >= 0.7 ? 'HIGH_DEPENDENCY' : overall <= 0.35 ? 'INDEPENDENT' : 'INTERACTION_LED',
  };
}

export function scoreProductionComplexity(input: {
  locationCount: number;
  subjectCount: number;
  propCount: number;
  cameraSetupCount: number;
  shotCount: number;
  effectCount: number;
}): ProductionComplexityScore {
  const weighted =
    input.locationCount * 0.2 +
    input.subjectCount * 0.15 +
    input.propCount * 0.1 +
    input.cameraSetupCount * 0.15 +
    input.shotCount * 0.25 +
    input.effectCount * 0.15;

  let level: ProductionComplexityLevel = 'LOW';
  if (weighted >= 3.5) level = 'EXTREME';
  else if (weighted >= 2.5) level = 'HIGH';
  else if (weighted >= 1.5) level = 'MEDIUM';

  return {
    level,
    overall: Math.round(Math.min(1, weighted / 4) * 100) / 100,
    ...input,
  };
}

export function scoreConceptualEfficiency(input: {
  productionComplexity: ProductionComplexityScore;
  conceptualYield: ConceptualYieldScore;
  narrativeClarity: number;
  productClarity: number;
  motifCount: number;
  copyNative: boolean;
  worldClarity: number;
  memorability: number;
  extensibility: number;
}): ConceptualEfficiencyScore {
  const prodPenalty = input.productionComplexity.overall;
  const meaning =
    input.conceptualYield.overall * 0.25 +
    input.narrativeClarity * 0.12 +
    input.productClarity * 0.12 +
    Math.min(1, input.motifCount / 4) * 0.12 +
    (input.copyNative ? 0.1 : 0.03) +
    input.worldClarity * 0.12 +
    input.memorability * 0.1 +
    input.extensibility * 0.07;

  const complexityDivisor =
    input.productionComplexity.level === 'LOW'
      ? Math.max(0.4, 0.55 + prodPenalty * 0.6)
      : Math.max(0.5, 1 + prodPenalty * 2);
  let meaningPerDecision = meaning / complexityDivisor;
  if (input.productionComplexity.level === 'LOW' && meaning >= 0.75) {
    meaningPerDecision *= 1.08;
  }
  const overall = Math.round(Math.min(1, meaningPerDecision * 1.05) * 100) / 100;

  return {
    overall,
    classification: overall >= 0.72 ? 'HIGH_EFFICIENCY' : overall >= 0.45 ? 'MEDIUM_EFFICIENCY' : 'LOW_EFFICIENCY',
    meaningPerDecision: Math.round(meaningPerDecision * 100) / 100,
    narrativeClarity: input.narrativeClarity,
    productClarity: input.productClarity,
    motifYield: Math.min(1, input.motifCount / 5),
    copyYield: input.copyNative ? 0.85 : 0.35,
    worldClarity: input.worldClarity,
    memorability: input.memorability,
    extensibility: input.extensibility,
  };
}

export function computeConceptValueRatio(input: {
  conceptualYield: number;
  conceptualEfficiency: number;
  brandSpecificity: number;
  productInteractionNaturalness: number;
  productionComplexity: number;
}): ConceptValueRatio {
  const numerator =
    input.conceptualYield * 0.3 +
    input.conceptualEfficiency * 0.3 +
    input.brandSpecificity * 0.2 +
    input.productInteractionNaturalness * 0.2;
  const denominator = Math.max(0.2, input.productionComplexity);

  const overall = Math.round((numerator / denominator) * 100) / 100;
  const quadrant = classifyQuadrant(input.conceptualYield, input.conceptualEfficiency);

  return { overall, numerator: Math.round(numerator * 100) / 100, denominator, quadrant };
}

export function classifyQuadrant(yieldScore: number, efficiencyScore: number): YieldEfficiencyQuadrant {
  const highYield = yieldScore >= 0.65;
  const highEff = efficiencyScore >= 0.65;
  if (highYield && highEff) return 'HIGH_YIELD_HIGH_EFFICIENCY';
  if (highYield && !highEff) return 'HIGH_YIELD_LOW_EFFICIENCY';
  if (!highYield && highEff) return 'LOW_YIELD_HIGH_EFFICIENCY';
  return 'LOW_YIELD_LOW_EFFICIENCY';
}

export function buildMinimalExecutionConcept(input: {
  candidate: CampaignWorldCandidate;
  durationSeconds?: number;
  shotCount?: number;
}): MinimalExecutionConcept {
  const c = input.candidate;
  const bridge = c.efficiencyEnrichment?.interactionBridge;
  const complexity = c.efficiencyEnrichment?.productionComplexity.level ?? 'LOW';

  return {
    world: c.setting,
    interactionPoint: bridge?.interactionPoint ?? c.humanExpression.hands[0] ?? 'BODY IN ACTION',
    singleAction: bridge?.requiredAction ?? c.humanExpression.movement[0] ?? 'ONE BEHAVIOR',
    singleVisualHook: c.motifs[0] ?? c.coreConcept,
    singleMotifSystem: c.motifs.slice(0, 2).join(' + ') || c.coreConcept,
    singleCopyHook: c.campaignTitleLanguage,
    singlePayoff: c.productIntegration[0] ?? 'Product visible through action',
    durationSeconds: input.durationSeconds ?? (complexity === 'LOW' ? 6 : 12),
    shotCount: input.shotCount ?? (c.efficiencyEnrichment?.oneShotPotential.viable ? 1 : 3),
    productionComplexity: complexity,
    conceptualYield: c.conceptualYield.overall,
    conceptualEfficiency: c.efficiencyEnrichment?.conceptualEfficiency.overall ?? 0.5,
  };
}

export function scoreCameraEconomy(cameraDecisions: number, communicationStrength: number): CameraEconomyScore {
  const economy = communicationStrength / Math.max(1, cameraDecisions);
  return {
    overall: Math.round(Math.min(1, economy) * 100) / 100,
    cameraDecisions,
    communicationStrength,
  };
}

export function assessOneShotPotential(input: {
  conceptClarity: number;
  productVisibility: number;
  worldClarity: number;
  memorability: number;
}): OneShotCampaignPotential {
  const avg = (input.conceptClarity + input.productVisibility + input.worldClarity + input.memorability) / 4;
  const viable = avg >= 0.72;
  return {
    viable,
    confidence: Math.round(avg * 100) / 100,
    reason: viable
      ? 'Concept clarity, product visibility, world clarity, and memorability support single-shot execution'
      : 'Concept needs sequence to communicate',
    suggestedDurationSeconds: viable ? 5 : 15,
  };
}

export function scoreConceptualDensity(elements: Array<{ name: string; roles: string[] }>): ConceptualDensityScore {
  if (!elements.length) return { overall: 0, averageRolesPerElement: 0, highDensityElements: [] };
  const avg = elements.reduce((s, e) => s + e.roles.length, 0) / elements.length;
  const highDensityElements = elements.filter((e) => e.roles.length >= 3).map((e) => e.name);
  return {
    overall: Math.round(Math.min(1, avg / 4) * 100) / 100,
    averageRolesPerElement: Math.round(avg * 100) / 100,
    highDensityElements,
  };
}

export function scoreCreativeElementUtility(
  element: string,
  elementType: CreativeElementUtility['elementType'],
  rolesServed: string[],
): CreativeElementUtility {
  return {
    element,
    elementType,
    rolesServed,
    utilityScore: Math.round(Math.min(1, rolesServed.length / 4) * 100) / 100,
  };
}

export function scoreCampaignExtensibility(motifCount: number, oneLocation: boolean): CampaignExtensibilityScore {
  const derivatives = ['STORY_CROP', 'STILL', 'DETAIL_CROP', 'LOOP', 'TEASER', 'TITLE_CARD'];
  const overall = (motifCount >= 2 ? 0.5 : 0.3) + (oneLocation ? 0.35 : 0.15);
  return {
    overall: Math.round(Math.min(1, overall) * 100) / 100,
    derivativeAssets: derivatives,
  };
}

export function scoreLoopability(naturalReturn: boolean, motionType: string): LoopabilityScore {
  const windOrRhythm = /wind|sway|loop|turn|platform|elevator/i.test(motionType);
  const overall = naturalReturn || windOrRhythm ? 0.82 : 0.45;
  return {
    overall: Math.round(overall * 100) / 100,
    naturalLoop: naturalReturn || windOrRhythm,
    reason: naturalReturn ? 'End state returns to start state' : windOrRhythm ? 'Cyclic motion supports loop' : 'Linear narrative — weak loop',
  };
}

export function buildProductVisibilityThroughBehavior(input: {
  behavior: string;
  moment: string;
  naturalness: number;
}): ProductVisibilityThroughBehavior {
  return {
    behavior: input.behavior,
    productVisibilityMoment: input.moment,
    visibilityDuration: input.naturalness >= 0.8 ? 'SUSTAINED' : 'BRIEF',
    naturalness: input.naturalness,
    memorability: Math.min(1, input.naturalness + 0.1),
    cameraRequirement: input.naturalness >= 0.75 ? 'LOCKED' : 'FOLLOW',
    productionComplexity: input.naturalness >= 0.75 ? 'LOW' : 'MEDIUM',
  };
}

export function inferWorldDistanceFromChain(connectiveLogic: string, setting: string): WorldCategoryDistance {
  const upper = `${connectiveLogic} ${setting}`.toUpperCase();
  if (/ABSURD|SURREAL/i.test(upper)) return 'ABSURD';
  if (/TRANSIT|ROOFTOP|GAME|WAGER|POOL HALL|ELEVATOR|DANCE|LIBRARY|CAFE|RECEIPT/i.test(upper)) return 'LATERAL';
  if (/VANITY|SALON|STUDIO|LOBBY|HOTEL/i.test(upper)) return 'ADJACENT';
  if (/PRODUCT ONLY|STYLISH LOCATION/i.test(upper)) return 'LITERAL';
  return 'LATERAL';
}
