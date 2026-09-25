/**
 * PAGE concept generation — async START + status; legacy sync generate for tests.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  pageConceptGenerationDryRun,
  planPageConceptGeneration,
  runPageConceptGeneration,
  type PageGenerationCapturePayload,
} from '../_lib/site00PageConcept/runPageConceptGeneration.js';
import { pageGenerationCapturePayloadValid } from '../_lib/site00PageConcept/resolvePageGenerationCapture.js';
import { resolveLatestPageConceptServerRunForPage } from '../_lib/site00PageConcept/pageConceptGenerationRunStore.js';
import { resolveDesignPageIdentity } from '../../shared/site00-design-workspace-production/designPageIdentity.js';
import {
  snapshotPageConceptServerRun,
  startPageConceptGenerationRun,
} from '../_lib/site00PageConcept/startPageConceptGenerationRun.js';
import type { PageConceptGenerationState } from '../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptGenerationRequest } from '../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationRequest.js';

type Body = PageConceptGenerationRequest & {
  mobileCapture?: PageGenerationCapturePayload;
  desktopCapture?: PageGenerationCapturePayload;
};

function incomingCapturesTrusted(body: Body): boolean {
  if (!pageGenerationCapturePayloadValid(body.mobileCapture) || !pageGenerationCapturePayloadValid(body.desktopCapture)) {
    return false;
  }
  const dry = pageConceptGenerationDryRun({
    state: body.state,
    mobileCapture: body.mobileCapture,
    desktopCapture: body.desktopCapture,
  });
  return dry.ok;
}

async function handleGet(req: VercelRequest, res: VercelResponse, email: string) {
  const latestForPage =
    req.query.latestForPage === '1' ||
    req.query.latestForPage === 'true' ||
    req.query.scope === 'latestForPage';
  const projectId = String(req.query.projectId ?? '').trim();
  const pageId = String(req.query.pageId ?? '').trim();

  if (latestForPage) {
    if (!projectId || !pageId) {
      res.status(400).json({ error: 'PROJECT_AND_PAGE_REQUIRED' });
      return;
    }
    const screenId = String(req.query.screenId ?? '').trim();
    const routeRaw = req.query.route;
    const route = routeRaw != null && String(routeRaw).trim() !== '' ? String(routeRaw) : null;
    const identity = resolveDesignPageIdentity({
      projectSlug: projectId,
      pageId,
      screenId,
      route,
    });
    const pageIds = [
      ...new Set(
        [identity.registryPageId, identity.canonicalPageId, identity.screenId].filter(Boolean),
      ),
    ];
    const latest = await resolveLatestPageConceptServerRunForPage(
      identity.projectId,
      identity.registryPageId,
      pageIds,
    );
    if (!latest) {
      res.status(404).json({ error: 'NO_GALLERY_RUN_FOR_PAGE' });
      return;
    }
    const snapshot = await snapshotPageConceptServerRun(latest.runId, 0, { projectId, pageId });
    if (!snapshot) {
      res.status(404).json({ error: 'RUN_NOT_FOUND' });
      return;
    }
    res.status(200).json({
      ok: true,
      founderEmail: email,
      run: snapshot,
      latestSequence: snapshot.latestProgressSequence,
      progressEvents: snapshot.progressEventsAfterSequence,
    });
    return;
  }

  const runId = String(req.query.runId ?? '').trim();
  if (!runId) {
    res.status(400).json({ error: 'RUN_ID_REQUIRED' });
    return;
  }
  const afterRaw = req.query.afterSequence;
  const afterSequence =
    afterRaw != null && String(afterRaw).trim() !== '' ?
      Math.max(0, Number.parseInt(String(afterRaw), 10) || 0)
    : 0;
  const scopeProjectId = projectId || undefined;
  const scopePageId = pageId || undefined;
  const snapshot = await snapshotPageConceptServerRun(runId, afterSequence, {
    projectId: scopeProjectId,
    pageId: scopePageId,
  });
  if (!snapshot) {
    res.status(404).json({ error: 'RUN_NOT_FOUND' });
    return;
  }
  res.status(200).json({
    ok: true,
    founderEmail: email,
    run: snapshot,
    latestSequence: snapshot.latestProgressSequence,
    progressEvents: snapshot.progressEventsAfterSequence,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  const authed = await getAuthUser(req);
  const email = authed?.email ?? null;
  if (!email) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  if (!isFounderPrivilegedAccount(email)) {
    res.status(403).json({ error: 'FOUNDER_ONLY' });
    return;
  }

  if (req.method === 'GET') {
    await handleGet(req, res, email);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Body;
  if (!body.state || body.state.targetType !== 'PAGE') {
    res.status(400).json({ error: 'PAGE_STATE_REQUIRED' });
    return;
  }

  try {
    if (body.action === 'plan') {
      const trustIncoming = incomingCapturesTrusted(body);
      const plan = planPageConceptGeneration(body.state.projectId, body.state.pageId, {
        trustIncomingCaptures: trustIncoming,
      });
      res.status(200).json({ ok: true, plan, trustIncomingCaptures: trustIncoming });
      return;
    }

    if (body.action === 'trace' || body.traceOnly === true || body.dryRun === true) {
      const dry = pageConceptGenerationDryRun({
        state: body.state,
        mobileCapture: body.mobileCapture,
        desktopCapture: body.desktopCapture,
      });
      if (!dry.ok) {
        const status = dry.code.startsWith('BLOCKED_') ? 422 : 400;
        res.status(status).json({
          ok: false,
          trace: true,
          dryRun: true,
          error: dry.code,
          message: dry.message,
          serverCaptureValidation: 'FAIL',
          projectId: body.state.projectId,
          pageId: body.state.pageId,
        });
        return;
      }
      res.status(200).json({
        ok: true,
        trace: true,
        dryRun: true,
        readiness: dry.readiness,
        founderEmail: email,
        stage: 'CGPT_STARTING',
        serverCaptureValidation: dry.serverCaptureValidation,
        mobileCaptureId: dry.mobileCaptureId,
        desktopCaptureId: dry.desktopCaptureId,
        mobileTransport: dry.mobileTransport,
        desktopTransport: dry.desktopTransport,
        projectId: body.state.projectId,
        pageId: body.state.pageId,
        generationStatus: body.state.generationStatus ?? 'IDLE',
        planSummary: {
          nbpJobs: dry.plan.nbpJobs,
          captureSetId: dry.plan.captureSetId,
        },
        message: 'READY_FOR_PROVIDER_DISPATCH — no provider dispatch',
      });
      return;
    }

    if (body.action === 'start') {
      if (!pageGenerationCapturePayloadValid(body.mobileCapture) || !pageGenerationCapturePayloadValid(body.desktopCapture)) {
        res.status(400).json({ error: 'CAPTURE_ARTIFACTS_REQUIRED' });
        return;
      }
      const isDryRun = body.dryRun === true;
      if (!isDryRun && body.founderConfirmedSpend !== true) {
        res.status(400).json({ error: 'SPEND_GUARD: founder confirmation required' });
        return;
      }
      const { runId, status } = await startPageConceptGenerationRun({
        state: body.state,
        mobileCapture: body.mobileCapture,
        desktopCapture: body.desktopCapture,
        founderConfirmedSpend: body.founderConfirmedSpend === true,
        retryFailedOnly: body.retryFailedOnly === true,
        retryCgptOnly: body.retryCgptOnly === true,
        resumeRunId: body.resumeRunId,
        continueNbpAfterGpt2Review: body.continueNbpAfterGpt2Review === true,
        continueGpt2AfterCgptReview: body.continueGpt2AfterCgptReview === true,
        retryGpt2Only: body.retryGpt2Only === true,
        regenerateNbpOnly: body.regenerateNbpOnly === true,
        founderEmail: email,
        dryRun: isDryRun,
      });
      res.status(202).json({
        ok: true,
        runId,
        status,
        dryRun: isDryRun,
        message: isDryRun ? 'DRY_RUN_QUEUED' : 'GENERATION_QUEUED',
      });
      return;
    }

    if (body.action === 'generate') {
      if (!pageGenerationCapturePayloadValid(body.mobileCapture) || !pageGenerationCapturePayloadValid(body.desktopCapture)) {
        res.status(400).json({ error: 'CAPTURE_ARTIFACTS_REQUIRED' });
        return;
      }
      const result = await runPageConceptGeneration({
        state: body.state,
        mobileCapture: body.mobileCapture,
        desktopCapture: body.desktopCapture,
        founderConfirmedSpend: body.founderConfirmedSpend === true,
        retryFailedOnly: body.retryFailedOnly === true,
      });
      res.status(200).json({ ok: true, ...result });
      return;
    }

    res.status(400).json({ error: 'UNKNOWN_ACTION' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GENERATION_FAILED';
    const status =
      message.includes('SPEND_GUARD') ? 400
      : message === 'RUN_NOT_FOUND' ? 404
      : message.startsWith('BLOCKED_') ? 422
      : 500;
    res.status(status).json({ error: message });
  }
}
