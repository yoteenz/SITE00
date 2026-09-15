import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ImplementationTranslationBrief } from '../p0vrTwinV30R8M2R2/implementationTranslationBriefTypes.js';
import type { VisualReconstructionPlan } from './actualFirstTypes.js';
import { ACTUAL_FIRST_PROMPT_OPENING, TRANSLATION_BRIEF_EXPLANATORY_PREFIX } from './constants.js';
import type { ActualFirstVisualReconstructionPrompt } from './actualFirstTypes.js';

export function buildActualFirstVisualReconstructionPrompt(input: {
  brief: ImplementationTranslationBrief;
  plan: VisualReconstructionPlan;
  actualContentHash: string;
  blueprintContentHash: string;
}): ActualFirstVisualReconstructionPrompt {
  const explanatoryBrief = input.brief.sectionTranslations
    .map((s) => `${TRANSLATION_BRIEF_EXPLANATORY_PREFIX}\n${s.implementationGuidance}`)
    .join('\n\n');

  const fullText = [
    ACTUAL_FIRST_PROMPT_OPENING,
    '',
    'DO NOT DESIGN A PAGE FROM THE DESCRIPTION.',
    '',
    'LOOK AT THE ACTUAL IMAGE AND COPY ITS:',
    '- COMPOSITION',
    '- PROPORTIONS',
    '- VISUAL WEIGHT',
    '- ALIGNMENT',
    '- SPACING',
    '- TYPOGRAPHY HIERARCHY',
    '- CONTROL HIERARCHY',
    '- ASSET PLACEMENT',
    '- COLOR BALANCE',
    '- MATERIAL TREATMENT',
    '',
    'USE THE BLUEPRINT TO UNDERSTAND GEOMETRY.',
    'USE THE TRANSLATION BRIEF TO UNDERSTAND WHAT YOU ARE LOOKING AT.',
    'USE THE STRUCTURED PACKAGE TO BIND CORRECT FUNCTION AND DATA.',
    '',
    'WHEN THE DESCRIPTION AND THE VISIBLE ACTUAL DIFFER IN APPEARANCE, FOLLOW THE ACTUAL.',
    'DO NOT USE THE ACTUAL IMAGE ITSELF AS A RUNTIME RASTER.',
    'RECREATE IT WITH REAL DOM/CSS AND CANONICAL ASSETS.',
    '',
    `ACTUAL_CONTENT_HASH:${input.actualContentHash}`,
    `BLUEPRINT_CONTENT_HASH:${input.blueprintContentHash}`,
    '',
    'RECONSTRUCTION PLAN:',
    input.plan.pageComposition,
    '',
    'EXPLANATORY TRANSLATION (NOT VISUAL AUTHORITY):',
    explanatoryBrief.slice(0, 8000),
  ].join('\n');

  return {
    id: `afvrp-${fnv1aHex(fullText).slice(0, 12)}`,
    fullText,
    hash: fnv1aHex(fullText),
    injected: true,
  };
}

/** Appearance conflicts: Actual wins over brief prose (function/data exceptions handled elsewhere). */
export function resolveVisualAuthorityConflict(input: {
  briefAppearanceHint: string;
  actualAppearanceHint: string;
}): string {
  if (input.briefAppearanceHint.trim() !== input.actualAppearanceHint.trim()) {
    return input.actualAppearanceHint;
  }
  return input.actualAppearanceHint;
}
