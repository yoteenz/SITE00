/**
 * P0.VR.TWINV2.9 — Atomic creative generation bundle (sibling outputs, no BUILD).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import type { ConceptDirectedTwinSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { runAtomicConceptGenerationBundle } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV29/runAtomicConceptGenerationBundle.js';
import { appendTwinV2ConceptLedger } from '../_lib/site00TwinV2/twinV2ConceptLedger.js';

type Body = {
  session: ConceptDirectedTwinSession;
  conceptId: string;
  conceptVersionId: string;
  founderConfirmedSpend?: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'twin-v2-atomic-concept-generation',
      buildRef: 'v384',
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

  try {
    const result = await runAtomicConceptGenerationBundle({
      session: body.session,
      conceptId: body.conceptId,
      conceptVersionId: body.conceptVersionId,
    });

    const createdAt = new Date().toISOString();
    for (const artifact of [result.authorityArtifact, result.blueprintTwinArtifact]) {
      try {
        await appendTwinV2ConceptLedger({
          entryId: `ledger-v29-${artifact.artifactId}`,
          projectId: body.session.projectId,
          pageId: body.session.pageId,
          sessionId: body.session.sessionId,
          imageUrl: artifact.storageUrl,
          imageStorageRef: null,
          createdAt,
          provider: artifact.provider,
          model: `${artifact.model}:${artifact.artifactKind}`,
        });
      } catch {
        /* non-blocking */
      }
    }

    res.status(200).json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'ATOMIC_GENERATION_FAILED';
    const status =
      message.includes('ATOMIC_GENERATION_BLOCKED') ||
      message.includes('INCOMPLETE_')
        ? 422
        : message.includes('FAL_KEY_MISSING')
          ? 503
          : 500;
    res.status(status).json({ error: message });
  }
}
