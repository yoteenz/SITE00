import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { DesignWorkspaceTranslationReviewRecord } from './types.js';

export function createPendingTranslationReview(session: DesignPageAuthorityReviewSession): DesignWorkspaceTranslationReviewRecord | null {
  const derivation = session.designWorkspaceDerivation;
  const run = derivation?.runs.at(-1);
  const pkgId = derivation?.latestPackageId;
  if (!run || !pkgId) return null;
  return {
    id: `trr-${run.id}`,
    derivationRunId: run.id,
    authorityPairId: run.authorityPairId,
    packageId: pkgId,
    founderDecision: 'PENDING',
    reviewNotes: '',
    requestedCorrections: [],
    approvedAt: null,
    rejectedAt: null,
    reviewedBy: null,
  };
}

export function approveTranslationReview(
  session: DesignPageAuthorityReviewSession,
  notes = '',
): DesignPageAuthorityReviewSession {
  const derivation = session.designWorkspaceDerivation;
  if (!derivation?.latestPackageId) throw new Error('TRANSLATION_REVIEW_NO_PACKAGE');
  const now = new Date().toISOString();
  const record: DesignWorkspaceTranslationReviewRecord = {
    id: `trr-${derivation.runs.at(-1)?.id ?? now}`,
    derivationRunId: derivation.runs.at(-1)?.id ?? '',
    authorityPairId: derivation.runs.at(-1)?.authorityPairId ?? '',
    packageId: derivation.latestPackageId,
    founderDecision: 'APPROVE_TRANSLATION',
    reviewNotes: notes,
    requestedCorrections: [],
    approvedAt: now,
    rejectedAt: null,
    reviewedBy: 'founder',
  };
  const packages = derivation.packages.map((p) =>
    p.id === derivation.latestPackageId ? { ...p, status: 'READY_FOR_REVIEW' as const } : p,
  );
  return {
    ...session,
    designWorkspaceDerivation: {
      ...derivation,
      packages,
      translationReview: record,
    },
    updatedAt: now,
  };
}

export function requestDerivationCorrection(
  session: DesignPageAuthorityReviewSession,
  corrections: string[],
): DesignPageAuthorityReviewSession {
  const derivation = session.designWorkspaceDerivation;
  if (!derivation?.latestPackageId) throw new Error('TRANSLATION_REVIEW_NO_PACKAGE');
  const now = new Date().toISOString();
  const record: DesignWorkspaceTranslationReviewRecord = {
    id: `trr-reject-${Date.now()}`,
    derivationRunId: derivation.runs.at(-1)?.id ?? '',
    authorityPairId: derivation.runs.at(-1)?.authorityPairId ?? '',
    packageId: derivation.latestPackageId,
    founderDecision: 'REQUEST_DERIVATION_CORRECTION',
    reviewNotes: '',
    requestedCorrections: corrections,
    approvedAt: null,
    rejectedAt: now,
    reviewedBy: 'founder',
  };
  return {
    ...session,
    designWorkspaceDerivation: {
      ...derivation,
      translationReview: record,
      /** Next GENERATE DERIVATIVES creates new derivation version — same authority pair. */
      correctionRequested: true,
    },
    updatedAt: now,
  };
}
