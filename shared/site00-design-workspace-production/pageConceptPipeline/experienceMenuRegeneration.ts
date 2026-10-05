/**
 * P0.VR.EXPERIENCE-MENU-REGEN-MATERIALIZATION-AND-REVIEW-TAB-LAYOUT-FIX1
 */

import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import { PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION } from './pageConceptExperienceExpressionFalPlan.js';

/** Marker that nested-nav refinement block was applied (guard against generic MENU prompt). */
export const MENU_NESTED_NAV_REFINEMENT_MARKER = 'NESTED_NAV_REFINEMENT';

export const MENU_HIERARCHY_DIRECTIVE_VERSION = 'ndxbook-menu-nested-nav-v2';

export type MenuRegenerationReceipt = {
  previousMenuArtifactId: string | null;
  newMenuArtifactId: string;
  providerRequestId: string;
  promptVersion: string;
  hierarchyDirectiveVersion: string;
  regeneratedAt: string;
  menuRefinementDirectiveRequired: 'PASS' | 'FAIL';
  existingMenuUsedAsRefinementReference: 'PASS' | 'FAIL';
  activeMenuSlotUpdated: 'PASS' | 'FAIL';
  cacheBustKey: string;
  readyForFounderVisualQa: 'YES' | 'NO';
};

export function menuRegenerationArtifactId(input: {
  experienceAuthorityId: string;
  regenerationAttemptId: string;
}): string {
  const tail = input.experienceAuthorityId.slice(-10);
  const attempt = input.regenerationAttemptId.replace(/[^a-zA-Z0-9]/g, '').slice(-12) || 'regen';
  return `pcga-EXP-MENU-${tail}-R${attempt}`;
}

export function assertMenuRefinementDirectiveInPrompt(prompt: string): void {
  if (!prompt.includes(MENU_NESTED_NAV_REFINEMENT_MARKER)) {
    throw new Error('MENU_REFINEMENT_DIRECTIVE_REQUIRED');
  }
  if (!prompt.includes('DO NOT REDESIGN THE MENU')) {
    throw new Error('MENU_REFINEMENT_DIRECTIVE_REQUIRED');
  }
}

export function buildExperiencePreviewImageSrc(
  imageUri: string | null | undefined,
  artifactId: string | null | undefined,
): string | null {
  const uri = imageUri?.trim();
  if (!uri) return null;
  const id = artifactId?.trim();
  if (!id || uri.startsWith('data:')) {
    return id ? `${uri}#${encodeURIComponent(id)}` : uri;
  }
  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}v=${encodeURIComponent(id)}`;
}

export function assertExperiencePreviewArtifactSync(input: {
  selectedOutputType: string;
  activeArtifactId: string | null | undefined;
  previewArtifactId: string | null | undefined;
  currentPackageArtifactId: string | null | undefined;
}): void {
  if (input.selectedOutputType !== 'menu') return;
  const a = input.activeArtifactId?.trim() ?? '';
  const p = input.previewArtifactId?.trim() ?? '';
  const c = input.currentPackageArtifactId?.trim() ?? '';
  if (!a || !p || !c) return;
  if (a !== p || a !== c) {
    throw new Error('EXPERIENCE_PREVIEW_ARTIFACT_DESYNC');
  }
}

export function buildMenuRegenerationReceipt(input: {
  previousMenuArtifactId: string | null;
  newMenuArtifactId: string;
  providerRequestId: string;
  promptIncludesRefinement: boolean;
  existingMenuReferenceUsed: boolean;
  authorityAfter: ExperienceExpressionAuthority;
}): MenuRegenerationReceipt {
  if (input.previousMenuArtifactId && input.previousMenuArtifactId === input.newMenuArtifactId) {
    throw new Error('MENU_REGENERATION_ARTIFACT_UNCHANGED');
  }

  const menuState = input.authorityAfter.visualStates.find((s) => s.stateId === 'menu');
  const slotUpdated = menuState?.generatedArtifactId === input.newMenuArtifactId ? 'PASS' : 'FAIL';

  if (slotUpdated === 'FAIL') {
    throw new Error('MENU_REGENERATION_ARTIFACT_SLOT_NOT_UPDATED');
  }

  return {
    previousMenuArtifactId: input.previousMenuArtifactId,
    newMenuArtifactId: input.newMenuArtifactId,
    providerRequestId: input.providerRequestId,
    promptVersion: PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
    hierarchyDirectiveVersion: MENU_HIERARCHY_DIRECTIVE_VERSION,
    regeneratedAt: new Date().toISOString(),
    menuRefinementDirectiveRequired: input.promptIncludesRefinement ? 'PASS' : 'FAIL',
    existingMenuUsedAsRefinementReference: input.existingMenuReferenceUsed ? 'PASS' : 'FAIL',
    activeMenuSlotUpdated: slotUpdated,
    cacheBustKey: input.newMenuArtifactId,
    readyForFounderVisualQa: 'YES',
  };
}

export function menuVisualStateHasNewerRegenerationThanJob(input: {
  state: ExperienceExpressionVisualState;
  authority: ExperienceExpressionAuthority;
  legacyJobArtifactId: string;
  legacyJobCreatedAt: string;
}): boolean {
  if (input.state.stateId !== 'menu') return false;
  const currentId = input.state.generatedArtifactId?.trim();
  if (!currentId || currentId === input.legacyJobArtifactId) return false;
  const regenJobs = (input.authority.generationJobs ?? []).filter(
    (j) => j.stateId === 'menu' && j.regeneratedAt && j.artifactId === currentId,
  );
  if (regenJobs.length === 0) {
    return Boolean(input.authority.menuRegenerationReceipt?.newMenuArtifactId === currentId);
  }
  const latest = regenJobs.reduce((a, b) =>
    Date.parse(a.regeneratedAt!) >= Date.parse(b.regeneratedAt!) ? a : b,
  );
  return Date.parse(latest.regeneratedAt!) >= Date.parse(input.legacyJobCreatedAt);
}
