import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  createAccessCredential,
  getAccessCredentialById,
  getAccessCredentialEvents,
  listAccessCredentials,
  setAccessCredentialStatus,
} from '../_lib/site00AccessCredentials/service.js';
import type { Site00AccessCredentialStatus } from '../_lib/site00AccessCredentials/types.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * SITE 00 Founder Access Credential admin API
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'list');
      switch (action) {
        case 'list':
          return res.status(200).json({ items: await listAccessCredentials() });
        case 'detail': {
          const id = String(req.query.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          const row = await getAccessCredentialById(id);
          if (!row) return res.status(404).json({ error: 'Not found' });
          const events = await getAccessCredentialEvents(id);
          return res.status(200).json({ credential: row, events });
        }
        default:
          return res.status(400).json({ error: 'Unsupported action' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const action = String(body?.action ?? '');

      switch (action) {
        case 'create':
          return res.status(201).json({
            credential: await createAccessCredential({
              credentialType: body?.credentialType as never,
              recipientName: body?.recipientName ? String(body.recipientName) : undefined,
              recipientEmail: body?.recipientEmail ? String(body.recipientEmail) : undefined,
              recipientCompany: body?.recipientCompany ? String(body.recipientCompany) : undefined,
              notes: body?.notes ? String(body.notes) : undefined,
              createdBy: auth.user.email ?? undefined,
              activate: body?.activate === true,
            }),
          });
        case 'activate': {
          const id = String(body?.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json({
            credential: await setAccessCredentialStatus(id, 'ACTIVE', auth.user.email ?? undefined),
          });
        }
        case 'revoke': {
          const id = String(body?.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json({
            credential: await setAccessCredentialStatus(id, 'REVOKED', auth.user.email ?? undefined),
          });
        }
        case 'deactivate': {
          const id = String(body?.id ?? '');
          if (!id) return res.status(400).json({ error: 'id required' });
          return res.status(200).json({
            credential: await setAccessCredentialStatus(id, 'INACTIVE', auth.user.email ?? undefined),
          });
        }
        default:
          return res.status(400).json({ error: 'Unsupported action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/admin/site00-access-credentials]', e);
    return res.status(500).json({ error: 'Access credential admin request failed' });
  }
}
