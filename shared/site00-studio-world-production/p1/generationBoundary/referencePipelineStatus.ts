/**
 * Reference pipeline status — fail loud, never silent fallback.
 */

import type { VisualReferencePackage } from '../../../site00-visual-reference/types.js';
import { resolveVisualGenerationMode, shouldFailWithoutReferenceConditioning } from '../../../site00-visual-reference/generationModeResolver.js';

export const REFERENCE_PIPELINE_STATUSES = [
  'REFERENCE_CAPTURE_REQUIRED',
  'REFERENCE_CAPTURE_FAILED',
  'REFERENCE_PACKAGE_INCOMPLETE',
  'REFERENCE_STALE',
  'REFERENCE_CONDITIONING_UNSUPPORTED',
  'PROVIDER_MODE_MISMATCH',
  'AUTHENTICATED_REFERENCE_REQUIRED',
  'READY_FOR_REFERENCE_CONDITIONED_GENERATION',
  'NOT_STARTED',
] as const;

export type ReferencePipelineStatus = (typeof REFERENCE_PIPELINE_STATUSES)[number];

export function evaluateReferencePipelineStatus(params: {
  referencePackage: VisualReferencePackage | null;
  requireStrictHost: boolean;
  requireMobileEvidence?: boolean;
  mobileReferenceCount?: number;
  authenticatedProjectsReferenceValid?: boolean;
}): ReferencePipelineStatus {
  if (!params.referencePackage) return 'NOT_STARTED';

  if (params.requireStrictHost && params.authenticatedProjectsReferenceValid === false) {
    return 'AUTHENTICATED_REFERENCE_REQUIRED';
  }

  const resolvable = params.referencePackage.references.filter((r) => r.publicUrl || r.storagePath);
  if (resolvable.length === 0) return 'REFERENCE_PACKAGE_INCOMPLETE';

  const urls = resolvable.map((r) => r.publicUrl).filter(Boolean);
  const mode = resolveVisualGenerationMode({ referencePackage: params.referencePackage });

  if (
    shouldFailWithoutReferenceConditioning({
      strictHostVisualConditioning: params.requireStrictHost,
      generationMode: mode,
      referenceCount: urls.length,
    })
  ) {
    return 'PROVIDER_MODE_MISMATCH';
  }

  if (params.requireStrictHost && urls.length === 0) {
    return 'REFERENCE_CAPTURE_FAILED';
  }

  if (params.requireMobileEvidence && (params.mobileReferenceCount ?? 0) === 0) {
    return 'REFERENCE_PACKAGE_INCOMPLETE';
  }

  if (mode === 'TEXT_TO_IMAGE' && params.requireStrictHost) {
    return 'REFERENCE_CONDITIONING_UNSUPPORTED';
  }

  return 'READY_FOR_REFERENCE_CONDITIONED_GENERATION';
}

export function assertReferencePipelineReady(status: ReferencePipelineStatus): void {
  if (status !== 'READY_FOR_REFERENCE_CONDITIONED_GENERATION') {
    throw new Error(`REFERENCE_PIPELINE_BLOCKED: ${status}`);
  }
}
