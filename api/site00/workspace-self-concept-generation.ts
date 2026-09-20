/**
 * P0.VR.DESIGN-WORKSPACE-SELF-NBP-INTEGRATION-AUDIT1 — WORKSPACE_SELF concept generation (CGPT → NBP).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  planWorkspaceSelfGeneration,
  runWorkspaceSelfGeneration,
} from '../_lib/site00WorkspaceSelfConcept/runWorkspaceSelfGeneration.js';
import type { WorkspaceSelfWorkflowState } from '../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import type { GenerationCapturePayload } from '../_lib/site00WorkspaceSelfConcept/runWorkspaceSelfGeneration.js';

type Body = {
  action: 'plan' | 'generate' | 'retry_failed';
  founderConfirmedSpend?: boolean;
  state: WorkspaceSelfWorkflowState;
  mobileCapture?: GenerationCapturePayload;
  desktopCapture?: GenerationCapturePayload;
  retryArtifactIds?: string[];
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
  if (!body.state || body.state.targetType !== 'WORKSPACE_SELF') {
    res.status(400).json({ error: 'WORKSPACE_SELF_STATE_REQUIRED' });
    return;
  }

  try {
    if (body.action === 'plan') {
      const plan = planWorkspaceSelfGeneration(body.state);
      res.status(200).json({ ok: true, plan });
      return;
    }

    if (body.action === 'generate' || body.action === 'retry_failed') {
      if (!body.mobileCapture?.artifactBase64 || !body.desktopCapture?.artifactBase64) {
        res.status(400).json({ error: 'CAPTURE_ARTIFACTS_REQUIRED' });
        return;
      }
      const result = await runWorkspaceSelfGeneration({
        state: body.state,
        mobileCapture: body.mobileCapture,
        desktopCapture: body.desktopCapture,
        founderConfirmedSpend: body.founderConfirmedSpend === true,
        createdBy: email,
        retryArtifactIds: body.action === 'retry_failed' ? body.retryArtifactIds : undefined,
      });
      res.status(200).json({ ok: true, ...result });
      return;
    }

    res.status(400).json({ error: 'UNKNOWN_ACTION' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GENERATION_FAILED';
    const status =
      message.includes('SPEND_GUARD') ? 400
      : message.includes('BLOCKED_') ? 422
      : message.includes('CREATIVE_BRIEF_FAILED') ? 502
      : message.includes('NBP_AUTH_FAILED') ? 503
      : 500;
    res.status(status).json({ ok: false, error: message });
  }
}
