/**
 * P0.VR.REPLICATION.3C-R1 — Server-side authority hero crop materialization (CORS-safe).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCaptureCorsHeaders, handleCaptureCorsPreflight } from '../_lib/site00Capture/captureCors.js';
import { downloadUrlToBuffer } from '../_lib/site00Assts/storage.js';
import {
  materializeHeroProofSlotFromBuffer,
  HERO_MATERIALIZATION_PROOF_SLOT_ID,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3cR1/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCaptureCorsPreflight(req, res)) return;
  applyCaptureCorsHeaders(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
  const authorityUrl = String(body.authorityUrl ?? '').trim();
  const sessionId = String(body.sessionId ?? 'session').trim();
  const slotId = String(body.slotId ?? HERO_MATERIALIZATION_PROOF_SLOT_ID);

  if (!authorityUrl) {
    return res.status(400).json({ ok: false, code: 'ASSET_URL_INVALID', error: 'authorityUrl required' });
  }

  try {
    const buffer = await downloadUrlToBuffer(authorityUrl);
    const result = await materializeHeroProofSlotFromBuffer({ authorityBuffer: buffer, sessionId, slotId });
    return res.status(result.ok ? 200 : 422).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes('404') ? 404 : message.includes('403') ? 403 : 502;
    return res.status(status).json({
      ok: false,
      slotId,
      publicUrl: null,
      trace: {
        slotId,
        failureStage: 'NETWORK',
        failureCode: status === 404 ? 'ASSET_URL_404' : status === 403 ? 'ASSET_URL_403' : 'ASSET_RESPONSE_EMPTY',
        notes: message,
      },
    });
  }
}
