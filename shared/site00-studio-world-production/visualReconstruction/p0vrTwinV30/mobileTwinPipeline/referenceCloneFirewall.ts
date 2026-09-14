import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';
import type { MobileImplementationRender } from './types.js';
import type { ReferenceTranslationEvidenceReceipt } from './referenceTranslationEvidence.js';

export const REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION =
  'REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION' as const;

export type ReferenceCloneRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type ReferenceCloneFirewallResult = {
  risk: ReferenceCloneRisk;
  blocked: boolean;
  failureClassification: typeof REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION | null;
  signals: string[];
};

export function evaluateReferenceCloneFirewall(input: {
  reference: MobileDesignReferenceAuthority;
  render: Pick<MobileImplementationRender, 'renderImageHash' | 'renderImageUri' | 'id'>;
  composition: MobileTwinCompositionState;
  translationEvidence: ReferenceTranslationEvidenceReceipt;
}): ReferenceCloneFirewallResult {
  const signals: string[] = [];

  if (input.render.renderImageHash === input.reference.sourceImageHash) {
    signals.push('WHOLE_PAGE_HASH_IDENTITY');
  }
  if (input.render.renderImageUri === input.reference.sourceImageUri) {
    signals.push('SOURCE_URI_IDENTITY');
  }

  const hashPrefixMatch =
    input.render.renderImageHash.slice(0, 12) === input.reference.sourceImageHash.slice(0, 12) &&
    input.render.renderImageHash !== input.reference.sourceImageHash;
  if (hashPrefixMatch) {
    signals.push('EXCESSIVE_HASH_SIMILARITY');
  }

  if (!input.translationEvidence.featureManifestReconciled) {
    signals.push('FEATURE_MANIFEST_NOT_RECONCILED');
  }
  if (input.translationEvidence.result === 'FAIL') {
    signals.push('TRANSLATION_EVIDENCE_FAIL');
  }

  const identityCollapse = signals.some((s) => s === 'WHOLE_PAGE_HASH_IDENTITY' || s === 'SOURCE_URI_IDENTITY');
  const weakTranslation =
    input.translationEvidence.result === 'FAIL' ||
    (!input.translationEvidence.pageStateResolutionClaimed && input.translationEvidence.result !== 'PASS');

  let risk: ReferenceCloneRisk = 'LOW';
  if (identityCollapse || signals.includes('EXCESSIVE_HASH_SIMILARITY')) {
    risk = 'HIGH';
  } else if (weakTranslation || signals.includes('FEATURE_MANIFEST_NOT_RECONCILED')) {
    risk = 'MEDIUM';
  }

  const blocked = identityCollapse;
  const failureClassification = blocked ? REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION : null;

  return { risk, blocked, failureClassification, signals };
}

export function assertRenderPassesReferenceCloneFirewall(
  render: Pick<
    MobileImplementationRender,
    'cloneFirewallBlocked' | 'failureClassification' | 'referenceCloneRisk'
  >,
): void {
  if (render.cloneFirewallBlocked || render.failureClassification === REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION) {
    throw new Error('REFERENCE_TRANSLATION_COLLAPSE_TO_REPLICATION');
  }
}
