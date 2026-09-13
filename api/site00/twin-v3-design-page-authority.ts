/**
 * P0.VR.TWINV3.0 — Design page visual authority generation (no page implementation).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { applyDesignPageAuthorityGeneration } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designPageAuthorityReviewState.js';
import { runDesignPageAuthorityGeneration } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/runDesignPageAuthorityGeneration.js';
import type { DesignPageAuthorityReviewSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30_BUILD } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';

type Body = {
  session: DesignPageAuthorityReviewSession;
  action?: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'REGENERATE_TERRITORY';
  territoryScope?: 'ALL' | 'A' | 'B' | 'C';
  founderConfirmedSpend?: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'twin-v3-design-page-authority',
      buildRef: P0_VR_TWIN_V30_BUILD,
      sprint: 'P0.VR.TWINV3.0R4',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (!body?.session?.projectId || !body.founderConfirmedSpend) {
    res.status(400).json({ error: 'SPEND_GUARD: founderConfirmedSpend required' });
    return;
  }

  try {
    const action = body.action ?? 'GENERATE';
    const result = await runDesignPageAuthorityGeneration({
      session: body.session,
      action,
      territoryScope: body.territoryScope ?? 'ALL',
    });
    const session = applyDesignPageAuthorityGeneration(body.session, result, action);
    res.status(200).json({
      ok: true,
      result,
      session,
      falKeyConfigured: Boolean(process.env.FAL_KEY?.trim()),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DESIGN_PAGE_AUTHORITY_FAILED';
    const status =
      message.includes('FAL_KEY_MISSING') ? 503
      : message.includes('PILOT') || message.includes('PROJECT_CREATIVE_CONTEXT_INCOMPLETE') ? 422
      : message.includes('PROJECT_VISUAL_ASSET_UNGROUNDED') ? 422
      : 500;
    res.status(status).json({ error: message });
  }
}
