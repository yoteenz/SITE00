import { DESIGN_WORKSPACE_FEATURE_MANIFEST_V1, P0_VR_TWIN_V30R7MF1_LINEAGE } from '../constants.js';
import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';

export function buildMobileImplementationRenderFalPrompt(input: {
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  refineNotes?: string[];
  regeneration?: boolean;
}): string {
  const refineBlock =
    input.refineNotes?.length ?
      `\nFOUNDER REFINEMENT (bounded):\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  const regenBlock = input.regeneration ? '\nREGENERATE: sibling render — preserve lineage contracts.\n' : '';
  return [
    `LINEAGE: ${P0_VR_TWIN_V30R7MF1_LINEAGE}`,
    'TASK: CONTROLLED TRANSLATION — create the ACTUAL MOBILE DESIGN WORKSPACE IMPLEMENTATION RENDER.',
    'INPUT ROLE: Mobile Design Reference Authority is COMPOSITION GUIDELINE only — not a screenshot to return.',
    '',
    'PRESERVE: major spatial composition, dominant work surface, density, hierarchy, authority-pair placement,',
    'candidate-gallery relationship, pipeline placement, mobile interaction hierarchy, SITE 00 host shell, NDXBOOK atmosphere.',
    '',
    'MAY CORRECT: placeholder content, feature-state gaps, fake metrics, impossible states, R5/R5F1 functionality.',
    'MAY NOT: new territory, generic SaaS UI, remove required features, standalone NDXBOOK app, wholesale redesign.',
    '',
    `compositionStateId: ${input.composition.id}`,
    `compositionHash: ${input.composition.compositionHash}`,
    `referenceAuthorityId: ${input.reference.id}`,
    `referenceImageHash: ${input.reference.sourceImageHash}`,
    `featureManifestVersion: ${DESIGN_WORKSPACE_FEATURE_MANIFEST_V1}`,
    `projectCreativeContextVersion: ${input.composition.projectCreativeContextVersion}`,
    `hostProjectContractVersion: ${input.composition.hostProjectContractVersion}`,
    `featureBindingCount: ${input.composition.featureBindings.length}`,
    `objectDefinitionCount: ${input.composition.objectDefinitions.length}`,
    refineBlock,
    regenBlock,
    'OUTPUT: single high-resolution mobile portrait UI render — real implementation-ready Design workspace page.',
  ].join('\n');
}

export function buildMobileBlueprintTwinFalPrompt(input: {
  composition: MobileTwinCompositionState;
  implementationRenderId: string;
  implementationRenderHash: string;
  implementationVisualAuthorityId: string;
}): string {
  return [
    `LINEAGE: ${P0_VR_TWIN_V30R7MF1_LINEAGE}`,
    'TASK: TRANSLATION ONLY — TECHNICAL BLUEPRINT TWIN of the APPROVED MOBILE IMPLEMENTATION RENDER.',
    'PARENT VISUAL: approved MobileImplementationRender (NOT the original design reference).',
    '',
    'CREATE A TECHNICAL BLUEPRINT TWIN OF THIS EXACT APPROVED MOBILE RENDER.',
    'DO NOT REDESIGN. DO NOT MOVE OBJECTS. DO NOT CHANGE LAYOUT. DO NOT CHANGE PROPORTIONS.',
    'DO NOT REMOVE OBJECTS. DO NOT ADD UI. DO NOT CHANGE CONTENT IDENTITY.',
    'DO NOT SUBSTITUTE PROJECT ASSETS. DO NOT CHANGE HOST/PROJECT OWNERSHIP.',
    'PRESERVE THE EXACT COMPOSITION. Use technical blueprint annotation language.',
    '',
    `compositionStateId: ${input.composition.id}`,
    `compositionHash: ${input.composition.compositionHash}`,
    `implementationRenderId: ${input.implementationRenderId}`,
    `implementationRenderHash: ${input.implementationRenderHash}`,
    `implementationVisualAuthorityId: ${input.implementationVisualAuthorityId}`,
    `objectDefinitionCount: ${input.composition.objectDefinitions.length}`,
  ].join('\n');
}
