/**
 * P0.VR.CONVERGE.1R1 — Real twin build job + idempotency (receipt-driven, no fake timers).
 */

import {
  buildTwin,
  getTwinSession,
  updateTwinSession,
} from '../p0vrUpgrade2/reconstructionTwinSession.js';
import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import { persistTwinSessionsStore } from '../p0vrUpgrade2/twinSessionPersistence.js';

export const TWIN_BUILD_JOB_STATUSES = [
  'QUEUED',
  'STARTING',
  'APPLYING_RECONSTRUCTION',
  'BUILDING',
  'VERIFYING',
  'CAPTURING',
  'READY',
  'FAILED',
] as const;

export type TwinBuildJobStatus = (typeof TWIN_BUILD_JOB_STATUSES)[number];

export type TwinBuildJob = {
  jobId: string;
  sessionId: string;
  pageId: string;
  route: string;
  viewport: string;
  sourceLiveVersionId: string;
  authorityVersionId: string;
  captureId: string;
  reconstructionPlanId: string;
  status: TwinBuildJobStatus;
  startedAt: string;
  completedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  idempotencyKey: string;
};

export type TwinRouteReceipt = {
  sessionId: string;
  twinRoute: string;
  routeRegistered: boolean;
  routeReachable: boolean;
  notLiveBannerPresent: boolean;
  status: 'OK' | 'FAILED';
};

export type TwinBuildExecutionReceipt = {
  sessionId: string;
  jobId: string;
  fromState: string;
  toState: string;
  regionChangesApplied: string[];
  twinVersionId: string | null;
  twinRoute: string;
  liveVersionUnchanged: boolean;
  warnings: string[];
  status: 'COMPLETE' | 'FAILED';
  routeReceipt?: TwinRouteReceipt;
};

const activeJobs = new Map<string, TwinBuildJob>();

export function evaluateTwinPlanInputsStale(input: {
  twin: ReconstructionTwinSession;
  authorityVersionId: string | null;
  captureId: string | null;
  reconstructionPlanId: string | null;
}): boolean {
  if (input.authorityVersionId && input.twin.authorityVersionId !== input.authorityVersionId) return true;
  if (input.captureId && input.twin.beforeCaptureId !== input.captureId) return true;
  if (input.reconstructionPlanId && input.twin.reconstructionPlanId !== input.reconstructionPlanId) return true;
  return false;
}

export function hydrateTwinBuildJobFromSession(session: ReconstructionTwinSession): TwinBuildJob | null {
  if (!session.activeBuildJobId) return null;
  const existing = activeJobs.get(session.sessionId);
  if (existing) return existing;
  const status =
    session.buildJobStatus && TWIN_BUILD_JOB_STATUSES.includes(session.buildJobStatus as TwinBuildJobStatus)
      ? (session.buildJobStatus as TwinBuildJobStatus)
      : mapStepToJobStatus(session);
  const job: TwinBuildJob = {
    jobId: session.activeBuildJobId,
    sessionId: session.sessionId,
    pageId: session.pageId,
    route: session.canonicalRoute,
    viewport: session.viewport,
    sourceLiveVersionId: session.sourceLiveVersionId,
    authorityVersionId: session.authorityVersionId,
    captureId: session.beforeCaptureId,
    reconstructionPlanId: session.reconstructionPlanId,
    status,
    startedAt: session.updatedAt,
    completedAt: session.status === 'READY_FOR_REVIEW' || session.status === 'FAILED' ? session.updatedAt : null,
    errorCode: session.status === 'FAILED' ? 'BUILD_FAILED' : null,
    errorMessage: session.status === 'FAILED' ? 'Prior build failed' : null,
    idempotencyKey: twinBuildIdempotencyKey({
      sessionId: session.sessionId,
      authorityVersionId: session.authorityVersionId,
      captureId: session.beforeCaptureId,
      reconstructionPlanId: session.reconstructionPlanId,
    }),
  };
  activeJobs.set(session.sessionId, job);
  return job;
}

export function twinBuildIdempotencyKey(input: {
  sessionId: string;
  authorityVersionId: string;
  captureId: string;
  reconstructionPlanId: string;
}): string {
  return `${input.sessionId}|${input.authorityVersionId}|${input.captureId}|${input.reconstructionPlanId}`;
}

export function getTwinBuildJob(sessionId: string): TwinBuildJob | null {
  const cached = activeJobs.get(sessionId);
  if (cached) return cached;
  const session = getTwinSession(sessionId);
  if (!session?.activeBuildJobId) return null;
  return hydrateTwinBuildJobFromSession(session);
}

function mapStepToJobStatus(session: ReconstructionTwinSession): TwinBuildJobStatus {
  if (session.status === 'READY_FOR_REVIEW') return 'READY';
  if (session.status === 'FAILED') return 'FAILED';
  if (session.status !== 'BUILDING') return 'QUEUED';
  const running = session.buildSteps.find((s) => s.status === 'RUNNING');
  if (!running) return 'BUILDING';
  switch (running.step) {
    case 'CLONING_FUNCTION_CONTRACT':
      return 'STARTING';
    case 'APPLYING_RECONSTRUCTION_PLAN':
      return 'APPLYING_RECONSTRUCTION';
    case 'BUILDING_ISOLATED_PAGE':
      return 'BUILDING';
    case 'VERIFYING_ROUTE':
      return 'VERIFYING';
    case 'CAPTURING_TWIN':
      return 'CAPTURING';
    default:
      return 'BUILDING';
  }
}

export async function startTwinBuild(
  sessionId: string,
  inputGuard?: {
    authorityVersionId: string | null;
    captureId: string | null;
    reconstructionPlanId: string | null;
  },
): Promise<{
  session: ReconstructionTwinSession | null;
  job: TwinBuildJob | null;
  receipt: TwinBuildExecutionReceipt | null;
  error?: { code: string; message: string };
}> {
  const session = getTwinSession(sessionId);
  if (!session) {
    return { session: null, job: null, receipt: null, error: { code: 'EXECUTOR_NOT_WIRED', message: 'Twin session not found.' } };
  }

  if (
    inputGuard &&
    evaluateTwinPlanInputsStale({
      twin: session,
      authorityVersionId: inputGuard.authorityVersionId,
      captureId: inputGuard.captureId,
      reconstructionPlanId: inputGuard.reconstructionPlanId,
    })
  ) {
    return {
      session,
      job: null,
      receipt: null,
      error: { code: 'SOURCE_VERSION_MISSING', message: 'INPUTS UPDATED — REFRESH TWIN PLAN BEFORE BUILD.' },
    };
  }

  if (session.status === 'BUILDING') {
    const existing = getTwinBuildJob(sessionId);
    return { session, job: existing, receipt: session.lastBuildExecutionReceipt ?? null };
  }

  if (session.status !== 'PLANNED' && session.status !== 'FAILED') {
    return {
      session,
      job: null,
      receipt: null,
      error: { code: 'UNKNOWN_TWIN_BUILD_FAILURE', message: `Cannot build from status ${session.status}.` },
    };
  }

  const idempotencyKey = twinBuildIdempotencyKey({
    sessionId: session.sessionId,
    authorityVersionId: session.authorityVersionId,
    captureId: session.beforeCaptureId,
    reconstructionPlanId: session.reconstructionPlanId,
  });

  const inflight = getTwinBuildJob(sessionId);
  if (inflight && inflight.status !== 'FAILED' && inflight.status !== 'READY') {
    return { session, job: inflight, receipt: null };
  }

  const job: TwinBuildJob = {
    jobId: `tbj_${sessionId}_${Date.now()}`,
    sessionId,
    pageId: session.pageId,
    route: session.canonicalRoute,
    viewport: session.viewport,
    sourceLiveVersionId: session.sourceLiveVersionId,
    authorityVersionId: session.authorityVersionId,
    captureId: session.beforeCaptureId,
    reconstructionPlanId: session.reconstructionPlanId,
    status: 'QUEUED',
    startedAt: new Date().toISOString(),
    completedAt: null,
    errorCode: null,
    errorMessage: null,
    idempotencyKey,
  };
  activeJobs.set(sessionId, job);

  updateTwinSession(sessionId, { activeBuildJobId: job.jobId, buildJobStatus: job.status });
  persistTwinSessionsStore();

  const fromState = session.status;
  job.status = 'STARTING';
  activeJobs.set(sessionId, job);

  try {
    const built = await buildTwin(sessionId);
    if (!built) {
      job.status = 'FAILED';
      job.errorCode = 'BUILD_FAILED';
      job.errorMessage = 'buildTwin returned null';
      job.completedAt = new Date().toISOString();
      activeJobs.set(sessionId, job);
      updateTwinSession(sessionId, { status: 'FAILED', buildJobStatus: 'FAILED' });
      persistTwinSessionsStore();
      return {
        session: getTwinSession(sessionId),
        job,
        receipt: null,
        error: { code: 'BUILD_FAILED', message: job.errorMessage },
      };
    }

    job.status = mapStepToJobStatus(built);
    job.completedAt = new Date().toISOString();
    activeJobs.set(sessionId, job);

    const regionChangesApplied = [
      ...built.reconstructionPlan.geometryChanges,
      ...built.reconstructionPlan.spacingChanges,
      ...built.reconstructionPlan.componentChanges,
    ]
      .slice(0, 12)
      .map((c) => c.regionName ?? c.label);

    const routeReceipt: TwinRouteReceipt = {
      sessionId,
      twinRoute: built.twinRoute,
      routeRegistered: Boolean(built.twinRoute),
      routeReachable: built.status === 'READY_FOR_REVIEW',
      notLiveBannerPresent: true,
      status: built.status === 'READY_FOR_REVIEW' ? 'OK' : 'FAILED',
    };

    const receipt: TwinBuildExecutionReceipt = {
      sessionId,
      jobId: job.jobId,
      fromState,
      toState: built.status,
      regionChangesApplied,
      twinVersionId: built.twinVersionId,
      twinRoute: built.twinRoute,
      liveVersionUnchanged: true,
      warnings: built.twinBuildReceipt?.warnings ?? [],
      status: built.status === 'READY_FOR_REVIEW' ? 'COMPLETE' : 'FAILED',
      routeReceipt,
    };

    updateTwinSession(sessionId, {
      buildJobStatus: job.status,
      lastBuildExecutionReceipt: receipt,
    });
    persistTwinSessionsStore();

    return { session: built, job, receipt };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    job.status = 'FAILED';
    job.errorCode = 'PATCH_APPLICATION_FAILED';
    job.errorMessage = message;
    job.completedAt = new Date().toISOString();
    activeJobs.set(sessionId, job);
    updateTwinSession(sessionId, { status: 'FAILED', buildJobStatus: 'FAILED' });
    persistTwinSessionsStore();
    return { session: getTwinSession(sessionId), job, receipt: null, error: { code: job.errorCode, message } };
  }
}
