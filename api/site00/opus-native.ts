/**
 * P0.VR.OPUS-NATIVE1 — the native Opus design runtime endpoint.
 *
 * One action-dispatched handler, matching the existing SITE 00 API convention.
 * Nothing in any response contains, derives from, or hints at the Anthropic
 * credential; `assertNoSecrets` re-checks that on the way out for every
 * response this file produces.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import type {
  OpusNativeAction,
  OpusNativeStartRequest,
  OpusNativeTargetRef,
} from '../../shared/site00-opus-native/contracts.js';
import { modeContract } from '../../shared/site00-opus-native/modeContracts.js';
import { usageCostUsd } from '../../shared/site00-opus-native/pricing.js';
import { OPUS_NATIVE_MODES, type OpusNativeMode } from '../../shared/site00-opus-native/types.js';
import { approveRun, requestChanges, ReviewStateError, revertRun } from '../_lib/site00OpusNative/approval.js';
import { OPUS_NATIVE_MODEL, scriptedProviderEnabled, tokenRates } from '../_lib/site00OpusNative/config.js';
import { compileAgentContext } from '../_lib/site00OpusNative/contextCompiler.js';
import { readLedger, summariseLedger } from '../_lib/site00OpusNative/costLedger.js';
import { NATIVE_OPUS_VS_CURSOR_GAP, summariseGap } from '../_lib/site00OpusNative/cursorGap.js';
import { auditForSecrets, collectDiagnostics } from '../_lib/site00OpusNative/observability.js';
import { ProviderError } from '../_lib/site00OpusNative/provider.js';
import { getRun, latestRun } from '../_lib/site00OpusNative/runContext.js';
import { startRun, SpendNotConfirmedError } from '../_lib/site00OpusNative/runtime.js';
import { listScriptedTranscripts } from '../_lib/site00OpusNative/scriptedTranscripts.js';
import { OPUS_TOOL_DEFINITIONS } from '../_lib/site00OpusNative/tools.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') return await handleGet(req, res);
    if (req.method === 'POST') return await handlePost(req, res);
    return send(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    return send(res, 500, {
      ok: false,
      error: 'OPUS_NATIVE_ERROR',
      detail: (error as Error).message ?? String(error),
    });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const action = (typeof req.query.action === 'string' ? req.query.action : 'diagnostics') as OpusNativeAction;

  if (action === 'status') {
    const runId = typeof req.query.runId === 'string' ? req.query.runId : '';
    const run = runId ? getRun(runId) : latestRun();
    if (!run) return send(res, 404, { ok: false, error: 'RUN_NOT_FOUND' });
    return send(res, 200, { ok: true, run: run.serialise() });
  }

  if (action === 'ledger') {
    const receipts = await readLedger();
    return send(res, 200, { ok: true, receipts, totals: summariseLedger(receipts) });
  }

  if (action === 'gap') {
    return send(res, 200, { ok: true, rows: NATIVE_OPUS_VS_CURSOR_GAP, summary: summariseGap() });
  }

  const diagnostics = await collectDiagnostics();
  return send(res, 200, {
    ok: true,
    service: 'opus-native',
    model: OPUS_NATIVE_MODEL,
    diagnostics,
    modes: OPUS_NATIVE_MODES.map((mode) => ({
      mode,
      ...summariseModeContract(mode),
    })),
    tools: OPUS_TOOL_DEFINITIONS.map((tool) => ({ name: tool.name, mutating: tool.mutating })),
    scriptedProvider: scriptedProviderEnabled()
      ? { enabled: true, transcripts: listScriptedTranscripts() }
      : { enabled: false, transcripts: [] },
  });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const body = (typeof req.body === 'string' ? safeJson(req.body) : req.body) as Record<string, unknown> | null;
  const action = String(body?.action ?? '') as OpusNativeAction;

  switch (action) {
    case 'estimate': {
      const mode = coerceMode(body?.mode);
      const task = String(body?.task ?? '');
      const target = body?.target as OpusNativeTargetRef | undefined;
      const { context, compiled } = await compileAgentContext({ mode, task, target });
      const rates = tokenRates();
      const contract = modeContract(mode);

      // Cold: the whole prefix is a cache write. Warm: it is a cache read.
      // Showing both is the honest way to present the cost of a second run on
      // the same page, which is the common case during refinement.
      const volatileTokens = compiled.totalEstimatedTokens - compiled.cacheableEstimatedTokens;
      const estimatedUsd = usageCostUsd(
        {
          inputTokens: volatileTokens,
          outputTokens: contract.maxOutputTokens / 4,
          cacheWriteTokens: compiled.cacheableEstimatedTokens,
          cacheReadTokens: 0,
        },
        rates,
      );
      const estimatedUsdCached = usageCostUsd(
        {
          inputTokens: volatileTokens,
          outputTokens: contract.maxOutputTokens / 4,
          cacheWriteTokens: 0,
          cacheReadTokens: compiled.cacheableEstimatedTokens,
        },
        rates,
      );

      return send(res, 200, {
        ok: true,
        mode,
        context,
        estimatedTokens: compiled.totalEstimatedTokens,
        cacheableTokens: compiled.cacheableEstimatedTokens,
        estimatedUsd,
        estimatedUsdCached,
        fileAllowlist: compiled.fileAllowlist,
        writeAllowlist: compiled.writeAllowlist,
        blockSummary: compiled.blocks.map((block) => ({
          tier: block.tier,
          label: block.label,
          estimatedTokens: block.estimatedTokens,
          cacheable: block.cacheable,
        })),
        guardLimits: contract.limits as unknown as Record<string, number>,
      });
    }

    case 'start': {
      const request = body as unknown as OpusNativeStartRequest;
      try {
        const run = await startRun({
          mode: coerceMode(request?.mode),
          task: String(request?.task ?? ''),
          target: request?.target,
          effort: request?.effort ?? null,
          founderConfirmedSpend: request?.founderConfirmedSpend === true,
          scriptedProviderId: request?.scriptedProviderId,
        });
        return send(res, 200, { ok: true, run: run.serialise() });
      } catch (error) {
        if (error instanceof SpendNotConfirmedError) {
          return send(res, 400, { ok: false, error: 'SPEND_NOT_CONFIRMED', detail: error.message });
        }
        if (error instanceof ProviderError) {
          return send(res, 400, { ok: false, error: error.kind, detail: error.message });
        }
        throw error;
      }
    }

    case 'cancel': {
      const run = resolveRun(body);
      if (!run) return send(res, 404, { ok: false, error: 'RUN_NOT_FOUND' });
      run.cancelled = true;
      run.note('system', 'Cancellation requested by founder.');
      return send(res, 200, { ok: true, run: run.serialise() });
    }

    case 'approve': {
      const run = resolveRun(body);
      if (!run) return send(res, 404, { ok: false, error: 'RUN_NOT_FOUND' });
      try {
        await approveRun(run, typeof body?.resultingDesignVersion === 'string' ? body.resultingDesignVersion : null);
        return send(res, 200, { ok: true, run: run.serialise() });
      } catch (error) {
        if (error instanceof ReviewStateError) {
          return send(res, 409, { ok: false, error: 'REVIEW_STATE', detail: error.message });
        }
        throw error;
      }
    }

    case 'request_changes': {
      const run = resolveRun(body);
      if (!run) return send(res, 404, { ok: false, error: 'RUN_NOT_FOUND' });
      try {
        await requestChanges(run, String(body?.note ?? ''));
        return send(res, 200, { ok: true, run: run.serialise() });
      } catch (error) {
        if (error instanceof ReviewStateError) {
          return send(res, 409, { ok: false, error: 'REVIEW_STATE', detail: error.message });
        }
        throw error;
      }
    }

    case 'revert': {
      const run = resolveRun(body);
      if (!run) return send(res, 404, { ok: false, error: 'RUN_NOT_FOUND' });
      const result = await revertRun(run);
      return send(res, 200, { ok: true, run: run.serialise(), reverted: result.reverted });
    }

    default:
      return send(res, 400, { ok: false, error: 'UNKNOWN_ACTION', detail: action });
  }
}

function resolveRun(body: Record<string, unknown> | null) {
  const runId = typeof body?.runId === 'string' ? body.runId : '';
  return runId ? getRun(runId) : latestRun();
}

function coerceMode(value: unknown): OpusNativeMode {
  const mode = String(value ?? 'DESIGN').toUpperCase();
  return (OPUS_NATIVE_MODES as readonly string[]).includes(mode) ? (mode as OpusNativeMode) : 'DESIGN';
}

function summariseModeContract(mode: OpusNativeMode) {
  const contract = modeContract(mode);
  return {
    purpose: contract.purpose,
    useFor: contract.useFor,
    contextBudgetTokens: contract.contextBudgetTokens,
    maxVisualLoops: contract.maxVisualLoops,
    defaultEffort: contract.defaultEffort,
    limits: contract.limits,
  };
}

function safeJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Last line of the security contract. Every response this endpoint emits is
 * audited for credential material before it leaves the process.
 */
function send(res: VercelResponse, status: number, payload: Record<string, unknown>) {
  if (auditForSecrets(payload)) {
    res.status(500).json({ ok: false, error: 'RESPONSE_BLOCKED_SECRET_LEAK' });
    return;
  }
  res.status(status).json(payload);
}
