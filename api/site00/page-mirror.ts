/**
 * SITE 00 page mirror API — route discovery, sync orchestration, capture queue.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildProjectPageMirrorRows,
  buildProjectPageMirrorSummary,
  buildPageMirrorInspectorState,
  handlePageSyncEvent,
  listPageSyncEvents,
  listCaptureQueue,
  reconcileProjectPageRegistry,
  pageMirrorRowToVisualIndexRow,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import { captureImplementationSnapshot } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8/screenshotRecorder.js';
import {
  refreshProjectCaptureState,
  getProjectCaptureRefreshProgress,
  buildCaptureOrchestrationInspectorState,
  bootstrapCaptureRunStore,
  reconcileRecoveredPageCaptureStates,
  buildCaptureRunPreflight,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import {
  CAPTURE_RUN_CONTRACT_VERSION,
  normalizeProjectCaptureRunResponse,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/projectCaptureRunContract.js';
import { buildCaptureVersionReceipt, P0_VR_8R3R1_BUILD } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/buildVersionReceipt.js';
import { bootstrapAllManagedDesignProjects } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

const REPO_ROOT = process.cwd();

function bootstrapCaptureApi(projectId: string): void {
  bootstrapAllManagedDesignProjects();
  bootstrapCaptureRunStore(REPO_ROOT);
  reconcileRecoveredPageCaptureStates(projectId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const projectId = String(req.query.projectId ?? req.body?.projectId ?? 'site00');
    bootstrapCaptureApi(projectId);

    const preflight = buildCaptureRunPreflight(projectId, { baseUrl: process.env.VITE_SITE00_ROOT ? 'https://site00.com' : undefined });
    const buildReceipt = buildCaptureVersionReceipt(P0_VR_8R3R1_BUILD, {
      routeManifestVersion: preflight.routeManifestVersion,
      pageInventoryVersion: preflight.pageInventoryVersion,
    });
    res.setHeader('X-Site00-Capture-Contract', CAPTURE_RUN_CONTRACT_VERSION);
    res.setHeader('X-Site00-Api-Build', P0_VR_8R3R1_BUILD);

    if (req.method === 'GET') {
      const view = req.query.view ? String(req.query.view) : null;

      if (view === 'inspector') {
        return res.status(200).json(buildPageMirrorInspectorState(projectId));
      }
      if (view === 'capture-orchestration') {
        return res.status(200).json({
          ...buildCaptureOrchestrationInspectorState(projectId),
          buildReceipt,
          contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
        });
      }
      if (view === 'capture-run') {
        const progress = getProjectCaptureRefreshProgress(projectId, REPO_ROOT);
        return res.status(200).json({
          contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
          captureRun: progress,
          buildReceipt,
        });
      }
      if (view === 'events') {
        return res.status(200).json({ events: listPageSyncEvents(projectId) });
      }
      if (view === 'queue') {
        return res.status(200).json({ queue: listCaptureQueue(projectId) });
      }

      const rows = buildProjectPageMirrorRows(projectId);
      const captureSummary = buildProjectPageMirrorSummary(projectId);
      const captureRun = getProjectCaptureRefreshProgress(projectId, REPO_ROOT);
      const preflightView = buildCaptureRunPreflight(projectId);
      return res.status(200).json({
        contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
        projectId,
        pages: rows.map(pageMirrorRowToVisualIndexRow),
        inspector: buildPageMirrorInspectorState(projectId),
        captureRun,
        captureSummary,
        preflight: preflightView,
        buildReceipt,
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const action = body.action as string;
    const postProjectId = String(body.projectId ?? 'site00');
    bootstrapCaptureApi(postProjectId);

    switch (action) {
      case 'discover_routes': {
        const result = reconcileProjectPageRegistry(postProjectId, {
          screenSetMode: body.screenSetMode ?? 'PRIMARY',
        });
        return res.status(200).json(result);
      }
      case 'sync_event': {
        const result = handlePageSyncEvent(
          {
            type: body.eventType,
            projectId: postProjectId,
            pageId: body.pageId ?? null,
            route: body.route ?? null,
            deploymentId: body.deploymentId ?? null,
            changedFiles: body.changedFiles ?? [],
          },
          { awaitDeploy: body.awaitDeploy !== false, screenSetMode: body.screenSetMode },
        );
        return res.status(200).json(result);
      }
      case 'refresh_page': {
        if (body.executeCapture && body.pageId && body.screenId) {
          const snapshot = await captureImplementationSnapshot({
            projectId: postProjectId,
            screenId: body.screenId,
            pageId: body.pageId,
            viewportClass: body.viewportClass ?? 'mobile',
            baseUrl: body.baseUrl,
            repoRoot: REPO_ROOT,
          });
          return res.status(200).json({ snapshot, enqueued: 0, affectedPageIds: [body.pageId] });
        }
        const result = handlePageSyncEvent(
          {
            type: 'MANUAL_REFRESH',
            projectId: postProjectId,
            pageId: body.pageId,
            route: body.route ?? null,
          },
          { awaitDeploy: true, skipRouteReconciliation: true },
        );
        return res.status(200).json(result);
      }
      case 'refresh_project': {
        if (body.contractVersion && body.contractVersion !== CAPTURE_RUN_CONTRACT_VERSION) {
          return res.status(409).json({
            error: 'CAPTURE_RUN_CONTRACT_MISMATCH',
            expected: CAPTURE_RUN_CONTRACT_VERSION,
            received: body.contractVersion,
            captureRun: normalizeProjectCaptureRunResponse(null, { buildReceipt: buildCaptureVersionReceipt() }),
          });
        }

        const run = await refreshProjectCaptureState(postProjectId, {
          viewportMode: body.viewportMode ?? 'MOBILE_ONLY',
          forceNewRun: body.forceNewRun === true,
          baseUrl: body.baseUrl,
          repoRoot: REPO_ROOT,
          executeWorker: body.executeWorker !== false,
          awaitFirstCapture: body.awaitFirstCapture === true,
        });

        return res.status(200).json({
          contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
          captureRun: run,
          preflight: run.preflight ?? buildCaptureRunPreflight(postProjectId),
          captureSummary: buildProjectPageMirrorSummary(postProjectId),
          buildReceipt,
        });
      }
      case 'capture_run_progress': {
        const progress = getProjectCaptureRefreshProgress(postProjectId, REPO_ROOT);
        return res.status(200).json({
          contractVersion: CAPTURE_RUN_CONTRACT_VERSION,
          captureRun: progress,
          buildReceipt,
        });
      }
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = message.includes('OFFLINE') ? 'CAPTURE_WORKER_OFFLINE' : message;
    return res.status(500).json({
      error: code,
      errorCode: code,
      retryable: code !== 'CAPTURE_WORKER_OFFLINE',
      captureRun: normalizeProjectCaptureRunResponse(null, { buildReceipt: buildCaptureVersionReceipt() }),
    });
  }
}
