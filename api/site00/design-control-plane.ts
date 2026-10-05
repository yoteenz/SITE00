/**
 * P0.BRIDGE.1 — Design control plane API (SITE 00 ↔ FSBW handoff).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  Site00DesignControlPlane,
  initDesignControlPlaneForTest,
} from '../../shared/site00-design-control-plane/designControlPlane.js';
import type { PrepareRepoChangeInput } from '../../shared/site00-design-control-plane/types.js';

if (process.env.VITEST === 'true') {
  initDesignControlPlaneForTest();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const changeRequestId = req.query.changeRequestId ? String(req.query.changeRequestId) : null;
      const view = req.query.view ? String(req.query.view) : null;

      if (view === 'capabilities') {
        const { listProjectRuntimeCapabilities } = await import(
          '../../shared/site00-design-control-plane/capabilityRegistry.js'
        );
        const projectKey = String(req.query.projectKey ?? 'site00');
        return res.status(200).json({
          projectKey,
          capabilities: listProjectRuntimeCapabilities(projectKey),
          arbitraryCodeBlocked: true,
        });
      }

      if (changeRequestId) {
        return res.status(200).json(Site00DesignControlPlane.prepareRepoChangeSummary(changeRequestId));
      }

      return res.status(400).json({ error: 'changeRequestId or view required' });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const admin = await requireAdmin(req);
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
    const action = String(body.action ?? '');

    switch (action) {
      case 'prepare_repo_change': {
        const input = body.input as PrepareRepoChangeInput;
        const record = Site00DesignControlPlane.createChangeRequest(input);
        return res.status(200).json({
          changeRequest: record,
          summary: Site00DesignControlPlane.prepareRepoChangeSummary(record.id!),
        });
      }
      case 'approve_for_source_repo': {
        const changeRequestId = String(body.changeRequestId);
        Site00DesignControlPlane.approveChangeRequest(changeRequestId, admin.email);
        const ready = Site00DesignControlPlane.markReadyForRepo(changeRequestId, {
          currentSourceCommit: body.currentSourceCommit ? String(body.currentSourceCommit) : undefined,
        });
        return res.status(200).json({
          changeRequest: ready,
          summary: Site00DesignControlPlane.prepareRepoChangeSummary(changeRequestId),
        });
      }
      case 'publish_runtime_binding': {
        const changeRequestId = String(body.changeRequestId);
        const published = Site00DesignControlPlane.publishRuntimeBinding(changeRequestId);
        return res.status(200).json({ changeRequest: published });
      }
      case 'record_receipt': {
        const receipt = Site00DesignControlPlane.recordCrossRepoReceipt({
          changeRequestId: String(body.changeRequestId),
          eventType: String(body.eventType ?? 'FSBW_RECEIPT'),
          actor: body.actor ? String(body.actor) : 'fsbw-materializer',
          repoCommit: body.repoCommit ? String(body.repoCommit) : undefined,
          prUrlOrId: body.prUrlOrId ? String(body.prUrlOrId) : undefined,
          status: String(body.status),
          message: body.message ? String(body.message) : undefined,
        });
        return res.status(200).json({
          changeRequest: receipt,
          summary: Site00DesignControlPlane.prepareRepoChangeSummary(String(body.changeRequestId)),
        });
      }
      case 'check_source_divergence': {
        const changeRequestId = String(body.changeRequestId);
        const summary = Site00DesignControlPlane.prepareRepoChangeSummary(changeRequestId);
        const { detectSourceDivergence } = await import('../../shared/site00-design-control-plane/designControlPlane.js');
        const { memoryGetChangeRequest } = await import('../../shared/site00-design-control-plane/memoryStore.js');
        const reqRecord = memoryGetChangeRequest(changeRequestId);
        if (!reqRecord) return res.status(404).json({ error: 'Not found' });
        const divergence = detectSourceDivergence(reqRecord, body.currentSourceCommit ? String(body.currentSourceCommit) : undefined);
        return res.status(200).json({ summary, divergence });
      }
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Design control plane error';
    return res.status(500).json({ error: message });
  }
}
