/**
 * Forensic trace for every visual generation attempt.
 */

import { createHash } from 'node:crypto';
import type { SurfaceGenerationMode } from './surfaceGenerationMode.js';
import type { VisualGenerationMode } from '../../../site00-visual-reference/types.js';

export type VisualGenerationExecutionTrace = {
  traceId: string;
  surfaceId: string;
  projectId: string;
  generationIntent: string;
  surfaceGenerationMode: SurfaceGenerationMode;
  generationMode: VisualGenerationMode;
  referencePackageId: string | null;
  referenceCount: number;
  selectedReferenceIds: string[];
  authoritySummary: string;
  provider: string;
  model: string;
  providerOperation: 'TEXT_TO_IMAGE' | 'IMAGE_EDIT' | 'REFERENCE_CONDITIONED' | 'BLOCKED' | 'SKIPPED';
  providerRequestId: string | null;
  promptHash: string;
  inputFingerprint: string;
  outputAssetIds: string[];
  fallbackAttempted: boolean;
  fallbackBlocked: boolean;
  failureReason: string | null;
  createdAt: string;
};

export function providerOperationFromModel(params: {
  model: string;
  referenceCount: number;
  blocked: boolean;
}): VisualGenerationExecutionTrace['providerOperation'] {
  if (params.blocked) return 'BLOCKED';
  if (params.referenceCount > 0 && params.model.includes('/edit')) return 'IMAGE_EDIT';
  if (params.referenceCount > 0) return 'REFERENCE_CONDITIONED';
  return 'TEXT_TO_IMAGE';
}

export function buildVisualGenerationExecutionTrace(params: {
  surfaceId: string;
  projectId: string;
  generationIntent: string;
  surfaceGenerationMode: SurfaceGenerationMode;
  generationMode: VisualGenerationMode;
  referencePackageId: string | null;
  referenceCount: number;
  selectedReferenceIds: string[];
  authoritySummary: string;
  provider: string;
  model: string;
  providerRequestId: string | null;
  promptHash: string;
  inputFingerprintSeed: string;
  outputAssetIds: string[];
  fallbackAttempted: boolean;
  fallbackBlocked: boolean;
  failureReason: string | null;
  blocked?: boolean;
}): VisualGenerationExecutionTrace {
  const inputFingerprint = createHash('sha256')
    .update(params.inputFingerprintSeed)
    .digest('hex')
    .slice(0, 16);

  return {
    traceId: `trace-${inputFingerprint}-${Date.now()}`,
    surfaceId: params.surfaceId,
    projectId: params.projectId,
    generationIntent: params.generationIntent,
    surfaceGenerationMode: params.surfaceGenerationMode,
    generationMode: params.generationMode,
    referencePackageId: params.referencePackageId,
    referenceCount: params.referenceCount,
    selectedReferenceIds: params.selectedReferenceIds,
    authoritySummary: params.authoritySummary,
    provider: params.provider,
    model: params.model,
    providerRequestId: params.providerRequestId,
    promptHash: params.promptHash,
    inputFingerprint,
    outputAssetIds: params.outputAssetIds,
    fallbackAttempted: params.fallbackAttempted,
    fallbackBlocked: params.fallbackBlocked,
    failureReason: params.failureReason,
    providerOperation: providerOperationFromModel({
      model: params.model,
      referenceCount: params.referenceCount,
      blocked: Boolean(params.blocked),
    }),
    createdAt: new Date().toISOString(),
  };
}

export function traceExplainsTextToImageFailure(trace: VisualGenerationExecutionTrace): string {
  if (trace.surfaceGenerationMode === 'COMPOSED_INTERFACE' && trace.providerOperation === 'TEXT_TO_IMAGE') {
    return 'COMPOSED_INTERFACE attempted TEXT_TO_IMAGE — full-page or unconstrained generation blocked';
  }
  if (trace.fallbackBlocked) {
    return 'Strict host conditioning blocked silent TEXT_TO_IMAGE fallback';
  }
  if (trace.referenceCount === 0 && trace.generationMode === 'TEXT_TO_IMAGE') {
    return 'No resolvable reference URLs — TEXT_TO_IMAGE would invent host visual language';
  }
  return trace.failureReason ?? 'Unknown';
}
