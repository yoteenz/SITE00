/**
 * P0.VR.8R3R1 — Canonical ProjectCaptureRunContract (capture-run-v1).
 */

import type { CaptureWorkerHealth } from './captureWorkerHealth.js';
import type { ProjectCaptureRunEvent } from './captureRunEvents.js';
import type { BuildVersionReceipt } from './buildVersionReceipt.js';

export const CAPTURE_RUN_CONTRACT_VERSION = 'capture-run-v1' as const;

export type ProjectCaptureRunContractStatus =
  | 'PLANNING'
  | 'QUEUING'
  | 'CAPTURING'
  | 'PARTIAL'
  | 'COMPLETE'
  | 'FAILED'
  | 'INVALID';

export type ProjectCaptureRunContract = {
  contractVersion: typeof CAPTURE_RUN_CONTRACT_VERSION;
  runId: string;
  projectId: string;
  status: ProjectCaptureRunContractStatus;
  totalTargets: number;
  queuedCount: number;
  capturingCount: number;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  currentTargetId: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  workerStatus: CaptureWorkerHealth['status'];
  lastEvent: ProjectCaptureRunEvent | null;
  lastError: string | null;
  contractValid: boolean;
  contractError: string | null;
  duplicateBlocked?: boolean;
  activeRunId?: string | null;
  buildReceipt?: BuildVersionReceipt;
};

function safeCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return 0;
}

function pickRunId(raw: Record<string, unknown>): string {
  const id = raw.runId ?? raw.captureRefreshRunId ?? raw.activeRunId;
  return typeof id === 'string' ? id : '';
}

export function validateProjectCaptureRunContract(
  contract: ProjectCaptureRunContract,
): { valid: boolean; error: string | null } {
  if (contract.contractVersion !== CAPTURE_RUN_CONTRACT_VERSION) {
    return { valid: false, error: 'CAPTURE_RUN_CONTRACT_MISMATCH' };
  }
  if (!contract.runId) return { valid: false, error: 'RUN_CONTRACT_INVALID' };
  if (!contract.projectId) return { valid: false, error: 'RUN_CONTRACT_INVALID' };
  if (!contract.status) return { valid: false, error: 'RUN_CONTRACT_INVALID' };
  if (contract.status !== 'PLANNING' && contract.totalTargets <= 0 && contract.status !== 'INVALID') {
    return { valid: false, error: 'RUN_TARGETS_MISSING' };
  }
  return { valid: true, error: null };
}

export function normalizeProjectCaptureRunResponse(
  raw: Record<string, unknown> | null | undefined,
  options?: {
    workerHealth?: CaptureWorkerHealth | null;
    lastEvent?: ProjectCaptureRunEvent | null;
    buildReceipt?: BuildVersionReceipt;
    duplicateBlocked?: boolean;
    activeRunId?: string | null;
  },
): ProjectCaptureRunContract {
  const workerStatus = options?.workerHealth?.status ?? (raw?.workerStatus as CaptureWorkerHealth['status']) ?? 'UNKNOWN';

  if (!raw) {
    return {
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      runId: '',
      projectId: '',
      status: 'INVALID',
      totalTargets: 0,
      queuedCount: 0,
      capturingCount: 0,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentTargetId: null,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      workerStatus,
      lastEvent: options?.lastEvent ?? null,
      lastError: 'RUN_NOT_FOUND',
      contractValid: false,
      contractError: 'RUN_CONTRACT_INVALID',
      buildReceipt: options?.buildReceipt,
    };
  }

  const version = (raw.contractVersion as string) ?? CAPTURE_RUN_CONTRACT_VERSION;
  if (version !== CAPTURE_RUN_CONTRACT_VERSION) {
    return {
      contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
      runId: pickRunId(raw),
      projectId: String(raw.projectId ?? ''),
      status: 'INVALID',
      totalTargets: 0,
      queuedCount: 0,
      capturingCount: 0,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentTargetId: null,
      startedAt: String(raw.startedAt ?? new Date().toISOString()),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      workerStatus,
      lastEvent: options?.lastEvent ?? null,
      lastError: 'CAPTURE_RUN_CONTRACT_MISMATCH',
      contractValid: false,
      contractError: 'CAPTURE_RUN_CONTRACT_MISMATCH',
      buildReceipt: options?.buildReceipt,
    };
  }

  const totalTargets = safeCount(raw.totalTargets ?? raw.totalPages);
  const contract: ProjectCaptureRunContract = {
    contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
    runId: pickRunId(raw),
    projectId: String(raw.projectId ?? ''),
    status: (raw.status as ProjectCaptureRunContractStatus) ?? 'INVALID',
    totalTargets,
    queuedCount: safeCount(raw.queuedCount),
    capturingCount: safeCount(raw.capturingCount),
    completedCount: safeCount(raw.completedCount),
    failedCount: safeCount(raw.failedCount),
    skippedCount: safeCount(raw.skippedCount),
    currentTargetId: typeof raw.currentTargetId === 'string' ? raw.currentTargetId : null,
    startedAt: String(raw.startedAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.startedAt ?? new Date().toISOString()),
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
    workerStatus,
    lastEvent: options?.lastEvent ?? (raw.lastEvent as ProjectCaptureRunEvent | null) ?? null,
    lastError: typeof raw.lastError === 'string' ? raw.lastError : null,
    contractValid: true,
    contractError: null,
    duplicateBlocked: Boolean(raw.duplicateBlocked ?? options?.duplicateBlocked),
    activeRunId: typeof raw.activeRunId === 'string' ? raw.activeRunId : options?.activeRunId ?? null,
    buildReceipt: options?.buildReceipt ?? (raw.buildReceipt as BuildVersionReceipt | undefined),
  };

  const validation = validateProjectCaptureRunContract(contract);
  if (!validation.valid) {
    contract.contractValid = false;
    contract.contractError = validation.error;
    if (validation.error === 'RUN_TARGETS_MISSING') contract.status = 'INVALID';
  }

  return contract;
}

export function captureRunProgressLabel(contract: ProjectCaptureRunContract | null): string {
  if (!contract || !contract.contractValid) return 'CAPTURE RUN COULD NOT INITIALIZE';
  const done = contract.completedCount + contract.failedCount + contract.skippedCount;
  if (contract.totalTargets <= 0) return `${contract.status}`;
  return `${contract.status} · ${done}/${contract.totalTargets}`;
}
