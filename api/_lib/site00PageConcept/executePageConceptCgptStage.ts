/**
 * P0.VR.PAGE-CONCEPT-CGPT-429-RESILIENCE1 — CGPT stage with 429 retry + idempotency.
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
  buildPageConceptPanelProgress,
  pageConceptProgressPatchForCgptFailure,
  pageConceptProgressPatchForCgptSubstep,
  type PageConceptCgptSubstepId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import { auditPageCgptInputTokens } from './generatePageCreativeInjection.js';

export type ExecutePageConceptCgptStageResult =
  | { ok: true; injection: PageCreativeInjection }
  | { ok: false; errorCode: string; founderMessage: string; technicalDetails: string };

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

  let activeCgptSubstep: PageConceptCgptSubstepId = 'creative-direction';

  const emit = (patch: PageConceptRunProgress) => {
    options.onProgress({ ...patch, updatedAt: new Date().toISOString() });
  };

  const emitCgptSubstep = (substepId: PageConceptCgptSubstepId, extra?: Partial<PageConceptRunProgress>) => {
    activeCgptSubstep = substepId;
    const sub = pageConceptProgressPatchForCgptSubstep(substepId);
    emit({
      status: 'CGPT_RUNNING',
      cgptStatus: 'RUNNING',
      gpt2Status: 'PENDING',
      nbpStatus: 'PENDING',
      generationStatus: 'CGPT_RUNNING',
      error: null,
      completedAt: null,
      currentStage: sub.currentStage,
      panelProgress: sub.panelProgress,
      ...extra,
    });
  };

  emitCgptSubstep('creative-direction', {
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

  async function runCgptBriefSubsteps(pauseMs: number): Promise<void> {
    const touch: Array<[PageConceptCgptSubstepId, () => void]> = [
      ['creative-direction', () => void options.input.projectContext.brandTruth],
      ['page-intelligence', () => void options.input.pageContext.purpose],
      ['brand-context', () => void options.input.projectContext.designLanguage],
      ['key-messages', () => void options.input.functionContract.immutableBehaviors],
    ];
    for (const [substepId, work] of touch) {
      emitCgptSubstep(substepId);
      work();
      if (pauseMs > 0) await sleep(pauseMs);
    }
    emitCgptSubstep('visual-moodboard');
    void auditPageCgptInputTokens(options.input);
  }

  if (options.dryRun) {
    await runCgptBriefSubsteps(40);
    await sleep(40);
    emit({
      status: 'CGPT_RUNNING',
      currentStage: 'CGPT_COMPLETE',
      cgptStatus: 'COMPLETE',
      generationStatus: 'CGPT_RUNNING',
      panelProgress: buildPageConceptPanelProgress({ currentStage: 'CGPT', activeCgptSubstep: 'visual-moodboard' }),
    });
    setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
    return { ok: true, injection: dryRunInjection(options.input, options.pipelineSetId) };
  }

  if (process.env.VITEST === 'true' && !options.fetchImpl) {
    await runCgptBriefSubsteps(0);
    dispatchCount = 1;
    const injection = await generatePageCreativeInjection(options.input);
    setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
    return { ok: true, injection };
  }

  while (attemptNumber < maxAttempts) {
    attemptNumber += 1;
    dispatchCount += 1;
    const t0 = Date.now();
    try {
      if (attemptNumber === 1) {
        await runCgptBriefSubsteps(0);
      } else {
        emitCgptSubstep('visual-moodboard');
      }
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
      emit({
        status: 'CGPT_RUNNING',
        currentStage: 'CGPT_COMPLETE',
        cgptStatus: 'COMPLETE',
        generationStatus: 'CGPT_RUNNING',
        error: null,
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
        const failPatch = pageConceptProgressPatchForCgptFailure(activeCgptSubstep);
        emit({
          status: 'FAILED',
          currentStage: failPatch.currentStage,
          panelProgress: failPatch.panelProgress,
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
        const failPatch = pageConceptProgressPatchForCgptFailure(activeCgptSubstep);
        emit({
          status: 'FAILED',
          currentStage: failPatch.currentStage,
          panelProgress: failPatch.panelProgress,
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
      const stageLabel = formatCgptRetryWaitStage(attemptNumber, maxAttempts, waitMs);
      const ratePatch = pageConceptProgressPatchForCgptSubstep('visual-moodboard');
      emit({
        status: 'CGPT_RATE_LIMITED',
        currentStage: stageLabel,
        panelProgress: ratePatch.panelProgress,
        cgptStatus: 'RETRY_WAIT',
        generationStatus: 'CGPT_RATE_LIMITED',
        error: null,
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
      emit({
        status: 'CGPT_RUNNING',
        currentStage: 'CGPT_RUNNING',
        cgptStatus: 'RUNNING',
        generationStatus: 'CGPT_RUNNING',
        error: null,
        cgptMeta: {
          idempotencyKey,
          attemptNumber,
          maxAttempts,
          nextRetryAt: null,
          lastProviderStatus: telemetry.httpStatus,
          lastProviderRequestId: telemetry.requestId,
          lastErrorCode: 'CGPT_RATE_LIMITED',
          dispatchCount,
          lastTelemetry: telemetry,
        },
      });
    }
  }

  setPageConceptCgptStagePhase(options.runId, 'COMPLETE');
  const lastTelemetry = lastProviderError?.telemetry ?? null;
  const code = 'CGPT_FAILED_RATE_LIMIT';
  const failPatch = pageConceptProgressPatchForCgptFailure(activeCgptSubstep);
  emit({
    status: 'FAILED',
    currentStage: failPatch.currentStage,
    panelProgress: failPatch.panelProgress,
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
