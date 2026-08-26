/**
 * SITE 00 implementation snapshot API — browser capture, no FAL.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { captureImplementationSnapshot } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';
import {
  captureProjectImplementationSnapshots,
  captureSelectedImplementationSnapshots,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotBatch.js';
import { captureComposerDraftSnapshots } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3j/composerDraftBackfill.js';
import {
  getLatestImplementationSnapshot,
  listImplementationSnapshotsForScreen,
  listImplementationSnapshotBatches,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import { buildImplementationSnapshotCoverage } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCoverage.js';
import type { DesignViewportClass } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const projectId = String(req.query.projectId ?? 'site00');
      const screenId = req.query.screenId ? String(req.query.screenId) : null;
      const viewportClass = req.query.viewportClass ? (String(req.query.viewportClass) as DesignViewportClass) : null;

      if (screenId && viewportClass) {
        const latest = getLatestImplementationSnapshot(projectId, screenId, viewportClass);
        return res.status(200).json({ snapshot: latest });
      }
      if (screenId) {
        return res.status(200).json({ snapshots: listImplementationSnapshotsForScreen(projectId, screenId) });
      }
      return res.status(200).json({
        coverage: buildImplementationSnapshotCoverage(projectId),
        batches: listImplementationSnapshotBatches(projectId),
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const action = body.action as string;

    switch (action) {
      case 'capture_screen': {
        const snapshot = await captureImplementationSnapshot({
          projectId: body.projectId,
          screenId: body.screenId,
          viewportClass: body.viewportClass,
          visualStateId: body.visualStateId ?? null,
          baseUrl: body.baseUrl,
        });
        return res.status(200).json({ snapshot });
      }
      case 'capture_selected': {
        const snapshots = await captureSelectedImplementationSnapshots({
          projectId: body.projectId,
          screenIds: body.screenIds ?? [body.screenId],
          viewports: body.viewports,
          baseUrl: body.baseUrl,
        });
        return res.status(200).json({ snapshots });
      }
      case 'capture_project': {
        const result = await captureProjectImplementationSnapshots({
          projectId: body.projectId,
          viewports: body.viewports,
          screenSetMode: body.screenSetMode,
          concurrency: body.concurrency,
          baseUrl: body.baseUrl,
        });
        return res.status(200).json(result);
      }
      case 'capture_composer_drafts': {
        const result = await captureComposerDraftSnapshots({
          baseUrl: body.baseUrl,
          concurrency: body.concurrency,
        });
        return res.status(200).json(result);
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
