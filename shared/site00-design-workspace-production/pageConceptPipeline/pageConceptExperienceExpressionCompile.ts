/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageExperienceExpressionContract } from './pageConceptViewportAuthorityFamily.js';

export function compilePageExperienceExpressionContract(input: {
  projectId: string;
  pageId: string;
  selectedMobileConceptId: string;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
}): PageExperienceExpressionContract {
  const overlayPatterns = [
    'DRAWERS: slide-over panels anchored to concept hierarchy; preserve thumb reach on Mobile authority.',
    'SHEETS: bottom sheets for secondary actions; Tablet uses wider sheet with two-column summary when space allows.',
    'MODALS: centered focus with brand frame; Desktop may use split modal + inspector column.',
    'MENUS: contextual menus inherit typography + lime accent from Skin Contract.',
    'DROPDOWNS: compact mono labels; never default system chrome.',
    'INSPECTORS: right-rail on Desktop; full-screen inspector on Mobile when depth > 1.',
    'FULLSCREEN VIEWS: immersive media/story modes; exit affordance always visible.',
    'CONFIRMATIONS: destructive actions use high-contrast band + explicit verb labels.',
    'LOADING: skeleton blocks match concept geometry — not generic spinners alone.',
    'EMPTY STATES: narrative copy from CGPT brief + single primary action.',
    'ERRORS: calm recovery copy; preserve layout shell.',
    'CONTEXTUAL ACTIONS: floating action cluster respects safe areas.',
    'AI PANELS: collapsible side dock on Desktop; sheet stack on Mobile.',
    'EXPANDED/COLLAPSED: section headers use display type; motion subtle, editorial.',
    `INTERACTION CHARACTER: ${input.injection.interactionCharacter ?? input.cgptBrief.interactionCharacter}`,
    `FUNCTION REGIONS: ${input.functionContract.regions.join(', ')}`,
    `IMMUTABLE BEHAVIORS: ${input.functionContract.immutableBehaviors.join(', ')}`,
  ];

  return {
    contractId: `peec-${input.projectId}-${input.pageId}-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    selectedMobileConceptId: input.selectedMobileConceptId,
    skinContractVersion: input.skinContract.version,
    cgptBriefId: input.cgptBrief.briefId,
    overlayPatterns,
    version: input.cgptBrief.version,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };
}
