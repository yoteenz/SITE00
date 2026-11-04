import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { handleJurnlCorsPreflight } from '../_lib/jurnlEntitlements/jurnlApiCors.js';
import { listActiveInternalGrants } from '../_lib/jurnlEntitlements/internalGrantStore.js';
import { setPlanPreviewPlanId } from '../_lib/jurnlEntitlements/planPreviewStore.js';
import { JURNL_MONETIZATION_CONTRACT } from '../_lib/jurnlEntitlements/jurnlProject.js';
import { planById } from '../../shared/site00-monetization/contract.js';
import { hasActiveFounderFull } from '../../shared/site00-monetization/internalGrants.js';

const PREVIEW_PLANS = ['JURNL_FREE', 'JURNL_PLUS', 'JURNL_PRO', 'JURNL_BUSINESS'] as const;

/** POST /api/jurnl/entitlements-preview — founder-only UI simulation (does not change authorization). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleJurnlCorsPreflight(req, res, 'user')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });

  const grants = await listActiveInternalGrants(JURNL_MONETIZATION_CONTRACT.projectId, user.id);
  if (!hasActiveFounderFull(grants, JURNL_MONETIZATION_CONTRACT.projectId)) {
    return res.status(403).json({ error: 'Founder grant required for plan preview', code: 'FOUNDER_GRANT_REQUIRED' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const rawPlan = body.simulatedPlanId;
  if (rawPlan === null || rawPlan === undefined || rawPlan === '') {
    setPlanPreviewPlanId(user.id, null);
    return res.status(200).json({ ok: true, simulatedPlanId: null, previewActive: false });
  }
  const planId = String(rawPlan).trim();
  if (!PREVIEW_PLANS.includes(planId as (typeof PREVIEW_PLANS)[number]) || !planById(JURNL_MONETIZATION_CONTRACT, planId)) {
    return res.status(400).json({ error: 'Invalid simulated plan', code: 'INVALID_PREVIEW_PLAN' });
  }
  setPlanPreviewPlanId(user.id, planId);
  return res.status(200).json({ ok: true, simulatedPlanId: planId, previewActive: true });
}
