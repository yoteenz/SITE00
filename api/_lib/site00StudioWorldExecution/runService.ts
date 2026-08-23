/**
 * Studio World run service — execution envelope lifecycle.
 */

import { randomUUID } from 'node:crypto';
import type {
  StudioWorldNormalizedStatus,
  StudioWorldRunRecord,
  StudioWorldRunType,
} from '../../../shared/site00-studio-world-execution/types.js';
import * as store from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

export type CreateStudioWorldRunInput = {
  projectId?: string | null;
  projectSlug?: string | null;
  brandId?: string | null;
  brandSlug?: string | null;
  runType: StudioWorldRunType;
  runSubtype?: string | null;
  methodologyDomain?: string | null;
  methodologyVersion?: string | null;
  experimentId?: string | null;
  experimentVersion?: string | null;
  parentRunId?: string | null;
  rootRunId?: string | null;
  idempotencyKey?: string | null;
  inputFingerprint?: string | null;
  status?: string;
  normalizedStatus?: StudioWorldNormalizedStatus;
  requestedBy?: string | null;
  triggerType?: string | null;
  domainRecordType?: string | null;
  domainRecordId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createStudioWorldRun(input: CreateStudioWorldRunInput): Promise<StudioWorldRunRecord> {
  const ts = nowIso();
  const record: StudioWorldRunRecord = {
    id: randomUUID(),
    projectId: input.projectId ?? null,
    projectSlug: input.projectSlug ?? null,
    brandId: input.brandId ?? null,
    brandSlug: input.brandSlug ?? null,
    runType: input.runType,
    runSubtype: input.runSubtype ?? null,
    methodologyDomain: input.methodologyDomain ?? null,
    methodologyVersion: input.methodologyVersion ?? null,
    experimentId: input.experimentId ?? null,
    experimentVersion: input.experimentVersion ?? null,
    parentRunId: input.parentRunId ?? null,
    rootRunId: input.rootRunId ?? input.parentRunId ?? null,
    idempotencyKey: input.idempotencyKey ?? null,
    status: input.status ?? 'CREATED',
    normalizedStatus: input.normalizedStatus ?? 'CREATED',
    requestedBy: input.requestedBy ?? null,
    triggerType: input.triggerType ?? null,
    createdAt: ts,
    startedAt: null,
    completedAt: null,
    failedAt: null,
    cancelledAt: null,
    supersededAt: null,
    inputFingerprint: input.inputFingerprint ?? null,
    outputFingerprint: null,
    snapshotId: null,
    snapshotFingerprint: null,
    providerSummary: {},
    costSummary: {},
    errorSummary: null,
    metadata: input.metadata ?? {},
    domainRecordType: input.domainRecordType ?? null,
    domainRecordId: input.domainRecordId ?? null,
    version: 1,
    updatedAt: ts,
  };

  if (input.idempotencyKey && input.inputFingerprint) {
    const existing = await store.findIdempotencyKey({
      projectSlug: input.projectSlug ?? null,
      idempotencyKey: input.idempotencyKey,
      inputFingerprint: input.inputFingerprint,
    });
    if (existing) {
      const run = await store.getStudioWorldRunById(existing.runId);
      if (run) return run;
    }
    await store.registerIdempotencyKey({
      projectId: input.projectId ?? null,
      projectSlug: input.projectSlug ?? null,
      idempotencyKey: input.idempotencyKey,
      inputFingerprint: input.inputFingerprint,
      runId: record.id,
      runType: input.runType,
    });
  }

  return store.saveStudioWorldRun(record);
}

export async function transitionStudioWorldRun(params: {
  runId: string;
  status: string;
  normalizedStatus: StudioWorldNormalizedStatus;
  expectedVersion: number;
  outputFingerprint?: string | null;
  providerSummary?: StudioWorldRunRecord['providerSummary'];
  costSummary?: StudioWorldRunRecord['costSummary'];
  errorSummary?: StudioWorldRunRecord['errorSummary'];
}): Promise<StudioWorldRunRecord> {
  const existing = await store.getStudioWorldRunById(params.runId);
  if (!existing) throw new Error(`Run not found: ${params.runId}`);

  const ts = nowIso();
  const next: StudioWorldRunRecord = {
    ...existing,
    status: params.status,
    normalizedStatus: params.normalizedStatus,
    outputFingerprint: params.outputFingerprint ?? existing.outputFingerprint,
    providerSummary: params.providerSummary ?? existing.providerSummary,
    costSummary: params.costSummary ?? existing.costSummary,
    errorSummary: params.errorSummary ?? existing.errorSummary,
    startedAt: existing.startedAt ?? (params.normalizedStatus === 'RUNNING' ? ts : null),
    completedAt: params.normalizedStatus === 'SUCCEEDED' ? ts : existing.completedAt,
    failedAt: params.normalizedStatus === 'FAILED' ? ts : existing.failedAt,
    cancelledAt: params.normalizedStatus === 'CANCELLED' ? ts : existing.cancelledAt,
    supersededAt: params.normalizedStatus === 'SUPERSEDED' ? ts : existing.supersededAt,
    updatedAt: ts,
  };

  return store.saveStudioWorldRunWithVersionCheck(next, params.expectedVersion);
}

export async function recoverInterruptedRuns(): Promise<StudioWorldRunRecord[]> {
  const runs = await store.listStudioWorldRuns({ limit: 200 });
  const interrupted = runs.filter((r) =>
    ['RUNNING', 'WAITING_FOR_PROVIDER'].includes(r.normalizedStatus),
  );
  const recovered: StudioWorldRunRecord[] = [];
  for (const run of interrupted) {
    const next = await store.saveStudioWorldRunWithVersionCheck(
      {
        ...run,
        status: 'RECOVERY_REQUIRED',
        normalizedStatus: 'RECOVERY_REQUIRED',
        errorSummary: {
          category: 'RECOVERY_REQUIRED',
          message: 'Process restart detected — provider dispatch state unknown; manual reconciliation required',
          recoveryHint: 'Inspect provider receipts before redispatching expensive operations',
        },
        updatedAt: nowIso(),
      },
      run.version,
    );
    recovered.push(next);
  }
  return recovered;
}

export { getStudioWorldRunById, listStudioWorldRuns } from './storeAdapter.js';
