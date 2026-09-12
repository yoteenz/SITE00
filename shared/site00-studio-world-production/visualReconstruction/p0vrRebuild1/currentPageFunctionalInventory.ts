/**
 * P0.VR.REBUILD.1 — Function inventory from live contract (not visuals).
 */

import type { PageFunctionContract } from '../p0vrUpgrade2/types.js';
import type { CurrentPageFunctionalInventory } from './types.js';

export function buildCurrentPageFunctionalInventory(input: {
  sessionId: string;
  contract: PageFunctionContract;
}): CurrentPageFunctionalInventory {
  return {
    inventoryId: `inv_${input.sessionId}`,
    routes: [input.contract.route],
    actions: input.contract.actions,
    dataQueries: input.contract.dataQueries,
    mutations: input.contract.mutations,
    forms: input.contract.forms,
    links: input.contract.links,
    navigation: input.contract.navigation,
    state: input.contract.state,
    permissions: input.contract.permissions,
    featureFlags: input.contract.featureFlags,
  };
}
