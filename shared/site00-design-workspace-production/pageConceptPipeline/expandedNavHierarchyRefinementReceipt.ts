/**
 * P0.VR.EXPANDED-NAV-HIERARCHY-REFINEMENT1 — founder QA receipt for menu-only refinement.
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import {
  buildNdxbookOverviewExpandedNavHierarchy,
  buildMenuExpandedNavHierarchyRefinementPromptBlock,
  validateExpandedNavHierarchyManifestStructure,
} from './ndxbookExpandedNavHierarchy.js';
export type ExpandedNavHierarchyRefinementReceipt = {
  menuStateRegenerated: boolean;
  designChangedBeyondHierarchy: 'YES' | 'NO' | 'UNKNOWN';
  lightThemePreserved: 'PASS' | 'FAIL' | 'UNKNOWN';
  contentOpsParentVisible: 'PASS' | 'FAIL';
  campaignBoardNested: 'PASS' | 'FAIL';
  campaignBoardTopLevel: 'YES' | 'NO';
  pageFamilyHierarchyMatch: 'PASS' | 'FAIL';
  otherExperienceOutputsRegenerated: 'YES' | 'NO';
  readyForFounderNavHierarchyQa: 'YES' | 'NO';
};

export function otherExperienceVisualStatesUnchanged(
  before: ExperienceExpressionAuthority,
  after: ExperienceExpressionAuthority,
  menuStateId = 'menu',
): boolean {
  const beforeById = new Map(before.visualStates.map((s) => [s.stateId, s]));
  for (const state of after.visualStates) {
    if (state.stateId === menuStateId) continue;
    const prior = beforeById.get(state.stateId);
    if (!prior) return false;
    if (prior.previewImageUri !== state.previewImageUri) return false;
    if (prior.generatedArtifactId !== state.generatedArtifactId) return false;
  }
  return true;
}

export function buildExpandedNavHierarchyRefinementReceipt(input: {
  projectId: string;
  pageId: string;
  authorityBefore: ExperienceExpressionAuthority | null;
  authorityAfter: ExperienceExpressionAuthority;
  menuStateRegenerated: boolean;
}): ExpandedNavHierarchyRefinementReceipt {
  const hierarchy = buildNdxbookOverviewExpandedNavHierarchy(input.projectId, input.pageId);
  const structure = validateExpandedNavHierarchyManifestStructure(hierarchy);
  const promptIncludesLock =
    buildMenuExpandedNavHierarchyRefinementPromptBlock({ hierarchyLines: hierarchy.hierarchyLines }).includes(
      'DO NOT REDESIGN THE MENU',
    );

  const otherUnchanged =
    input.authorityBefore ?
      otherExperienceVisualStatesUnchanged(input.authorityBefore, input.authorityAfter)
    : true;

  const menuState = input.authorityAfter.visualStates.find((s) => s.stateId === 'menu');
  const lightTheme =
    menuState?.themeMode === 'INHERIT_AUTHORITY' || menuState?.outputThemeDominance === 'LIGHT' ?
      'PASS'
    : menuState?.themeMode ? 'FAIL'
    : 'UNKNOWN';

  const hierarchyPass =
    structure.contentOpsParentRelationship === 'PASS' &&
    structure.campaignBoardNested === 'PASS' &&
    structure.campaignBoardNotTopLevel === 'PASS' &&
    structure.canonicalPageFamilyMatch === 'PASS';

  const ready =
    input.menuStateRegenerated &&
    otherUnchanged &&
    hierarchyPass &&
    promptIncludesLock;

  return {
    menuStateRegenerated: input.menuStateRegenerated,
    designChangedBeyondHierarchy: 'UNKNOWN',
    lightThemePreserved: lightTheme,
    contentOpsParentVisible: structure.contentOpsParentRelationship,
    campaignBoardNested: structure.campaignBoardNested,
    campaignBoardTopLevel: hierarchy.campaignBoardTopLevel ? 'YES' : 'NO',
    pageFamilyHierarchyMatch: structure.canonicalPageFamilyMatch,
    otherExperienceOutputsRegenerated: otherUnchanged ? 'NO' : 'YES',
    readyForFounderNavHierarchyQa: ready ? 'YES' : 'NO',
  };
}
