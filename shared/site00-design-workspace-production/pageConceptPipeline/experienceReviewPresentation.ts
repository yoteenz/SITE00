/**
 * P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import { validateExperiencePackageMaterialization } from './experiencePackageMaterialization.js';

export type ExperienceReviewPanelMode =
  | 'EMPTY'
  | 'GENERATING'
  | 'READY'
  | 'PARTIAL'
  | 'FAILED'
  | 'APPROVED';

export type ExperienceReviewPackageStatus = {
  planned: number;
  generated: number;
  ready: number;
  running: number;
  failed: number;
  pending: number;
  mode: ExperienceReviewPanelMode;
  statusLabel: string;
};

export function resolveExperienceReviewPanelMode(
  authority: ExperienceExpressionAuthority | null | undefined,
): ExperienceReviewPanelMode {
  if (!authority) return 'EMPTY';
  if (authority.status === 'APPROVED') return 'APPROVED';
  if (authority.status === 'FAILED') return 'FAILED';
  if (authority.status === 'GENERATING') return 'GENERATING';
  if (authority.status === 'PARTIAL_FAILURE') return 'PARTIAL';
  if (authority.status === 'READY_FOR_REVIEW') return 'READY';
  return 'EMPTY';
}

export function buildExperienceReviewPackageStatus(
  authority: ExperienceExpressionAuthority | null | undefined,
): ExperienceReviewPackageStatus {
  const mode = resolveExperienceReviewPanelMode(authority);
  if (!authority) {
    return {
      planned: 4,
      generated: 0,
      ready: 0,
      running: 0,
      failed: 0,
      pending: 4,
      mode,
      statusLabel: 'NOT GENERATED',
    };
  }
  const materialization = validateExperiencePackageMaterialization(authority);
  const planned = materialization.plannedOutputCount || authority.visualStates.length || 4;
  const visualStates = authority.visualStates ?? [];
  const ready = visualStates.filter((v) => Boolean(v.previewImageUri?.trim())).length;
  const failed = visualStates.filter((v) => v.materializationStatus === 'FAILED').length;
  const running =
    authority.status === 'GENERATING' ?
      Math.max(0, planned - ready - failed)
    : visualStates.filter((v) => v.materializationStatus === 'GENERATING').length;
  const generated = ready + failed;
  const pending = Math.max(0, planned - ready - failed - running);

  let statusLabel: string = authority.status;
  if (mode === 'APPROVED') statusLabel = 'APPROVED';
  else if (mode === 'FAILED') statusLabel = 'GENERATION FAILED';
  else if (mode === 'GENERATING') statusLabel = 'GENERATING';
  else if (mode === 'PARTIAL') statusLabel = 'PARTIAL — REVIEW REQUIRED';
  else if (mode === 'READY') statusLabel = 'READY FOR REVIEW';

  return { planned, generated, ready, running, failed, pending, mode, statusLabel };
}

/** Shared review-shell lineage marker for Generation Panel family. */
export const EXPERIENCE_REVIEW_SHELL_LINEAGE = 'generation-panel' as const;
