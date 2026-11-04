/**
 * Founder-only public plan presentation simulation (server-side session flag).
 * Does not alter grants, subscriptions, or authorization capabilities.
 */

const previewByPrincipal = new Map<string, string | null>();

export function getPlanPreviewPlanId(principalId: string): string | null {
  return previewByPrincipal.get(principalId) ?? null;
}

export function setPlanPreviewPlanId(principalId: string, planId: string | null) {
  if (planId === null) previewByPrincipal.delete(principalId);
  else previewByPrincipal.set(principalId, planId);
}

export function resetPlanPreviewStoreForTests() {
  previewByPrincipal.clear();
}
