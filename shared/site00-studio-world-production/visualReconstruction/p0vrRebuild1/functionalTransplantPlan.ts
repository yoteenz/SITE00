/**
 * P0.VR.REBUILD.1 — Map live function/data into authority slots.
 */

import type { AuthorityCompositionBlueprint, FunctionalBinding, FunctionalTransplantPlan } from './types.js';
import type { CurrentPageFunctionalInventory } from './types.js';

const NDX_BINDINGS: Omit<FunctionalBinding, 'bindingId'>[] = [
  {
    sourceFunctionId: 'pulse.metrics',
    sourceDataPath: 'operatingState.pulse.counts',
    targetRegionId: 'ndx.overview.kpi.audience',
    targetSlotId: 'metric-cells',
    bindingType: 'DATA',
    preservationRequirements: ['LIVE_METRIC_VALUES'],
    status: 'READY',
  },
  {
    sourceFunctionId: 'inProduction.list',
    sourceDataPath: 'operatingState.inProduction',
    targetRegionId: 'ndx.overview.production.card.subscription',
    targetSlotId: 'milestone-rail',
    bindingType: 'DATA',
    preservationRequirements: ['CAMPAIGN_LINKS'],
    status: 'READY',
  },
  {
    sourceFunctionId: 'radar.items',
    sourceDataPath: 'operatingState.radarItems',
    targetRegionId: 'ndx.overview.radar',
    targetSlotId: 'activity-list',
    bindingType: 'DATA',
    preservationRequirements: ['CULTURAL_INTEL_ROUTE'],
    status: 'READY',
  },
  {
    sourceFunctionId: 'bottomNav',
    sourceDataPath: 'founderWorkspace.nav',
    targetRegionId: 'ndx.overview.bottom-nav-shell',
    targetSlotId: 'persistent-nav',
    bindingType: 'NAVIGATION',
    preservationRequirements: ['ROUTE_PRESERVATION'],
    status: 'READY',
  },
  {
    sourceFunctionId: 'auth.session',
    sourceDataPath: 'auth.session',
    targetRegionId: 'ndx.overview.header-shell',
    targetSlotId: 'masthead',
    bindingType: 'AUTH',
    preservationRequirements: ['SIGNED_IN'],
    status: 'READY',
  },
];

export function buildFunctionalTransplantPlan(input: {
  sessionId: string;
  blueprint: AuthorityCompositionBlueprint;
  inventory: CurrentPageFunctionalInventory;
}): FunctionalTransplantPlan {
  const bindings: FunctionalBinding[] = NDX_BINDINGS.map((b, i) => ({
    ...b,
    bindingId: `fb_${input.sessionId}_${i + 1}`,
  })).filter((b) =>
    input.blueprint.regions.some((r) => r.regionId === b.targetRegionId),
  );

  return {
    planId: `ftp_${input.sessionId}`,
    sessionId: input.sessionId,
    bindings,
    status: bindings.length >= 1 ? 'READY' : 'PARTIAL',
  };
}
