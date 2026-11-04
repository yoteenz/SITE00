import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { handleJurnlCorsPreflight } from '../_lib/jurnlEntitlements/jurnlApiCors.js';
import { resolveJurnlEntitlementsForPrincipal } from '../_lib/jurnlEntitlements/resolveJurnlEntitlements.js';
import { JURNL_MONETIZATION_CONTRACT } from '../_lib/jurnlEntitlements/jurnlProject.js';

/** GET /api/jurnl/entitlements — SERVER_VERIFIED capability resolution (no financial payload). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleJurnlCorsPreflight(req, res, 'user')) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });

  try {
    const payload = await resolveJurnlEntitlementsForPrincipal(JURNL_MONETIZATION_CONTRACT, user.id, user.id);
    return res.status(200).json({
      projectId: payload.projectId,
      capabilities: payload.authorization.capabilities,
      effectivePlanId: payload.authorization.effectivePlanId,
      subscriptionState: payload.authorization.subscriptionState,
      source: payload.authorization.source,
      authoritative: payload.authorization.authoritative,
      status: payload.authorization.status,
      internalGrants: payload.authorization.internalGrants ?? { active: [], enforcementSource: 'SUBSCRIPTION_ONLY' },
      presentation: payload.presentation,
    });
  } catch (e) {
    const err = e as Error;
    return res.status(500).json({ error: err.message || 'Internal error', code: 'ENTITLEMENT_RESOLUTION_FAILED' });
  }
}
