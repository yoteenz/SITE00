import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientCtrlRoomPayload, getProvisioningPayload } from '../_lib/site00Production/service.js';
import {
  activateClientProject,
  getClientProjectsPayload,
  getClientStudioPayload,
  loadProjectForClient,
} from '../_lib/site00Production/clientStudio.js';
import { updateServiceConnectionState } from '../_lib/site00Production/seedDemo.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function safeClientError(e: unknown): { status: number; message: string } {
  const msg = e instanceof Error ? e.message : 'Internal error';
  if (msg === 'PROJECT NOT FOUND') return { status: 404, message: 'Project not found' };
  if (msg === 'FORBIDDEN') return { status: 403, message: 'Access denied' };
  return { status: 500, message: 'We could not load this operation. Try again.' };
}

/** Customer-facing SITE 00 production API — authenticated client routes. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(req.query.action ?? (typeof req.body === 'object' && req.body ? (req.body as { action?: string }).action : '') ?? '');

  try {
    if (req.method === 'GET') {
      switch (action) {
        case 'ctrl-room':
          return res.status(200).json(await getClientCtrlRoomPayload(user.email));
        case 'projects':
          return res.status(200).json(await getClientProjectsPayload(user.email, user.id));
        case 'studio': {
          const projectSlug = String(req.query.projectSlug ?? '');
          if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
          return res.status(200).json(await getClientStudioPayload(projectSlug, user.email, user.id));
        }
        case 'provisioning': {
          const projectSlug = String(req.query.projectSlug ?? '');
          if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
          await loadProjectForClient(projectSlug, user.email, user.id);
          return res.status(200).json(await getProvisioningPayload(projectSlug));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const postAction = String(body.action ?? action);

      if (postAction === 'connect-service') {
        const projectId = String(body.projectId ?? '');
        const providerKey = String(body.providerKey ?? '');
        const projectSlug = String(body.projectSlug ?? '');
        if (!projectId || !providerKey) return res.status(400).json({ error: 'projectId and providerKey required' });
        if (projectSlug) {
          await loadProjectForClient(projectSlug, user.email, user.id);
        } else {
          const { loadProjectByIdForClient } = await import('../_lib/site00Production/clientStudio.js');
          await loadProjectByIdForClient(projectId, user.email, user.id);
        }
        const connectionState = String(body.connectionState ?? 'CONNECTED');
        await updateServiceConnectionState(projectId, providerKey, connectionState, 'CLIENT');
        return res.status(200).json({ ok: true });
      }

      if (postAction === 'activate-project') {
        const slug = String(body.slug ?? '').trim();
        const name = String(body.name ?? '').trim();
        if (!slug || !name) return res.status(400).json({ error: 'slug and name required' });
        const result = await activateClientProject({
          clientEmail: user.email,
          userId: user.id,
          slug,
          name,
          buildClass: body.buildClass ? String(body.buildClass) : undefined,
          buildType: body.buildType ? String(body.buildType) : undefined,
          recipeKey: body.recipeKey ? String(body.recipeKey) : undefined,
          metadata: typeof body.metadata === 'object' && body.metadata ? (body.metadata as Record<string, unknown>) : undefined,
        });
        return res.status(200).json(result);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/site00/client-production]', e);
    const { status, message } = safeClientError(e);
    return res.status(status).json({ error: message });
  }
}
