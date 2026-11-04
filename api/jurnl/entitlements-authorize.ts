import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { handleJurnlCorsPreflight } from '../_lib/jurnlEntitlements/jurnlApiCors.js';
import { authorizeJurnlCapability } from '../_lib/jurnlEntitlements/authorizeJurnlCapability.js';
import { JURNL_MONETIZATION_CONTRACT } from '../_lib/jurnlEntitlements/jurnlProject.js';

/** POST /api/jurnl/entitlements-authorize — server capability probe (SERVER_ENFORCED boundary). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleJurnlCorsPreflight(req, res, 'user')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const capability = String(body.capability ?? '').trim();
  if (!capability) return res.status(400).json({ error: 'capability required', code: 'CAPABILITY_REQUIRED' });

  const projectId = String(body.projectId ?? JURNL_MONETIZATION_CONTRACT.projectId);
  if (projectId !== JURNL_MONETIZATION_CONTRACT.projectId) {
    return res.status(403).json({ allowed: false, status: 403, capability, reason: 'PROJECT_MISMATCH' });
  }

  const result = await authorizeJurnlCapability(JURNL_MONETIZATION_CONTRACT, user.id, user.id, capability);
  return res.status(result.status).json(result);
}
