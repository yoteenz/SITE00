/**
 * P0.VR.4 / P0.VR.4R1 — Design asset reconstruction API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join } from 'node:path';
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
  buildPersistStoragePath,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/index.js';
import {
  checkFalProviderHealth,
  runLiveProjectsHeaderPlanetAcceptance,
  getLiveBindingSlot,
  getProjectsHeaderPlanetBinding,
  applyLiveBindingSlot,
  loadLiveBindingsFromRepo,
  saveLiveBindingsToRepo,
  uploadCanonicalAsset,
  hashBuffer,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/index.js';
import { buildProjectsGoldenScreenshotSource } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/projectsGoldenTest.js';
import { PROJECTS_GOLDEN_TEST } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/constants.js';
import { isTemporaryProviderUrl } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr4/supabaseStorage.js';
import { downloadUrlToBuffer } from '../_lib/site00Assts/storage.js';

const REPO_ROOT = join(process.cwd());

function envConfig() {
  return {
    falKey: process.env.FAL_KEY,
    ideogramApiKey: process.env.IDEOGRAM_API_KEY,
    pixelcutApiKey: process.env.PIXELCUT_API_KEY,
  };
}

async function loadBindingsWithResolvedUrls(): Promise<void> {
  const { getSite00AssetPublicUrl } = await import('../_lib/site00Assts/storage.js');
  loadLiveBindingsFromRepo(REPO_ROOT, getSite00AssetPublicUrl);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await loadBindingsWithResolvedUrls();
  const action = String(req.query.action ?? req.body?.action ?? 'capabilities');

  try {
    if (req.method === 'GET') {
      if (action === 'capabilities') {
        const caps = discoverAllProviderCapabilities(envConfig());
        const health = checkFalProviderHealth(envConfig());
        return res.status(200).json({ ok: true, capabilities: caps, falHealth: health });
      }
      if (action === 'provider_health') {
        return res.status(200).json({ ok: true, health: checkFalProviderHealth(envConfig()) });
      }
      if (action === 'list') {
        const projectId = String(req.query.projectId ?? '');
        const assets = listReconstructionAssets(projectId ? { projectId } : undefined);
        return res.status(200).json({ ok: true, assets });
      }
      if (action === 'bindings') {
        const slotId = String(req.query.slotId ?? '');
        const slot = slotId ? getLiveBindingSlot(slotId) : getProjectsHeaderPlanetBinding();
        return res.status(200).json({
          ok: true,
          slot: slot
            ? {
                slotId: slot.slotId,
                currentAssetUrl: slot.currentAssetUrl,
                currentVersion: slot.currentVersion,
                previousAssetUrl: slot.previousAssetUrl,
                updatedAt: slot.updatedAt,
              }
            : null,
        });
      }
      if (action === 'inspect') {
        const assetId = String(req.query.assetId ?? '');
        const lineage = buildSystemInspectorLineage(assetId);
        const asset = getReconstructionAsset(assetId);
        const binding = getProjectsHeaderPlanetBinding();
        return res.status(200).json({
          ok: true,
          asset,
          lineage: {
            ...lineage,
            bindingRoute: binding?.route ?? null,
            bindingComponent: binding?.componentPath ?? null,
            bindingSlot: binding?.assetSlot ?? null,
            canonicalUrl: binding?.currentAssetUrl ?? null,
            verificationScreenshot: null,
          },
        });
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
        if (body.live === true) {
          const result = await runLiveProjectsHeaderPlanetAcceptance({
            repoRoot: REPO_ROOT,
            falKey: process.env.FAL_KEY,
            explicitFounderAction: body.explicitFounderAction === true,
            founderLoveIt: false,
            applyToPage: false,
          });
          const asset = result.assetId ? getReconstructionAsset(result.assetId) : null;
          return res.status(200).json({
            ok: !result.blocked,
            blocked: result.blocked,
            blocker: result.blocker,
            result,
            asset,
          });
        }
        const result = dispatchReconstructionGeneration({
          assetId: String(body.assetId),
          explicitFounderAction: body.explicitFounderAction === true,
          env: envConfig(),
        });
        const asset = getReconstructionAsset(String(body.assetId));
        return res.status(200).json({ ok: !result.blocked, result, asset });
      }
      case 'approve': {
        const asset = approveAssetLoveIt(String(body.assetId));
        return res.status(200).json({ ok: Boolean(asset), asset });
      }
      case 'persist_live': {
        const assetId = String(body.assetId);
        const asset = getReconstructionAsset(assetId);
        if (!asset || asset.founderJudgment !== 'LOVE_IT') {
          return res.status(400).json({ ok: false, error: 'FOUNDER_APPROVAL_MISSING' });
        }
        const sourceUrl = asset.cleanedAssetUrl ?? asset.generatedAssetUrl;
        if (!sourceUrl || isTemporaryProviderUrl(sourceUrl)) {
          return res.status(400).json({ ok: false, error: 'No valid source for persistence' });
        }
        const buffer = await downloadUrlToBuffer(sourceUrl);
        const version = Number(body.version ?? 1);
        const storagePath = buildPersistStoragePath(asset, version);
        const upload = await uploadCanonicalAsset({ storagePath, buffer, mimeType: 'image/png' });
        const persisted = persistApprovedAssetToSupabase({
          assetId,
          supabaseUrl: upload.publicUrl,
          storage: {
            bucket: 'live-preview',
            path: storagePath,
            mimeType: 'image/png',
            width: 0,
            height: 0,
            alpha: true,
            checksum: hashBuffer(buffer),
            createdAt: new Date().toISOString(),
          },
        });
        return res.status(200).json({ ok: Boolean(persisted), asset: persisted, supabasePath: storagePath });
      }
      case 'apply_to_page': {
        const assetId = String(body.assetId);
        const asset = getReconstructionAsset(assetId);
        if (!asset || asset.founderJudgment !== 'LOVE_IT') {
          return res.status(400).json({ ok: false, error: 'FOUNDER_APPROVAL_MISSING' });
        }
        let url = body.canonicalUrl as string | undefined;
        if (!url && asset.storage?.path) {
          const { getSite00AssetPublicUrl } = await import('../_lib/site00Assts/storage.js');
          url = getSite00AssetPublicUrl(asset.storage.path);
        }
        if (!url || isTemporaryProviderUrl(url)) {
          return res.status(400).json({ ok: false, error: 'TEMP_PROVIDER_URL_IN_LIVE_UI' });
        }
        const binding = applyLiveBindingSlot({
          assetId,
          canonicalUrl: url,
          storagePath: asset.storage?.path ?? String(body.storagePath ?? ''),
          version: Number(body.version ?? 1),
        });
        saveLiveBindingsToRepo(REPO_ROOT);
        applyAssetToLivePage({
          assetId,
          componentPath: PROJECTS_GOLDEN_TEST.componentPath,
          componentName: PROJECTS_GOLDEN_TEST.componentName,
          assetSlot: PROJECTS_GOLDEN_TEST.assetSlot,
          canonicalUrl: url,
        });
        return res.status(200).json({ ok: true, binding, supabasePath: asset.storage?.path ?? null });
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
      case 'live_acceptance': {
        const result = await runLiveProjectsHeaderPlanetAcceptance({
          repoRoot: REPO_ROOT,
          falKey: process.env.FAL_KEY,
          explicitFounderAction: body.explicitFounderAction === true,
          founderLoveIt: body.founderLoveIt === true,
          applyToPage: body.applyToPage !== false,
        });
        return res.status(200).json({ ok: result.passed, result });
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
