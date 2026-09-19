/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CAPTURE1 — Playwright capture of live DESIGN workspace (founder-only).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { captureLiveDesignWorkspacePair } from '../_lib/site00WorkspaceSelfCapture/designWorkspaceCaptureService.js';
import {
  DEFAULT_WORKSPACE_SELF_SOURCE,
  type WorkspaceSelfSourceContext,
} from '../../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';

type Body = {
  build?: string;
  sourceContext?: WorkspaceSelfSourceContext;
  baseUrl?: string;
};

function resolveCaptureBaseUrl(req: VercelRequest, body: Body): string {
  if (body.baseUrl) return body.baseUrl.replace(/\/$/, '');
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.startsWith('http')) return origin.replace(/\/$/, '');
  if (process.env.SITE00_CAPTURE_BASE_URL) return process.env.SITE00_CAPTURE_BASE_URL.replace(/\/$/, '');
  return 'http://127.0.0.1:5174';
}

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
  const source = body.sourceContext ?? DEFAULT_WORKSPACE_SELF_SOURCE;
  const build = String(body.build ?? process.env.SITE00_BUILD ?? 'dev');
  const baseUrl = resolveCaptureBaseUrl(req, body);

  const result = await captureLiveDesignWorkspacePair({
    baseUrl,
    source,
    build,
    engineeringBypass: true,
  });

  if ('error' in result) {
    res.status(502).json({ ok: false, error: result.error });
    return;
  }

  res.status(200).json({
    ok: true,
    route: result.route,
    build,
    sourceContext: source,
    mobile: {
      captureId: result.mobile.captureId,
      artifactBase64: result.mobile.buffer.toString('base64'),
    },
    desktop: {
      captureId: result.desktop.captureId,
      artifactBase64: result.desktop.buffer.toString('base64'),
    },
  });
}
