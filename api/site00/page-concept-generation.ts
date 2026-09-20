/**
 * PAGE concept generation — CGPT injection → GPT2 authority → NBP renditions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  planPageConceptGeneration,
  runPageConceptGeneration,
  type PageGenerationCapturePayload,
} from '../_lib/site00PageConcept/runPageConceptGeneration.js';
import type { PageConceptGenerationState } from '../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

type Body = {
  action: 'plan' | 'generate';
  founderConfirmedSpend?: boolean;
  state: PageConceptGenerationState;
  mobileCapture?: PageGenerationCapturePayload;
  desktopCapture?: PageGenerationCapturePayload;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const authed = await getAuthUser(req);
  const email = authed?.email ?? null;
  if (!email) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  if (!isFounderPrivilegedAccount(email)) {
    res.status(403).json({ error: 'FOUNDER_ONLY' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Body;
  if (!body.state || body.state.targetType !== 'PAGE') {
    res.status(400).json({ error: 'PAGE_STATE_REQUIRED' });
    return;
  }

  try {
    if (body.action === 'plan') {
      const plan = planPageConceptGeneration(body.state.projectId, body.state.pageId);
      res.status(200).json({ ok: true, plan });
      return;
    }

    if (body.action === 'generate') {
      if (!body.mobileCapture?.artifactBase64 || !body.desktopCapture?.artifactBase64) {
        res.status(400).json({ error: 'CAPTURE_ARTIFACTS_REQUIRED' });
        return;
      }
      const result = await runPageConceptGeneration({
        state: body.state,
        mobileCapture: body.mobileCapture,
        desktopCapture: body.desktopCapture,
        founderConfirmedSpend: body.founderConfirmedSpend === true,
      });
      res.status(200).json({ ok: true, ...result });
      return;
    }

    res.status(400).json({ error: 'UNKNOWN_ACTION' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GENERATION_FAILED';
    const status =
      message.includes('SPEND_GUARD') ? 400
      : message.startsWith('BLOCKED_') ? 422
      : 500;
    res.status(status).json({ error: message });
  }
}
