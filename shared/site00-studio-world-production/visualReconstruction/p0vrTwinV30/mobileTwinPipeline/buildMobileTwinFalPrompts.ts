import {
  DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
  P0_VR_TWIN_V30R7MF1_LINEAGE,
  P0_VR_TWIN_V30R7MF2_LINEAGE,
  P0_VR_TWIN_V30R7MF3_LINEAGE,
} from '../constants.js';
import {
  ANTI_CLONE_PROHIBITIONS,
  IMPLEMENTATION_RENDER_MUST,
  MOBILE_DESIGN_REFERENCE_AUTHORITY_ROLE,
  MOBILE_IMPLEMENTATION_RENDER_ROLE,
  PRESERVE_VS_EVOLVE_BLOCK,
  REFERENCE_IMAGE_PROVIDER_LABEL,
  REFERENCE_MUST_BE,
  REFERENCE_MUST_NOT_BE,
} from './referenceRoleContracts.js';
import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';

function buildCompositionContractBlock(composition: MobileTwinCompositionState): string {
  const regionSample = composition.regionDefinitions
    .slice(0, 6)
    .map((r) => r.semanticRole)
    .join(', ');
  const featureSample = composition.featureBindings
    .slice(0, 8)
    .map((f) => f.featureId)
    .join(', ');
  return [
    'INPUT PRIORITY (highest first):',
    '1) MobileTwinCompositionState structured truth',
    '2) Feature Manifest bindings',
    '3) Project creative context + host/project contract',
    '4) Design Reference Authority image (guidance only — lowest dominance)',
    '',
    `compositionStateId: ${composition.id}`,
    `compositionHash: ${composition.compositionHash}`,
    `objectDefinitionCount: ${composition.objectDefinitions.length}`,
    `featureBindingCount: ${composition.featureBindings.length}`,
    `hostProjectContractVersion: ${composition.hostProjectContractVersion}`,
    `projectCreativeContextVersion: ${composition.projectCreativeContextVersion}`,
    `regionSemanticSample: ${regionSample || 'MOBILE_DESIGN_WORKSPACE'}`,
    `featureManifestSample: ${featureSample || DESIGN_WORKSPACE_FEATURE_MANIFEST_V1}`,
  ].join('\n');
}

export function buildMobileImplementationRenderFalPrompt(input: {
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  refineNotes?: string[];
  regeneration?: boolean;
}): string {
  const refineBlock =
    input.refineNotes?.length ?
      `\nFOUNDER REFINEMENT (steer away from cloning):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  const regenBlock =
    input.regeneration ?
      '\nREGENERATE: sibling render — preserve composition lineage; anti-clone guard applies.\n'
    : '';
  return [
    `LINEAGE: ${P0_VR_TWIN_V30R7MF2_LINEAGE} (extends ${P0_VR_TWIN_V30R7MF1_LINEAGE})`,
    REFERENCE_IMAGE_PROVIDER_LABEL,
    '',
    `REFERENCE AUTHORITY ROLE: ${MOBILE_DESIGN_REFERENCE_AUTHORITY_ROLE}`,
    `OUTPUT ROLE: ${MOBILE_IMPLEMENTATION_RENDER_ROLE} (Phase A — ACTUAL implementation-ready mobile DESIGN page)`,
    '',
    'TASK: REFERENCE TRANSLATION — create the TRUE MobileImplementationRender.',
    'Use the approved reference for composition/style/hierarchy direction — NOT as a picture to recreate.',
    '',
    'REFERENCE MUST BE:',
    ...REFERENCE_MUST_BE.map((line) => `- ${line}`),
    '',
    'REFERENCE MUST NOT BE:',
    ...REFERENCE_MUST_NOT_BE.map((line) => `- ${line}`),
    '',
    'IMPLEMENTATION RENDER MUST:',
    ...IMPLEMENTATION_RENDER_MUST.map((line) => `- ${line}`),
    '',
    'ANTI-CLONE PROHIBITIONS:',
    ...ANTI_CLONE_PROHIBITIONS.map((line) => `- ${line}`),
    '',
    PRESERVE_VS_EVOLVE_BLOCK,
    '',
    buildCompositionContractBlock(input.composition),
    '',
    `referenceAuthorityId: ${input.reference.id}`,
    `referenceImageHash: ${input.reference.sourceImageHash}`,
    `featureManifestVersion: ${DESIGN_WORKSPACE_FEATURE_MANIFEST_V1}`,
    refineBlock,
    regenBlock,
    'OUTPUT: single high-resolution mobile portrait UI — fresh product render recognizably based on reference, not a copy.',
  ].join('\n');
}

export function promptIncludesAntiCloneInstruction(prompt: string): boolean {
  return (
    prompt.includes('REFERENCE TRANSLATION') &&
    prompt.includes('DO NOT replicate the reference image verbatim') &&
    prompt.includes(MOBILE_IMPLEMENTATION_RENDER_ROLE)
  );
}

/** @deprecated R7MF1 sequential path — R7MF3 uses buildMobileBlueprintTwinFromCompositionFalPrompt */
export function buildMobileBlueprintTwinFalPrompt(input: {
  composition: MobileTwinCompositionState;
  implementationRenderId: string;
  implementationRenderHash: string;
  implementationVisualAuthorityId: string;
}): string {
  return buildMobileBlueprintTwinFromCompositionFalPrompt({
    composition: input.composition,
    siblingActualRenderId: input.implementationRenderId,
  });
}

export function buildMobileBlueprintTwinFromCompositionFalPrompt(input: {
  composition: MobileTwinCompositionState;
  siblingActualRenderId: string;
}): string {
  return [
    `LINEAGE: ${P0_VR_TWIN_V30R7MF3_LINEAGE}`,
    'OUTPUT REPRESENTATION MODE: TECHNICAL_BLUEPRINT_RENDER',
    'STRUCTURAL SOURCE: MobileTwinCompositionState (FROZEN) — NOT Actual Render pixels.',
    '',
    'CREATE THE TECHNICAL BLUEPRINT VERSION OF THE EXACT SAME FROZEN MOBILE COMPOSITION.',
    'DO NOT REDESIGN. DO NOT MOVE OBJECTS. DO NOT CHANGE OBJECT SIZES. DO NOT CHANGE HIERARCHY.',
    'DO NOT ADD OR REMOVE UI. DO NOT CHANGE CONTENT IDENTITY. DO NOT USE A DIFFERENT PAGE CONCEPT.',
    'Represent the same composition using wireframe/technical blueprint visualization.',
    '',
    `compositionStateId: ${input.composition.id}`,
    `compositionHash: ${input.composition.compositionHash}`,
    `siblingActualRenderId: ${input.siblingActualRenderId}`,
    `objectDefinitionCount: ${input.composition.objectDefinitions.length}`,
    `featureBindingCount: ${input.composition.featureBindings.length}`,
    `hostProjectContractVersion: ${input.composition.hostProjectContractVersion}`,
  ].join('\n');
}

export function blueprintPromptUsesFrozenComposition(prompt: string): boolean {
  return prompt.includes('STRUCTURAL SOURCE: MobileTwinCompositionState') && prompt.includes('TECHNICAL_BLUEPRINT_RENDER');
}

export function buildMobileBlueprintTwinFromActualTransformFalPrompt(input: {
  composition: MobileTwinCompositionState;
  actualRenderId: string;
  actualRenderHash: string;
}): string {
  return [
    `LINEAGE: ${P0_VR_TWIN_V30R7MF3_LINEAGE}`,
    'SPRINT: P0.VR.TWINV3.0R7MF3P1 FLOW B',
    'TASK: IMAGE-TO-BLUEPRINT TRANSFORMATION of the EXACT supplied Actual Page image.',
    'ATTACHED_IMAGE_ROLE=CANONICAL_ACTUAL_PAGE — transform THIS page only.',
    '',
    'TRANSFORM THIS EXACT PAGE INTO ITS TECHNICAL BLUEPRINT REPRESENTATION.',
    'PRESERVE THE PAGE EXACTLY. DO NOT REDESIGN. DO NOT MOVE OBJECTS. DO NOT CHANGE OBJECT SIZES.',
    'DO NOT ADD OR REMOVE MODULES. DO NOT CHANGE PAGE STATE. DO NOT SUBSTITUTE ASSETS.',
    'DO NOT REWRITE THE COMPOSITION. ONLY CHANGE REPRESENTATION TO BLUEPRINT / TECHNICAL VISUAL LANGUAGE.',
    '',
    `compositionStateId: ${input.composition.id}`,
    `compositionHash: ${input.composition.compositionHash}`,
    `actualRenderId: ${input.actualRenderId}`,
    `actualRenderHash: ${input.actualRenderHash}`,
    `objectDefinitionCount: ${input.composition.objectDefinitions.length}`,
    'STRUCTURED TRUTH: frozen MobileTwinCompositionState (not pixel reverse-engineering).',
  ].join('\n');
}

export function blueprintTransformPromptUsesActualImage(prompt: string): boolean {
  return prompt.includes('IMAGE-TO-BLUEPRINT TRANSFORMATION') && prompt.includes('CANONICAL_ACTUAL_PAGE');
}
