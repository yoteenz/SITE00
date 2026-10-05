import { FAL_TWIN_FAILURE_CODES } from './constants.js';
import type {
  FalCapabilityClassification,
  FalTwinGenerationReceipt,
  TwinVisualAlignmentReceipt,
} from './types.js';

export function classifyFalParallelTwinCapability(input: {
  receipt: FalTwinGenerationReceipt;
  alignment: TwinVisualAlignmentReceipt;
  fromLiveFal: boolean;
}): { classification: FalCapabilityClassification; failureCode: string | null } {
  if (!input.receipt.authorityArtifactId || !input.receipt.blueprintArtifactId) {
    return {
      classification: 'FAL_PARALLEL_TWIN_CAPABILITY_FAILED',
      failureCode: FAL_TWIN_FAILURE_CODES[0],
    };
  }
  if (input.receipt.authorityArtifactId === input.receipt.blueprintArtifactId) {
    return {
      classification: 'FAL_PARALLEL_TWIN_CAPABILITY_FAILED',
      failureCode: FAL_TWIN_FAILURE_CODES[0],
    };
  }
  if (!input.receipt.sameCompositionState || !input.receipt.sameObjectIds) {
    return {
      classification: 'FAL_PARALLEL_TWIN_CAPABILITY_FAILED',
      failureCode: FAL_TWIN_FAILURE_CODES[3],
    };
  }
  if (input.alignment.majorDriftObjects.length > 0 && input.alignment.status === 'FAIL') {
    return {
      classification: 'FAL_PARALLEL_TWIN_CAPABILITY_FAILED',
      failureCode: FAL_TWIN_FAILURE_CODES[1],
    };
  }
  if (input.alignment.status === 'PENDING_FOUNDER_REVIEW') {
    return {
      classification: 'FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL',
      failureCode: null,
    };
  }
  if (input.alignment.status === 'PASS' && input.fromLiveFal) {
    return { classification: 'FAL_PARALLEL_TWIN_CAPABILITY_PROVEN', failureCode: null };
  }
  if (input.alignment.status === 'PASS' && !input.fromLiveFal) {
    return {
      classification: 'FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL',
      failureCode: null,
    };
  }
  return {
    classification: 'FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL',
    failureCode: null,
  };
}
