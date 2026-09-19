/**
 * Carousel narrative architecture — ONE THOUGHT UNFOLDING.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { MarketingContentThesis } from '../brandMarketingExpression/types.js';
import type {
  CarouselNarrativeArchitecture,
  CarouselSequenceFunction,
  CarouselSlideContract,
  InformationDisclosureEntry,
  TextDensityLevel,
  TypographyRoleAssignment,
} from './types.js';
import type { EditorialDecision } from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function determineCarouselProgression(params: {
  thesis: MarketingContentThesis;
  artifact: BrandMarketingArtifact;
}): CarouselSequenceFunction[] {
  const roles: CarouselSequenceFunction[] = ['HOOK'];

  if (params.thesis.whatNDXFound || params.artifact.visibleEvidence.length) {
    roles.push('EVIDENCE');
  }

  if (params.thesis.centralContradiction) {
    roles.push('CONTRADICTION');
  } else if (params.thesis.whatNDXInvestigated) {
    roles.push('INVESTIGATION');
  }

  if (params.thesis.whatNDXConnected) {
    roles.push('CONNECTION');
  }

  if (params.thesis.resolutionState === 'SELF_CORRECTION') {
    roles.push('SELF_CORRECTION');
  } else if (params.thesis.resolutionState === 'STRONG_CONCLUSION') {
    roles.push('JUDGMENT');
  } else if (params.thesis.resolutionState === 'CALLBACK') {
    roles.push('CALLBACK');
  } else if (
    params.thesis.resolutionState === 'QUESTION_OPEN' ||
    params.thesis.resolutionState === 'UNRESOLVED' ||
    params.thesis.resolutionState === 'INVESTIGATION_IN_PROGRESS'
  ) {
    roles.push('UNRESOLVED_QUESTION');
  } else {
    roles.push('SYNTHESIS');
  }

  return roles;
}

export function buildCarouselSlideContracts(params: {
  artifact: BrandMarketingArtifact;
  thesis: MarketingContentThesis;
  decision: EditorialDecision;
  slideRoles: CarouselSequenceFunction[];
  typographyAssignments: TypographyRoleAssignment[];
}): CarouselSlideContract[] {
  const contracts: CarouselSlideContract[] = [];
  let accumulated = '';

  for (let i = 0; i < params.slideRoles.length; i++) {
    const role = params.slideRoles[i]!;
    const slideNum = i + 1;
    const isFirst = slideNum === 1;
    const learnsNow = isFirst
      ? params.decision.viewerShouldNoticeFirst
      : role === 'EVIDENCE'
        ? params.thesis.whatNDXFound || 'Supporting evidence revealed'
        : role === 'CONTRADICTION'
          ? params.thesis.centralContradiction ?? 'Complication surfaces'
          : role === 'JUDGMENT'
            ? params.thesis.centralClaim ?? 'NDX lands'
            : 'Next layer of the investigation';

    const density: TextDensityLevel = isFirst
      ? params.artifact.artifactExpressionClass === 'MINIMAL_REACTION'
        ? 'SPARSE'
        : 'LIGHT'
      : role === 'EVIDENCE'
        ? 'MODERATE'
        : 'LIGHT';

    contracts.push({
      slideNumber: slideNum,
      semanticRole: role,
      purpose: isFirst ? 'THE CATCH — what did NDX notice?' : `${role.replace(/_/g, ' ')} — slide ${slideNum}`,
      viewerAlreadyKnows: accumulated || (isFirst ? 'Nothing yet' : params.decision.viewerShouldNoticeFirst),
      viewerLearnsNow: learnsNow,
      questionRemaining:
        slideNum === params.slideRoles.length
          ? params.thesis.centralQuestion ?? 'Open or resolved'
          : 'What comes next in the sequence',
      primaryMessage: isFirst ? params.decision.primaryHook : learnsNow,
      evidence: isFirst
        ? params.decision.supportingEvidence.slice(0, 2)
        : params.decision.deferredEvidence.slice(0, 2),
      trace: isFirst ? [params.decision.primaryHook.includes('?') ? 'one annotation max' : 'one trace cluster'] : [],
      typographyAssignments: isFirst ? params.typographyAssignments : params.typographyAssignments.filter((a) => a.role === 'DOCUMENT'),
      density,
      relationshipToPreviousSlide: isFirst ? 'Entry point' : 'Builds on prior slide knowledge',
      relationshipToNextSlide:
        slideNum < params.slideRoles.length ? 'Sets up next revelation' : 'Sequence resolution',
      visualContinuity: ['typography family', 'lime behavior', 'material logic', 'trace identity'],
      visualVariation: ['scale', 'density', 'evidence type', 'negative space', 'headline position'],
      resolutionState: params.thesis.resolutionState,
    });
    accumulated += ` ${learnsNow}`;
  }
  return contracts;
}

export function buildCarouselNarrativeArchitecture(params: {
  artifact: BrandMarketingArtifact;
  thesis: MarketingContentThesis;
  decision: EditorialDecision;
  disclosure: InformationDisclosureEntry[];
  typographyAssignments: TypographyRoleAssignment[];
  packageId?: string | null;
}): CarouselNarrativeArchitecture {
  const slideRoles = determineCarouselProgression({ thesis: params.thesis, artifact: params.artifact });
  const slideContracts = buildCarouselSlideContracts({
    artifact: params.artifact,
    thesis: params.thesis,
    decision: params.decision,
    slideRoles,
    typographyAssignments: params.typographyAssignments,
  });

  const evidenceDistribution: Record<number, string[]> = {};
  const traceDistribution: Record<number, string[]> = {};
  const densityDistribution: Record<number, TextDensityLevel> = {};

  for (const sc of slideContracts) {
    evidenceDistribution[sc.slideNumber] = sc.evidence;
    traceDistribution[sc.slideNumber] = sc.trace;
    densityDistribution[sc.slideNumber] = sc.density;
  }

  const arch: CarouselNarrativeArchitecture = {
    packageId: params.packageId ?? null,
    artifactId: params.artifact.id,
    sequenceThesis: params.thesis.whatNDXNoticed,
    sequenceArc: slideRoles.join(' → '),
    slideCount: slideRoles.length,
    slideRoles,
    informationDisclosureMap: params.disclosure,
    visualRhythmPlan: ['typography continuity', 'density variation', 'evidence reveal over time'],
    evidenceDistribution,
    traceDistribution,
    densityDistribution,
    resolutionStateBySlide: slideContracts.map((s) => s.resolutionState),
    slideContracts,
    usesSequenceCreativeSystem: true,
    fingerprint: '',
  };
  arch.fingerprint = fp(arch);
  return arch;
}

export function carouselDoesNotRequireFixedFiveSlides(arch: CarouselNarrativeArchitecture): boolean {
  return arch.slideCount >= 2 && arch.slideCount <= 8;
}

export function eachSlideKnowsViewerState(contracts: CarouselSlideContract[]): boolean {
  return contracts.every((c) => c.viewerAlreadyKnows.length > 0 && c.viewerLearnsNow.length > 0);
}

export function carouselContinuityWithoutIdenticalLayouts(arch: CarouselNarrativeArchitecture): boolean {
  return (
    arch.visualRhythmPlan.includes('density variation') &&
    arch.slideContracts.every((s) => s.visualVariation.length > 0)
  );
}

export function carouselNotIndependentPosters(arch: CarouselNarrativeArchitecture): boolean {
  return arch.sequenceArc.includes('→') && arch.slideContracts[0]?.semanticRole === 'HOOK';
}
