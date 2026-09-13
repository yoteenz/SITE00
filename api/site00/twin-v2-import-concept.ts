/**
 * Import an existing Twin V2 concept image URL into durable SITE 00 storage + ledger (no FAL spend).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { appendTwinV2ConceptLedger } from '../_lib/site00TwinV2/twinV2ConceptLedger.js';
import {
  getSite00AssetPublicUrl,
  uploadSite00AssetBuffer,
} from '../_lib/site00Assts/storage.js';
import { TWIN_V2_VISUAL_PROVIDER, TWIN_V2_VISUAL_PROVIDER_LABEL } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/constants.js';

type Body = {
  projectId: string;
  pageId: string;
  sessionId: string;
  imageUrl: string;
  founderConfirmedNoSpend?: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (!body?.founderConfirmedNoSpend || !body.imageUrl?.trim() || !body.projectId || !body.sessionId) {
    res.status(400).json({ error: 'IMPORT_GUARD: projectId, sessionId, imageUrl, founderConfirmedNoSpend required' });
    return;
  }

  const sourceUrl = body.imageUrl.trim();
  let imageUrl = sourceUrl;
  let imageStorageRef: string | null = null;

  try {
    if (sourceUrl.startsWith('http') && process.env.VITEST !== 'true') {
      const { downloadUrlToBuffer } = await import('../_lib/site00Assts/storage.js');
      const buf = await downloadUrlToBuffer(sourceUrl);
      const path = `site00/twin-v2/${body.sessionId}/import-${Date.now()}.webp`;
      await uploadSite00AssetBuffer(path, buf, 'image/webp');
      imageStorageRef = path;
      imageUrl = getSite00AssetPublicUrl(path);
    }

    const createdAt = new Date().toISOString();
    await appendTwinV2ConceptLedger({
      entryId: `ledger-import-${body.sessionId}-${Date.now()}`,
      projectId: body.projectId,
      pageId: body.pageId,
      sessionId: body.sessionId,
      imageUrl,
      imageStorageRef,
      createdAt,
      provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
      model: TWIN_V2_VISUAL_PROVIDER,
    });

    res.status(200).json({ ok: true, imageUrl, imageStorageRef, createdAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'IMPORT_FAILED';
    res.status(500).json({ error: message });
  }
}
