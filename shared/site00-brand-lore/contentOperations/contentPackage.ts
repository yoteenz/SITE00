/**
 * Social content package + carousel/reel/story/caption contracts.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  CarouselSequencePlan,
  ContentOpportunity,
  NDXCaptionContract,
  NDXReelExpressionContract,
  NDXStoryExpressionContract,
  SocialContentPackage,
} from './types.js';
import type { ContentChannelDecision, ContentFormatDecision } from './types.js';
import { buildContentCTA } from './ctaPolicy.js';
import { evaluateContentRisk } from './contentRisk.js';
import { buildEvidenceRequirement } from './researchEvidence.js';
import { classifyClaim } from './researchEvidence.js';
import { determineResearchDepth } from './researchEvidence.js';
import { formulateCharacterEventFromOpportunity, formulateContentThesisFromOpportunity } from './characterEventProduction.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildCarouselSequencePlan(packageId: string): CarouselSequencePlan {
  return {
    packageId,
    usesSequenceCreativeSystem: true,
    firstSlideRole: 'HOOK_CHARACTER_EVENT',
    middleRoles: ['EVIDENCE', 'INVESTIGATION', 'CONNECTION', 'DEVELOPMENT'],
    endRole: 'OPEN_QUESTION',
    frameCount: 5,
    sequenceCreativeSystemId: null,
  };
}

export function buildReelContract(packageId: string): NDXReelExpressionContract {
  return {
    packageId,
    structure: [
      'STIMULUS',
      'PAUSE',
      'NOTICE',
      'REWIND',
      'SOURCE',
      'SECOND SOURCE',
      'CONNECTION',
      'REACTION',
      'RESOLUTION / OPEN QUESTION',
    ],
    beats: ['Show thinking over time — not animated carousel'],
    mustNotBeCarouselAnimation: true,
    supportedMedia: ['screen evidence', 'archival footage', 'typography', 'diagrams', 'captions'],
  };
}

export function buildStoryContract(packageId: string): NDXStoryExpressionContract {
  return {
    packageId,
    mode: 'LIVE_REACTION',
    resolutionExpectation: 'Less resolved than feed — REACTION_ONLY or QUESTION_OPEN',
    mustNotBeCompressedFeed: true,
  };
}

export function buildCaptionContract(params: {
  packageId: string;
  resolutionState: string;
  thesisSummary: string;
}): NDXCaptionContract {
  const style =
    params.resolutionState === 'REACTION_ONLY'
      ? 'ONE_LINE_REACTION'
      : params.resolutionState === 'QUESTION_OPEN'
        ? 'QUESTION_ONLY'
        : 'SHORT_CONTEXT';
  return {
    packageId: params.packageId,
    style,
    text: params.thesisSummary.slice(0, 120),
    derivedFrom: ['character temperature', 'resolution state', 'content thesis', 'channel'],
  };
}

export function buildSocialContentPackage(params: {
  projectId: string;
  opportunity: ContentOpportunity;
  channel: ContentChannelDecision;
  format: ContentFormatDecision;
}): SocialContentPackage {
  const event = formulateCharacterEventFromOpportunity(params.opportunity);
  const depth = determineResearchDepth(params.opportunity);
  const thesis = formulateContentThesisFromOpportunity(params.opportunity, event.id, depth);
  const packageId = `scp-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const claims = [
    classifyClaim({
      text: thesis.centralClaim ?? thesis.centralQuestion ?? params.opportunity.summary,
      status: thesis.resolutionState === 'STRONG_CONCLUSION' ? 'FACT' : 'HYPOTHESIS',
      confidence: thesis.confidence === 'HIGH' ? 'HIGH' : 'MEDIUM',
    }),
  ];

  const pkg: SocialContentPackage = {
    id: packageId,
    projectId: params.projectId,
    opportunityId: params.opportunity.id,
    characterEventId: event.id,
    contentThesisId: thesis.id,
    channel: params.channel.channel,
    format: params.format.format,
    coverArtifactId: null,
    sequencePlan: params.format.format === 'CAROUSEL' ? buildCarouselSequencePlan(packageId) : null,
    caption: buildCaptionContract({
      packageId,
      resolutionState: thesis.resolutionState,
      thesisSummary: thesis.whatNDXNoticed,
    }),
    storyCopy: params.channel.channel === 'INSTAGRAM_STORY' ? ['wait.', 'look at this.'] : [],
    reelContract: params.format.format === 'REEL' ? buildReelContract(packageId) : null,
    storyContract: params.channel.channel === 'INSTAGRAM_STORY' ? buildStoryContract(packageId) : null,
    onScreenCopy: [],
    voiceoverScript: null,
    cta: buildContentCTA({ packageId, format: params.format.format, resolution: thesis.resolutionState }),
    altText: params.opportunity.subject,
    metadata: { behavioralModeId: thesis.behavioralModeId },
    sourceLinks: [],
    evidenceManifest: buildEvidenceRequirement({ thesisId: thesis.id, opp: params.opportunity, depth }),
    claimClassifications: claims,
    factCheckStatus: claims.some((c) => c.confidence === 'UNVERIFIED') ? 'REVIEW' : 'PASS',
    riskStatus: evaluateContentRisk({ contentId: packageId, opp: params.opportunity }),
    assets: [],
    generationReceipts: [],
    calendarStatus: 'FORMULATING',
    status: 'FORMULATED',
    founderJudgment: null,
    fingerprint: '',
    createdAt: now,
    updatedAt: now,
  };
  pkg.fingerprint = fp(pkg);
  return pkg;
}

export function carouselUsesSequenceCreativeSystem(plan: CarouselSequencePlan | null): boolean {
  return plan?.usesSequenceCreativeSystem === true;
}

export function marketingContentThesisRequired(pkg: SocialContentPackage): boolean {
  return Boolean(pkg.contentThesisId && pkg.characterEventId);
}

export function storyCanRemainUnresolved(contract: NDXStoryExpressionContract | null): boolean {
  return contract?.resolutionExpectation.includes('Less resolved') ?? false;
}
