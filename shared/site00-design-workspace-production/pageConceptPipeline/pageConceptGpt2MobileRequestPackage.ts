/**
 * GPT2 Mobile concept FAL request package — three territories, one CGPT brief.
 */

import type {
  PageConceptCgptCreativeBrief,
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
} from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import { buildPageConceptGpt2AuthorityPackage } from './pageConceptGpt2AuthorityPackage.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import { PAGE_NBP_MODEL } from './generationPlan.js';

export const PAGE_GPT2_MOBILE_CONCEPT_PROMPT_VERSION = 'page-gpt2-mobile-concept-v1-fal';

export type PageGpt2MobileConceptRequestPackage = {
  prompt: string;
  functionalCaptureBase64: string;
  lineage: {
    runId: string;
    conceptSlot: PageMobileConceptSlotId;
    conceptId: string;
    cgptBriefId: string;
    skinContractVersion: string;
    idempotencyKey: string;
  };
  inspector: {
    currentCaptureRole: 'FUNCTIONAL_CONTEXT_ONLY';
    promptVersion: string;
    model: string;
    territoryDirective: string;
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

  if (input.slot === 'MOBILE_CONCEPT_A') {
    return [
      'CONCEPT TERRITORY A — structured spatial grammar:',
      `Premise anchor: ${premise}.`,
      `Stress ${spatial} with hierarchy led by ${hierarchy}.`,
      `Mobile direction: ${mobileDir}.`,
      'Explore index/ledger-like information architecture — distinct from B and C.',
    ].join(' ');
  }
  if (input.slot === 'MOBILE_CONCEPT_B') {
    return [
      'CONCEPT TERRITORY B — evidence-forward spatial composition:',
      `Premise anchor: ${premise}.`,
      `Asset/evidence strategy: ${asset}.`,
      `Spatial rhythm diverges from A; hierarchy via ${hierarchy}.`,
      'Archival collage / proof-wall energy — not a color swap of A.',
    ].join(' ');
  }
  return [
    'CONCEPT TERRITORY C — publication / dossier monument:',
    `Premise anchor: ${premise}.`,
    `Distinctive move / surprise: ${surprise}.`,
    `Mobile direction: ${mobileDir}.`,
    'Monument typography + narrative spine — maximally divergent from A and B.',
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
  skinContract: ProjectSkinContract;
  functionalCaptureBase64: string;
  pageContextSummary: string;
  mobileViewport: { width: number; height: number };
}): PageGpt2MobileConceptRequestPackage {
  const territoryDirective = mobileConceptTerritoryDirective({
    slot: input.slot,
    injection: input.injection,
    brief: input.cgptBrief,
  });
  const authorityPackage = buildPageConceptGpt2AuthorityPackage({
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    injection: input.injection,
    cgptBrief: input.cgptBrief,
    implementationCaptureNote: 'FUNCTIONAL_CONTEXT_ONLY — never aesthetic authority.',
  });

  const prompt = [
    'GPT2 MOBILE CONCEPT RENDER — produce ONE full mobile viewport concept frame.',
    'ROLE: GPT2 conceptual render. Provider executes via FAL image edit.',
    `SLOT: ${input.slot}`,
    `OUTPUT SIZE: ${input.mobileViewport.width}×${input.mobileViewport.height} (mobile portrait authority).`,
    '',
    territoryDirective,
    '',
    'MANDATORY AUTHORITY HIERARCHY (highest wins on conflict):',
    authorityPackage.creativeAuthorityHierarchy.join(' → '),
    '',
    'GPT2 TASK:',
    String(authorityPackage.payload.gpt2Task ?? ''),
    '',
    'PROJECT + SKIN + CGPT PAYLOAD (JSON — obey literally):',
    JSON.stringify(authorityPackage.payload, null, 0).slice(0, 24000),
    '',
    'PAGE CONTEXT:',
    input.pageContextSummary,
    '',
    'INPUT IMAGE ROLE:',
    'FUNCTIONAL_REFERENCE_CURRENT — required modules/actions/information only.',
    'DO NOT copy palette, card chrome, spacing, or layout clichés from the screenshot.',
    '',
    'Deliver a single strong mobile concept image — not a traced screenshot, not a generic admin UI.',
  ].join('\n');

  return {
    prompt,
    functionalCaptureBase64: input.functionalCaptureBase64,
    lineage: {
      runId: input.runId,
      conceptSlot: input.slot,
      conceptId: input.conceptId,
      cgptBriefId: input.injection.injectionId,
      skinContractVersion: input.skinContract.version,
      idempotencyKey: pageConceptGpt2MobileIdempotencyKey(input.runId, input.slot),
    },
    inspector: {
      currentCaptureRole: 'FUNCTIONAL_CONTEXT_ONLY',
      promptVersion: PAGE_GPT2_MOBILE_CONCEPT_PROMPT_VERSION,
      model: PAGE_NBP_MODEL,
      territoryDirective,
    },
  };
}
