/**
 * P0.VR.OPUS-NATIVE1 — the agent loop.
 *
 * Phase 5 assembles the cacheable prefix, Phase 7 gates every iteration, Phase
 * 8 executes tools, Phase 12/13 close the visual loop, Phase 17 stops the run
 * at the founder boundary, and Phase 19 opens the lineage record.
 *
 * The loop never applies, never commits and never marks itself approved. Its
 * terminal success state is WAITING_FOR_FOUNDER_REVIEW.
 */

import { randomUUID } from 'node:crypto';

import { modeContract, resolveEffort, type OpusModelEffort } from '../../../shared/site00-opus-native/modeContracts.js';
import type { OpusNativeTargetRef } from '../../../shared/site00-opus-native/contracts.js';
import type {
  DesignAgentLineageRecord,
  OpusNativeFailure,
  OpusNativeMode,
  OpusNativeReviewPackage,
  OpusNativeViewport,
} from '../../../shared/site00-opus-native/types.js';
import { compileAgentContext } from './contextCompiler.js';
import { persistReceipt, RunCostMeter } from './costLedger.js';
import { previewReadiness } from './preview.js';
import {
  createAnthropicProvider,
  createScriptedProvider,
  ProviderError,
  type OpusProvider,
  type ProviderContentBlock,
  type ProviderMessage,
  type ProviderSystemBlock,
  type ProviderToolResultBlock,
} from './provider.js';
import { getScriptedTranscript } from './scriptedTranscripts.js';
import { persistLineage, RunContextHandle, storeRun } from './runContext.js';
import { dispatchTool, OPUS_TOOL_DEFINITIONS } from './tools.js';
import { isAnthropicConfigured, scriptedProviderEnabled } from './config.js';
import { PatchConflictError } from './workspaceSandbox.js';

export interface StartRunInput {
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
  effort?: OpusModelEffort | null;
  founderConfirmedSpend: boolean;
  scriptedProviderId?: string;
  maxRunCostUsd?: number;
}

export class SpendNotConfirmedError extends Error {
  constructor() {
    super('founderConfirmedSpend must be true before a run is dispatched');
    this.name = 'SpendNotConfirmedError';
  }
}

export async function startRun(input: StartRunInput): Promise<RunContextHandle> {
  if (!input.founderConfirmedSpend) throw new SpendNotConfirmedError();

  const runId = `opus-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
  const { context, compiled, surface } = await compileAgentContext({
    mode: input.mode,
    task: input.task,
    target: input.target,
  });

  const projectContextBlock = compiled.blocks.find((block) => block.label.startsWith('PROJECT_CANON'));
  const meter = new RunCostMeter(
    runId,
    input.mode,
    context.projectId,
    context.pageId,
    compiled.protocolHash,
    input.maxRunCostUsd,
  );

  let provider: OpusProvider;
  if (input.scriptedProviderId) {
    if (!scriptedProviderEnabled()) {
      throw new ProviderError('UNKNOWN', 'the scripted provider is not enabled in this environment');
    }
    const transcript = getScriptedTranscript(input.scriptedProviderId);
    if (!transcript) throw new ProviderError('UNKNOWN', `unknown scripted transcript "${input.scriptedProviderId}"`);
    provider = createScriptedProvider(transcript);
  } else {
    if (!isAnthropicConfigured()) {
      throw new ProviderError('MISSING_API_KEY', 'ANTHROPIC_API_KEY is not configured');
    }
    provider = createAnthropicProvider();
  }

  const run = new RunContextHandle(
    runId,
    input.mode,
    input.task,
    context,
    compiled,
    surface,
    meter,
    provider.id,
    projectContextBlock?.text ?? 'No project canon compiled for this mode.',
  );
  storeRun(run);

  // The loop is intentionally not awaited: the panel polls status, and a
  // FORENSIC run can legitimately take many minutes.
  void executeRun(run, provider, input).catch((error) => {
    run.fail(classifyFailure(error), (error as Error).message ?? String(error));
  });

  return run;
}

function classifyFailure(error: unknown): OpusNativeFailure {
  if (error instanceof ProviderError) return error.kind;
  if (error instanceof PatchConflictError) return 'PATCH_CONFLICT';
  const message = (error as Error)?.message ?? '';
  if (message.startsWith('PREVIEW_FAILURE')) return 'PREVIEW_FAILURE';
  if (message.startsWith('SCREENSHOT_FAILURE')) return 'SCREENSHOT_FAILURE';
  if (message.startsWith('SCOPE_VIOLATION')) return 'SCOPE_VIOLATION';
  if (message.startsWith('COST_CEILING')) return 'COST_CEILING';
  return 'UNKNOWN';
}

/** Phase 5 — stable tiers first, each with a cache breakpoint; volatile last. */
export function buildSystemBlocks(run: RunContextHandle): ProviderSystemBlock[] {
  const blocks: ProviderSystemBlock[] = [];
  const stable = run.compiled.blocks.filter((block) => block.cacheable);
  const volatile = run.compiled.blocks.filter((block) => !block.cacheable);

  for (const block of stable) {
    blocks.push({ type: 'text', text: `<${block.label}>\n${block.text}\n</${block.label}>` });
  }
  // A single breakpoint at the end of the stable region caches everything
  // before it. Anthropic allows four; one is correct here because the stable
  // tiers always change together — the protocol and the project canon are
  // versioned as a unit, so a finer split would buy nothing and cost a
  // breakpoint.
  if (blocks.length > 0) {
    blocks[blocks.length - 1] = { ...blocks[blocks.length - 1], cache_control: { type: 'ephemeral' } };
  }
  for (const block of volatile) {
    blocks.push({ type: 'text', text: `<${block.label}>\n${block.text}\n</${block.label}>` });
  }
  return blocks;
}

async function executeRun(
  run: RunContextHandle,
  provider: OpusProvider,
  input: StartRunInput,
): Promise<void> {
  const contract = modeContract(run.mode);
  const { effort, escalated } = resolveEffort(run.mode, input.effort ?? null);
  if (escalated) run.note('system', `Effort escalated to "${effort}" by founder request.`);

  const system = buildSystemBlocks(run);
  const messages: ProviderMessage[] = [
    {
      role: 'user',
      content: [{ type: 'text', text: `Begin. Follow OPUS_DESIGN_EXECUTION_PROTOCOL_V1. Task:\n\n${run.task}` }],
    },
  ];

  const tools = OPUS_TOOL_DEFINITIONS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.input_schema,
  }));

  const toolCtx = {
    run,
    surface: run.surface,
    fileAllowlist: run.compiled.fileAllowlist,
    writeAllowlist: run.compiled.writeAllowlist,
    viewport: run.context.viewport as OpusNativeViewport,
    route: run.context.route,
  };

  let guardStop: string | null = null;

  for (let iteration = 0; iteration < contract.limits.maxIterations; iteration += 1) {
    if (run.cancelled) {
      run.failure = 'CANCELLED';
      run.touch('CANCELLED');
      await finalise(run, 'Run cancelled by founder.');
      return;
    }

    // Phase 7 — gate BEFORE dispatch, never after.
    const verdict = run.meter.check();
    if (verdict.state === 'BLOCKED') {
      guardStop = verdict.reason;
      break;
    }

    run.touch('THINKING');
    const response = await provider.send({
      system,
      messages,
      tools,
      maxTokens: contract.maxOutputTokens,
      effort,
    });

    run.meter.iterations += 1;
    run.meter.record(response.usage);
    run.cachePosture = derivePosture(run.cachePosture, response.usage.cacheReadTokens, response.usage.cacheWriteTokens);

    const assistantBlocks = response.content;
    const textOut = assistantBlocks
      .filter((block): block is Extract<ProviderContentBlock, { type: 'text' }> => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
    if (textOut) run.note('assistant', textOut);

    const toolUses = assistantBlocks.filter(
      (block): block is Extract<ProviderContentBlock, { type: 'tool_use' }> => block.type === 'tool_use',
    );

    if (toolUses.length === 0) {
      messages.push({ role: 'assistant', content: assistantBlocks });
      break;
    }

    messages.push({ role: 'assistant', content: assistantBlocks });
    run.touch('TOOL_USE');

    const results: ProviderToolResultBlock[] = [];
    for (const use of toolUses) {
      if (run.cancelled) break;
      const isRender = use.name.includes('screenshot') || use.name.includes('render') || use.name.includes('preview');
      run.touch(isRender ? 'RENDERING' : 'TOOL_USE');

      const started = Date.now();
      const result = await dispatchTool(use.name, (use.input ?? {}) as Record<string, unknown>, toolCtx);
      const durationMs = Date.now() - started;

      run.recordToolCall({
        tool: use.name,
        input: (use.input ?? {}) as Record<string, unknown>,
        ok: result.ok,
        summary: result.summary,
        durationMs,
        at: new Date().toISOString(),
      });
      run.note('tool', `${use.name} → ${result.summary}`);

      const content: ProviderToolResultBlock['content'] = [{ type: 'text', text: result.content }];
      if (result.image) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: result.image.mediaType, data: result.image.base64 },
        });
      }
      results.push({ type: 'tool_result', tool_use_id: use.id, is_error: !result.ok, content });
    }

    messages.push({ role: 'user', content: results });
  }

  if (run.cancelled) {
    run.failure = 'CANCELLED';
    run.touch('CANCELLED');
    await finalise(run, 'Run cancelled by founder.');
    return;
  }

  if (guardStop) {
    run.note('system', `Cost guard stopped the run: ${guardStop}. Work so far is preserved for review.`);
  }

  await finalise(run, guardStop ? `Stopped by cost guard: ${guardStop}` : 'Run complete.');
}

function derivePosture(
  current: 'HIT' | 'MISS' | 'PARTIAL' | 'UNKNOWN',
  cacheRead: number,
  cacheWrite: number,
): 'HIT' | 'MISS' | 'PARTIAL' | 'UNKNOWN' {
  const turn = cacheRead > 0 ? (cacheWrite > 0 ? 'PARTIAL' : 'HIT') : cacheWrite > 0 ? 'MISS' : 'UNKNOWN';
  if (current === 'UNKNOWN') return turn;
  if (current === turn) return current;
  return 'PARTIAL';
}

/**
 * Phase 17 + 19. Every completed run stops here regardless of outcome. A run
 * that produced a patch enters WAITING_FOR_FOUNDER_REVIEW; a run that produced
 * nothing is still given a receipt, because a run that cost money and changed
 * nothing is exactly the run the founder most needs a receipt for.
 */
async function finalise(run: RunContextHandle, summary: string): Promise<void> {
  const receipt = run.meter.receipt();
  run.setReceipt(receipt);
  await persistReceipt(receipt).catch(() => undefined);

  const before = run.screenshots.find((shot) => shot.screenshotId.includes('-before-')) ?? run.screenshots[0] ?? null;
  const after =
    run.screenshots.slice().reverse().find((shot) => shot.screenshotId !== before?.screenshotId) ?? null;

  const review: OpusNativeReviewPackage = {
    runId: run.runId,
    summary,
    patch: run.patch(),
    before,
    after,
    typecheck: run.typecheckResult(),
    tests: run.testResult(),
    receipt,
    guard: run.meter.check(),
  };
  run.setReview(review);

  const lineage: DesignAgentLineageRecord = {
    lineageId: `lineage-${run.runId}`,
    runId: run.runId,
    sourceGolden: run.context.goldenReference,
    parentDesignAuthority: run.context.parentDesignAuthority,
    patchId: run.patch()?.patchId ?? null,
    screenshots: run.screenshots,
    founderDecision: 'PENDING',
    decidedAt: null,
    resultingDesignVersion: null,
    protocolVersion: run.compiled.protocolVersion,
  };
  run.setLineage(lineage);
  await persistLineage(lineage).catch(() => undefined);

  if (run.status !== 'ERROR' && run.status !== 'CANCELLED') {
    run.touch('WAITING_FOR_FOUNDER_REVIEW');
  }
}

/** Phase 20 — preview readiness is probed on demand, never cached into a lie. */
export async function probePreview() {
  return previewReadiness();
}
