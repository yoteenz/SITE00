/**
 * P0.VR.TWINV3.0R7MF1 — Mobile twin FAL provider (render + blueprint twin).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { P0_VR_TWIN_V30_BUILD, P0_VR_TWIN_V30R7MF3_LINEAGE } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import {
  runMobileTwinFalPipeline,
  type MobileTwinFalAction,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinFalPipeline.js';
import type { DesignPageAuthorityReviewSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';

type Body = {
  session: DesignPageAuthorityReviewSession;
  action: MobileTwinFalAction;
  founderConfirmedSpend?: boolean;
  refineNotes?: string[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'twin-v3-mobile-twin-pipeline',
      buildRef: P0_VR_TWIN_V30_BUILD,
      sprint: P0_VR_TWIN_V30R7MF3_LINEAGE,
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (!body?.session?.projectId || !body.action) {
    res.status(400).json({ error: 'INVALID_REQUEST' });
    return;
  }
  if (!body.founderConfirmedSpend) {
    res.status(400).json({ error: 'SPEND_GUARD: founderConfirmedSpend required' });
    return;
  }

  // FAL reference fetch uses site00.com for founder JPGs (see resolveMobileTwinPublicAssetUrl).
  const publicOrigin = (process.env.SITE00_PUBLIC_ORIGIN ?? 'https://site00.com').replace(/\/$/, '');

  try {
    const session = await runMobileTwinFalPipeline({
      session: body.session,
      action: body.action,
      founderConfirmedSpend: true,
      refineNotes: body.refineNotes,
      publicOrigin,
    });
    res.status(200).json({
      ok: true,
      session,
      falKeyConfigured: Boolean(process.env.FAL_KEY?.trim()),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'MOBILE_RENDER_PROVIDER_FAILED';
    const status =
      message.includes('FAL_KEY_MISSING') ? 503
      : message.includes('SPEND_GUARD') ? 400
      : message.includes('MOBILE_RENDER_NOT_APPROVED') ? 422
      : message.includes('LOCAL_COMPILER_STUB') ? 422
      : 500;
    res.status(status).json({ error: message, falKeyConfigured: Boolean(process.env.FAL_KEY?.trim()) });
  }
}
