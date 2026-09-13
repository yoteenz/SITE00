/**
 * P0.VR.TWINV2.8 — FAL parallel authority + blueprint twin visual capability proof (NDXBOOK pilot).
 * Does not wire BUILD or replace standard concept generation.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import type { ConceptDirectedTwinSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { runFalParallelTwinProof } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV28/runFalParallelTwinProof.js';
import { appendTwinV2ConceptLedger } from '../_lib/site00TwinV2/twinV2ConceptLedger.js';
import { uploadSite00AssetBuffer } from '../_lib/site00Assts/storage.js';

type Body = {
  session: ConceptDirectedTwinSession;
  conceptId: string;
  conceptVersionId: string;
  runAssetProof?: boolean;
  founderConfirmedSpend?: boolean;
};

function isFalKeyConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

async function persistRemoteImage(sessionId: string, label: string, remoteUrl: string): Promise<string | null> {
  if (!remoteUrl.startsWith('http') || !isFalKeyConfigured()) return null;
  const { downloadUrlToBuffer } = await import('../_lib/site00Assts/storage.js');
  const buf = await downloadUrlToBuffer(remoteUrl);
  const path = `site00/twin-v2/${sessionId}/fal-v28-${label}-${Date.now()}.webp`;
  await uploadSite00AssetBuffer(path, buf, 'image/webp');
  return path;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'twin-v2-fal-parallel-twin-proof',
      buildRef: 'v383',
      falKeyConfigured: isFalKeyConfigured(),
      note: 'Capability sprint — two FAL visual artifacts from MinimalTwinGenerationState',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (!body?.session?.creativeDirection || !body.founderConfirmedSpend) {
    res.status(400).json({ error: 'SPEND_GUARD: founderConfirmedSpend required' });
    return;
  }
  if (!body.conceptId || !body.conceptVersionId) {
    res.status(400).json({ error: 'conceptId and conceptVersionId required' });
    return;
  }

  try {
    const bundle = await runFalParallelTwinProof({
      session: body.session,
      conceptId: body.conceptId,
      conceptVersionId: body.conceptVersionId,
      runAssetProof: body.runAssetProof,
    });

    const sessionId = body.session.sessionId;
    const createdAt = new Date().toISOString();

    for (const artifact of [bundle.authorityArtifact, bundle.blueprintArtifact]) {
      let storageRef: string | null = null;
      if (artifact.storageUrl.startsWith('http')) {
        storageRef = await persistRemoteImage(sessionId, artifact.artifactKind, artifact.storageUrl);
      }
      try {
        await appendTwinV2ConceptLedger({
          entryId: `ledger-v28-${artifact.artifactId}`,
          projectId: body.session.projectId,
          pageId: body.session.pageId,
          sessionId,
          imageUrl: artifact.storageUrl,
          imageStorageRef: storageRef,
          createdAt,
          provider: artifact.provider,
          model: `${artifact.model}:${artifact.artifactKind}`,
        });
      } catch {
        /* non-blocking */
      }
    }

    res.status(200).json({
      ok: true,
      falKeyConfigured: isFalKeyConfigured(),
      bundle,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FAL_PARALLEL_TWIN_PROOF_FAILED';
    const status = message.includes('FAL_KEY_MISSING') ? 503 : 500;
    res.status(status).json({ error: message, falKeyConfigured: isFalKeyConfigured() });
  }
}
