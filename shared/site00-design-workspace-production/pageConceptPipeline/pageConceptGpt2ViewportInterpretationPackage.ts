/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1 — Tablet/Desktop GPT2 interpretation packages.
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageExperienceExpressionContract } from './pageConceptViewportAuthorityFamily.js';

export const PAGE_GPT2_TABLET_INTERPRETATION_PROMPT_VERSION = 'page-gpt2-tablet-interpretation-v1';
export const PAGE_GPT2_DESKTOP_INTERPRETATION_PROMPT_VERSION = 'page-gpt2-desktop-interpretation-v1';

export const GPT2_TABLET_MODEL = 'gpt2-viewport-tablet-v1';
export const GPT2_DESKTOP_MODEL = 'gpt2-viewport-desktop-v1';

export type PageGpt2ViewportInterpretationTarget = 'TABLET' | 'DESKTOP';

export type PageGpt2ViewportInterpretationPackage = {
  prompt: string;
  mobileAuthorityBase64: string;
  promptVersion: string;
  model: string;
  target: PageGpt2ViewportInterpretationTarget;
  lineage: {
    selectedMobileConceptId: string;
    mobileArtifactId: string;
    tabletInterpretationId: string | null;
    cgptBriefId: string;
    experienceExpressionContractId: string;
    skinContractVersion: string;
    functionContractVersion: string;
  };
};

export function buildPageGpt2ViewportInterpretationPackage(input: {
  target: PageGpt2ViewportInterpretationTarget;
  mobileAuthorityBase64: string;
  selectedMobileConceptId: string;
  mobileArtifactId: string;
  mobileRationale: string;
  tabletInterpretationId: string | null;
  tabletArtifactBase64: string | null;
  creativeInjection: PageCreativeInjection;
  cgptBrief: PageConceptCgptCreativeBrief;
  functionContract: PageFunctionContract;
  skinContract: ProjectSkinContract;
  experienceContract: PageExperienceExpressionContract;
  pageContextSummary: string;
  pageContentSummary: string;
}): PageGpt2ViewportInterpretationPackage {
  const promptVersion =
    input.target === 'TABLET' ?
      PAGE_GPT2_TABLET_INTERPRETATION_PROMPT_VERSION
    : PAGE_GPT2_DESKTOP_INTERPRETATION_PROMPT_VERSION;
  const model = input.target === 'TABLET' ? GPT2_TABLET_MODEL : GPT2_DESKTOP_MODEL;

  const taskLine =
    input.target === 'TABLET' ?
      'INTERPRET THE SELECTED MOBILE CONCEPT FOR TABLET. Do not resize. Do not invent a new territory.'
    : 'INTERPRET THE SAME CONCEPT FOR DESKTOP. Exploit width while preserving the selected concept family.';

  const tabletRef =
    input.target === 'DESKTOP' && input.tabletArtifactBase64 ?
      'Use approved Tablet interpretation expansion logic as secondary reference — Mobile remains authority.'
    : '';

  const prompt = [
    `GPT2 VIEWPORT FAMILY — ${input.target} AUTHORED INTERPRETATION`,
    taskLine,
    tabletRef,
    '',
    'MOBILE AUTHORITY (PRIORITY 1 — visual territory):',
    input.mobileRationale,
    '',
    'CGPT BRIEF:',
    input.cgptBrief.creativePremise,
    input.cgptBrief.pageStory,
    input.cgptBrief.compositionStrategy,
    '',
    'EXPERIENCE EXPRESSION (overlays / states):',
    input.experienceContract.overlayPatterns.join('\n'),
    '',
    'SKIN CONTRACT:',
    input.skinContract.brandSignals.join(' · '),
    input.skinContract.palette.join(' · '),
    `FORBIDDEN DRIFT: ${input.skinContract.forbiddenDrift.join(' · ')}`,
    '',
    'FUNCTION + CONTENT (preserve behavior, not live aesthetics):',
    input.functionContract.regions.join(' · '),
    input.functionContract.interactions.join(' · '),
    input.pageContextSummary,
    input.pageContentSummary,
    '',
    'CURRENT IMPLEMENTATION: functional reference only — NEVER visual authority.',
    input.creativeInjection.immutableRequirements.join(' · '),
  ]
    .filter(Boolean)
    .join('\n');

  return {
    prompt,
    mobileAuthorityBase64: input.mobileAuthorityBase64,
    promptVersion,
    model,
    target: input.target,
    lineage: {
      selectedMobileConceptId: input.selectedMobileConceptId,
      mobileArtifactId: input.mobileArtifactId,
      tabletInterpretationId: input.tabletInterpretationId,
      cgptBriefId: input.cgptBrief.briefId,
      experienceExpressionContractId: input.experienceContract.contractId,
      skinContractVersion: input.skinContract.version,
      functionContractVersion: input.functionContract.version,
    },
  };
}
