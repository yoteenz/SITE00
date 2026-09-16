/**
 * P0.VR.OPUS-NATIVE1 — the native Opus design runtime endpoint.
 *
 * One action-dispatched handler, matching the existing SITE 00 API convention.
 * Nothing in any response contains, derives from, or hints at the Anthropic
 * credential; `assertNoSecrets` re-checks that on the way out for every
 * response this file produces.
 */

import { readFile } from 'node:fs/promises';

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import type {
  OpusNativeAction,
  OpusNativeStartRequest,
  OpusNativeTargetRef,
} from '../../shared/site00-opus-native/contracts.js';
import { modeContract } from '../../shared/site00-opus-native/modeContracts.js';
import { projectRunCost } from '../../shared/site00-opus-native/pricing.js';
import { OPUS_NATIVE_MODES, type OpusNativeMode } from '../../shared/site00-opus-native/types.js';
import { approveRun, requestChanges, ReviewStateError, revertRun } from '../_lib/site00OpusNative/approval.js';
import { OPUS_NATIVE_MODEL, scriptedProviderEnabled, tokenRates } from '../_lib/site00OpusNative/config.js';
import { compileAgentContext } from '../_lib/site00OpusNative/contextCompiler.js';
import { readLedger, summariseLedger } from '../_lib/site00OpusNative/costLedger.js';
import { NATIVE_OPUS_VS_CURSOR_GAP, summariseGap } from '../_lib/site00OpusNative/cursorGap.js';
import { auditForSecrets, collectDiagnostics } from '../_lib/site00OpusNative/observability.js';
import { ProviderError } from '../_lib/site00OpusNative/provider.js';
import { DESIGN_SURFACES } from '../_lib/site00OpusNative/designSurfaceRegistry.js';
import { previewReadiness } from '../_lib/site00OpusNative/preview.js';
import {
  createSession,
  getSession,
  listSessions,
  recordFeedback,
  recordRunInSession,
} from '../_lib/site00OpusNative/sessionStore.js';
import {
  DESIGN_AGENT_INTENTS,
  type DesignAgentIntent,
  type FounderWriteGrant,
} from '../../shared/site00-opus-native/writePolicy.js';
import { getRun, latestRun } from '../_lib/site00OpusNative/runContext.js';
import {
  CreationContractRequiredError,
  startRun,
  SpendNotConfirmedError,
  WriteAuthorizationRequiredError,
} from '../_lib/site00OpusNative/runtime.js';
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

  // ---- P0.VR.OPUS-NATIVE2 --------------------------------------------------

  /** Phase 4 — the panel resolves the active DESIGN page against this. */
  if (action === 'surfaces') {
    return send(res, 200, {
      ok: true,
      surfaces: DESIGN_SURFACES.map((surface) => ({
        pageId: surface.pageId,
        route: surface.route,
        pageRole: surface.pageRole,
        projectSlug: surface.projectSlug,
        parentPageId: surface.parentPageId,
        standingWriteMode: surface.standingWriteMode,
        maxGrantableWriteMode: surface.maxGrantableWriteMode,
        goldenReferenceVersion: surface.goldenReferenceVersion,
        writeFirewallReason: surface.writeFirewallReason,
        assetManifestPath: surface.assetManifestPath,
        allowedCreateDirectories: surface.allowedCreateDirectories,
      })),
    });
  }

  /**
   * Phase 26 — the review surface compares BEFORE, AFTER and GOLDEN, so the
   * captures have to be reachable from the browser. Served by id from the run
   * store rather than by path, so the endpoint cannot be turned into a
   * general file reader: an id that is not a screenshot of a retained run
   * simply does not resolve.
   */
  if (action === 'screenshot') {
    const id = stringParam(req.query.id);
    const runId = stringParam(req.query.runId);
    const run = runId ? getRun(runId) : latestRun();
    const shot = id && run ? run.screenshotById(id) : null;
    if (!shot) return send(res, 404, { ok: false, error: 'SCREENSHOT_NOT_FOUND' });
    try {
      const bytes = await readFile(shot.path);
      res.setHeader('Content-Type', 'image/png');
      res.status(200).send(bytes);
      return;
    } catch {
      return send(res, 404, { ok: false, error: 'SCREENSHOT_UNREADABLE' });
    }
  }

  if (action === 'sessions') {
    const pageId = typeof req.query.pageId === 'string' ? req.query.pageId : undefined;
    return send(res, 200, { ok: true, sessions: listSessions(pageId ? { pageId } : undefined) });
  }

  /** Phase 32 — the inspectable brain. Compiled context only, never reasoning. */
  if (action === 'agent_context') {
    const target: OpusNativeTargetRef = {
      projectSlug: stringParam(req.query.projectSlug),
      route: stringParam(req.query.route),
      pageId: stringParam(req.query.pageId),
    };
    const intent = coerceIntent(req.query.intent);
    const { context, compiled, surface, authority } = await compileAgentContext({
      mode: coerceMode(req.query.mode),
      task: stringParam(req.query.task) ?? '(no task supplied — context preview only)',
      target,
      intent,
    });

    return send(res, 200, {
      ok: true,
      pageId: surface.pageId,
      route: context.route,
      context,
      policy: authority.policy,
      intent,
      standingMode: authority.standingMode,
      maxGrantableMode: authority.maxGrantableMode,
      inheritance: surface.inheritanceRules
        ? {
            parentPageId: surface.parentPageId,
            mustInherit: surface.inheritanceRules.mustInherit,
            mayOverride: surface.inheritanceRules.mayOverride,
            sharedModules: surface.inheritanceRules.sharedModules,
          }
        : null,
      assetAuthority: {
        manifestPath: surface.assetManifestPath,
        protectedPaths: surface.protectedAssets,
        mutation: authority.policy.allowAssetReferenceChanges ? 'GRANTED' : 'BLOCKED',
        owner: 'GROK owns generated raster identity; OPUS owns structure, typography, icons and interaction.',
      },
      blocks: compiled.blocks.map((block) => ({
        tier: block.tier,
        label: block.label,
        estimatedTokens: block.estimatedTokens,
        cacheable: block.cacheable,
        sources: block.sources,
        preview: block.text.split('\n').slice(0, 12).join('\n'),
      })),
      totalEstimatedTokens: compiled.totalEstimatedTokens,
      cacheableEstimatedTokens: compiled.cacheableEstimatedTokens,
    });
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
      const intent = coerceIntent(body?.intent);
      const grant = (body?.writeGrant as FounderWriteGrant | null | undefined) ?? null;
      const { context, compiled, authority } = await compileAgentContext({
        mode,
        task,
        target,
        intent,
        grant,
      });
      const rates = tokenRates();
      const contract = modeContract(mode);
      const preview = await previewReadiness(context.route);

      // Cold: the stable prefix is a cache write. Warm: it is a cache read.
      // Showing both is the honest way to present the cost of a second run on
      // the same page, which is the common case during refinement.
      const volatileTokens = compiled.totalEstimatedTokens - compiled.cacheableEstimatedTokens;
      const expectedTurns = Math.min(contract.limits.maxIterations, contract.maxVisualLoops + 4);
      const projection = {
        volatileTokens,
        cacheableTokens: compiled.cacheableEstimatedTokens,
        expectedTurns,
        maxOutputTokens: contract.maxOutputTokens,
        rates,
      };
      const estimatedUsd = projectRunCost({ ...projection, cacheWarm: false });
      const estimatedUsdCached = projectRunCost({ ...projection, cacheWarm: true });

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
        // ---- P0.VR.OPUS-NATIVE2 — Phase 7/22 --------------------------------
        intent,
        requestedMode: authority.requestedMode,
        permittedMode: authority.permittedMode,
        standingMode: authority.standingMode,
        maxGrantableMode: authority.maxGrantableMode,
        createDirectories: authority.policy.allowedDirectories,
        assetMutation: authority.policy.allowAssetReferenceChanges ? 'GRANTED' : 'BLOCKED',
        writeAuthorization: authority.authorizationRequest,
        previewReady: preview.ready,
        previewReason: preview.reason,
        /**
         * P0.VR.OPUS-NATIVE2 — Phase 21/22, added after a proof run exposed
         * it. A QUICK visual loop on the canonical page projected $0.616
         * against QUICK's $0.75 ceiling, dispatched, and was stopped by the
         * guard mid-loop with the patch applied but never compared. The guard
         * was right; the estimate was useless, because a projection inside
         * the ceiling is not the same as a projection that will finish. The
         * founder now sees the mode that fits before spending anything.
         */
        ...modeFit(estimatedUsd, mode, contract.limits.hardStopAtCostUsd),
      });
    }

    case 'start': {
      const request = body as unknown as OpusNativeStartRequest;
      const intent = coerceIntent(request?.intent);

      // Phase 24 — a run against a page opens a thread if it is not already
      // continuing one, so continuation is always available afterwards rather
      // than being something the founder has to have opted into up front.
      let sessionId = request?.sessionId ?? null;
      if (!sessionId) {
        const { context, surface, authority } = await compileAgentContext({
          mode: coerceMode(request?.mode),
          task: String(request?.task ?? ''),
          target: request?.target,
          intent,
          grant: request?.writeGrant ?? null,
        });
        sessionId = createSession({
          projectId: context.projectId,
          pageId: surface.pageId,
          route: context.route,
          threadTask: String(request?.task ?? ''),
          intent,
          writeMode: authority.permittedMode,
        }).sessionId;
      }

      try {
        const run = await startRun({
          mode: coerceMode(request?.mode),
          task: String(request?.task ?? ''),
          target: request?.target,
          effort: request?.effort ?? null,
          founderConfirmedSpend: request?.founderConfirmedSpend === true,
          scriptedProviderId: request?.scriptedProviderId,
          intent,
          writeGrant: request?.writeGrant ?? null,
          creationContract: request?.creationContract ?? null,
          sessionId,
          parentRunId: request?.parentRunId ?? null,
        });
        return send(res, 200, { ok: true, run: run.serialise() });
      } catch (error) {
        return sendStartError(res, error);
      }
    }

    /**
     * Phase 23 — request changes and continue, atomically. NATIVE1 made these
     * two separate acts and the second one started from nothing; here the
     * feedback is recorded on the thread and the continuation is dispatched
     * against the compacted state in one call.
     */
    case 'continue': {
      const parent = resolveRun(body);
      if (!parent) return send(res, 404, { ok: false, error: 'RUN_NOT_FOUND' });
      const note = String(body?.note ?? '').trim();
      if (!note) return send(res, 400, { ok: false, error: 'NOTE_REQUIRED' });

      const session = parent.sessionId ? getSession(parent.sessionId) : null;
      if (!session) {
        return send(res, 409, {
          ok: false,
          error: 'NO_SESSION',
          detail: 'this run has no thread to continue; start a new run instead',
        });
      }

      try {
        await requestChanges(parent, note);
      } catch (error) {
        if (!(error instanceof ReviewStateError)) throw error;
        // A run that already ended is still a legitimate thing to continue
        // from; the note matters more than the parent's terminal state.
      }
      recordRunInSession(session, parent, 'CHANGES_REQUESTED');
      recordFeedback(session, parent.runId, note);

      try {
        const run = await startRun({
          mode: coerceMode(body?.mode ?? parent.mode),
          task: note,
          target: {
            projectSlug: parent.context.projectId,
            route: parent.context.route,
            pageId: parent.context.pageId,
            viewport: parent.context.viewport,
          },
          effort: null,
          founderConfirmedSpend: body?.founderConfirmedSpend === true,
          scriptedProviderId: typeof body?.scriptedProviderId === 'string' ? body.scriptedProviderId : undefined,
          intent: parent.intent,
          // The grant that authorised the parent carries into the
          // continuation: it is the same founder, the same thread and the
          // same page, and forcing a re-grant per turn would train the
          // founder to approve without reading.
          writeGrant: parent.authority.grantApplied
            ? {
                mode: parent.authority.permittedMode,
                allowAssetReferenceChanges: parent.authority.policy.allowAssetReferenceChanges,
              }
            : null,
          sessionId: session.sessionId,
          parentRunId: parent.runId,
        });
        return send(res, 200, { ok: true, run: run.serialise() });
      } catch (error) {
        return sendStartError(res, error);
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

/**
 * Phase 7 — WRITE_ACCESS_REQUIRED is a 409 with the full authorization
 * request attached, not a 400 with a sentence. The panel renders the grant
 * prompt straight from this payload.
 */
function sendStartError(res: VercelResponse, error: unknown) {
  if (error instanceof SpendNotConfirmedError) {
    return send(res, 400, { ok: false, error: 'SPEND_NOT_CONFIRMED', detail: error.message });
  }
  if (error instanceof WriteAuthorizationRequiredError) {
    return send(res, 409, {
      ok: false,
      error: 'WRITE_ACCESS_REQUIRED',
      detail: error.message,
      writeAuthorization: error.request,
    });
  }
  if (error instanceof CreationContractRequiredError) {
    return send(res, 400, { ok: false, error: 'CREATION_CONTRACT_REQUIRED', detail: error.message });
  }
  if (error instanceof ProviderError) {
    return send(res, 400, { ok: false, error: error.kind, detail: error.message });
  }
  throw error;
}

/**
 * A run is at risk long before its projection crosses the ceiling: the
 * projection is a model, and the tail of an agent loop — the comparison and
 * the guards — is the part that gets cut off when it under-projects. 80% is
 * treated as "will not finish" rather than "nearly fine".
 */
const MODE_FIT_MARGIN = 0.8;

function modeFit(estimatedUsd: number, mode: OpusNativeMode, ceiling: number) {
  const fits = estimatedUsd <= ceiling * MODE_FIT_MARGIN;
  if (fits) return { modeFitsBudget: true, recommendedMode: mode, modeFitDetail: null };

  const better = OPUS_NATIVE_MODES.find(
    (candidate) => estimatedUsd <= modeContract(candidate).limits.hardStopAtCostUsd * MODE_FIT_MARGIN,
  );
  return {
    modeFitsBudget: false,
    recommendedMode: better ?? mode,
    modeFitDetail: better
      ? `${mode} will stop mid-loop on this surface: the projection is $${estimatedUsd.toFixed(3)} against a $${ceiling.toFixed(2)} ceiling. ${better} has the headroom to finish and compare.`
      : `This surface projects $${estimatedUsd.toFixed(3)}, above every mode's ceiling. Narrow the task or the target.`,
  };
}

function stringParam(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function coerceIntent(value: unknown): DesignAgentIntent {
  const intent = String(value ?? 'REFINE_CURRENT').toUpperCase();
  return (DESIGN_AGENT_INTENTS as readonly string[]).includes(intent)
    ? (intent as DesignAgentIntent)
    : 'REFINE_CURRENT';
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
