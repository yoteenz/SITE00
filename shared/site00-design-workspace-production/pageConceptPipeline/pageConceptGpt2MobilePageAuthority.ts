/**
 * GPT2 Step 2 — page authority contract (not NBP rendition, not poster graphics).
 */

import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptRenditionSlotId } from './types.js';

export const PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION = 'page-gpt2-mobile-page-authority-v5-distinction-fix';

export const PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE =
  'DUAL_REFERENCE_FUNCTIONAL_PAGE_PLUS_CONTINUITY' as const;

export type PageGpt2MobileCaptureInfluenceMode = typeof PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE;

/** Bottom strip fraction of viewport height — sole allowed visual inheritance from capture. */
export const PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION = 0.22;

export const PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS: Record<PageMobileConceptSlotId, string> = {
  MOBILE_CONCEPT_A: 'GPT2 MOBILE PAGE CONCEPT A',
  MOBILE_CONCEPT_B: 'GPT2 MOBILE PAGE CONCEPT B',
  MOBILE_CONCEPT_C: 'GPT2 MOBILE PAGE CONCEPT C',
};

export function gpt2MobileConceptRenditionSlot(slot: PageMobileConceptSlotId): PageConceptRenditionSlotId {
  if (slot === 'MOBILE_CONCEPT_A') return 'RENDITION_A';
  if (slot === 'MOBILE_CONCEPT_B') return 'RENDITION_B';
  return 'RENDITION_C';
}

export type PageGpt2MobileArtifactDebug = {
  stage: 'GPT2_MOBILE_PAGE_CONCEPT';
  provider: 'GPT2_MOBILE';
  transport: 'FAL';
  captureInfluenceMode: PageGpt2MobileCaptureInfluenceMode;
  bottomContinuityApplied: boolean;
  bottomContinuityFraction: number;
  territoryLabel: string;
  territoryDirective: string;
  pageValidityPass: boolean;
  posterDriftWarning: boolean;
  screenshotOverreachWarning: boolean;
  conceptContractVersion: string;
  effectivePromptVersion: string;
  nbpPathGuard: 'BLOCKED';
  pageStructureContractIncluded: boolean;
  pageArchitectureBriefId?: string;
  regionMapVersion?: string;
  bottomContinuityContractId?: string;
  navigationContractId?: string;
  scrollNarrativeId?: string;
  pageArchitectureValidation?: 'PASS' | 'PAGE_ARCHITECTURE_VALIDATION_FAILED';
  pageArchitectureDebugLines?: readonly string[];
  compiledPromptVersion?: string;
  compiledPromptHash?: string;
  compiledPromptCharCount?: number;
  providerPromptSafeLimit?: number;
  compiledProviderPromptPreview?: string;
  providerReferenceInputs?: readonly {
    role: string;
    assetId: string;
    sourcePath: string;
    width: number;
    height: number;
  }[];
  providerImageRoleSummary?: string;
  conceptTerritoryLabel?: string;
  conceptThemeClass?: string;
  uppercaseContractApplied?: boolean;
  conceptDiversityContractApplied?: boolean;
  lightFamilyContractApplied?: boolean;
  bottomNavInherited?: boolean;
};

export const PAGE_GPT2_MOBILE_PAGE_STRUCTURE_REQUIREMENTS = [
  'mobile website page concept (full viewport screen in a digital product)',
  'page masthead / opening read region',
  'main structured content region with real hierarchy',
  'evidence or content field with section rhythm',
  'interaction affordance cues (tappable rows, nav, actions — not decorative only)',
  'bottom continuity region aligned to host shell (subordinate but present)',
] as const;

export const PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES = [
  'poster',
  'flyer',
  'campaign graphic',
  'infographic',
  'moodboard tile',
  'book cover',
  'social graphic',
  'presentation board',
  'abstract identity card',
  'static visual essay plate',
  'brochure spread',
] as const;

export function assertGpt2MobilePackageNotNbpPath(input: {
  promptVersion: string;
  stageContract: string;
  providerLabel: string;
}): void {
  if (input.providerLabel === 'NBP') {
    throw new Error('GPT2_MOBILE_NBP_PATH_LEAK: STEP_2 must not use NBP provider label');
  }
  if (input.stageContract !== 'GPT2_MOBILE_PAGE_AUTHORITY') {
    throw new Error('GPT2_MOBILE_NBP_PATH_LEAK: invalid stage contract');
  }
  if (input.promptVersion.includes('nbp') || input.promptVersion.includes('NBP')) {
    throw new Error('GPT2_MOBILE_NBP_PATH_LEAK: prompt version must not reference NBP');
  }
}

export function buildGpt2MobileArtifactDebug(input: {
  slot: PageMobileConceptSlotId;
  territoryDirective: string;
  bottomContinuityApplied: boolean;
  pageValidityPass: boolean;
  posterDriftWarning?: boolean;
  screenshotOverreachWarning?: boolean;
  pageArchitectureBriefId?: string;
  regionMapVersion?: string;
  bottomContinuityContractId?: string;
  navigationContractId?: string;
  scrollNarrativeId?: string;
  pageArchitectureValidation?: 'PASS' | 'PAGE_ARCHITECTURE_VALIDATION_FAILED';
  pageArchitectureDebugLines?: readonly string[];
  compiledPromptVersion?: string;
  compiledPromptHash?: string;
  compiledPromptCharCount?: number;
  providerPromptSafeLimit?: number;
  compiledProviderPromptPreview?: string;
  providerReferenceInputs?: readonly {
    role: string;
    assetId: string;
    sourcePath: string;
    width: number;
    height: number;
  }[];
  providerImageRoleSummary?: string;
  conceptTerritoryLabel?: string;
  conceptThemeClass?: string;
  uppercaseContractApplied?: boolean;
  conceptDiversityContractApplied?: boolean;
  lightFamilyContractApplied?: boolean;
  bottomNavInherited?: boolean;
}): PageGpt2MobileArtifactDebug {
  return {
    stage: 'GPT2_MOBILE_PAGE_CONCEPT',
    provider: 'GPT2_MOBILE',
    transport: 'FAL',
    captureInfluenceMode: PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
    bottomContinuityApplied: input.bottomContinuityApplied,
    bottomContinuityFraction: PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION,
    territoryLabel: PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS[input.slot],
    territoryDirective: input.territoryDirective,
    pageValidityPass: input.pageValidityPass,
    posterDriftWarning: input.posterDriftWarning === true,
    screenshotOverreachWarning: input.screenshotOverreachWarning === true,
    conceptContractVersion: PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
    effectivePromptVersion: PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
    nbpPathGuard: 'BLOCKED',
    pageStructureContractIncluded: true,
    pageArchitectureBriefId: input.pageArchitectureBriefId,
    regionMapVersion: input.regionMapVersion,
    bottomContinuityContractId: input.bottomContinuityContractId,
    navigationContractId: input.navigationContractId,
    scrollNarrativeId: input.scrollNarrativeId,
    pageArchitectureValidation: input.pageArchitectureValidation,
    pageArchitectureDebugLines: input.pageArchitectureDebugLines,
    compiledPromptVersion: input.compiledPromptVersion,
    compiledPromptHash: input.compiledPromptHash,
    compiledPromptCharCount: input.compiledPromptCharCount,
    providerPromptSafeLimit: input.providerPromptSafeLimit,
    compiledProviderPromptPreview: input.compiledProviderPromptPreview,
    providerReferenceInputs: input.providerReferenceInputs,
    providerImageRoleSummary: input.providerImageRoleSummary,
    conceptTerritoryLabel: input.conceptTerritoryLabel,
    conceptThemeClass: input.conceptThemeClass,
    uppercaseContractApplied: input.uppercaseContractApplied,
    conceptDiversityContractApplied: input.conceptDiversityContractApplied,
    lightFamilyContractApplied: input.lightFamilyContractApplied,
    bottomNavInherited: input.bottomNavInherited,
  };
}
