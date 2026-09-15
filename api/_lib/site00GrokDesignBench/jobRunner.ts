import {
  GROK_TWIN_TEST_A_MODEL,
  GROK_TWIN_TEST_A_PROVIDER,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import { finalizeGrokTiming, grokStageLabel, grokStageProgress } from '../../../shared/site00-design-bench/grokTwinTestA/timing.js';
import type { GrokDesignBenchRun, GrokDesignBenchStage } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import {
  classifyGrok46ProviderError,
  GROK_4_6_PROVIDER_BINDING_FAILED,
  GROK_DESIGN_BENCH_MODEL_ID,
} from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import { translateInterfaceWithGrok } from './grokVisionProvider.js';
import { getGrokDesignBenchRun, getGrokReferenceBytes, putGrokDesignBenchRun, recordGrokDuration } from './store.js';

const STAGE_PAUSE_MS = process.env.VITEST === 'true' ? 0 : 40;

export function patchRun(run: GrokDesignBenchRun, patch: Partial<GrokDesignBenchRun>): GrokDesignBenchRun {
  const next = { ...run, ...patch };
  if (patch.stage) {
    next.stageLabel = grokStageLabel(patch.stage);
    next.progressPercent = grokStageProgress(patch.stage);
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
    run = patchRun(run, { timing: { ...run.timing, providerStartedAt } });

    const translated = await translateInterfaceWithGrok({
      runId,
      imageBytes: bytes.bytes,
      mime: run.reference.mime,
      filename: run.reference.filename,
      width: run.reference.width,
      height: run.reference.height,
      sha256: run.reference.sha256,
    });

    const providerCompletedAt = new Date().toISOString();
    run = patchRun(requireRun(runId), {
      providerModel: GROK_DESIGN_BENCH_MODEL_ID,
      modelId: GROK_DESIGN_BENCH_MODEL_ID,
      inputReceipt: translated.inputReceipt,
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

    run = await advance(runId, 'DECOMPOSING_LAYOUT');
    run = await advance(runId, 'BUILDING_DESIGN_SYSTEM');
    run = await advance(runId, 'BUILDING_COMPONENT_SPEC');
    run = await advance(runId, 'RENDERING_VISUAL_TRANSLATION');
    run = await advance(runId, 'BUILDING_HANDOFF');
    run = await advance(runId, 'FINALIZING');

    const completedAt = new Date().toISOString();
    const timing = finalizeGrokTiming({ ...requireRun(runId).timing, completedAt }, completedAt);
    if (timing.totalDurationMs) recordGrokDuration(timing.totalDurationMs);

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
    const bindingFailed = message.includes(GROK_4_6_PROVIDER_BINDING_FAILED);
    const codeMatch = message.match(/providerResponseCode=(\d+|none)/);
    const status = codeMatch && codeMatch[1] !== 'none' ? Number(codeMatch[1]) : null;
    return patchRun(requireRun(runId), {
      stage: 'FAILED',
      error: message,
      providerFailure: bindingFailed
        ? {
            code: GROK_4_6_PROVIDER_BINDING_FAILED,
            providerResponseCode: status,
            classification: classifyGrok46ProviderError(status, message),
            runId,
            detail: message,
          }
        : null,
      timing: finalizeGrokTiming(requireRun(runId).timing, new Date().toISOString()),
    });
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
