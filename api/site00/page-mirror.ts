/**
 * SITE 00 page mirror API — route discovery, sync orchestration, capture queue.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildProjectPageMirrorRows,
  buildPageMirrorInspectorState,
  handlePageSyncEvent,
  listPageSyncEvents,
  listCaptureQueue,
  reconcileProjectPageRegistry,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import { captureImplementationSnapshot } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8/screenshotRecorder.js';
import {
  refreshProjectCaptureState,
  getProjectCaptureRefreshProgress,
  buildCaptureOrchestrationInspectorState,
  getActiveProjectCaptureRun,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import { bootstrapAllManagedDesignProjects } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

const REPO_ROOT = process.cwd();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    bootstrapAllManagedDesignProjects();

    if (req.method === 'GET') {
      const projectId = String(req.query.projectId ?? 'site00');
      const view = req.query.view ? String(req.query.view) : null;

      if (view === 'inspector') {
        return res.status(200).json(buildPageMirrorInspectorState(projectId));
      }
      if (view === 'capture-orchestration') {
        return res.status(200).json(buildCaptureOrchestrationInspectorState(projectId));
      }
      if (view === 'capture-run') {
        const active = getActiveProjectCaptureRun(projectId);
        const progress = getProjectCaptureRefreshProgress(projectId);
        return res.status(200).json({ activeRun: active, progress });
      }
      if (view === 'events') {
        return res.status(200).json({ events: listPageSyncEvents(projectId) });
      }
      if (view === 'queue') {
        return res.status(200).json({ queue: listCaptureQueue(projectId) });
      }

      const rows = buildProjectPageMirrorRows(projectId);
      const captureRun = getProjectCaptureRefreshProgress(projectId) ?? getActiveProjectCaptureRun(projectId);
      return res.status(200).json({
        projectId,
        pages: rows,
        inspector: buildPageMirrorInspectorState(projectId),
        captureRun,
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const action = body.action as string;
    const projectId = String(body.projectId ?? 'site00');

    switch (action) {
      case 'discover_routes': {
        const result = reconcileProjectPageRegistry(projectId, {
          screenSetMode: body.screenSetMode ?? 'PRIMARY',
        });
        return res.status(200).json(result);
      }
      case 'sync_event': {
        const result = handlePageSyncEvent(
          {
            type: body.eventType,
            projectId,
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
            projectId,
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
            projectId,
            pageId: body.pageId,
            route: body.route ?? null,
          },
          { awaitDeploy: true, skipRouteReconciliation: true },
        );
        return res.status(200).json(result);
      }
      case 'refresh_project': {
        const run = await refreshProjectCaptureState(projectId, {
          viewportMode: body.viewportMode ?? 'MOBILE_ONLY',
          skipRouteReconciliation: body.skipRouteReconciliation !== false,
          forceNewRun: body.forceNewRun === true,
          baseUrl: body.baseUrl,
          repoRoot: REPO_ROOT,
          executeWorker: body.executeWorker !== false,
        });
        if (body.awaitCompletion === true && run.captureRefreshRunId && !run.duplicateBlocked) {
          const { dispatchCaptureWorker } = await import(
            '../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js'
          );
          await dispatchCaptureWorker({
            projectId,
            runId: run.captureRefreshRunId,
            baseUrl: body.baseUrl,
            repoRoot: REPO_ROOT,
          });
          const progress = getProjectCaptureRefreshProgress(projectId);
          return res.status(200).json(progress ?? run);
        }
        return res.status(200).json(run);
      }
      case 'capture_run_progress': {
        const progress = getProjectCaptureRefreshProgress(projectId);
        return res.status(200).json({ progress });
      }
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
