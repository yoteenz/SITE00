/**
 * Optional client fetch for SERVER_VERIFIED entitlements (fail closed → null).
 */

import { resolveEntitlements, type ResolvedEntitlements } from '../../../../../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT } from './contract';
import type { PlanPreviewState } from '../../runtime/monetization/presentationEntitlements';

export type ServerEntitlementsResponse = {
  capabilities: string[];
  effectivePlanId: string;
  subscriptionState: string;
  source: string;
  authoritative: boolean;
  status: string;
  internalGrants: { active: string[]; enforcementSource: string };
  presentation: PlanPreviewState;
};

export async function fetchServerEntitlements(apiBase: string, accessToken: string): Promise<{
  authorization: ResolvedEntitlements;
  presentation: PlanPreviewState;
} | null> {
  try {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/jurnl/entitlements`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ServerEntitlementsResponse;
    if (body.source !== 'SERVER_VERIFIED' || !body.authoritative) return null;
    const authorization: ResolvedEntitlements = {
      projectId: JURNL_MONETIZATION_CONTRACT.projectId,
      status: body.status === 'FALLBACK' ? 'FALLBACK' : 'RESOLVED',
      source: 'SERVER_VERIFIED',
      authoritative: true,
      subscriptionState: body.subscriptionState as ResolvedEntitlements['subscriptionState'],
      requestedPlanId: null,
      effectivePlanId: body.effectivePlanId,
      capabilities: body.capabilities,
      limits: [],
      addOns: { granted: [], ignored: [] },
      trialActive: false,
      failure: null,
      internalGrants: {
        active: body.internalGrants.active as ResolvedEntitlements['internalGrants'] extends { active: infer A } ? A : never,
        enforcementSource: body.internalGrants.enforcementSource as 'INTERNAL_GRANT' | 'SUBSCRIPTION_ONLY',
      },
    };
    return { authorization, presentation: body.presentation };
  } catch {
    return null;
  }
}

/** Offline fallback — never grants paid capabilities. */
export function offlineEntitlements(): ResolvedEntitlements {
  return resolveEntitlements(JURNL_MONETIZATION_CONTRACT, { source: 'NONE', subscription: null });
}
