/**
 * Behavior-first FAL prompt compiler V2 — editorial hierarchy governance.
 */

import { createHash } from 'node:crypto';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import type { FirstSlideArtDirectionContract } from './types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import { FAL_EDITORIAL_PROMPT_SECTION_ORDER } from './constants.js';

export function compileEditorialFalPrompt(params: {
  artifact: BrandMarketingArtifact;
  contract: FirstSlideArtDirectionContract;
}): MarketingFalPromptContract {
  const c = params.contract;
  const deferred = c.deferredEvidence.join('; ') || c.informationDisclosure
    .filter((d) => d.classification.startsWith('SEQUENCE') || d.classification === 'CAPTION_ONLY')
    .map((d) => d.element)
    .join('; ');

  const typoRoles = c.typographyAssignments
    .map((a) => `${a.role}: "${a.text}"${a.role === 'SOURCE_TEXT' ? ' (preserve authentic mixed case)' : ''}`)
    .join('\n');

  const sections = [
    `WHAT HAPPENED: ${params.artifact.topic} — ${params.artifact.subject}`,
    `WHAT NDX NOTICED: ${params.artifact.supportingLanguage[0] ?? c.primaryHook}`,
    `THE SINGLE PRIMARY EDITORIAL IDEA: ${c.viewerShouldNoticeFirst}`,
    `WHAT THE VIEWER MUST NOTICE FIRST: ${c.viewerShouldNoticeFirst}`,
    `FIRST-SLIDE SEMANTIC ROLE: ${c.semanticRole.replace(/_/g, ' ')}`,
    `INFORMATION HIERARCHY:\nLEVEL 1 (dominant): ${c.primaryHook}\nLEVEL 2 (subordinate): ${c.secondaryReveal ?? 'none'}\nLEVEL 3 (one trace): ${c.primaryTrace}\nLEVEL 4 (metadata): optional small zones only`,
    `PRIMARY EVIDENCE (max 0-2): ${c.primaryEvidence.join('; ') || 'minimal or none'}`,
    `WHAT INFORMATION IS DELIBERATELY DEFERRED TO SLIDES 2+: ${deferred}`,
    `NDX TRACE (one dominant cluster max): ${c.primaryTrace}${c.optionalSecondaryTrace ? `; optional: ${c.optionalSecondaryTrace}` : ''}`,
    `TYPOGRAPHIC ROLE ASSIGNMENTS:\n${typoRoles}`,
    `UPPERCASE GOVERNANCE: ALL NDX-AUTHORED TEXT UPPERCASE ONLY. Source screenshots/documents may preserve authentic mixed case. Distinguish SOURCE_TEXT from NDX overlays.`,
    `READING PATH:\nFIRST LOOK: ${c.readingPath.firstLook}\nSECOND LOOK: ${c.readingPath.secondLook}\nTHIRD LOOK: ${c.readingPath.thirdLook}\nOPTIONAL: ${c.readingPath.optionalDiscovery}`,
    `DENSITY TARGET: ${c.textDensity.level} — first slide must NOT be a complete information graphic`,
    `MATERIAL CONDITIONS: Preserve black structural field, warm cream/paper, evidence surfaces — same expression world as V1`,
    `COMPOSITIONAL CONDITIONS: ${c.compositionIntent}. Bespoke art-directed first carousel slide — NOT compressed report.`,
    `LIME BEHAVIOR: ${c.limeFunction ? `${c.limeFunction} — selective intervention, NOT default fill` : 'Optional — restrained, semantic purpose only'}`,
    `PHOTOGRAPHIC / RENDERING: Topic-specific evidence for ${params.artifact.topic}. Controlled character, not less character.`,
    `NEGATIVE CONSTRAINTS: ${c.negativeConstraints.join('; ')}`,
  ];

  const prompt = sections.join('\n\n');
  const negativePrompt =
    'infographic overload, report on one page, multiple competing headlines, excessive text boxes, random fonts, mixed typography without role, lowercase NDX copy, sentence-case NDX copy, multiple handwriting identities, unnecessary paragraphs, tiny unreadable copy, decorative annotations, excessive arrows circles, excessive lime, evidence tables without justification, full source lists, multiple conclusions, visual noise, generic social template, generic quote card, corporate infographic, dashboard styling, scrapbook decoration, AI editorial clutter, Swiss corporate minimalism, sanitized NDX';

  return {
    prompt,
    negativePrompt,
    promptHash: createHash('sha256').update(prompt).digest('hex').slice(0, 16),
    sectionOrder: [...FAL_EDITORIAL_PROMPT_SECTION_ORDER],
  };
}

export function editorialFalPromptNotCompleteInformationGraphic(contract: MarketingFalPromptContract): boolean {
  return contract.prompt.includes('NOT be a complete information graphic') || contract.prompt.includes('NOT compressed report');
}

export function falPromptV2SectionOrder(): readonly string[] {
  return FAL_EDITORIAL_PROMPT_SECTION_ORDER;
}
