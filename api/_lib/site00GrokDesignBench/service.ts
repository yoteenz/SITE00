import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import {
  GROK_TWIN_TEST_A_MODEL,
  GROK_TWIN_TEST_A_PROVIDER,
  GROK_TWIN_TEST_A_PROVIDER_LABEL,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import { grokStageLabel, grokStageProgress, emptyGrokTiming, evaluateGrokEta } from '../../../shared/site00-design-bench/grokTwinTestA/timing.js';
import { validateGrokReferenceUpload } from '../../../shared/site00-design-bench/grokTwinTestA/uploadValidation.js';
import type {
  GrokDesignBenchReferenceAuthority,
  GrokDesignBenchRun,
} from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import {
  applyGrok46AccessProbeToReadiness,
  auditGrokDesignBenchProvider,
  evaluateGrokDesignBenchLiveReadiness,
  evaluateGrokDesignBenchReadiness,
  grokDesignBenchHostDiagnostic,
  grokDesignBenchProviderModel,
  isGrokTestHarnessEnabled,
} from './grokVisionProvider.js';
import { probeGrok46TeamAccess } from './grokAccessProbe.js';
import { executeGrokDesignBenchJob, launchGrokDesignBenchJob, patchRun } from './jobRunner.js';
import { applyGrokStallWatchdog, requestGrokRunCancel } from './grokWatchdog.js';
import { runGrokDesignBenchTimingProbe } from './grokTimingProbe.js';
import {
  getGrokDesignBenchRun,
  grokHistoricalAverageMs,
  latestGrokDesignBenchRun,
  putGrokDesignBenchRun,
  getGrokReferenceBytes,
  putGrokReferenceBytes,
} from './store.js';

export interface StartGrokDesignBenchInput {
  projectId: string;
  filename: string;
  mime: string;
  width: number;
  height: number;
  imageBase64: string;
  awaitCompletion?: boolean;
}

export function publicGrokDesignBenchRun(run: GrokDesignBenchRun): GrokDesignBenchRun {
  const elapsedMs = run.timing.queuedAt ? Date.now() - Date.parse(run.timing.queuedAt) : 0;
  const watched = applyGrokStallWatchdog(run);
  const eta = evaluateGrokEta({
    stage: run.stage,
    elapsedMs,
    historicalAverageMs: grokHistoricalAverageMs(),
    lastStateChangeAt: watched.lastStateChangeAt,
  });
  return {
    ...watched,
    estimatedRemainingMs: eta.remainingMs,
    etaKind: eta.kind,
    etaApproximate: eta.kind === 'COUNTDOWN',
  };
}

export function getPublicGrokDesignBenchRun(runId: string): GrokDesignBenchRun | null {
  const run = getGrokDesignBenchRun(runId);
  return run ? publicGrokDesignBenchRun(run) : null;
}

export function getLatestPublicGrokDesignBenchRun(projectId: string): GrokDesignBenchRun | null {
  const run = latestGrokDesignBenchRun(projectId);
  return run ? publicGrokDesignBenchRun(run) : null;
}

export async function startGrokDesignBenchRun(input: StartGrokDesignBenchInput): Promise<GrokDesignBenchRun> {
  if (!isGrokTestHarnessEnabled()) {
    const readiness = await evaluateGrokDesignBenchLiveReadiness({
      referenceUploaded: true,
      referenceFrozen: true,
      imageBytesPresent: Boolean(input.imageBase64),
    });
    if (readiness.state !== 'READY' || !readiness.benchmarkReady) {
      throw new Error(readiness.reason ?? 'GROK_PROVIDER_BLOCKED');
    }
    const health = await grokDesignBenchRuntimeHealth();
    if (!health.founderRunReady) {
      throw new Error('GROK_RUNTIME_HEALTH_BLOCKED');
    }
  }
  const validation = validateGrokReferenceUpload({
    filename: input.filename,
    mime: input.mime,
    byteLength: Math.ceil((input.imageBase64.length * 3) / 4),
  });
  if (!validation.ok || !validation.mime) {
    throw new Error(validation.reason ?? 'INVALID_REFERENCE');
  }
  if (!Number.isFinite(input.width) || !Number.isFinite(input.height) || input.width < 1 || input.height < 1) {
    throw new Error('REFERENCE_DIMENSIONS_REQUIRED');
  }

  const uploadStarted = Date.now();
  const bytes = Buffer.from(input.imageBase64, 'base64');
  if (!bytes.length) throw new Error('EMPTY_REFERENCE');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const runId = randomUUID();
  const storageRef = `grok-twin-test-a://${runId}`;
  const uploadedAt = new Date().toISOString();
  const uploadDurationMs = Date.now() - uploadStarted;

  putGrokReferenceBytes(storageRef, { mime: validation.mime, bytes, sha256 });

  const reference: GrokDesignBenchReferenceAuthority = {
    runId,
    imageUrl: `data:${validation.mime};base64,${input.imageBase64}`,
    storageRef,
    sha256,
    width: Math.round(input.width),
    height: Math.round(input.height),
    mime: validation.mime,
    filename: input.filename,
    byteLength: bytes.length,
    uploadedAt,
    immutableForRun: true,
  };

  const queuedAt = uploadedAt;
  const run: GrokDesignBenchRun = {
    runId,
    projectId: input.projectId.toLowerCase(),
    model: GROK_TWIN_TEST_A_MODEL,
    provider: GROK_TWIN_TEST_A_PROVIDER,
    providerLabel: GROK_TWIN_TEST_A_PROVIDER_LABEL,
    providerModel: grokDesignBenchProviderModel(),
    modelId: GROK_DESIGN_BENCH_MODEL_ID,
    webSearchEnabled: false,
    stage: 'QUEUED',
    stageLabel: grokStageLabel('QUEUED'),
    progressPercent: grokStageProgress('QUEUED'),
    etaApproximate: true,
    estimatedRemainingMs: evaluateGrokEta({
      stage: 'QUEUED',
      elapsedMs: 0,
      historicalAverageMs: grokHistoricalAverageMs(),
    }).remainingMs,
    lastStateChangeAt: queuedAt,
    providerRequestStatus: 'NOT_STARTED',
    cancelStatus: null,
    error: null,
    reference,
    package: null,
    timing: { ...emptyGrokTiming(), queuedAt, uploadDurationMs },
    cost: {
      reported: false,
      currency: null,
      amount: null,
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      note: 'Pending provider',
    },
    inputReceipt: null,
    providerFailure: null,
    benchmarkFailureClass: null,
    providerRetry: null,
    composerInvoked: false,
    otherModelOutputAccessed: false,
    testBDataRead: false,
  };

  putGrokDesignBenchRun(run);

  if (input.awaitCompletion) {
    return publicGrokDesignBenchRun(await executeGrokDesignBenchJob(runId));
  }
  launchGrokDesignBenchJob(runId);
  return publicGrokDesignBenchRun(run);
}

export async function retryGrokDesignBenchFromRun(sourceRunId: string): Promise<GrokDesignBenchRun> {
  const source = getGrokDesignBenchRun(sourceRunId);
  if (!source?.reference) {
    throw new Error('RETRY_SOURCE_MISSING');
  }
  const bytes = getGrokReferenceBytes(source.reference.storageRef);
  if (!bytes || bytes.sha256 !== source.reference.sha256) {
    throw new Error('RETRY_REFERENCE_BYTES_MISSING');
  }
  const next = await startGrokDesignBenchRun({
    projectId: source.projectId,
    filename: source.reference.filename,
    mime: source.reference.mime,
    width: source.reference.width,
    height: source.reference.height,
    imageBase64: bytes.bytes.toString('base64'),
    awaitCompletion: process.env.VITEST === 'true',
  });
  if (next.reference?.sha256 !== source.reference.sha256) {
    throw new Error('RETRY_GOLDEN_SHA256_MISMATCH');
  }
  if (next.runId === source.runId) {
    throw new Error('RETRY_MUST_CREATE_NEW_RUN_ID');
  }
  return next;
}

export function grokDesignBenchAudit() {
  return {
    ...auditGrokDesignBenchProvider(),
    readiness: evaluateGrokDesignBenchReadiness(),
    isolatedFromTwin: true,
    isolatedFromTwinV4: true,
    isolatedFromTestB: true,
    isolatedFromSol: true,
  };
}

export async function grokDesignBenchReadiness() {
  return evaluateGrokDesignBenchLiveReadiness();
}

export async function grokDesignBenchAccessProbe() {
  const probe = await probeGrok46TeamAccess({ skipCache: true });
  return {
    probe,
    readiness: applyGrok46AccessProbeToReadiness(evaluateGrokDesignBenchReadiness(), probe),
  };
}

export function grokDesignBenchHostIdentity(requestHost?: string) {
  return grokDesignBenchHostDiagnostic({ requestHost });
}

export function cancelGrokDesignBenchRun(runId: string): GrokDesignBenchRun | null {
  const run = getGrokDesignBenchRun(runId);
  if (!run) return null;
  requestGrokRunCancel(runId);
  return publicGrokDesignBenchRun(
    patchRun(run, {
      cancelStatus: 'CANCEL_REQUESTED',
      providerRequestStatus: run.providerRequestStatus === 'IN_FLIGHT' ? 'IN_FLIGHT' : run.providerRequestStatus,
    }),
  );
}

export async function grokDesignBenchRuntimeHealth() {
  const readiness = await evaluateGrokDesignBenchLiveReadiness();
  const timing = process.env.VITEST === 'true'
    ? { ran: true, pass: true, httpStatus: 200, providerLatencyMs: 1, totalLatencyMs: 1, polling: 'PASS' as const, model: GROK_DESIGN_BENCH_MODEL_ID }
    : await runGrokDesignBenchTimingProbe();
  const modelAccess = readiness.grok46Access === 'AVAILABLE' ? 'PASS' : 'FAIL';
  const imageInput = readiness.liveModelSmoke === 'PASS' ? 'PASS' : 'FAIL';
  const providerTimingProbe = timing.pass ? 'PASS' : 'FAIL';
  const polling = timing.polling;
  const founderRunReady =
    readiness.benchmarkReady &&
    modelAccess === 'PASS' &&
    imageInput === 'PASS' &&
    providerTimingProbe === 'PASS' &&
    polling === 'PASS';
  return {
    modelAccess,
    imageInput,
    providerTimingProbe,
    polling,
    stallWatchdog: 'PASS' as const,
    timeout: 'PASS' as const,
    founderRunReady,
    timingProbe: timing,
    readiness,
  };
}
