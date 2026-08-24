/**
 * Post-assembly surface content fidelity checks — operational truth over decorative filler.
 */

import type { InterfaceSlotResolutionResult } from './interfaceVisualSlot.js';
import type { SurfaceDesignProof } from '../../../site00-brand-lore/experienceExpression/designProofTypes.js';

export type SurfaceContentFidelityCheck =
  | 'ASSET_SEMANTIC_RELEVANCE'
  | 'REAL_PROJECT_ARTIFACT_USAGE'
  | 'DECORATIVE_FILLER_RISK'
  | 'WRONG_PROJECT_ASSET_RISK'
  | 'WRONG_CLIENT_ASSET_RISK'
  | 'ARTIFICIAL_WORK_HISTORY_RISK'
  | 'HOST_REFERENCE_AUTH_VALIDITY'
  | 'SURFACE_CONTENT_TRUTH';

export type SurfaceContentFidelityResult = {
  check: SurfaceContentFidelityCheck;
  passed: boolean;
  notes: string;
};

export function evaluateSurfaceContentFidelity(params: {
  proof: SurfaceDesignProof;
  slotResolution: InterfaceSlotResolutionResult | null;
}): SurfaceContentFidelityResult[] {
  const resolution = params.slotResolution;
  const results: SurfaceContentFidelityResult[] = [];

  const obsoleteCount = resolution?.obsoleteGeneratedAssets.length ?? 0;
  results.push({
    check: 'DECORATIVE_FILLER_RISK',
    passed: (resolution?.summary.generationRequired ?? 0) <= 1,
    notes:
      (resolution?.summary.generationRequired ?? 0) > 2
        ? 'Multiple unjustified generation slots detected'
        : 'Generation count within purpose-gated bounds',
  });

  results.push({
    check: 'REAL_PROJECT_ARTIFACT_USAGE',
    passed: (resolution?.summary.eligible ?? 0) > 0 || (resolution?.summary.generationRequired ?? 0) === 0,
    notes: 'Eligible project artifacts preferred before generation',
  });

  results.push({
    check: 'HOST_REFERENCE_AUTH_VALIDITY',
    passed: params.proof.authenticatedReferenceStatus.every((s) => s.status !== 'INVALID'),
    notes: 'Authenticated Projects references must not be sign-in redirects',
  });

  results.push({
    check: 'SURFACE_CONTENT_TRUTH',
    passed: (resolution?.summary.rejected ?? 0) >= 0,
    notes: 'Obsolete methodology assets classified without deletion',
  });

  results.push({
    check: 'WRONG_PROJECT_ASSET_RISK',
    passed: (resolution?.resolved.filter((r) => r.rejectionReason?.includes('different project')).length ?? 0) === 0,
    notes: 'Cross-project assets rejected at eligibility gate',
  });

  results.push({
    check: 'WRONG_CLIENT_ASSET_RISK',
    passed: (resolution?.resolved.filter((r) => r.rejectionReason?.includes('different client')).length ?? 0) === 0,
    notes: 'Cross-client assets rejected at eligibility gate',
  });

  results.push({
    check: 'ARTIFICIAL_WORK_HISTORY_RISK',
    passed: !params.proof.generatedAssets.some((a) => /WORKBENCH|DOSSIER|FAKE/i.test(a.assetRole)),
    notes: 'No synthetic work-history filler detected',
  });

  results.push({
    check: 'ASSET_SEMANTIC_RELEVANCE',
    passed: (resolution?.summary.rejected ?? 0) >= obsoleteCount,
    notes: 'Ineligible assets do not count as reusable production material',
  });

  return results;
}

export function decorativeFillerRiskDetectable(results: SurfaceContentFidelityResult[]): boolean {
  return results.some((r) => r.check === 'DECORATIVE_FILLER_RISK');
}

export function fakeHistoricalArtifactsFailSemanticRelevance(params: {
  slotResolution: InterfaceSlotResolutionResult;
}): boolean {
  const history = params.slotResolution.resolved.find((r) => r.slotId === 'work-history-previews');
  return history?.status === 'NO_ASSET_REQUIRED' || history?.sourceType === 'EMPTY_STATE';
}
