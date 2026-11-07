/**
 * Public-plan preview — presentation only. Never pass results to authorizeCapability.
 */

import {
  clientGate,
  hasCapability,
  resolvePresentationPlanEntitlements,
  type ResolvedEntitlements,
} from '../../../../../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT } from '../../data/monetization/contract';

export type PlanPreviewState = {
  simulatedPlanId: string | null;
  previewActive: boolean;
};

/** UI entitlements: optional simulated public plan while authorization entitlements stay authoritative. */
export function mergePresentationEntitlements(
  authorization: ResolvedEntitlements | null,
  preview: PlanPreviewState | null | undefined,
): ResolvedEntitlements | null {
  if (!authorization) return null;
  if (!preview?.previewActive || !preview.simulatedPlanId) return authorization;
  return resolvePresentationPlanEntitlements(JURNL_MONETIZATION_CONTRACT, preview.simulatedPlanId);
}

export function usePresentationCapability(
  authorization: ResolvedEntitlements | null,
  preview: PlanPreviewState | null | undefined,
  capability: string,
) {
  const ui = mergePresentationEntitlements(authorization, preview);
  return hasCapability(ui, capability);
}

export function usePresentationGate(
  authorization: ResolvedEntitlements | null,
  preview: PlanPreviewState | null | undefined,
  capability: string,
) {
  const ui = mergePresentationEntitlements(authorization, preview);
  return clientGate(ui, capability);
}
