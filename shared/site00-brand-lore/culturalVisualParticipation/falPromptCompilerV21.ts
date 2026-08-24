/**
 * FAL prompt compiler V2.1 — cultural / human / artistic subject matter.
 */

import { createHash } from 'node:crypto';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import type { AmendedFirstSlideContract } from './types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import { FAL_CULTURAL_PROMPT_SECTION_ORDER } from './constants.js';

export function compileCulturalFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  contract: AmendedFirstSlideContract;
}): MarketingFalPromptContract {
  const c = params.contract;
  const cp = c.culturalParticipation;
  const vsm = cp.visualSubjectMatterDecision;
  const culturalSubject = cp.culturalVisualEvidence[0]?.subjectDescription ?? vsm.culturalVisualSubject;

  const sections = [
    `WHAT HAPPENED: ${params.artifact.topic} — ${params.artifact.subject}`,
    `WHAT NDX NOTICED: ${params.artifact.supportingLanguage[0] ?? c.primaryHook}`,
    `THE SINGLE PRIMARY EDITORIAL IDEA: ${c.viewerShouldNoticeFirst}`,
    `WHAT THE VIEWER SHOULD NOTICE FIRST: ${vsm.imageHero || vsm.objectHero ? culturalSubject : c.viewerShouldNoticeFirst}`,
    `CULTURAL / HUMAN / ARTISTIC SUBJECT MATTER: ${culturalSubject}`,
    `WHY THAT VISUAL SUBJECT BELONGS: ${cp.whyImageBelongs ?? vsm.whyImageBelongs ?? 'N/A'}`,
    `IMAGE PARTICIPATION MODE: ${cp.visualParticipationMode.replace(/_/g, ' ')}`,
    `FIRST-SLIDE SEMANTIC ROLE: ${c.semanticRole}`,
    `INFORMATION HIERARCHY: Level 1: ${c.primaryHook}; Level 2: ${c.secondaryReveal ?? 'subordinate'}; image/type balance per mode`,
    `PRIMARY EVIDENCE (max 0-2 on slide 1): ${c.primaryEvidence.join('; ') || 'minimal'}`,
    `DEFERRED EVIDENCE: ${c.deferredEvidence.slice(0, 4).join('; ')}`,
    `NDX TRACE: ${c.primaryTrace}`,
    `TYPOGRAPHIC ROLE ASSIGNMENTS: ${c.typographyAssignments.map((t) => `${t.role}: ${t.text.slice(0, 50)}`).join('; ')}`,
    `UPPERCASE GOVERNANCE: ALL NDX-AUTHORED TEXT UPPERCASE. Source images preserve authentic mixed case.`,
    `IMAGE / TYPE BALANCE: ${cp.visualParticipationMode} — ${vsm.imageHero ? 'IMAGE HERO + SMALLER DISPLAY' : vsm.objectHero ? 'OBJECT HERO' : 'typography may co-lead or lead'}`,
    `READING PATH: 1: ${c.readingPath.firstLook} → 2: ${c.readingPath.secondLook} → 3: ${c.readingPath.thirdLook}`,
    `DENSITY TARGET: ${c.textDensity.level}`,
    `PLAYFULNESS / EMOTIONAL TARGET: ${cp.playfulnessTarget}`,
    `MATERIAL CONDITIONS: Preserve black/cream/lime expression world from V1 — controlled character`,
    `COMPOSITIONAL CONDITIONS: ${c.compositionIntent}. Cultural visual matter participates in thesis — NOT decoration.`,
    `LIME FUNCTION: ${c.limeFunction ?? 'restrained intervention'}`,
    `PHOTOGRAPHIC / ILLUSTRATIVE: ${cp.photographyBehavior ?? 'topic-specific'} — conceptual/editorial photography permitted; generated = ARTISTIC_INTERPRETATION not factual evidence`,
    `CULTURAL REFERENCE DISCIPLINE: No random celebrity; no reference stuffing; no fake historical sources; provenance required for cultural sources`,
    `NEGATIVE CONSTRAINTS: ${[...c.negativeConstraints, 'no wall of text', 'no research-report composition', 'no random celebrity', 'no irrelevant model portrait', 'no random nostalgia', 'no generic stock photo', 'no text dominating every composition', 'no fake factual evidence'].join('; ')}`,
  ];

  const prompt = sections.join('\n\n');
  const negativePrompt =
    'wall of text, research report, dashboard, infographic overload, random celebrity, irrelevant model portrait, random nostalgia, decorative cultural references, generic stock photo, forced diversity imagery, fake historical photo, fake magazine cover, fake endorsement, text-only every slide, document-heavy every slide, Swiss corporate minimalism';

  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_CULTURAL_PROMPT_SECTION_ORDER],
  };
}

export function culturalFalPromptUpdated(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('CULTURAL / HUMAN / ARTISTIC SUBJECT MATTER');
}
