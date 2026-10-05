/**
 * P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1
 * P0.VR.EXPERIENCE-LEGACY-FAL-ARTIFACT-RECONCILIATION-AND-REVIEW-UX-FIX1
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import { validateExperiencePackageMaterialization } from './experiencePackageMaterialization.js';

export type ExperienceReviewPanelMode =
  | 'HYDRATING'
  | 'EMPTY'
  | 'GENERATING'
  | 'READY'
  | 'PARTIAL'
  | 'FAILED'
  | 'APPROVED'
  | 'STALE';

export type ExperienceReviewPackageStatus = {
  planned: number;
  inherited: number;
  falOutputs: number;
  falReady: number;
  materialized: number;
  generated: number;
  ready: number;
  running: number;
  failed: number;
  pending: number;
  stale: number;
  mode: ExperienceReviewPanelMode;
  statusLabel: string;
  blockerHint: string | null;
};

function countMaterialized(authority: ExperienceExpressionAuthority): {
  planned: number;
  inherited: number;
  falOutputs: number;
  falReady: number;
  materialized: number;
  ready: number;
  failed: number;
  running: number;
  pending: number;
  stale: number;
} {
  const materialization = validateExperiencePackageMaterialization(authority);
  const visualStates = authority.visualStates ?? [];
  const agg = authority.packageOutputIndex?.aggregates;
  const planned = agg?.plannedOutputCount ?? (materialization.plannedOutputCount || visualStates.length || 4);
  const inherited = agg?.inheritedOutputCount ?? visualStates.filter((v) => v.sourceProvider === 'INHERITED_MOBILE').length;
  const falStates = visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE');
  const falOutputs = agg?.falOutputCount ?? falStates.length;
  const falReady = agg?.falReadyCount ?? falStates.filter((v) => Boolean(v.previewImageUri?.trim())).length;
  const ready = agg?.materializedOutputCount ?? visualStates.filter((v) => Boolean(v.previewImageUri?.trim())).length;
  const materialized = ready;
  const failed = visualStates.filter((v) => v.materializationStatus === 'FAILED').length;
  const stale =
    agg?.staleOutputCount ??
    visualStates.filter((v) => v.caption.includes('REGENERATION REQUIRED') || v.materializationStatus === 'PRESERVED').length;
  const running =
    authority.status === 'GENERATING' ?
      Math.max(0, planned - ready - failed)
    : visualStates.filter((v) => v.materializationStatus === 'GENERATING').length;
  const pending = agg?.pendingOutputCount ?? Math.max(0, planned - ready - failed - running);
  return { planned, inherited, falOutputs, falReady, materialized, ready, failed, running, pending, stale };
}

export function deriveExperiencePackageStatusLabel(input: {
  authority: ExperienceExpressionAuthority;
  mode: ExperienceReviewPanelMode;
  counts: ReturnType<typeof countMaterialized>;
}): string {
  if (input.mode === 'APPROVED') return 'APPROVED';
  if (input.mode === 'FAILED') return 'GENERATION FAILED';
  if (input.mode === 'GENERATING') return 'GENERATING';
  if (input.mode === 'STALE') return 'STALE — AUTHORITY CHANGED';
  if (input.mode === 'HYDRATING') return 'LOADING EXPERIENCE PACKAGE';
  if (input.counts.materialized === 0) return 'NOT STARTED';
  if (input.counts.materialized < input.counts.planned) return 'PARTIAL';
  if (input.counts.stale > 0) return 'PARTIAL — REGENERATION REQUIRED';
  return 'READY FOR REVIEW';
}

export function deriveExperienceReviewBlockerHint(input: {
  authority: ExperienceExpressionAuthority | null | undefined;
  themeBlocked: boolean;
  contentBlocked: boolean;
  coverageBlocked: boolean;
  counts: ReturnType<typeof countMaterialized>;
}): string | null {
  if (!input.authority) return null;
  if (input.counts.pending > 0) return `${input.counts.pending} OUTPUT${input.counts.pending === 1 ? '' : 'S'} MISSING`;
  if (input.counts.stale > 0) return 'LEGACY OUTPUT · REGENERATION REQUIRED';
  if (input.themeBlocked || input.contentBlocked) return 'THEME OR CONTENT REVIEW REQUIRED BEFORE APPROVAL';
  if (input.coverageBlocked) return 'EXPRESSION COVERAGE INCOMPLETE';
  if (input.counts.materialized >= input.counts.planned) return 'READY FOR REVIEW';
  return null;
}

export function resolveExperienceReviewPanelMode(
  authority: ExperienceExpressionAuthority | null | undefined,
  options?: { hydrating?: boolean },
): ExperienceReviewPanelMode {
  if (options?.hydrating) return 'HYDRATING';
  if (!authority) return 'EMPTY';
  if (authority.status === 'SUPERSEDED') return 'STALE';
  if (authority.status === 'APPROVED') return 'APPROVED';
  if (authority.status === 'FAILED') return 'FAILED';

  const counts = countMaterialized(authority);
  const materialization = validateExperiencePackageMaterialization(authority);

  if (authority.status === 'GENERATING' && counts.ready < counts.planned) {
    return counts.ready > 0 ? 'PARTIAL' : 'GENERATING';
  }
  if (authority.status === 'PARTIAL_FAILURE' || (counts.ready > 0 && counts.ready < counts.planned)) {
    return 'PARTIAL';
  }
  if (materialization.ok || counts.ready >= counts.planned) return 'READY';
  if (authority.status === 'READY_FOR_REVIEW') return 'READY';
  if (counts.ready > 0) return 'PARTIAL';
  if (authority.status === 'NOT_STARTED' || authority.status === 'GENERATING') {
    return counts.ready > 0 ? 'PARTIAL' : 'EMPTY';
  }
  return 'EMPTY';
}

export function buildExperienceReviewPackageStatus(
  authority: ExperienceExpressionAuthority | null | undefined,
  options?: { themeBlocked?: boolean; contentBlocked?: boolean; coverageBlocked?: boolean },
): ExperienceReviewPackageStatus {
  const mode = resolveExperienceReviewPanelMode(authority);
  if (!authority) {
    return {
      planned: 4,
      inherited: 0,
      falOutputs: 3,
      falReady: 0,
      materialized: 0,
      generated: 0,
      ready: 0,
      running: 0,
      failed: 0,
      pending: 4,
      stale: 0,
      mode,
      statusLabel: 'NOT STARTED',
      blockerHint: '4 OUTPUTS MISSING',
    };
  }
  const counts = countMaterialized(authority);
  const statusLabel = deriveExperiencePackageStatusLabel({ authority, mode, counts });
  const falGenerated = counts.falReady;
  const blockerHint = deriveExperienceReviewBlockerHint({
    authority,
    themeBlocked: options?.themeBlocked === true,
    contentBlocked: options?.contentBlocked === true,
    coverageBlocked: options?.coverageBlocked === true,
    counts,
  });

  return {
    planned: counts.planned,
    inherited: counts.inherited,
    falOutputs: counts.falOutputs,
    falReady: counts.falReady,
    materialized: counts.materialized,
    generated: falGenerated + counts.inherited,
    ready: counts.ready,
    running: counts.running,
    failed: counts.failed,
    pending: counts.pending,
    stale: counts.stale,
    mode,
    statusLabel,
    blockerHint,
  };
}

/** Shared review-shell lineage marker for Generation Panel family. */
export const EXPERIENCE_REVIEW_SHELL_LINEAGE = 'generation-panel' as const;
