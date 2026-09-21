/**
 * P0.VR.PAGE-CONCEPT-CGPT-429-RESILIENCE1 + REAL-SUBSTEP-EMISSION1
 */

import type { PageCreativeInjection } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptRunProgress } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import {
  PAGE_CONCEPT_CGPT_MAX_429_ATTEMPTS,
  computeCgpt429BackoffMs,
  formatCgptProviderReceipt,
  formatCgptRetryWaitStage,
  founderMessageForCgptFailure,
  logPageConceptCgptProviderTelemetry,
  pageConceptCgptIdempotencyKeyForRun,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgpt429.js';
import {
  buildPanelProgressFromCgptSubstepDetail,
  pageConceptProgressPatchForCgptFailure,
  type PageConceptCgptSubstepId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import {
  emptyCgptSubstepRunDetail,
  type PageConceptCgptSubstepRunDetail,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptSubstepRun.js';
import {
  fetchAnthropicPageCreativeJson,
  generatePageCreativeInjection,
  type PageCgptInput,
} from './generatePageCreativeInjection.js';
import {
  isPageConceptCgptProviderError,
  PageConceptCgptProviderError,
} from './pageConceptCgptProviderError.js';
import {
  setPageConceptCgptStagePhase,
  tryBeginPageConceptCgptDispatch,
} from './pageConceptCgptStageLock.js';
import {
  compileBrandContextSlice,
  compileKeyMessagesSlice,
  compilePageIntelligenceSlice,
  compileVisualMoodboardSlice,
} from './pageConceptCgptSubstepCompile.js';
import { auditPageCgptInputTokens } from './generatePageCreativeInjection.js';

export type ExecutePageConceptCgptStageResult =
  | { ok: true; injection: PageCreativeInjection }
  | { ok: false; errorCode: string; founderMessage: string; technicalDetails: string };

function yieldForStatusPoll(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

function injectionFromParsed(
  input: PageCgptInput,
  parsed: Record<string, unknown>,
  model: string,
): PageCreativeInjection {
  const now = new Date().toISOString();
  return {
    injectionId: `pinj-${Date.now()}`,
    projectId: input.pageContext.projectId,
    pageId: input.pageContext.pageId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractVersion: input.functionContract.version,
    creativeThesis: String(parsed.creativeThesis ?? ''),
    pagePurposeInterpretation: String(parsed.pagePurposeInterpretation ?? ''),
    visualOpportunity: String(parsed.visualOpportunity ?? ''),
    hierarchyDirection: String(parsed.hierarchyDirection ?? ''),
    spatialDirection: String(parsed.spatialDirection ?? ''),
    informationPriority: String(parsed.informationPriority ?? ''),
    imageDataBalance: String(parsed.imageDataBalance ?? ''),
    responsiveDirection: String(parsed.responsiveDirection ?? ''),
    mobileDirection: String(parsed.mobileDirection ?? ''),
    desktopDirection: String(parsed.desktopDirection ?? ''),
    creativeLatitude: String(parsed.creativeLatitude ?? ''),
    immutableRequirements: Array.isArray(parsed.immutableRequirements) ?
      parsed.immutableRequirements.map(String)
    : [],
    referenceStrategy: String(parsed.referenceStrategy ?? ''),
    assetStrategy: String(parsed.assetStrategy ?? ''),
    createdAt: now,
    cgptProvider: 'anthropic',
    cgptModel: model,
  };
}

function dryRunInjection(input: PageCgptInput, pipelineSetId: string): PageCreativeInjection {
  return {
    injectionId: `dry-cgpt-${pipelineSetId}`,
    projectId: input.pageContext.projectId,
    pageId: input.pageContext.pageId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractVersion: input.functionContract.version,
    creativeThesis: 'DRY_RUN',
    pagePurposeInterpretation: 'DRY_RUN',
    visualOpportunity: 'DRY_RUN',
    hierarchyDirection: 'DRY_RUN',
    spatialDirection: 'DRY_RUN',
    informationPriority: 'DRY_RUN',
    imageDataBalance: 'DRY_RUN',
    responsiveDirection: 'DRY_RUN',
    mobileDirection: 'DRY_RUN',
    desktopDirection: 'DRY_RUN',
    creativeLatitude: 'DRY_RUN',
    immutableRequirements: [],
    referenceStrategy: 'DRY_RUN',
    assetStrategy: 'DRY_RUN',
    createdAt: new Date().toISOString(),
    cgptProvider: 'dry-run',
    cgptModel: 'dry-run',
  };
}

export async function executePageConceptCgptStage(options: {
  runId: string;
  input: PageCgptInput;
  pipelineSetId: string;
  dryRun: boolean;
  resetAttempts?: boolean;
  onProgress: (patch: PageConceptRunProgress) => void;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
  fetchImpl?: typeof fetch;
}): Promise<ExecutePageConceptCgptStageResult> {
  const sleep = options.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const idempotencyKey = pageConceptCgptIdempotencyKeyForRun(options.runId);

  if (!options.dryRun && !tryBeginPageConceptCgptDispatch(options.runId)) {
    return {
      ok: false,
      errorCode: 'CGPT_DUPLICATE_DISPATCH_BLOCKED',
      founderMessage: 'CGPT ALREADY RUNNING FOR THIS GENERATION RUN',
      technicalDetails: `IDEMPOTENCY_KEY=${idempotencyKey}`,
    };
  }

  let attemptNumber = 0;
  let dispatchCount = 0;
  const maxAttempts = PAGE_CONCEPT_CGPT_MAX_429_ATTEMPTS;
  let lastProviderError: PageConceptCgptProviderError | null = null;

  const cgptSubsteps: PageConceptCgptSubstepRunDetail = emptyCgptSubstepRunDetail();

  const emit = (patch: PageConceptRunProgress) => {
    options.onProgress({ ...patch, updatedAt: new Date().toISOString() });
  };

  const emitCgptDetail = (
    extra: Partial<PageConceptRunProgress> & {
      generationStatus?: PageConceptRunProgress['generationStatus'];
    } = {},
  ) => {
    const panelProgress = buildPanelProgressFromCgptSubstepDetail(cgptSubsteps, {
      failedStage: extra.status === 'FAILED' ? 'CGPT' : null,
    });
    const currentSubstep = cgptSubsteps.currentCgptSubstep;
    emit({
      status: extra.status ?? 'CGPT_RUNNING',
      currentStage: currentSubstep ? `CGPT_SUB:${currentSubstep}` : 'CGPT_RUNNING',
      cgptStatus: extra.cgptStatus ?? 'RUNNING',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: extra.generationStatus ?? 'CGPT_RUNNING',
      error: extra.error ?? null,
      completedAt: extra.completedAt ?? null,
      panelProgress,
      cgptSubsteps: { ...cgptSubsteps, substepStatusById: { ...cgptSubsteps.substepStatusById } },
      ...extra,
    });
  };

  async function runSubstepCheckpoint(
    substepId: PageConceptCgptSubstepId,
    work: () => string,
    pauseAfter?: number,
  ): Promise<void> {
    const now = new Date().toISOString();
    cgptSubsteps.currentCgptSubstep = substepId;
    cgptSubsteps.substepStatusById[substepId] = 'RUNNING';
    cgptSubsteps.substepStartedAt[substepId] = cgptSubsteps.substepStartedAt[substepId] ?? now;
    cgptSubsteps.substepUpdatedAt[substepId] = now;
    emitCgptDetail();
    await yieldForStatusPoll();

    const digest = work();
    cgptSubsteps.substepDigest[substepId] = digest;
    cgptSubsteps.substepStatusById[substepId] = 'COMPLETE';
    cgptSubsteps.substepUpdatedAt[substepId] = new Date().toISOString();
    emitCgptDetail();
    await yieldForStatusPoll();
    if (pauseAfter != null && pauseAfter > 0) await sleep(pauseAfter);
  }

  async function runContextCompilationCheckpoints(pauseMs: number): Promise<void> {
    await runSubstepCheckpoint('page-intelligence', () => compilePageIntelligenceSlice(options.input), pauseMs);
    await runSubstepCheckpoint('brand-context', () => compileBrandContextSlice(options.input), pauseMs);
    await runSubstepCheckpoint('key-messages', () => compileKeyMessagesSlice(options.input), pauseMs);
    await runSubstepCheckpoint('visual-moodboard', () => {
      void auditPageCgptInputTokens(options.input);
      return compileVisualMoodboardSlice(options.input);
    }, pauseMs);
    cgptSubsteps.contextCompilationComplete = true;
    emitCgptDetail();
  }

  async function markCreativeDirectionRunning(): Promise<void> {
    const now = new Date().toISOString();
    cgptSubsteps.currentCgptSubstep = 'creative-direction';
    cgptSubsteps.substepStatusById['creative-direction'] = 'RUNNING';
    cgptSubsteps.substepStartedAt['creative-direction'] = cgptSubsteps.substepStartedAt['creative-direction'] ?? now;
    cgptSubsteps.substepUpdatedAt['creative-direction'] = now;
    emitCgptDetail();
    await yieldForStatusPoll();
  }

  async function markCreativeDirectionComplete(): Promise<void> {
    cgptSubsteps.substepStatusById['creative-direction'] = 'COMPLETE';
    cgptSubsteps.substepUpdatedAt['creative-direction'] = new Date().toISOString();
    cgptSubsteps.currentCgptSubstep = null;
    emitCgptDetail({ cgptStatus: 'COMPLETE', currentStage: 'CGPT_COMPLETE' });
  }

  emitCgptDetail({
    cgptMeta: {
      idempotencyKey,
      attemptNumber: 0,
      maxAttempts,
      nextRetryAt: null,
      lastProviderStatus: null,
      lastProviderRequestId: null,
      lastErrorCode: null,
      dispatchCount: 0,
      lastTelemetry: null,
    },
  });

  if (options.dryRun) {
    await runContextCompilationCheckpoints(50);
    await markCreativeDirectionRunning();
    await sleep(50);
    await markCreativeDirectionComplete();
    setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
    return { ok: true, injection: dryRunInjection(options.input, options.pipelineSetId) };
  }

  if (process.env.VITEST === 'true' && !options.fetchImpl) {
    await runContextCompilationCheckpoints(0);
    await markCreativeDirectionRunning();
    dispatchCount = 1;
    const injection = await generatePageCreativeInjection(options.input);
    await markCreativeDirectionComplete();
    setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
    return { ok: true, injection };
  }

  while (attemptNumber < maxAttempts) {
    attemptNumber += 1;
    dispatchCount += 1;
    const t0 = Date.now();
    try {
      if (attemptNumber === 1 || options.resetAttempts || !cgptSubsteps.contextCompilationComplete) {
        await runContextCompilationCheckpoints(0);
      }
      await markCreativeDirectionRunning();

      const { parsed, model } = await fetchAnthropicPageCreativeJson(options.input, {
        attempt: attemptNumber,
        fetchImpl: options.fetchImpl,
      });
      const durationMs = Date.now() - t0;
      logPageConceptCgptProviderTelemetry({
        generationRunId: options.runId,
        stage: 'CGPT_COMPLETE',
        telemetry: {
          provider: 'anthropic',
          model,
          httpStatus: 200,
          errorType: null,
          errorCode: null,
          providerMessage: null,
          requestId: null,
          rateLimitClass: null,
          rateLimitHeaders: {
            retryAfterSec: null,
            requestLimit: null,
            requestRemaining: null,
            requestReset: null,
            tokenLimit: null,
            tokenRemaining: null,
            tokenReset: null,
          },
          inputTokensEstimate: null,
          maxOutputTokens: 4096,
          attempt: attemptNumber,
          retryable: false,
          hardQuota: false,
        },
        durationMs,
        nextRetryAt: null,
      });
      setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
      await markCreativeDirectionComplete();
      emitCgptDetail({
        cgptMeta: {
          idempotencyKey,
          attemptNumber,
          maxAttempts,
          nextRetryAt: null,
          lastProviderStatus: 200,
          lastProviderRequestId: null,
          lastErrorCode: null,
          dispatchCount,
          lastTelemetry: null,
        },
      });
      return { ok: true, injection: injectionFromParsed(options.input, parsed, model) };
    } catch (caught) {
      const durationMs = Date.now() - t0;
      if (!isPageConceptCgptProviderError(caught)) {
        setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
        const message = caught instanceof Error ? caught.message : 'CGPT_INJECTION_FAILED';
        cgptSubsteps.substepStatusById['creative-direction'] = 'FAILED';
        emitCgptDetail({ status: 'FAILED', generationStatus: 'FAILED', error: message, completedAt: new Date().toISOString() });
        return {
          ok: false,
          errorCode: message,
          founderMessage: message,
          technicalDetails: message,
        };
      }

      lastProviderError = caught;
      const telemetry = caught.telemetry;
      logPageConceptCgptProviderTelemetry({
        generationRunId: options.runId,
        stage: 'CGPT_PROVIDER_ERROR',
        telemetry,
        durationMs,
        nextRetryAt: null,
      });

      if (telemetry.hardQuota) {
        setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
        const code = caught.founderCode;
        cgptSubsteps.substepStatusById['creative-direction'] = 'FAILED';
        const failPatch = pageConceptProgressPatchForCgptFailure('creative-direction');
        emit({
          status: 'FAILED',
          currentStage: failPatch.currentStage,
          panelProgress: failPatch.panelProgress,
          cgptSubsteps: { ...cgptSubsteps },
          cgptStatus: 'FAILED',
          generationStatus: 'FAILED',
          error: `${founderMessageForCgptFailure(code)} · ${formatCgptProviderReceipt(telemetry)}`,
          completedAt: new Date().toISOString(),
          cgptMeta: {
            idempotencyKey,
            attemptNumber,
            maxAttempts,
            nextRetryAt: null,
            lastProviderStatus: telemetry.httpStatus,
            lastProviderRequestId: telemetry.requestId,
            lastErrorCode: code,
            dispatchCount,
            lastTelemetry: telemetry,
          },
        });
        return {
          ok: false,
          errorCode: code,
          founderMessage: founderMessageForCgptFailure(code),
          technicalDetails: formatCgptProviderReceipt(telemetry),
        };
      }

      if (telemetry.httpStatus !== 429 || !telemetry.retryable) {
        setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
        const code = caught.founderCode;
        cgptSubsteps.substepStatusById['creative-direction'] = 'FAILED';
        const failPatch = pageConceptProgressPatchForCgptFailure('creative-direction');
        emit({
          status: 'FAILED',
          currentStage: failPatch.currentStage,
          panelProgress: failPatch.panelProgress,
          cgptSubsteps: { ...cgptSubsteps },
          cgptStatus: 'FAILED',
          generationStatus: 'FAILED',
          error: `${code} · ${formatCgptProviderReceipt(telemetry)}`,
          completedAt: new Date().toISOString(),
          cgptMeta: {
            idempotencyKey,
            attemptNumber,
            maxAttempts,
            nextRetryAt: null,
            lastProviderStatus: telemetry.httpStatus,
            lastProviderRequestId: telemetry.requestId,
            lastErrorCode: code,
            dispatchCount,
            lastTelemetry: telemetry,
          },
        });
        return {
          ok: false,
          errorCode: code,
          founderMessage: code,
          technicalDetails: formatCgptProviderReceipt(telemetry),
        };
      }

      if (attemptNumber >= maxAttempts) break;

      const waitMs = computeCgpt429BackoffMs({
        attempt: attemptNumber,
        retryAfterSec: telemetry.rateLimitHeaders.retryAfterSec,
        random: options.random,
      });
      const nextRetryAt = new Date(Date.now() + waitMs).toISOString();
      setPageConceptCgptStagePhase(options.runId, 'RETRY_WAIT');
      cgptSubsteps.currentCgptSubstep = 'creative-direction';
      cgptSubsteps.substepStatusById['creative-direction'] = 'RATE_LIMITED';
      cgptSubsteps.substepUpdatedAt['creative-direction'] = new Date().toISOString();
      const stageLabel = formatCgptRetryWaitStage(attemptNumber, maxAttempts, waitMs);
      emitCgptDetail({
        status: 'CGPT_RATE_LIMITED',
        currentStage: stageLabel,
        cgptStatus: 'RETRY_WAIT',
        generationStatus: 'CGPT_RATE_LIMITED',
        cgptMeta: {
          idempotencyKey,
          attemptNumber,
          maxAttempts,
          nextRetryAt,
          lastProviderStatus: telemetry.httpStatus,
          lastProviderRequestId: telemetry.requestId,
          lastErrorCode: 'CGPT_RATE_LIMITED',
          dispatchCount,
          lastTelemetry: telemetry,
        },
      });
      await sleep(waitMs);
      setPageConceptCgptStagePhase(options.runId, 'RUNNING');
      cgptSubsteps.substepStatusById['creative-direction'] = 'RUNNING';
      emitCgptDetail({ generationStatus: 'CGPT_RUNNING' });
    }
  }

  setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
  const lastTelemetry = lastProviderError?.telemetry ?? null;
  const code = 'CGPT_FAILED_RATE_LIMIT';
  cgptSubsteps.substepStatusById['creative-direction'] = 'FAILED';
  const failPatch = pageConceptProgressPatchForCgptFailure('creative-direction');
  emit({
    status: 'FAILED',
    currentStage: failPatch.currentStage,
    panelProgress: failPatch.panelProgress,
    cgptSubsteps: { ...cgptSubsteps },
    cgptStatus: 'FAILED',
    generationStatus: 'FAILED',
    error: `${founderMessageForCgptFailure(code)} · ${lastTelemetry ? formatCgptProviderReceipt(lastTelemetry) : ''}`,
    completedAt: new Date().toISOString(),
    cgptMeta: {
      idempotencyKey,
      attemptNumber,
      maxAttempts,
      nextRetryAt: null,
      lastProviderStatus: lastTelemetry?.httpStatus ?? 429,
      lastProviderRequestId: lastTelemetry?.requestId ?? null,
      lastErrorCode: code,
      dispatchCount,
      lastTelemetry,
    },
  });
  return {
    ok: false,
    errorCode: code,
    founderMessage: founderMessageForCgptFailure(code),
    technicalDetails: lastTelemetry ? formatCgptProviderReceipt(lastTelemetry) : code,
  };
}
