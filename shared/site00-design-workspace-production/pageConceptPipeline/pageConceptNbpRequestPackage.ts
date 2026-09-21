/**
 * Authority-first NBP request package — image order, roles, prompt contract, lineage.
 */

import type {
  PageConceptRenditionSlotId,
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
} from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import {
  PAGE_NBP_PROMPT_VERSION,
  pageConceptNbpOmitCurrentScreenshot,
} from './pageConceptNbpAuthorityPolicy.js';

export type PageNbpImageInputRole =
  | 'VISUAL_AUTHORITY_GPT2'
  | 'BRAND_SYSTEM_REFERENCE'
  | 'FUNCTIONAL_REFERENCE_CURRENT';

export type PageNbpImageInputSpec = {
  role: PageNbpImageInputRole;
  source: string;
  promptDescription: string;
  base64: string;
};

export type PageConceptNbpLineage = {
  authorityApprovalId: string;
  cgptDirectionId: string;
  gpt2AuthorityId: string;
  gpt2AuthorityVersion: string;
  skinContractId: string;
  skinContractVersion: string;
  renditionId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  renditionSlot: PageConceptRenditionSlotId;
};

export type PageConceptNbpPreDispatchInspector = {
  visualAuthorityPresent: boolean;
  skinContractVersion: string;
  cgptDirectionId: string;
  functionContractVersion: string;
  currentScreenshotRole: 'REFERENCE_ONLY' | 'OMITTED';
  imageInputOrder: readonly string[];
  authorityApprovalId: string | null;
  promptVersion: string;
};

export type PageNbpRequestPackage = {
  prompt: string;
  imageInputs: readonly PageNbpImageInputSpec[];
  lineage: PageConceptNbpLineage;
  inspector: PageConceptNbpPreDispatchInspector;
  functionContractText: string;
  omitCurrentScreenshot: boolean;
};

export function parseAuthorityArtifactBase64(authorityArtifact: string | null | undefined): string | null {
  if (!authorityArtifact?.trim()) return null;
  const trimmed = authorityArtifact.trim();
  if (trimmed.startsWith('data:')) {
    const comma = trimmed.indexOf(',');
    if (comma === -1) return null;
    return trimmed.slice(comma + 1);
  }
  return trimmed;
}

function functionContractBlock(contract: PageFunctionContract, pageContextSummary: string): string {
  return [
    'PAGE FUNCTION CONTRACT (structured — preserve function, not current visual design):',
    `Contract ${contract.version} · ${contract.contractId}`,
    `Route: ${contract.route}`,
    `Regions: ${contract.regions.join(' · ')}`,
    `Interactions: ${contract.interactions.join(' · ')}`,
    `Immutable behaviors: ${contract.immutableBehaviors.join(' · ')}`,
    `Responsive: ${contract.responsiveRequirements.join(' · ')}`,
    pageContextSummary,
  ].join('\n');
}

function skinContractBlock(skin: ProjectSkinContract): string {
  return [
    'PROJECT SKIN CONTRACT (typography, palette, material, composition — mandatory):',
    `Skin ${skin.skinName} · ${skin.contractId} · v${skin.version}`,
    `DISPLAY FONT: ${skin.typography.displayFont}`,
    `BODY FONT: ${skin.typography.bodyFont}`,
    `MONO / DATA FONT: ${skin.typography.monoFont}`,
    `PALETTE:\n${skin.palette.join('\n')}`,
    `MATERIAL:\n${skin.material.join('\n')}`,
    `COMPOSITION:\n${skin.composition.join('\n')}`,
    `IMAGERY:\n${skin.imagery.join('\n')}`,
    `COMPONENT EXPRESSION:\n${skin.componentExpression.join('\n')}`,
    `BRAND SIGNALS:\n${skin.brandSignals.join('\n')}`,
    `FORBIDDEN DRIFT (never):\n${skin.forbiddenDrift.join('\n')}`,
  ].join('\n');
}

const PROVIDER_TOP_INSTRUCTION = [
  'THE APPROVED GPT2 AUTHORITY IMAGE IS THE DESIGN AUTHORITY.',
  'RECONSTRUCT THIS PAGE FROM THAT AUTHORITY.',
  'USE THE PROJECT SKIN CONTRACT FOR TYPOGRAPHY, PALETTE, MATERIAL, IMAGE LANGUAGE, SPACING, AND COMPONENT EXPRESSION.',
  'PRESERVE PAGE FUNCTION, NOT THE CURRENT PAGE VISUAL IMPLEMENTATION.',
  'DO NOT RESTYLE OR TRACE THE CURRENT SCREENSHOT.',
  'DO NOT COLLAPSE THE AUTHORITY INTO A GENERIC DASHBOARD.',
].join('\n');

export type BuildPageNbpRequestPackageInput = {
  gpt2Authority: PageGPT2AuthorityConcept;
  creativeInjection: PageCreativeInjection;
  functionContract: PageFunctionContract;
  skinContract: ProjectSkinContract;
  renditionSlot: PageConceptRenditionSlotId;
  renditionDirective: string;
  viewport: 'MOBILE' | 'DESKTOP';
  currentImplementationBase64: string | null;
  pageContextSummary: string;
  authorityApprovalId: string;
  renditionId: string;
};

export function buildPageNbpRequestPackage(input: BuildPageNbpRequestPackageInput): PageNbpRequestPackage {
  const authorityB64 = parseAuthorityArtifactBase64(input.gpt2Authority.authorityArtifact);
  if (!authorityB64) {
    throw new Error('NBP_BLOCKED: GPT2_AUTHORITY_IMAGE_REQUIRED');
  }

  const omitCurrent = pageConceptNbpOmitCurrentScreenshot() || !input.currentImplementationBase64?.trim();
  const imageInputs: PageNbpImageInputSpec[] = [
    {
      role: 'VISUAL_AUTHORITY_GPT2',
      source: `gpt2-authority:${input.gpt2Authority.conceptId}`,
      promptDescription:
        'PRIMARY VISUAL AUTHORITY — reconstruct composition, hierarchy, spatial grammar, typography character, and materiality from this approved concept image.',
      base64: authorityB64,
    },
  ];

  if (!omitCurrent && input.currentImplementationBase64) {
    imageInputs.push({
      role: 'FUNCTIONAL_REFERENCE_CURRENT',
      source: `current-capture:${input.viewport}`,
      promptDescription:
        'FUNCTIONAL REFERENCE ONLY — required modules, actions, and information must remain represented. DO NOT COPY VISUAL DESIGN, COMPOSITION, CARD GEOMETRY, PALETTE, OR SPACING FROM THIS IMAGE. DO NOT RESTYLE THIS SCREENSHOT.',
      base64: input.currentImplementationBase64,
    });
  }

  const lineage: PageConceptNbpLineage = {
    authorityApprovalId: input.authorityApprovalId,
    cgptDirectionId: input.creativeInjection.injectionId,
    gpt2AuthorityId: input.gpt2Authority.conceptId,
    gpt2AuthorityVersion: input.gpt2Authority.groundingPackageVersion ?? PAGE_NBP_PROMPT_VERSION,
    skinContractId: input.skinContract.contractId,
    skinContractVersion: input.skinContract.version,
    renditionId: input.renditionId,
    viewport: input.viewport,
    renditionSlot: input.renditionSlot,
  };

  const prompt = [
    PROVIDER_TOP_INSTRUCTION,
    '',
    'INPUT ROLES:',
    'VISUAL_AUTHORITY: GPT2_AUTHORITY (image #1)',
    'BRAND_SYSTEM: PROJECT_SKIN_CONTRACT',
    'CREATIVE_DIRECTION: CGPT_OUTPUT',
    'FUNCTIONAL_CONTRACT: PAGE_FUNCTION_CONTRACT',
    omitCurrent ? 'CURRENT_IMPLEMENTATION: OMITTED' : 'CURRENT_IMPLEMENTATION: REFERENCE_ONLY (last image if present)',
    `VIEWPORT: ${input.viewport}`,
    `RENDITION: ${input.renditionSlot}`,
    '',
    skinContractBlock(input.skinContract),
    '',
    'CGPT CREATIVE DIRECTION:',
    input.creativeInjection.creativeThesis,
    input.creativeInjection.spatialDirection,
    input.creativeInjection.hierarchyDirection,
    input.creativeInjection.mobileDirection,
    input.creativeInjection.desktopDirection,
    '',
    functionContractBlock(input.functionContract, input.pageContextSummary),
    '',
    'GPT2 AUTHORITY (text reinforcement — image is dominant):',
    `${input.gpt2Authority.name} — ${input.gpt2Authority.premise}`,
    input.gpt2Authority.visualLanguage,
    input.gpt2Authority.compositionStrategy,
    input.gpt2Authority.hierarchyStrategy,
    input.gpt2Authority.brandSignals ? `BRAND SIGNALS: ${input.gpt2Authority.brandSignals}` : '',
    input.gpt2Authority.avoidList ? `AVOID: ${input.gpt2Authority.avoidList}` : '',
    '',
    `RENDITION DIRECTIVE (${input.renditionSlot}): ${input.renditionDirective}`,
    input.viewport === 'MOBILE' ?
      `MOBILE INTERPRETATION: ${input.gpt2Authority.mobileIntent}`
    : `DESKTOP INTERPRETATION: ${input.gpt2Authority.desktopIntent}`,
    '',
    'TASK: RECONSTRUCT A NEW PAGE RENDITION FROM THE APPROVED GPT2 AUTHORITY — NOT an edit/restyle of the current implementation capture.',
    `Package ${PAGE_NBP_PROMPT_VERSION}`,
  ]
    .filter(Boolean)
    .join('\n');

  const inspector: PageConceptNbpPreDispatchInspector = {
    visualAuthorityPresent: true,
    skinContractVersion: input.skinContract.version,
    cgptDirectionId: input.creativeInjection.injectionId,
    functionContractVersion: input.functionContract.version,
    currentScreenshotRole: omitCurrent ? 'OMITTED' : 'REFERENCE_ONLY',
    imageInputOrder: imageInputs.map((img, i) => `${i + 1}. ${img.role}`),
    authorityApprovalId: input.authorityApprovalId,
    promptVersion: PAGE_NBP_PROMPT_VERSION,
  };

  return {
    prompt,
    imageInputs,
    lineage,
    inspector,
    functionContractText: functionContractBlock(input.functionContract, input.pageContextSummary),
    omitCurrentScreenshot: omitCurrent,
  };
}

/** Golden-package test: authority must be image #1; current must never be #1. */
export function assertPageNbpImageHierarchy(package_: PageNbpRequestPackage): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (package_.imageInputs.length === 0) errors.push('NO_IMAGE_INPUTS');
  if (package_.imageInputs[0]?.role !== 'VISUAL_AUTHORITY_GPT2') {
    errors.push('AUTHORITY_NOT_IMAGE_1');
  }
  if (package_.imageInputs.some((img, i) => img.role === 'FUNCTIONAL_REFERENCE_CURRENT' && i === 0)) {
    errors.push('CURRENT_IS_IMAGE_1');
  }
  return { ok: errors.length === 0, errors };
}
