/**
 * GPT2 Mobile PAGE AUTHORITY request package — decoupled from NBP rendition semantics.
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
import { PAGE_GPT2_MOBILE_FAL_MODEL } from './generationPlan.js';
import {
  PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
  PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
  PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS,
  PAGE_GPT2_MOBILE_PAGE_STRUCTURE_REQUIREMENTS,
  assertGpt2MobilePackageNotNbpPath,
} from './pageConceptGpt2MobilePageAuthority.js';

export {
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION as PAGE_GPT2_MOBILE_CONCEPT_PROMPT_VERSION,
} from './pageConceptGpt2MobilePageAuthority.js';

export type PageGpt2MobileConceptRequestPackage = {
  prompt: string;
  bottomContinuityCaptureBase64: string;
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
    currentCaptureRole: 'FUNCTIONAL_CONTEXT_PLUS_BOTTOM_CONTINUITY_ONLY';
    bottomContinuityApplied: boolean;
    promptVersion: string;
    model: string;
    territoryDirective: string;
    territoryLabel: string;
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

function skinBlock(skin: ProjectSkinContract): string {
  return [
    `SKIN ${skin.contractId} v${skin.version}`,
    skin.typography.displayFont,
    skin.typography.bodyFont,
    skin.palette.join(' · '),
    skin.material.join(' · '),
    `FORBIDDEN DRIFT: ${skin.forbiddenDrift.join(' · ')}`,
  ].join('\n');
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
  bottomContinuityCaptureBase64: string;
  bottomContinuityApplied: boolean;
  pageContextSummary: string;
  mobileViewport: { width: number; height: number };
}): PageGpt2MobileConceptRequestPackage {
  const territoryDirective = mobileConceptTerritoryDirective({
    slot: input.slot,
    injection: input.injection,
    brief: input.cgptBrief,
  });
  const territoryLabel = PAGE_GPT2_MOBILE_PAGE_SLOT_LABELS[input.slot];

  const authorityPackage = buildPageConceptGpt2AuthorityPackage({
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    injection: input.injection,
    cgptBrief: input.cgptBrief,
    implementationCaptureNote:
      'FUNCTIONAL_CONTEXT_ONLY — full-page screenshot is NOT composition authority. Only bottom continuity strip may be visually inherited.',
  });

  const prompt = [
    'GPT2 MOBILE WEBSITE PAGE AUTHORITY — generate ONE full mobile viewport PAGE CONCEPT.',
    'THIS IS STEP 2 (GPT2). THIS IS NOT NBP. THIS IS NOT A RENDITION PASS. THIS IS NOT AN IMAGE EDIT OF THE CURRENT PAGE.',
    '',
    `OUTPUT: ${territoryLabel}`,
    `VIEWPORT: ${input.mobileViewport.width}×${input.mobileViewport.height} portrait mobile screen.`,
    '',
    'ROLE REFRAME:',
    'Generate one full mobile viewport WEBSITE PAGE AUTHORITY CONCEPT for the specified live page function.',
    'You are authoring page structure, hierarchy, and interaction logic — not a poster about the brand.',
    '',
    territoryDirective,
    '',
    'AUTHORITY PRIORITY STACK (highest wins):',
    '1. PAGE FUNCTION CONTRACT',
    '2. CGPT CREATIVE SYNTHESIS',
    '3. SKIN / DESIGN-LANGUAGE CONTRACT',
    '4. PAGE FAMILY / HOST FIREWALL (SITE 00 host shell stays structurally true)',
    '5. APPROVED BOTTOM CONTINUITY INHERITANCE (image input — lower strip only)',
    '6. CURRENT SCREENSHOT — FUNCTIONAL CONTEXT ONLY (route, modules, required content — NOT visual layout)',
    '',
    'CAPTURE ZONES:',
    'ZONE A (DISALLOWED): overall composition, hero, macro hierarchy, card/grid from screenshot, palette mimicry.',
    'ZONE B (ALLOWED): page identity, required modules, shell awareness, functional content obligations.',
    'ZONE C (ALLOWED VISUAL): bottom continuity panel / lower shell strip ONLY (attached reference image).',
    '',
    'INPUT IMAGE RULE:',
    input.bottomContinuityApplied ?
      'The attached image is ONLY the bottom continuity strip. Use it ONLY to align lower shell continuity — NOT for hero, body layout, or hierarchy.'
    : 'No bottom continuity image — infer shell continuity from skin + host rules only.',
    'Do NOT recreate, reinterpret, or remix the full current implementation screenshot.',
    '',
    'REQUIRED PAGE STRUCTURE (must be visible in the output):',
    ...PAGE_GPT2_MOBILE_PAGE_STRUCTURE_REQUIREMENTS.map((line) => `- ${line}`),
    '',
    'EXPLICITLY FORBIDDEN (fail if output reads primarily as):',
    ...PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES.map((t) => `- ${t}`),
    '',
    'HOST / CLIENT:',
    '- NDXBOOK (page content language) may dominate inside the product page frame.',
    '- SITE 00 host shell logic remains subordinate but real — not a detached editorial poster universe.',
    '',
    'SKIN CONTRACT:',
    skinBlock(input.skinContract),
    '',
    'CGPT + GPT2 HANDOFF PAYLOAD:',
    JSON.stringify(authorityPackage.payload, null, 0).slice(0, 22000),
    '',
    'PAGE CONTEXT:',
    input.pageContextSummary,
    '',
    'DELIVER: one mobile PAGE concept frame suitable for tablet/desktop interpretation later — twin pipeline only.',
  ].join('\n');

  const pkg: PageGpt2MobileConceptRequestPackage = {
    prompt,
    bottomContinuityCaptureBase64: input.bottomContinuityCaptureBase64,
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
      currentCaptureRole: 'FUNCTIONAL_CONTEXT_PLUS_BOTTOM_CONTINUITY_ONLY',
      bottomContinuityApplied: input.bottomContinuityApplied,
      promptVersion: PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
      model: PAGE_GPT2_MOBILE_FAL_MODEL,
      territoryDirective,
      territoryLabel,
    },
  };

  assertGpt2MobilePackageNotNbpPath({
    promptVersion: pkg.inspector.promptVersion,
    stageContract: pkg.inspector.stageContract,
    providerLabel: pkg.inspector.providerLabel,
  });

  return pkg;
}
