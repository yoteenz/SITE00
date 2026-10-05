/**
 * No provider spend on browse — only explicit CREATE/GENERATE/FIT/RESKIN actions.
 */

export const PROVIDER_FREE_ACTIONS = [
  'OPEN_CATALOGUE',
  'OPEN_WARDROBE',
  'OPEN_CASTING',
  'BROWSE_SETS',
  'VIEW_ENTITLEMENT',
  'SEARCH_LIBRARY',
  'COST_PREVIEW',
] as const;

export type ProviderFreeAction = (typeof PROVIDER_FREE_ACTIONS)[number];

export const PROVIDER_PAID_ACTIONS = ['CREATE', 'GENERATE', 'FIT', 'RESKIN'] as const;
export type ProviderPaidAction = (typeof PROVIDER_PAID_ACTIONS)[number];

export function providerDispatchAllowed(action: ProviderFreeAction | ProviderPaidAction): boolean {
  return (PROVIDER_PAID_ACTIONS as readonly string[]).includes(action);
}
