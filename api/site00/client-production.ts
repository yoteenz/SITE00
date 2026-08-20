import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getClientCtrlRoomPayload, getProvisioningPayload } from '../_lib/site00Production/service.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
        case 'provisioning': {
          const projectSlug = String(req.query.projectSlug ?? '');
          if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
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
        return res.status(501).json({ error: 'connect-service not implemented on client route' });
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/site00/client-production]', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
