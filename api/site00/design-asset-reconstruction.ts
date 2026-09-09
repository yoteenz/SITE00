/**
 * P0.VR.4 — Design asset reconstruction API.
 * Server-side dispatch with FAL when configured; simulated in test/dev without FAL_KEY.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  detectAndRegisterAssets,
  dispatchReconstructionGeneration,
  persistApprovedAssetToSupabase,
  applyAssetToLivePage,
  listReconstructionAssets,
  getReconstructionAsset,
  approveAssetLoveIt,
  buildSystemInspectorLineage,
  discoverAllProviderCapabilities,
  runProjectsRedPlanetGoldenTest,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action ?? req.body?.action ?? 'capabilities');

  try {
    if (req.method === 'GET') {
      if (action === 'capabilities') {
        const caps = discoverAllProviderCapabilities({
          falKey: process.env.FAL_KEY,
          ideogramApiKey: process.env.IDEOGRAM_API_KEY,
          pixelcutApiKey: process.env.PIXELCUT_API_KEY,
        });
        return res.status(200).json({ ok: true, capabilities: caps });
      }
      if (action === 'list') {
        const projectId = String(req.query.projectId ?? '');
        const assets = listReconstructionAssets(projectId ? { projectId } : undefined);
        return res.status(200).json({ ok: true, assets });
      }
      if (action === 'inspect') {
        const assetId = String(req.query.assetId ?? '');
        const lineage = buildSystemInspectorLineage(assetId);
        const asset = getReconstructionAsset(assetId);
        return res.status(200).json({ ok: true, asset, lineage });
      }
      return res.status(400).json({ ok: false, error: 'Unknown GET action' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const body = req.body ?? {};

    switch (action) {
      case 'detect': {
        const assets = detectAndRegisterAssets({
          source: body.source,
          hints: body.hints ?? [],
          screenshotBasePath: body.screenshotBasePath ?? '',
        });
        return res.status(200).json({ ok: true, assets });
      }
      case 'generate': {
        const result = dispatchReconstructionGeneration({
          assetId: String(body.assetId),
          explicitFounderAction: body.explicitFounderAction === true,
          env: {
            falKey: process.env.FAL_KEY,
            ideogramApiKey: process.env.IDEOGRAM_API_KEY,
            pixelcutApiKey: process.env.PIXELCUT_API_KEY,
          },
        });
        const asset = getReconstructionAsset(String(body.assetId));
        return res.status(200).json({ ok: !result.blocked, result, asset });
      }
      case 'approve': {
        const asset = approveAssetLoveIt(String(body.assetId));
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'persist': {
        const asset = persistApprovedAssetToSupabase({
          assetId: String(body.assetId),
          supabaseUrl: String(body.supabaseUrl),
          storage: body.storage,
        });
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'bind': {
        const asset = applyAssetToLivePage({
          assetId: String(body.assetId),
          componentPath: String(body.componentPath),
          componentName: String(body.componentName),
          assetSlot: String(body.assetSlot),
          canonicalUrl: String(body.canonicalUrl),
        });
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'golden_test': {
        const result = runProjectsRedPlanetGoldenTest();
        return res.status(200).json({ ok: result.passed, result });
      }
      default:
        return res.status(400).json({ ok: false, error: `Unknown action: ${action}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
}
