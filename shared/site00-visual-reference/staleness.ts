/**
 * Visual reference staleness evaluation.
 */

import type { StalenessState, VisualReferenceRecord } from './types.js';

const DEFAULT_STALE_DAYS = 30;

export function evaluateReferenceStaleness(params: {
  reference: VisualReferenceRecord;
  currentSourceCommit: string | null;
  hostCanonVersion?: string | null;
  now?: Date;
}): StalenessState {
  const { reference, currentSourceCommit } = params;
  if (reference.stalenessState === 'SUPERSEDED') return 'SUPERSEDED';

  if (reference.sourceCommit && currentSourceCommit && reference.sourceCommit !== currentSourceCommit) {
    return 'POSSIBLY_STALE';
  }

  const capturedAt = new Date(reference.capturedAt);
  const now = params.now ?? new Date();
  const ageDays = (now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > DEFAULT_STALE_DAYS * 2) return 'STALE';
  if (ageDays > DEFAULT_STALE_DAYS) return 'POSSIBLY_STALE';

  return 'FRESH';
}

export function deprioritizeStaleReferences(references: VisualReferenceRecord[]): VisualReferenceRecord[] {
  const order: Record<StalenessState, number> = {
    FRESH: 0,
    POSSIBLY_STALE: 1,
    STALE: 2,
    SUPERSEDED: 3,
  };
  return [...references].sort((a, b) => order[a.stalenessState] - order[b.stalenessState]);
}

export function approvedHostBaselineOutranksExperimental(
  baseline: VisualReferenceRecord,
  experimental: VisualReferenceRecord,
): boolean {
  const baselineApproved =
    baseline.approvalStatus === 'APPROVED_REFERENCE' ||
    baseline.sourceType === 'APPROVED_PRODUCTION_CAPTURE';
  const experimentalLoose =
    experimental.approvalStatus === 'EXPERIMENTAL_REFERENCE' ||
    experimental.sourceType === 'GENERATED_VISUAL_DEVELOPMENT';
  return baselineApproved && experimentalLoose;
}
