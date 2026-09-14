import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { DesignWorkspaceImplementationPackage, DesignWorkspaceTranslationReviewRecord } from './types.js';
import { canApproveTranslationGates } from './exactBoundaryAnalysis.js';
import type { GeometryFidelityReceipt } from './geometryFidelityTypes.js';
import type { AuthorityVisualCoverageReceipt, ObjectGranularityReceipt } from './pixelGroundedTypes.js';

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

export function evaluateTranslationApprovalGate(session: DesignPageAuthorityReviewSession): {
  allowed: boolean;
  reason: string | null;
} {
  const derivation = session.designWorkspaceDerivation;
  const pkg = derivation?.packages.find((p) => p.id === derivation.latestPackageId) as
    | DesignWorkspaceImplementationPackage
    | undefined;
  if (!derivation || !pkg) return { allowed: false, reason: 'TRANSLATION_REVIEW_NO_PACKAGE' };
  const artifacts = derivation.artifactsById;
  const mobCov = pkg.authorityVisualCoverageReceiptMobileId ?
    (artifacts[pkg.authorityVisualCoverageReceiptMobileId] as AuthorityVisualCoverageReceipt)
  : null;
  const deskCov = pkg.authorityVisualCoverageReceiptDesktopId ?
    (artifacts[pkg.authorityVisualCoverageReceiptDesktopId] as AuthorityVisualCoverageReceipt)
  : null;
  const mobGran = pkg.objectGranularityReceiptMobileId ?
    (artifacts[pkg.objectGranularityReceiptMobileId] as ObjectGranularityReceipt)
  : null;
  const deskGran = pkg.objectGranularityReceiptDesktopId ?
    (artifacts[pkg.objectGranularityReceiptDesktopId] as ObjectGranularityReceipt)
  : null;
  const mobGeo = pkg.geometryFidelityReceiptMobileId ?
    (artifacts[pkg.geometryFidelityReceiptMobileId] as GeometryFidelityReceipt)
  : null;
  const deskGeo = pkg.geometryFidelityReceiptDesktopId ?
    (artifacts[pkg.geometryFidelityReceiptDesktopId] as GeometryFidelityReceipt)
  : null;
  const visualCoverageGatePass = mobCov?.result === 'PASS' && deskCov?.result === 'PASS';
  const granularityPass = mobGran?.result === 'PASS' && deskGran?.result === 'PASS';
  const geometryFidelityGatePass =
    pkg.derivationAlgorithm === 'R6F2' ?
      mobGeo?.result === 'PASS' && deskGeo?.result === 'PASS'
    : true;
  const criticalVisualGaps = (mobCov?.highImportanceUnmapped ?? 0) + (deskCov?.highImportanceUnmapped ?? 0);
  const allowed = canApproveTranslationGates({
    visualCoverageGatePass,
    geometryFidelityGatePass,
    granularityPass,
    criticalVisualGaps,
  });
  if (!allowed && pkg.derivationAlgorithm === 'R6F2' && !geometryFidelityGatePass) {
    return { allowed: false, reason: 'OBJECT_GEOMETRY_FIDELITY_FAILED' };
  }
  return { allowed, reason: allowed ? null : 'TRANSLATION_APPROVAL_GATE_BLOCKED' };
}

export function approveTranslationReview(
  session: DesignPageAuthorityReviewSession,
  notes = '',
): DesignPageAuthorityReviewSession {
  const derivation = session.designWorkspaceDerivation;
  if (!derivation?.latestPackageId) throw new Error('TRANSLATION_REVIEW_NO_PACKAGE');
  const gate = evaluateTranslationApprovalGate(session);
  if (!gate.allowed) throw new Error(gate.reason ?? 'TRANSLATION_APPROVAL_GATE_BLOCKED');
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
    correctionReason:
      corrections.some((c) => /boundary|geometry|pixel.?exact|not.?pixel/i.test(c)) ?
        'OBJECT_BOUNDARIES_NOT_PIXEL_EXACT'
      : 'OBJECT_MISSED',
    priorPackageId: derivation.latestPackageId,
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
