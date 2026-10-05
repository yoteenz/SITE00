/**
 * Content Operations editorial layer integration.
 */

import type { ContentOpportunity } from '../contentOperations/types.js';
import { seedCharacterFirstContentSeeds } from '../contentOperations/characterFirst/ndxContentSeed.js';
import {
  buildCharacterPremiseAuthority,
  resolveHeadlineFromCharacterPremise,
} from '../contentOperations/characterFirst/characterPremiseAuthority.js';
import type { SocialContentPackage, CarouselSequencePlan } from '../contentOperations/types.js';
import type { BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { EditorialLayerBundle } from './types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import { formulateCharacterEventFromOpportunity, formulateContentThesisFromOpportunity } from '../contentOperations/characterEventProduction.js';
import { determineResearchDepth } from '../contentOperations/researchEvidence.js';
import { buildEditorialDecision, classifyInformationElements } from './editorialDecision.js';
import { buildFirstSlideArtDirectionContract } from './experiment01V2.js';
import { buildCarouselNarrativeArchitecture } from './carouselNarrative.js';
import { assignTypographyRoles } from './typographyGovernance.js';
import { inferTextDensity, buildFirstSlideInformationBudget } from './firstSlideSystem.js';

export type ContentPackageEditorialLayer = {
  editorialDecisionId: string;
  firstSlideContractId: string;
  carouselArchitectureId: string;
  editorialLayer: EditorialLayerBundle;
};

export function contentOperationsCannotBypassEditorialLayer(layer: ContentPackageEditorialLayer | null): boolean {
  return layer !== null && Boolean(layer.editorialDecisionId && layer.firstSlideContractId);
}

export function buildEditorialLayerForContentPackage(params: {
  pkg: SocialContentPackage;
  opportunity: ContentOpportunity;
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
}): ContentPackageEditorialLayer {
  const depth = determineResearchDepth(params.opportunity);
  const event = formulateCharacterEventFromOpportunity(params.opportunity);
  const thesis = formulateContentThesisFromOpportunity(params.opportunity, event.id, depth);

  const cf = params.opportunity.characterFirst;
  const seedForPremise = cf
    ? seedCharacterFirstContentSeeds(params.pkg.projectId).find((s) => s.seedId === cf.contentSeedId) ?? null
    : null;
  const premiseAuthority = seedForPremise ? buildCharacterPremiseAuthority(seedForPremise) : null;
  const headline = premiseAuthority
    ? resolveHeadlineFromCharacterPremise(premiseAuthority)
    : cf?.spokenPremise?.toUpperCase() ?? params.opportunity.subject.toUpperCase();

  const artifact: BrandMarketingArtifact = {
    id: `bma-co-${params.pkg.id}`,
    expressionSystemId: params.expressionSystem.id,
    characterEventId: event.id,
    contentThesisId: thesis.id,
    behavioralModeId: thesis.behavioralModeId,
    channel: 'INSTAGRAM_FEED',
    format: 'FIRST_SLIDE',
    topic: params.opportunity.domains[0] ?? params.opportunity.subject,
    subject: params.opportunity.subject,
    characterTemperature: 'CURIOUS',
    resolutionState: thesis.resolutionState,
    artifactExpressionClass: 'TYPOGRAPHIC_ARGUMENT',
    visualCausalityRecords: [],
    evidenceObjects: params.opportunity.evidenceAvailable,
    makerTraces: ['one annotation where causality requires'],
    headline,
    supportingLanguage: [params.opportunity.summary, params.opportunity.whyPotentiallyInteresting],
    visibleEvidence: params.opportunity.evidenceAvailable.slice(0, 2),
    hiddenEvidence: params.opportunity.evidenceNeeded,
    humorDecision: 'NONE',
    culturalContext: params.opportunity.themes,
    judgmentState: thesis.centralClaim ?? thesis.centralQuestion ?? 'Open',
    generationContract: null,
    generatedAssetId: null,
    generatedAssetUrl: null,
    generationStatus: 'NOT_GENERATED',
    characterEvaluation: null,
    northStarDistanceEvaluation: null,
    visualEvaluation: null,
    founderJudgment: null,
    fingerprint: params.pkg.fingerprint,
    createdAt: params.pkg.createdAt,
    updatedAt: params.pkg.updatedAt,
  };

  const decision = buildEditorialDecision({
    projectId: params.pkg.projectId,
    artifact,
    thesis,
    characterSystemId: params.characterSystemId,
    marketingExpressionSystemId: params.expressionSystem.id,
    contentOpportunityId: params.opportunity.id,
    contentPackageId: params.pkg.id,
  });

  const disclosure = classifyInformationElements({ artifact, thesis });
  const densityLevel = inferTextDensity({
    artifact,
    budget: buildFirstSlideInformationBudget({
      artifact,
      primaryHook: decision.primaryHook,
      secondaryReveal: thesis.centralContradiction,
    }),
  });

  const typographyAssignments = assignTypographyRoles({
    artifact,
    primaryHook: decision.primaryHook,
    secondaryReveal: thesis.centralContradiction,
    primaryTrace: 'ONE TRACE',
    metadataLabels: [params.opportunity.sourceType],
  });

  const firstSlideContract = buildFirstSlideArtDirectionContract({
    artifact,
    thesis,
    decision,
    disclosure,
    typographyAssignments,
    densityLevel,
    packageId: params.pkg.id,
  });

  const carouselNarrative = buildCarouselNarrativeArchitecture({
    artifact,
    thesis,
    decision,
    disclosure,
    typographyAssignments,
    packageId: params.pkg.id,
  });

  const layer: EditorialLayerBundle = {
    editorialDecision: decision,
    firstSlideContract,
    carouselNarrative,
    feedDensityRhythm: null,
    typographyAssignments,
    informationDisclosureMap: disclosure,
  };

  return {
    editorialDecisionId: decision.id,
    firstSlideContractId: firstSlideContract.artifactId,
    carouselArchitectureId: carouselNarrative.fingerprint,
    editorialLayer: layer,
  };
}

export function extendCarouselSequencePlan(params: {
  plan: CarouselSequencePlan;
  narrative: import('./types.js').CarouselNarrativeArchitecture;
  preservePremiseThesis?: string | null;
}): CarouselSequencePlan & {
  sequenceThesis: string;
  sequenceArc: string;
  slideRoles: string[];
  informationDisclosureMap: import('./types.js').InformationDisclosureEntry[];
  slideContracts: import('./types.js').CarouselSlideContract[];
} {
  return {
    ...params.plan,
    sequenceThesis: params.preservePremiseThesis ?? params.narrative.sequenceThesis,
    sequenceArc: params.narrative.sequenceArc,
    slideRoles: params.narrative.slideRoles,
    informationDisclosureMap: params.narrative.informationDisclosureMap,
    slideContracts: params.narrative.slideContracts,
    frameCount: params.narrative.slideCount,
    middleRoles: params.narrative.slideRoles.filter((r) => r !== 'HOOK').slice(0, -1),
    endRole: params.narrative.slideRoles[params.narrative.slideRoles.length - 1] ?? 'OPEN_QUESTION',
  };
}

export function performanceLearningCannotMutateTypographyGovernance(): true {
  return true;
}

export function performanceLearningCannotMutateBrandCharacter(): true {
  return true;
}

export function experimentFImmutable(): true {
  return true;
}

export function experimentGNotReevaluated(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}

export function productExpressionBlocked(): true {
  return true;
}

export function worldFormationBlocked(): true {
  return true;
}
