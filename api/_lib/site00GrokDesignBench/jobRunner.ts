import {
  GROK_TWIN_TEST_A_MODEL,
  GROK_TWIN_TEST_A_PROVIDER,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { finalizeGrokTiming, grokStageLabel, grokStageProgress } from '../../../shared/site00-design-bench/grokTwinTestA/timing.js';
import type { GrokDesignBenchRun, GrokDesignBenchStage } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import {
  GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS,
  GROK_PROVIDER_TIMEOUT,
  GROK_RUN_STALLED,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { translateInterfaceWithGrok } from './grokVisionProvider.js';
import { GrokProviderError } from './grokProviderRetry.js';
import {
  clearGrokRunControl,
  isGrokRunCancelRequested,
  registerGrokRunAbort,
} from './grokWatchdog.js';
import { getGrokDesignBenchRun, getGrokReferenceBytes, putGrokDesignBenchRun, recordGrokDuration } from './store.js';

const STAGE_PAUSE_MS = process.env.VITEST === 'true' ? 0 : 40;

export function patchRun(run: GrokDesignBenchRun, patch: Partial<GrokDesignBenchRun>): GrokDesignBenchRun {
  const next = { ...run, ...patch };
  if (patch.stage) {
    next.stageLabel = grokStageLabel(patch.stage);
    next.progressPercent = grokStageProgress(patch.stage);
    next.lastStateChangeAt = new Date().toISOString();
  }
  putGrokDesignBenchRun(next);
  return next;
}

function requireRun(runId: string): GrokDesignBenchRun {
  const run = getGrokDesignBenchRun(runId);
  if (!run) throw new Error(`GROK_RUN_MISSING:${runId}`);
  return run;
}

async function advance(runId: string, stage: GrokDesignBenchStage): Promise<GrokDesignBenchRun> {
  const current = requireRun(runId);
  if (STAGE_PAUSE_MS) await new Promise((r) => setTimeout(r, STAGE_PAUSE_MS));
  return patchRun(current, { stage });
}

export async function executeGrokDesignBenchJob(runId: string): Promise<GrokDesignBenchRun> {
  let run = requireRun(runId);
  const startedAt = new Date().toISOString();
  run = patchRun(run, {
    stage: 'INGESTING_REFERENCE',
    timing: { ...run.timing, startedAt },
  });

  try {
    if (!run.reference?.immutableForRun) {
      throw new Error('REFERENCE_NOT_FROZEN');
    }
    const bytes = getGrokReferenceBytes(run.reference.storageRef);
    if (!bytes || bytes.sha256 !== run.reference.sha256) {
      throw new Error('REFERENCE_BYTES_MISSING_OR_MUTATED');
    }

    run = await advance(runId, 'ANALYZING_VISUAL');
    const providerStartedAt = new Date().toISOString();
    run = patchRun(run, {
      timing: { ...run.timing, providerStartedAt },
      providerRequestStatus: 'IN_FLIGHT',
    });
    if (isGrokRunCancelRequested(runId)) {
      throw new Error('CANCEL_REQUESTED');
    }

    const controller = registerGrokRunAbort(runId);
    const deadlineMs = Date.now() + GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS;
    const timeout = setTimeout(() => controller.abort(), GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS);
    let translated;
    try {
      translated = await translateInterfaceWithGrok({
        runId,
        imageBytes: bytes.bytes,
        mime: run.reference.mime,
        filename: run.reference.filename,
        width: run.reference.width,
        height: run.reference.height,
        sha256: run.reference.sha256,
        signal: controller.signal,
        deadlineMs,
        onProviderEvent: ({ retryState }) => {
          const current = requireRun(runId);
          patchRun(current, {
            lastStateChangeAt: new Date().toISOString(),
            providerRequestStatus: 'IN_FLIGHT',
            providerRetry: retryState,
            stall: {
              stalled: false,
              stalledStage: current.stage,
              lastStateChange: new Date().toISOString(),
              providerRequestStatus: 'IN_FLIGHT',
            },
          });
        },
      });
    } catch (err) {
      if (isGrokRunCancelRequested(runId) || (err instanceof Error && err.name === 'AbortError')) {
        throw new Error(isGrokRunCancelRequested(runId) ? 'CANCEL_REQUESTED' : GROK_PROVIDER_TIMEOUT);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (isGrokRunCancelRequested(runId)) {
      throw new Error('CANCEL_REQUESTED');
    }

    const providerCompletedAt = new Date().toISOString();
    run = patchRun(requireRun(runId), {
      providerModel: GROK_DESIGN_BENCH_MODEL_ID,
      modelId: GROK_DESIGN_BENCH_MODEL_ID,
      providerRequestStatus: 'RETURNED',
      inputReceipt: translated.inputReceipt,
      outputBytes: translated.outputBytes,
      requestInputBytes: translated.requestInputBytes,
      responseId: translated.responseId,
      finishStatus: translated.finishStatus,
      maxOutputTokens: translated.maxOutputTokens,
      responseTruncated: translated.responseTruncated,
      providerRetry: translated.providerRetry,
      timing: { ...requireRun(runId).timing, providerCompletedAt },
      cost: {
        reported: translated.costReported,
        currency: translated.costReported ? 'USD' : null,
        amount: translated.costAmount,
        promptTokens: translated.promptTokens,
        completionTokens: translated.completionTokens,
        totalTokens: translated.totalTokens,
        note: translated.costReported ? 'Provider reported cost' : 'Provider did not report a dollar cost',
      },
    });

    if (isGrokRunCancelRequested(runId)) {
      throw new Error('CANCEL_REQUESTED');
    }

    run = await advance(runId, 'DECOMPOSING_LAYOUT');
    run = await advance(runId, 'BUILDING_DESIGN_SYSTEM');
    run = await advance(runId, 'BUILDING_COMPONENT_SPEC');
    run = await advance(runId, 'RENDERING_VISUAL_TRANSLATION');
    run = await advance(runId, 'BUILDING_HANDOFF');
    run = await advance(runId, 'FINALIZING');

    const completedAt = new Date().toISOString();
    const timing = finalizeGrokTiming({ ...requireRun(runId).timing, completedAt }, completedAt);
    if (timing.totalDurationMs && timing.totalDurationMs < GROK_DESIGN_BENCH_EXECUTION_TIMEOUT_MS) {
      recordGrokDuration(timing.totalDurationMs);
    }

    return patchRun(requireRun(runId), {
      stage: 'COMPLETE',
      package: translated.package,
      timing,
      composerInvoked: false,
      otherModelOutputAccessed: false,
      testBDataRead: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GROK_JOB_FAILED';
    const cancelled = message === 'CANCEL_REQUESTED';
    const timedOut = message === GROK_PROVIDER_TIMEOUT;
    const stalled = message === GROK_RUN_STALLED;
    const providerErr = err instanceof GrokProviderError ? err : null;
    let benchmarkFailureClass = providerErr?.benchmarkFailureClass ?? null;
    if (cancelled) benchmarkFailureClass = 'USER_CANCELLED';
    else if (timedOut) benchmarkFailureClass = 'PROVIDER_TIMEOUT';
    else if (stalled) benchmarkFailureClass = 'RUN_STALLED';
    else if (!benchmarkFailureClass && /truncat|OUTPUT_TRUNCATED/i.test(message)) benchmarkFailureClass = 'OUTPUT_TRUNCATED';
    else if (!benchmarkFailureClass && /FIGMA_STYLE|validation|assertFigma/i.test(message)) {
      benchmarkFailureClass = 'OUTPUT_VALIDATION_FAILED';
    }
    return patchRun(requireRun(runId), {
      stage: cancelled ? 'CANCELLED' : 'FAILED',
      error: message,
      cancelStatus: cancelled ? 'CANCELLED' : requireRun(runId).cancelStatus ?? null,
      providerRequestStatus: timedOut ? 'TIMEOUT' : cancelled ? 'CANCELLED' : 'FAILED',
      benchmarkFailureClass,
      providerRetry: providerErr?.retryState ?? requireRun(runId).providerRetry ?? null,
      providerFailure: providerErr
        ? providerErr.providerFailure
        : null,
      timing: finalizeGrokTiming(requireRun(runId).timing, new Date().toISOString()),
    });
  } finally {
    clearGrokRunControl(runId);
  }
}

export function launchGrokDesignBenchJob(runId: string): void {
  void executeGrokDesignBenchJob(runId);
}

export function grokJobUsesOnlyGrok(run: GrokDesignBenchRun): boolean {
  return (
    run.model === GROK_TWIN_TEST_A_MODEL &&
    run.provider === GROK_TWIN_TEST_A_PROVIDER &&
    run.modelId === GROK_DESIGN_BENCH_MODEL_ID &&
    run.providerModel === GROK_DESIGN_BENCH_MODEL_ID &&
    run.webSearchEnabled === false &&
    run.composerInvoked === false
  );
}
