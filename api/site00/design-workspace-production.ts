/**
 * P0.VR.DESIGN-PRODUCTION1R1 — server-authoritative design workspace production state.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { assertFounderProjectAccess } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  applyDesignWorkspaceProductionCommand,
  getDesignWorkspaceProductionSession,
} from '../_lib/site00DesignWorkspaceProduction/designWorkspaceProductionService.js';
import { DESIGN_WORKSPACE_PRODUCTION_PAGE_ID } from '../_lib/site00DesignWorkspaceProduction/types.js';
import type { DesignWorkspaceProductionCommandName } from '../_lib/site00DesignWorkspaceProduction/types.js';

type Body = {
  projectId?: string;
  pageId?: string;
  command?: DesignWorkspaceProductionCommandName;
  expectedSessionVersion?: number | null;
  payload?: Record<string, unknown>;
};

function mapError(err: unknown): { status: number; code: string } {
  const msg = err instanceof Error ? err.message : 'DESIGN_WORKSPACE_PRODUCTION_FAILED';
  if (msg === 'STALE_STATE') return { status: 409, code: 'STALE_STATE' };
  if (msg.startsWith('FOUNDER_ONLY:')) return { status: 403, code: msg };
  if (msg === 'SERVER_SESSION_EXISTS') return { status: 409, code: msg };
  if (msg.includes('SCHEMA') || msg.includes('DurablePersistence')) return { status: 503, code: 'AUTHORITY_STATE_UNAVAILABLE' };
  return { status: 500, code: msg };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  const projectId = String(
    req.query.projectId ?? (typeof req.body === 'object' && req.body ? (req.body as Body).projectId : '') ?? '',
  ).toLowerCase();
  const pageId = String(
    req.query.pageId ??
      (typeof req.body === 'object' && req.body ? (req.body as Body).pageId : '') ??
      DESIGN_WORKSPACE_PRODUCTION_PAGE_ID,
  );

  if (!projectId) {
    res.status(400).json({ error: 'INVALID_REQUEST', message: 'projectId required' });
    return;
  }

  const authed = await getAuthUser(req);
  const email = authed?.email ?? null;
  if (!email) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  try {
    assertFounderProjectAccess(email, projectId);
  } catch {
    res.status(403).json({ error: 'FORBIDDEN' });
    return;
  }

  const actorIsFounder = isFounderPrivilegedAccount(email);

  if (req.method === 'GET') {
    try {
      const session = await getDesignWorkspaceProductionSession(projectId, pageId);
      res.status(200).json({
        ok: true,
        serverAuthoritative: true,
        session,
        state: session?.state ?? null,
        sessionVersion: session?.sessionVersion ?? null,
      });
    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json({ error: mapped.code });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = (req.body ?? {}) as Body;
  if (!body.command) {
    res.status(400).json({ error: 'INVALID_REQUEST' });
    return;
  }

  try {
    const result = await applyDesignWorkspaceProductionCommand({
      projectId,
      pageId,
      command: body.command,
      expectedSessionVersion: body.expectedSessionVersion ?? null,
      payload: body.payload,
      actorEmail: email,
      actorIsFounder,
    });
    res.status(200).json({
      ok: true,
      serverAuthoritative: true,
      sessionVersion: result.session.sessionVersion,
      session: result.session,
      state: result.state,
    });
  } catch (err) {
    const mapped = mapError(err);
    res.status(mapped.status).json({ error: mapped.code });
  }
}
