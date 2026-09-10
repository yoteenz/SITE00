/**
 * P0.VR.8R3R2 — Field-level CaptureRunContractReceipt validation.
 */

import type { CaptureWorkerHealth } from './captureWorkerHealth.js';
import type { ProjectCaptureRunEvent } from './captureRunEvents.js';
import {
  CAPTURE_RUN_CONTRACT_VERSION,
  type ProjectCaptureRunContract,
  type ProjectCaptureRunContractStatus,
} from './projectCaptureRunContract.js';

export type CaptureRunContractErrorCode =
  | 'RUN_ID_MISSING'
  | 'PROJECT_ID_MISSING'
  | 'STATUS_INVALID'
  | 'TOTAL_TARGETS_MISSING'
  | 'COUNT_INVALID'
  | 'WORKER_STATUS_INVALID'
  | 'CONTRACT_VERSION_MISMATCH'
  | 'RUNTIME_URLS_UNRESOLVED'
  | 'TARGET_PLAN_EMPTY'
  | 'JOB_PLAN_EMPTY'
  | 'RUN_CONTRACT_INVALID';

export type CaptureRunContractFieldReceipt = {
  value: string | number | null;
  valid: boolean;
  error: CaptureRunContractErrorCode | null;
};

export type CaptureRunContractReceipt = {
  contractVersion: CaptureRunContractFieldReceipt;
  contractValid: CaptureRunContractFieldReceipt;
  runId: CaptureRunContractFieldReceipt;
  runIdValid: CaptureRunContractFieldReceipt;
  projectId: CaptureRunContractFieldReceipt;
  projectIdValid: CaptureRunContractFieldReceipt;
  status: CaptureRunContractFieldReceipt;
  statusValid: CaptureRunContractFieldReceipt;
  totalTargets: CaptureRunContractFieldReceipt;
  totalTargetsValid: CaptureRunContractFieldReceipt;
  queuedCount: CaptureRunContractFieldReceipt;
  queuedCountValid: CaptureRunContractFieldReceipt;
  capturingCount: CaptureRunContractFieldReceipt;
  capturingCountValid: CaptureRunContractFieldReceipt;
  completedCount: CaptureRunContractFieldReceipt;
  completedCountValid: CaptureRunContractFieldReceipt;
  failedCount: CaptureRunContractFieldReceipt;
  failedCountValid: CaptureRunContractFieldReceipt;
  skippedCount: CaptureRunContractFieldReceipt;
  skippedCountValid: CaptureRunContractFieldReceipt;
  workerStatus: CaptureRunContractFieldReceipt;
  workerStatusValid: CaptureRunContractFieldReceipt;
  startedAt: CaptureRunContractFieldReceipt;
  startedAtValid: CaptureRunContractFieldReceipt;
  updatedAt: CaptureRunContractFieldReceipt;
  updatedAtValid: CaptureRunContractFieldReceipt;
  lastEvent: CaptureRunContractFieldReceipt;
  lastEventValid: CaptureRunContractFieldReceipt;
  errors: CaptureRunContractErrorCode[];
  primaryError: CaptureRunContractErrorCode | null;
  issueCount: number;
};

const VALID_STATUSES: ProjectCaptureRunContractStatus[] = [
  'PLANNING',
  'QUEUING',
  'CAPTURING',
  'PARTIAL',
  'COMPLETE',
  'FAILED',
  'INVALID',
];

const VALID_WORKER_STATUSES: CaptureWorkerHealth['status'][] = ['HEALTHY', 'DEGRADED', 'OFFLINE', 'UNKNOWN'];

function fieldReceipt(
  value: string | number | null,
  valid: boolean,
  error: CaptureRunContractErrorCode | null = null,
): CaptureRunContractFieldReceipt {
  return { value, valid, error };
}

function isValidCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidIso(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Date.parse(value));
}

export function buildCaptureRunContractReceipt(
  contract: Partial<ProjectCaptureRunContract> & Record<string, unknown>,
  options?: { allowPlanningZeroTargets?: boolean },
): CaptureRunContractReceipt {
  const errors: CaptureRunContractErrorCode[] = [];
  const allowPlanningZeroTargets = options?.allowPlanningZeroTargets ?? false;

  const version = String(contract.contractVersion ?? '');
  const versionValid = version === CAPTURE_RUN_CONTRACT_VERSION;
  if (!versionValid) errors.push('CONTRACT_VERSION_MISMATCH');

  const runId = typeof contract.runId === 'string' ? contract.runId : '';
  const runIdValid = runId.trim().length > 0;
  if (!runIdValid) errors.push('RUN_ID_MISSING');

  const projectId = typeof contract.projectId === 'string' ? contract.projectId : '';
  const projectIdValid = projectId.trim().length > 0;
  if (!projectIdValid) errors.push('PROJECT_ID_MISSING');

  const status = contract.status as ProjectCaptureRunContractStatus | undefined;
  const statusValid = Boolean(status && VALID_STATUSES.includes(status));
  if (!statusValid) errors.push('STATUS_INVALID');

  const totalTargets = typeof contract.totalTargets === 'number' ? contract.totalTargets : NaN;
  const totalTargetsValid =
    isValidCount(totalTargets) &&
    (allowPlanningZeroTargets && status === 'PLANNING' ? true : totalTargets > 0 || status === 'INVALID');
  if (!totalTargetsValid) errors.push('TOTAL_TARGETS_MISSING');

  const queuedCount = contract.queuedCount;
  const queuedCountValid = isValidCount(queuedCount);
  if (!queuedCountValid) errors.push('COUNT_INVALID');

  const capturingCount = contract.capturingCount;
  const capturingCountValid = isValidCount(capturingCount);
  if (!capturingCountValid) errors.push('COUNT_INVALID');

  const completedCount = contract.completedCount;
  const completedCountValid = isValidCount(completedCount);
  if (!completedCountValid) errors.push('COUNT_INVALID');

  const failedCount = contract.failedCount;
  const failedCountValid = isValidCount(failedCount);
  if (!failedCountValid) errors.push('COUNT_INVALID');

  const skippedCount = contract.skippedCount;
  const skippedCountValid = isValidCount(skippedCount);
  if (!skippedCountValid) errors.push('COUNT_INVALID');

  const workerStatus = contract.workerStatus as CaptureWorkerHealth['status'] | undefined;
  const workerStatusValid = Boolean(workerStatus && VALID_WORKER_STATUSES.includes(workerStatus));
  if (!workerStatusValid) errors.push('WORKER_STATUS_INVALID');

  const startedAt = typeof contract.startedAt === 'string' ? contract.startedAt : null;
  const startedAtValid = isValidIso(startedAt);
  if (!startedAtValid) errors.push('RUN_CONTRACT_INVALID');

  const updatedAt = typeof contract.updatedAt === 'string' ? contract.updatedAt : null;
  const updatedAtValid = isValidIso(updatedAt);
  if (!updatedAtValid) errors.push('RUN_CONTRACT_INVALID');

  const lastEvent = contract.lastEvent as ProjectCaptureRunEvent | null | undefined;
  const lastEventValid = lastEvent == null || typeof lastEvent.type === 'string';

  const contractValid = errors.length === 0;
  const uniqueErrors = [...new Set(errors)];

  return {
    contractVersion: fieldReceipt(version || null, versionValid, versionValid ? null : 'CONTRACT_VERSION_MISMATCH'),
    contractValid: fieldReceipt(contractValid ? 'YES' : 'NO', contractValid, contractValid ? null : uniqueErrors[0] ?? 'RUN_CONTRACT_INVALID'),
    runId: fieldReceipt(runId || null, runIdValid, runIdValid ? null : 'RUN_ID_MISSING'),
    runIdValid: fieldReceipt(runIdValid ? 'YES' : 'NO', runIdValid, runIdValid ? null : 'RUN_ID_MISSING'),
    projectId: fieldReceipt(projectId || null, projectIdValid, projectIdValid ? null : 'PROJECT_ID_MISSING'),
    projectIdValid: fieldReceipt(projectIdValid ? 'YES' : 'NO', projectIdValid, projectIdValid ? null : 'PROJECT_ID_MISSING'),
    status: fieldReceipt(status ?? null, statusValid, statusValid ? null : 'STATUS_INVALID'),
    statusValid: fieldReceipt(statusValid ? 'YES' : 'NO', statusValid, statusValid ? null : 'STATUS_INVALID'),
    totalTargets: fieldReceipt(Number.isFinite(totalTargets) ? totalTargets : null, totalTargetsValid, totalTargetsValid ? null : 'TOTAL_TARGETS_MISSING'),
    totalTargetsValid: fieldReceipt(totalTargetsValid ? 'YES' : 'NO', totalTargetsValid, totalTargetsValid ? null : 'TOTAL_TARGETS_MISSING'),
    queuedCount: fieldReceipt(isValidCount(queuedCount) ? queuedCount : null, queuedCountValid, queuedCountValid ? null : 'COUNT_INVALID'),
    queuedCountValid: fieldReceipt(queuedCountValid ? 'YES' : 'NO', queuedCountValid, queuedCountValid ? null : 'COUNT_INVALID'),
    capturingCount: fieldReceipt(isValidCount(capturingCount) ? capturingCount : null, capturingCountValid, capturingCountValid ? null : 'COUNT_INVALID'),
    capturingCountValid: fieldReceipt(capturingCountValid ? 'YES' : 'NO', capturingCountValid, capturingCountValid ? null : 'COUNT_INVALID'),
    completedCount: fieldReceipt(isValidCount(completedCount) ? completedCount : null, completedCountValid, completedCountValid ? null : 'COUNT_INVALID'),
    completedCountValid: fieldReceipt(completedCountValid ? 'YES' : 'NO', completedCountValid, completedCountValid ? null : 'COUNT_INVALID'),
    failedCount: fieldReceipt(isValidCount(failedCount) ? failedCount : null, failedCountValid, failedCountValid ? null : 'COUNT_INVALID'),
    failedCountValid: fieldReceipt(failedCountValid ? 'YES' : 'NO', failedCountValid, failedCountValid ? null : 'COUNT_INVALID'),
    skippedCount: fieldReceipt(isValidCount(skippedCount) ? skippedCount : null, skippedCountValid, skippedCountValid ? null : 'COUNT_INVALID'),
    skippedCountValid: fieldReceipt(skippedCountValid ? 'YES' : 'NO', skippedCountValid, skippedCountValid ? null : 'COUNT_INVALID'),
    workerStatus: fieldReceipt(workerStatus ?? null, workerStatusValid, workerStatusValid ? null : 'WORKER_STATUS_INVALID'),
    workerStatusValid: fieldReceipt(workerStatusValid ? 'YES' : 'NO', workerStatusValid, workerStatusValid ? null : 'WORKER_STATUS_INVALID'),
    startedAt: fieldReceipt(startedAt, startedAtValid, startedAtValid ? null : 'RUN_CONTRACT_INVALID'),
    startedAtValid: fieldReceipt(startedAtValid ? 'YES' : 'NO', startedAtValid, startedAtValid ? null : 'RUN_CONTRACT_INVALID'),
    updatedAt: fieldReceipt(updatedAt, updatedAtValid, updatedAtValid ? null : 'RUN_CONTRACT_INVALID'),
    updatedAtValid: fieldReceipt(updatedAtValid ? 'YES' : 'NO', updatedAtValid, updatedAtValid ? null : 'RUN_CONTRACT_INVALID'),
    lastEvent: fieldReceipt(lastEvent?.type ?? null, lastEventValid, lastEventValid ? null : 'RUN_CONTRACT_INVALID'),
    lastEventValid: fieldReceipt(lastEventValid ? 'YES' : 'NO', lastEventValid, lastEventValid ? null : 'RUN_CONTRACT_INVALID'),
    errors: uniqueErrors,
    primaryError: uniqueErrors[0] ?? null,
    issueCount: uniqueErrors.length,
  };
}

export function primaryContractErrorFromReceipt(receipt: CaptureRunContractReceipt): CaptureRunContractErrorCode | null {
  return receipt.primaryError;
}
