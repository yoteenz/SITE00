/**
 * P0.VR.8R3R1 — Durable capture run / target / job state (survives API poll cycles).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { PageCaptureQueueJob } from '../p0vr8/types.js';
import type { ProjectCaptureRunEvent } from './captureRunEvents.js';
import type { WorkerDispatchReceipt } from './workerDispatchReceipt.js';
import type { ProjectCaptureRunContractStatus } from './projectCaptureRunContract.js';
import type { CaptureWorkerBootReceipt } from './captureWorkerBootReceipt.js';
import type { CaptureWorkerEvent } from './captureWorkerEvents.js';
import type { CaptureWorkerCapability } from './captureWorkerIdentity.js';
import type { CaptureWorkerHealthStatus } from './captureWorkerHealth.js';

export const CAPTURE_ORCHESTRATION_REGISTRY_RELATIVE_PATH =
  'public/studio-world/design/capture-orchestration-registry.json';

export type PageCaptureTarget = {
  targetId: string;
  runId: string;
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  displayRoute?: string | null;
  resolvedRuntimePath?: string | null;
  captureUrl?: string | null;
  resolutionSource?: string | null;
  routeValid?: boolean;
  viewport: DesignViewportClass;
  status: 'PLANNED' | 'QUEUED' | 'CAPTURING' | 'COMPLETE' | 'FAILED' | 'SKIPPED' | 'NEEDS_REVIEW';
  jobId: string | null;
};

export type PersistedCaptureRun = {
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
  lastError: string | null;
  viewportMode: 'MOBILE_ONLY' | 'ALL_SUPPORTED';
  contractValid: boolean;
  invalidReason?: string | null;
};

export type PersistedCaptureQueueJob = PageCaptureQueueJob & {
  runId?: string;
  targetId?: string;
  claimedBy?: string | null;
  claimedAt?: string | null;
  leaseExpiresAt?: string | null;
  acknowledgedAt?: string | null;
};

export type PersistedWorkerRecord = {
  workerId: string;
  serviceId: string;
  instanceId: string;
  buildVersion: string;
  contractVersion: string;
  startedAt: string;
  environment: string;
  capabilities: CaptureWorkerCapability[];
  status: CaptureWorkerHealthStatus | 'STARTING';
  lastHeartbeat: string | null;
  activeJobCount: number;
  queueDepth: number;
  lastAcceptedJobAt: string | null;
  lastCompletedJobAt: string | null;
  lastError: string | null;
  playwrightReady: boolean;
  browserReady: boolean;
  bootReceipt: CaptureWorkerBootReceipt | null;
  lastDispatchAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  concurrencyLimit: number;
};

export type CaptureWorkerTestJob = {
  jobId: string;
  status: 'QUEUED' | 'CLAIMED' | 'ACKNOWLEDGED' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  workerId: string | null;
  queuedAt: string;
  claimedAt: string | null;
  acknowledgedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  lastError: string | null;
};

export type CaptureOrchestrationRegistry = {
  schemaVersion: 'site00-capture-orchestration@1';
  updatedAt: string;
  activeRunByProject: Record<string, string>;
  runs: PersistedCaptureRun[];
  targets: PageCaptureTarget[];
  jobs: PersistedCaptureQueueJob[];
  events: ProjectCaptureRunEvent[];
  dispatchReceipts: WorkerDispatchReceipt[];
  workers?: Record<string, PersistedWorkerRecord>;
  workerEvents?: CaptureWorkerEvent[];
  workerTestJobs?: CaptureWorkerTestJob[];
  lastSuccessfulTestJobAt?: string | null;
};

let memoryRegistry: CaptureOrchestrationRegistry | null = null;
let repoRoot = process.cwd();

function defaultRegistry(): CaptureOrchestrationRegistry {
  return {
    schemaVersion: 'site00-capture-orchestration@1',
    updatedAt: new Date().toISOString(),
    activeRunByProject: {},
    runs: [],
    targets: [],
    jobs: [],
    events: [],
    dispatchReceipts: [],
    workers: {},
    workerEvents: [],
    workerTestJobs: [],
    lastSuccessfulTestJobAt: null,
  };
}

export function setCaptureRunRepoRoot(root: string): void {
  repoRoot = root;
  memoryRegistry = null;
}

export function resolveCaptureOrchestrationRegistryPath(root = repoRoot): string {
  return join(root, CAPTURE_ORCHESTRATION_REGISTRY_RELATIVE_PATH);
}

export function loadCaptureOrchestrationRegistry(root = repoRoot): CaptureOrchestrationRegistry {
  if (memoryRegistry) return memoryRegistry;
  const path = resolveCaptureOrchestrationRegistryPath(root);
  if (!existsSync(path)) {
    memoryRegistry = defaultRegistry();
    return memoryRegistry;
  }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as CaptureOrchestrationRegistry;
    memoryRegistry = {
      ...defaultRegistry(),
      ...parsed,
      workers: parsed.workers ?? {},
      workerEvents: parsed.workerEvents ?? [],
      workerTestJobs: parsed.workerTestJobs ?? [],
    };
    return memoryRegistry;
  } catch {
    memoryRegistry = defaultRegistry();
    return memoryRegistry;
  }
}

export function saveCaptureOrchestrationRegistry(
  registry: CaptureOrchestrationRegistry,
  root = repoRoot,
): void {
  memoryRegistry = { ...registry, updatedAt: new Date().toISOString() };
  if (process.env.VITEST === 'true' && process.env.PERSIST_CAPTURE_RUNS_IN_TEST !== '1') {
    return;
  }
  try {
    const path = resolveCaptureOrchestrationRegistryPath(root);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(memoryRegistry, null, 2), 'utf8');
  } catch {
    /* read-only FS in browser bundle */
  }
}

export function mutateCaptureOrchestrationRegistry(
  mutator: (registry: CaptureOrchestrationRegistry) => void,
  root = repoRoot,
): CaptureOrchestrationRegistry {
  const registry = loadCaptureOrchestrationRegistry(root);
  mutator(registry);
  saveCaptureOrchestrationRegistry(registry, root);
  return registry;
}

export function hydrateCaptureQueueFromRegistry(
  applyJob: (job: PageCaptureQueueJob & { runId?: string; targetId?: string }) => void,
  root = repoRoot,
): void {
  const registry = loadCaptureOrchestrationRegistry(root);
  for (const job of registry.jobs) {
    if (job.status === 'QUEUED' || job.status === 'CAPTURING') {
      applyJob(job);
    }
  }
}

export function clearCaptureOrchestrationRegistryForTest(): void {
  memoryRegistry = defaultRegistry();
}
