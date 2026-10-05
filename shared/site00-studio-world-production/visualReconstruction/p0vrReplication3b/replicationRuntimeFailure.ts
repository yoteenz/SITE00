/**
 * P0.VR.REPLICATION.3B-R1 — Classify replication build failures for founder UX.
 */

export const REPLICATION_RUNTIME_ERROR_CODES = [
  'CLIENT_RUNTIME_REPLICATION_ERROR',
  'VISION_API_UNAVAILABLE',
  'VISION_PROVIDER_ERROR',
  'VISION_REPLICATION_CAPABILITY_LIMIT',
] as const;

export type ReplicationRuntimeErrorCode = (typeof REPLICATION_RUNTIME_ERROR_CODES)[number];

export const REPLICATION_FAILURE_CLASSES = [
  'CLIENT_RUNTIME_ERROR',
  'API_UNAVAILABLE',
  'VISION_PROVIDER_ERROR',
  'VISION_CAPABILITY_LIMIT',
  'EXECUTION_STRATEGY_LIMIT',
] as const;

export type ReplicationFailureClass = (typeof REPLICATION_FAILURE_CLASSES)[number];

export function classifyReplicationBuildError(message: string): {
  failureClass: ReplicationFailureClass;
  errorCode: string;
  founderSummary: string;
  showSwitchImplementationStrategy: boolean;
} {
  const lower = message.toLowerCase();
  if (
    lower.includes("can't find variable: process") ||
    lower.includes('process is not defined') ||
    lower.includes('referenceerror') && lower.includes('process')
  ) {
    return {
      failureClass: 'CLIENT_RUNTIME_ERROR',
      errorCode: 'CLIENT_RUNTIME_REPLICATION_ERROR',
      founderSummary:
        'REPLICATION COULDN\'T START — a runtime configuration error interrupted replication before the visual build began. Live page unchanged.',
      showSwitchImplementationStrategy: false,
    };
  }
  if (lower.includes('vision_api_unavailable') || lower.includes('vision_provider_unavailable') || lower.includes('503')) {
    return {
      failureClass: 'API_UNAVAILABLE',
      errorCode: 'VISION_API_UNAVAILABLE',
      founderSummary: 'Vision API is unavailable — redeploy Railway API or retry after connectivity is restored.',
      showSwitchImplementationStrategy: false,
    };
  }
  if (lower.includes('vision_replication_capability_limit')) {
    return {
      failureClass: 'VISION_CAPABILITY_LIMIT',
      errorCode: 'VISION_REPLICATION_CAPABILITY_LIMIT',
      founderSummary: 'Vision replication reached capability limit after correction passes.',
      showSwitchImplementationStrategy: true,
    };
  }
  if (lower.includes('vision_')) {
    return {
      failureClass: 'VISION_PROVIDER_ERROR',
      errorCode: 'VISION_PROVIDER_ERROR',
      founderSummary: 'Vision provider returned an error during replication.',
      showSwitchImplementationStrategy: false,
    };
  }
  return {
    failureClass: 'CLIENT_RUNTIME_ERROR',
    errorCode: 'PATCH_APPLICATION_FAILED',
    founderSummary: message,
    showSwitchImplementationStrategy: false,
  };
}

export type VisionExecutionStageReceipt = {
  visionRequestPreparation: 'NOT_STARTED' | 'RUNNING' | 'PASS' | 'FAIL';
  visionRequest: 'NOT_STARTED' | 'RUNNING' | 'PASS' | 'FAIL';
  literalSpec: 'NOT_STARTED' | 'RUNNING' | 'PASS' | 'FAIL';
  source: 'NOT_STARTED' | 'RUNNING' | 'PASS' | 'FAIL';
  render: 'NOT_STARTED' | 'RUNNING' | 'PASS' | 'FAIL';
};

export function visionStagesForRuntimeCrash(): VisionExecutionStageReceipt {
  return {
    visionRequestPreparation: 'FAIL',
    visionRequest: 'NOT_STARTED',
    literalSpec: 'NOT_STARTED',
    source: 'NOT_STARTED',
    render: 'NOT_STARTED',
  };
}
