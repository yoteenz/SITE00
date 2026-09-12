/**
 * P0.VR.REPLICATION.1R1 — Single execution receipt (no new subsystem).
 */

export const REPLICATION_EXECUTION_STAGES = [
  'reference',
  'blueprint',
  'functionGraph',
  'bindings',
  'composition',
  'source',
  'build',
  'route',
  'render',
] as const;

export type ReplicationExecutionStage = (typeof REPLICATION_EXECUTION_STAGES)[number];
export type ReplicationStageStatus = 'NOT_STARTED' | 'RUNNING' | 'PASS' | 'FAIL';

export const REPLICATION_EXECUTION_MODES = ['BLUEPRINT_COMPOSER', 'DIRECT_SOURCE_RECONSTRUCTION'] as const;
export type ReplicationExecutionMode = (typeof REPLICATION_EXECUTION_MODES)[number];

export type ReplicationStageReceipt = {
  stage: ReplicationExecutionStage;
  status: ReplicationStageStatus;
  errorCode: string | null;
  errorMessage: string | null;
};

export type ReplicationExecutionReceipt = {
  receiptId: string;
  sessionId: string;
  executionMode: ReplicationExecutionMode | null;
  blueprintComposer: 'PASS' | 'FAIL' | 'SKIPPED';
  directSourceFallback: 'PASS' | 'FAIL' | 'NOT_NEEDED' | 'SKIPPED';
  failedStage: ReplicationExecutionStage | null;
  stages: ReplicationStageReceipt[];
  macroIterations: number;
  twinRoute: string | null;
  renderProof: string | null;
  nextStrategy: 'CONTINUE_REFINEMENT' | 'SWITCH_IMPLEMENTATION_APPROACH' | null;
  status: 'PASS' | 'FAIL';
  /** P0.VR.REPLICATION.3B-R1 */
  failureClass?: import('../p0vrReplication3b/replicationRuntimeFailure.js').ReplicationFailureClass | null;
  runtimeErrorCode?: string | null;
  visionStages?: import('../p0vrReplication3b/replicationRuntimeFailure.js').VisionExecutionStageReceipt | null;
};

export function initReplicationExecutionReceipt(sessionId: string): ReplicationExecutionReceipt {
  return {
    receiptId: `rer_${sessionId}_${Date.now()}`,
    sessionId,
    executionMode: null,
    blueprintComposer: 'SKIPPED',
    directSourceFallback: 'SKIPPED',
    failedStage: null,
    stages: REPLICATION_EXECUTION_STAGES.map((stage) => ({
      stage,
      status: 'NOT_STARTED',
      errorCode: null,
      errorMessage: null,
    })),
    macroIterations: 0,
    twinRoute: null,
    renderProof: null,
    nextStrategy: null,
    status: 'FAIL',
    failureClass: null,
    runtimeErrorCode: null,
    visionStages: null,
  };
}

export function setStage(
  receipt: ReplicationExecutionReceipt,
  stage: ReplicationExecutionStage,
  status: ReplicationStageStatus,
  error?: { code: string; message: string },
): ReplicationExecutionReceipt {
  const stages = receipt.stages.map((s) =>
    s.stage === stage
      ? {
          ...s,
          status,
          errorCode: error?.code ?? (status === 'FAIL' ? s.errorCode : null),
          errorMessage: error?.message ?? (status === 'FAIL' ? s.errorMessage : null),
        }
      : s,
  );
  const failedStage =
    status === 'FAIL' ? stage : receipt.failedStage;
  return { ...receipt, stages, failedStage };
}

export function stageLabel(stage: ReplicationExecutionStage): string {
  return stage.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim().toUpperCase();
}
