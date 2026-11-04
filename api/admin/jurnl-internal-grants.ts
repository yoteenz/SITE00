import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { INTERNAL_GRANT_TYPES, type InternalGrantType } from '../../shared/site00-monetization/internalGrants.js';
import { revokeInternalGrant, upsertInternalGrant } from '../_lib/jurnlEntitlements/internalGrantStore.js';
import { JURNL_MONETIZATION_CONTRACT } from '../_lib/jurnlEntitlements/jurnlProject.js';

/**
 * POST /api/admin/jurnl-internal-grants — admin-only grant lifecycle (no production activation in sprint).
 * Body: { action: 'GRANT' | 'REVOKE', principalId, grantType: 'FOUNDER_FULL', reason }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access denied', code: 'NOT_ADMIN' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const action = String(body.action ?? '').toUpperCase();
  const principalId = String(body.principalId ?? '').trim();
  const grantType = String(body.grantType ?? 'FOUNDER_FULL').trim() as InternalGrantType;
  const reason = String(body.reason ?? '').trim() || 'ADMIN_ACTION';

  if (!principalId) return res.status(400).json({ error: 'principalId required', code: 'PRINCIPAL_REQUIRED' });
  if (!INTERNAL_GRANT_TYPES.includes(grantType)) return res.status(400).json({ error: 'Invalid grantType', code: 'INVALID_GRANT_TYPE' });

  if (action === 'GRANT') {
    const row = upsertInternalGrant({
      grant_type: grantType,
      principal_id: principalId,
      project_id: JURNL_MONETIZATION_CONTRACT.projectId,
      granted_by: admin.id,
      reason,
    });
    return res.status(200).json({ ok: true, grant: row });
  }

  if (action === 'REVOKE') {
    const row = revokeInternalGrant(JURNL_MONETIZATION_CONTRACT.projectId, principalId, grantType, admin.id, reason);
    if (!row) return res.status(404).json({ error: 'No active grant', code: 'GRANT_NOT_FOUND' });
    return res.status(200).json({ ok: true, grant: row });
  }

  return res.status(400).json({ error: 'action must be GRANT or REVOKE', code: 'INVALID_ACTION' });
}
