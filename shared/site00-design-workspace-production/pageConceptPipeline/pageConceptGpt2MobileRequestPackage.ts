/**
 * GPT2 Mobile PAGE AUTHORITY request package — decoupled from NBP rendition semantics.
 */

import type {
  PageConceptCgptCreativeBrief,
  PageConceptPageArchitectureBrief,
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
} from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import { resolvePageGpt2MobileFalModel } from './generationPlan.js';
import {
  compileGpt2MobileProviderPrompt,
  type Gpt2MobileCompiledProviderPrompt,
} from './pageConceptGpt2MobileProviderPromptCompiler.js';
import type { Gpt2MobileProviderReferenceBundle } from './pageConceptGpt2MobileReferenceAuthority.js';
import { orderedProviderReferenceAssets } from './pageConceptGpt2MobileReferenceAuthority.js';
import {
  PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
  PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS,
  assertGpt2MobilePackageNotNbpPath,
} from './pageConceptGpt2MobilePageAuthority.js';

export {
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION as PAGE_GPT2_MOBILE_CONCEPT_PROMPT_VERSION,
} from './pageConceptGpt2MobilePageAuthority.js';

export type PageGpt2MobileConceptRequestPackage = {
  prompt: string;
  /** @deprecated use providerReferences */
  bottomContinuityCaptureBase64: string;
  providerReferences: Gpt2MobileProviderReferenceBundle;
  lineage: {
    runId: string;
    conceptSlot: PageMobileConceptSlotId;
    conceptId: string;
    cgptBriefId: string;
    skinContractVersion: string;
    idempotencyKey: string;
  };
  inspector: {
    stageContract: 'GPT2_MOBILE_PAGE_AUTHORITY';
    providerLabel: 'GPT2_MOBILE';
    captureInfluenceMode: typeof PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE;
    currentCaptureRole: typeof PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE;
    bottomContinuityApplied: boolean;
    promptVersion: string;
    model: string;
    territoryDirective: string;
    territoryLabel: string;
    compiledProviderPrompt: Gpt2MobileCompiledProviderPrompt;
    providerImageRoleSummary: string;
  };
};

export function pageConceptGpt2MobileIdempotencyKey(runId: string, slot: PageMobileConceptSlotId): string {
  const letter = slot === 'MOBILE_CONCEPT_A' ? 'A' : slot === 'MOBILE_CONCEPT_B' ? 'B' : 'C';
  return `${runId}:GPT2_MOBILE:${letter}`;
}

export function mobileConceptTerritoryDirective(input: {
  slot: PageMobileConceptSlotId;
  injection: PageCreativeInjection;
  brief: PageConceptCgptCreativeBrief | null;
}): string {
  const premise = input.brief?.creativePremise ?? input.injection.creativeThesis;
  const spatial = input.injection.spatialDirection;
  const hierarchy = input.injection.hierarchyDirection;
  const asset = input.injection.assetStrategy;
  const surprise = input.injection.distinctiveMove ?? input.injection.informationPriority;
  const mobileDir = input.injection.mobileDirection;
  const pageStory = input.brief?.pageStory ?? input.injection.pagePurposeInterpretation;

  if (input.slot === 'MOBILE_CONCEPT_A') {
    return [
      'PAGE TERRITORY A — index/register-first mobile page architecture:',
      `Page story: ${pageStory}. Premise: ${premise}.`,
      `Hierarchy: ${hierarchy}. Spatial grammar: ${spatial}. Mobile: ${mobileDir}.`,
      'Design a navigable mobile PAGE with register/index rhythm — not a poster about the brand.',
    ].join(' ');
  }
  if (input.slot === 'MOBILE_CONCEPT_B') {
    return [
      'PAGE TERRITORY B — declaration-led dossier mobile page:',
      `Premise: ${premise}. Evidence/assets: ${asset}.`,
      `Hierarchy stress: ${hierarchy}. Distinct from Territory A page architecture.`,
      'Structured dossier PAGE with evidence placement — not a campaign graphic.',
    ].join(' ');
  }
  return [
    'PAGE TERRITORY C — evidence-plate structured ledger mobile page:',
    `Premise: ${premise}. Surprise/move: ${surprise}. Mobile: ${mobileDir}.`,
    'Monument typography inside a real page system — not a standalone art plate.',
  ].join(' ');
}

export function buildPageGpt2MobileConceptRequestPackage(input: {
  runId: string;
  slot: PageMobileConceptSlotId;
  conceptId: string;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  injection: PageCreativeInjection;
  cgptBrief: PageConceptCgptCreativeBrief | null;
  pageArchitectureBrief: PageConceptPageArchitectureBrief | null;
  skinContract: ProjectSkinContract;
  providerReferences: Gpt2MobileProviderReferenceBundle;
  pageContextSummary: string;
  mobileViewport: { width: number; height: number };
}): PageGpt2MobileConceptRequestPackage {
  const territoryDirective = mobileConceptTerritoryDirective({
    slot: input.slot,
    injection: input.injection,
    brief: input.cgptBrief,
  });
  const territoryLabel = PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS[input.slot];
  const bottomContinuityApplied = Boolean(
    input.providerReferences.bottomNavAuthority ?? input.providerReferences.continuity,
  );
  const manifest = input.providerReferences.authorityManifest;

  const compiledProviderPrompt = compileGpt2MobileProviderPrompt({
    slot: input.slot,
    cgptBrief: input.cgptBrief,
    pageArchitectureBrief: input.pageArchitectureBrief,
    skinContract: input.skinContract,
    functionContract: input.functionContract,
    pageContext: input.pageContext,
    injection: input.injection,
    bottomContinuityApplied,
    bottomHalfAuthorityAttached: manifest.bottomHalfSourceAttached,
    bottomNavAuthorityAttached: manifest.bottomNavAuthorityAttached,
    bottomContinuityLockActive: manifest.bottomContinuityLockActive,
    mobileViewport: input.mobileViewport,
    referenceImageRoleSummary: input.providerReferences.imageRoleSummary,
    creativeSupportAttached: Boolean(input.providerReferences.creativeSupport),
  });
  const prompt = compiledProviderPrompt.prompt;
  const referenceAssets = orderedProviderReferenceAssets(input.providerReferences);

  const pkg: PageGpt2MobileConceptRequestPackage = {
    prompt,
    bottomContinuityCaptureBase64: input.providerReferences.continuity?.base64 ?? '',
    providerReferences: input.providerReferences,
    lineage: {
      runId: input.runId,
      conceptSlot: input.slot,
      conceptId: input.conceptId,
      cgptBriefId: input.injection.injectionId,
      skinContractVersion: input.skinContract.version,
      idempotencyKey: pageConceptGpt2MobileIdempotencyKey(input.runId, input.slot),
    },
    inspector: {
      stageContract: 'GPT2_MOBILE_PAGE_AUTHORITY',
      providerLabel: 'GPT2_MOBILE',
      captureInfluenceMode: PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
      currentCaptureRole: PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
      bottomContinuityApplied,
      promptVersion: PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
      model: resolvePageGpt2MobileFalModel(referenceAssets.length),
      territoryDirective,
      territoryLabel,
      compiledProviderPrompt,
      providerImageRoleSummary: input.providerReferences.imageRoleSummary,
    },
  };

  assertGpt2MobilePackageNotNbpPath({
    promptVersion: pkg.inspector.promptVersion,
    stageContract: pkg.inspector.stageContract,
    providerLabel: pkg.inspector.providerLabel,
  });

  return pkg;
}
