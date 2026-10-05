/**
 * Editorial Decision — messy thinking ≠ messy communication.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { EditorialDecision, InformationDisclosureEntry } from './types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { MarketingContentThesis } from '../brandMarketingExpression/types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildEditorialDecision(params: {
  projectId: string;
  artifact: BrandMarketingArtifact;
  thesis: MarketingContentThesis;
  characterSystemId: string;
  marketingExpressionSystemId: string;
  contentOpportunityId?: string | null;
  contentPackageId?: string | null;
}): EditorialDecision {
  const now = new Date().toISOString();
  const primaryHook = params.artifact.headline.toUpperCase();
  const decision: EditorialDecision = {
    id: `ed-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    contentOpportunityId: params.contentOpportunityId ?? null,
    contentPackageId: params.contentPackageId ?? null,
    characterSystemId: params.characterSystemId,
    marketingExpressionSystemId: params.marketingExpressionSystemId,
    primaryObservation: params.thesis.whatNDXNoticed,
    primaryQuestion: params.thesis.centralQuestion,
    primaryJudgment: params.thesis.centralClaim,
    primaryContradiction: params.thesis.centralContradiction,
    primaryHook,
    viewerShouldNoticeFirst: primaryHook,
    supportingEvidence: params.artifact.visibleEvidence.slice(0, 2),
    secondaryEvidence: params.artifact.hiddenEvidence.slice(0, 2),
    deferredEvidence: [
      ...params.thesis.evidenceRequirements,
      ...params.artifact.evidenceObjects.slice(2),
      params.thesis.whatNDXInvestigated,
      params.thesis.whatNDXFound,
    ].filter(Boolean),
    requiredContext: [params.artifact.topic, params.artifact.subject],
    optionalContext: params.thesis.culturalContext,
    firstSlidePurpose: 'Make the viewer notice one thing first — then earn the sequence',
    sequencePurpose: 'Progressively reveal evidence, contradiction, investigation, synthesis, judgment',
    informationPriorityMap: {
      [primaryHook]: 'LEVEL_1',
    },
    fingerprint: '',
    createdAt: now,
    updatedAt: now,
  };
  decision.fingerprint = fp(decision);
  return decision;
}

export function viewerShouldNoticeFirstRequired(decision: EditorialDecision): boolean {
  return decision.viewerShouldNoticeFirst.trim().length > 0;
}

export function classifyInformationElements(params: {
  artifact: BrandMarketingArtifact;
  thesis: MarketingContentThesis;
}): InformationDisclosureEntry[] {
  const entries: InformationDisclosureEntry[] = [
    {
      element: params.artifact.headline,
      classification: 'FIRST_SLIDE_REQUIRED',
      reason: 'Primary hook — Level 1 hierarchy',
    },
  ];

  if (params.artifact.visibleEvidence[0]) {
    entries.push({
      element: params.artifact.visibleEvidence[0]!,
      classification: 'FIRST_SLIDE_OPTIONAL',
      reason: 'Primary evidence — max 0-2 on slide 1',
    });
  }

  for (const ev of params.artifact.visibleEvidence.slice(1)) {
    entries.push({
      element: ev,
      classification: 'SEQUENCE_EVIDENCE',
      reason: 'Deferred — does not need to be on slide 1',
    });
  }

  for (const req of params.thesis.evidenceRequirements) {
    entries.push({
      element: req,
      classification: 'SEQUENCE_EVIDENCE',
      reason: 'Research residue belongs in sequence',
    });
  }

  if (params.thesis.whatNDXFound) {
    entries.push({
      element: params.thesis.whatNDXFound,
      classification: 'SEQUENCE_SYNTHESIS',
      reason: 'Full conclusion deferred to later slides',
    });
  }

  if (params.thesis.whatNDXInvestigated) {
    entries.push({
      element: params.thesis.whatNDXInvestigated,
      classification: 'SEQUENCE_CONTEXT',
      reason: 'Methodology explanation deferred',
    });
  }

  for (const src of params.artifact.evidenceObjects) {
    entries.push({
      element: src,
      classification: entries.some((e) => e.element === src && e.classification.startsWith('FIRST'))
        ? 'FIRST_SLIDE_OPTIONAL'
        : 'SEQUENCE_EVIDENCE',
      reason: 'Source material distributed across sequence',
    });
  }

  entries.push({
    element: 'full source list',
    classification: 'REMOVE',
    reason: 'Full source lists cannot default to slide 1',
  });

  entries.push({
    element: 'full methodology explanation',
    classification: 'REMOVE',
    reason: 'Methodology belongs in sequence or caption',
  });

  return entries;
}

export function longResearchCannotDefaultToSlide1(entries: InformationDisclosureEntry[]): boolean {
  return !entries.some(
    (e) =>
      e.classification === 'FIRST_SLIDE_REQUIRED' &&
      /full (research|methodology|source list)/i.test(e.element),
  );
}

export function fullSourceListCannotDefaultToSlide1(entries: InformationDisclosureEntry[]): boolean {
  return !entries.some(
    (e) => e.classification === 'FIRST_SLIDE_REQUIRED' && /full source list/i.test(e.element),
  );
}
