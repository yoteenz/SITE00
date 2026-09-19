/**
 * P0.VR.REPLICATION.1 — FunctionGraph from PageFunctionContract.
 */

import type { PageFunctionContract } from '../p0vrUpgrade2/types.js';
import type { FunctionGraph } from './types.js';

export function buildFunctionGraph(input: { sessionId: string; contract: PageFunctionContract }): FunctionGraph {
  return {
    graphId: `fg_${input.sessionId}`,
    routes: [input.contract.route],
    navigationActions: input.contract.navigation,
    dataQueries: input.contract.dataQueries,
    mutations: input.contract.mutations,
    forms: input.contract.forms,
    stateKeys: input.contract.state,
    auth: input.contract.auth,
    permissions: input.contract.permissions,
    featureFlags: input.contract.featureFlags,
    dynamicValues: input.contract.actions,
    businessRules: input.contract.businessRules,
  };
}
