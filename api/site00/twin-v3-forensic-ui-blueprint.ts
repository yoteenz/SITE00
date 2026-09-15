/**
 * P0.VR.TWINV3.0R8M2R5F1 — Server-side Fal forensic UI blueprint generation.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { P0_VR_TWIN_V30_BUILD } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import {
  FORENSIC_BLUEPRINT_GENERATION_FAILED,
  P0_VR_TWIN_V30R8M2R5F1_LINEAGE,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/constants.js';
import type { DesignPageAuthorityReviewSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { generateForensicUiBlueprintForSession } from '../_lib/site00MobileTwinImplementation/forensicUiBlueprintService.js';

type Body = {
  action: 'GENERATE_FORENSIC_UI_BLUEPRINT';
  session: DesignPageAuthorityReviewSession;
  packageId: string;
  founderConfirmedSpend?: boolean;
  endpoint?: string;
  promptVersion?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'twin-v3-forensic-ui-blueprint',
      buildRef: P0_VR_TWIN_V30_BUILD,
      lineage: P0_VR_TWIN_V30R8M2R5F1_LINEAGE,
      falKeyConfigured: Boolean(typeof process !== 'undefined' && process.env.FAL_KEY?.trim()),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (body?.action !== 'GENERATE_FORENSIC_UI_BLUEPRINT' || !body.session?.projectId || !body.packageId) {
    res.status(400).json({ error: 'INVALID_REQUEST' });
    return;
  }
  if (!body.founderConfirmedSpend) {
    res.status(400).json({ error: 'SPEND_GUARD: founderConfirmedSpend required' });
    return;
  }

  try {
    const result = await generateForensicUiBlueprintForSession({
      session: body.session,
      packageId: body.packageId,
      endpoint: body.endpoint,
      promptVersion: body.promptVersion,
    });
    res.status(200).json({
      ok: true,
      authority: result.authority,
      receipt: result.receipt,
      dispatchReceipt: result.dispatchReceipt,
      falRequestDispatched: result.dispatchReceipt.status === 'DISPATCHED',
      falRequestId: result.receipt.requestId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FORENSIC_BLUEPRINT_GENERATION_FAILED';
    const status =
      message.includes('FAL_KEY_MISSING') || message.includes(FORENSIC_BLUEPRINT_GENERATION_FAILED) ? 503
      : message.includes('FORENSIC_BLUEPRINT_NOT_FAITHFUL') ? 422
      : 500;
    res.status(status).json({
      error: message,
      errorClass: message,
      falKeyConfigured: Boolean(typeof process !== 'undefined' && process.env.FAL_KEY?.trim()),
    });
  }
}
