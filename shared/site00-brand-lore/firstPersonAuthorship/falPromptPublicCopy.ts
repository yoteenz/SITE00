/**
 * FAL public copy sections — internal guidance vs visible artifact copy.
 */

import type { ArtBoardRetainedFirstSlideContract } from '../artBoardMateriality/types.js';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import { stripInternalLabelsFromPublicText } from './ndxPublicCopyTranslation.js';

export function buildFalPublicCopySections(params: {
  artifact: BrandMarketingArtifact;
  contract: ArtBoardRetainedFirstSlideContract;
}): string[] {
  const c = params.contract;
  const cr = c.characterRetention;
  const beatPublic = stripInternalLabelsFromPublicText(cr.primaryCharacterBeat.text ?? c.primaryHook);
  const hookPublic = stripInternalLabelsFromPublicText(c.primaryHook);
  const noticedPublic = stripInternalLabelsFromPublicText(
    params.artifact.supportingLanguage[0] ?? c.primaryHook,
  );

  return [
    'PUBLIC AUTHORSHIP MODE: FIRST-PERSON CHARACTER AUTHORSHIP — THE PAGE MUST FEEL LIKE NDX MADE IT DIRECTLY.',
    'INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY. DO NOT PRINT: CHARACTER BEAT, PRIMARY EDITORIAL IDEA, WHAT NDX NOTICED, WHY NOW, CONTROLLED MISBEHAVIOR, ADDED, ANNOTATION, (SELF_AWARE_COMMENT), OR OTHER PRODUCTION LANGUAGE.',
    'TRANSLATE INTERNAL MEANING INTO NATURAL INTERNALLY-AUTHORED NDX EXPRESSION. VALID PUBLIC COPY EXAMPLES: I WAS WRONG. BE SERIOUS. REMEMBER THIS? WAIT. I HAVE A THEORY.',
    `VISIBLE NDX HEADLINE (UPPERCASE): ${hookPublic}`,
    `VISIBLE NDX CHARACTER EXPRESSION (NO LABEL PREFIX): ${beatPublic}`,
    `VISIBLE NDX REACTION (NO "WHAT NDX NOTICED" LABEL): ${noticedPublic}`,
    'SOURCE VOICE: preserve authentic source text exactly — headlines, quotes, receipts, screenshots. Do NOT convert source text into first-person NDX voice.',
    'NDX VOICE: uppercase-authored copy where governance requires. Source material keeps authentic casing.',
    'FAIL IF: third-person NDX narration, system documentation labels, research report tone, AI summary copy, or meta creative language appears on the artifact.',
  ];
}

export function falPromptBlocksInternalLabelLeakage(sections: string[]): boolean {
  const joined = sections.join('\n');
  return joined.includes('INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY');
}

export function falPromptPreservesArtDirection(sections: string[]): boolean {
  const joined = sections.join('\n');
  return joined.includes('PUBLIC AUTHORSHIP MODE');
}
