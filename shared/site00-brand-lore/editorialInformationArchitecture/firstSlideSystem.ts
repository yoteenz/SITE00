/**
 * First-slide semantic role, information budget, hierarchy.
 */

import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { MarketingContentThesis } from '../brandMarketingExpression/types.js';
import type {
  FirstSlideInformationBudget,
  FirstSlideSemanticRole,
  TextDensityLevel,
} from './types.js';

export function inferFirstSlideSemanticRole(params: {
  artifact: BrandMarketingArtifact;
  thesis: MarketingContentThesis;
}): FirstSlideSemanticRole {
  const { resolutionState, behavioralModeId } = params.artifact;
  const headline = params.artifact.headline.toUpperCase();

  if (resolutionState === 'SELF_CORRECTION') return 'SELF_CORRECTION';
  if (resolutionState === 'CALLBACK') return 'CALLBACK';
  if (resolutionState === 'QUESTION_OPEN' || headline.includes('?')) return 'QUESTION';
  if (params.thesis.centralContradiction) return 'CONTRADICTION';
  if (behavioralModeId.includes('receipt')) return 'RECEIPT';
  if (behavioralModeId.includes('connection')) return 'COMPARISON';
  if (behavioralModeId.includes('rabbit-hole')) return 'DISCOVERY';
  if (behavioralModeId.includes('side-eye')) return 'PROVOCATION';
  if (behavioralModeId.includes('translation')) return 'JUDGMENT';
  if (behavioralModeId.includes('failed-promise')) return 'CONTRADICTION';
  if (behavioralModeId.includes('cultural')) return 'JUDGMENT';
  if (headline.endsWith('.')) return 'OBSERVATION';
  if (resolutionState === 'INVESTIGATION_IN_PROGRESS') return 'OPEN_LOOP';
  if (resolutionState === 'STRONG_CONCLUSION') return 'DECLARATION';
  return 'OBSERVATION';
}

export function everyFirstSlideHasOneSemanticRole(role: FirstSlideSemanticRole): boolean {
  return role !== undefined && role !== null;
}

export function buildFirstSlideInformationBudget(params: {
  artifact: BrandMarketingArtifact;
  primaryHook: string;
  secondaryReveal: string | null;
}): FirstSlideInformationBudget {
  const headlineCount = params.secondaryReveal ? 2 : 1;
  const primaryEvidence = Math.min(params.artifact.visibleEvidence.length, 2);
  const supportingEvidence = Math.min(Math.max(params.artifact.evidenceObjects.length - primaryEvidence, 0), 2);
  const traceClusters = params.artifact.makerTraces.length > 0 ? 1 : 0;
  const secondaryTraces = Math.min(Math.max(params.artifact.makerTraces.length - 1, 0), 1);

  const violations: string[] = [];
  if (headlineCount > 2) violations.push('Too many competing headlines');
  if (primaryEvidence > 2) violations.push('Too much primary evidence on slide 1');
  if (traceClusters > 1) violations.push('Too many trace clusters');
  if (params.artifact.supportingLanguage.length > 3) violations.push('Excessive microcopy');
  if (params.artifact.evidenceObjects.length > 4) violations.push('Report compressed onto slide 1');

  return {
    primaryHeadlineCount: headlineCount,
    primaryEvidenceObjects: primaryEvidence,
    supportingEvidenceObjects: supportingEvidence,
    primaryTraceClusters: traceClusters,
    secondaryTraceClusters: secondaryTraces,
    metadataZones: 1,
    longParagraphs: 0,
    fullResearchExplanations: 0,
    fullSourceLists: 0,
    multiParagraphAnalysis: 0,
    fullMethodologyExplanation: 0,
    fullCarouselConclusion: 0,
    withinBudget: violations.length === 0,
    violations,
  };
}

export function firstSlideCannotContainUnrestrictedEvidence(budget: FirstSlideInformationBudget): boolean {
  return budget.primaryEvidenceObjects <= 2 && budget.fullSourceLists === 0;
}

export function inferTextDensity(params: {
  artifact: BrandMarketingArtifact;
  budget: FirstSlideInformationBudget;
}): TextDensityLevel {
  const score =
    params.budget.primaryHeadlineCount +
    params.budget.primaryEvidenceObjects +
    params.budget.supportingEvidenceObjects +
    params.budget.primaryTraceClusters +
    params.budget.secondaryTraceClusters;

  if (params.artifact.artifactExpressionClass === 'MINIMAL_REACTION') return 'SPARSE';
  if (score <= 2) return 'SPARSE';
  if (score <= 4) return 'LIGHT';
  if (score <= 6) return 'MODERATE';
  if (score <= 8) return 'DENSE';
  return 'ARCHIVAL_DENSE';
}

export function denseFirstSlideRequiresJustification(
  density: TextDensityLevel,
  justified: boolean,
): boolean {
  if (density === 'ARCHIVAL_DENSE') return false;
  if (density === 'DENSE') return justified;
  return true;
}

export function firstSlidesDefaultAwayFromArchivalDense(density: TextDensityLevel): boolean {
  return density !== 'ARCHIVAL_DENSE';
}

export function sparseArtifactsAllowed(density: TextDensityLevel): boolean {
  return density === 'SPARSE' || density === 'LIGHT';
}

export function sparseCannotBecomeGenericQuoteCard(params: {
  density: TextDensityLevel;
  semanticRole: FirstSlideSemanticRole;
  hasTrace: boolean;
}): boolean {
  if (params.density !== 'SPARSE') return true;
  return params.semanticRole !== 'OBSERVATION' || params.hasTrace;
}
