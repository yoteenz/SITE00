import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  associateAccessCredentialWithUser,
  recordAccessCredentialEnter,
  recordAccessCredentialScan,
  resolveAccessCredentialPublic,
} from '../_lib/site00AccessCredentials/service.js';
import { getAuthUser } from '../_lib/auth.js';

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

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Public SITE 00 access credential API — single-credential resolve only (no enumeration).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'resolve');
      if (action !== 'resolve') {
        return res.status(400).json({ error: 'Unsupported action' });
      }
      const code = String(req.query.code ?? '');
      if (!code) return res.status(400).json({ error: 'code required' });
      const view = await resolveAccessCredentialPublic(code);
      return res.status(200).json({ view });
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const action = String(body?.action ?? req.query.action ?? '');
      const code = String(body?.code ?? req.query.code ?? '');
      const sessionId = String(body?.sessionId ?? '');

      if (!code) return res.status(400).json({ error: 'code required' });
      if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

      switch (action) {
        case 'scan': {
          const result = await recordAccessCredentialScan(code, sessionId);
          return res.status(200).json(result);
        }
        case 'enter': {
          const result = await recordAccessCredentialEnter(code, sessionId);
          return res.status(200).json(result);
        }
        case 'associate': {
          const user = await getAuthUser(req);
          if (!user?.id) return res.status(401).json({ error: 'Authentication required' });
          const result = await associateAccessCredentialWithUser(code, user.id, sessionId);
          if (!result.ok) {
            return res.status(result.reason === 'ALREADY_ASSIGNED' ? 409 : 400).json(result);
          }
          return res.status(200).json(result);
        }
        default:
          return res.status(400).json({ error: 'Unsupported action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/site00-access]', e);
    return res.status(500).json({ error: 'Access credential request failed' });
  }
}
