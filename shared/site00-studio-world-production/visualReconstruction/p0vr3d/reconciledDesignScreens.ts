/**
 * P0.VR.3D — Map reconciled contract to DesignScreenDefinition registry entries.
 */

import type { DesignScreenDefinition } from '../p0vr2/types.js';
import {
  buildSite00DiscoveredRoutes,
  missingRoutesAsDesignScreens,
  visualStatesAsDesignScreens,
} from '../p0vr3a/site00RouteForensics.js';
import type { DesignRouteSyncContract } from './types.js';
import { buildSite00FounderDesignScreenSet } from './site00AuditReconciliation.js';

/** Register curated self-audit screens; v2-only screens stay in Inspect forensics. */
export function buildReconciledSite00DesignScreens(contract: DesignRouteSyncContract): DesignScreenDefinition[] {
  const primaryIds = new Set(buildSite00FounderDesignScreenSet('PRIMARY', contract).screenIds);
  const allDesignableIds = new Set(buildSite00FounderDesignScreenSet('ALL_DESIGNABLE', contract).screenIds);

  const routes = buildSite00DiscoveredRoutes().map(({ resolvedRoute: _r, viewportCoverage: _v, ...def }) => ({
    ...def,
    showInDefaultSelector: primaryIds.has(def.screenId),
  }));

  const states = visualStatesAsDesignScreens().map((s) => ({
    ...s,
    showInDefaultSelector: primaryIds.has(s.screenId),
  }));

  const missing = missingRoutesAsDesignScreens().map((s) => ({
    ...s,
    showInDefaultSelector: primaryIds.has(s.screenId),
  }));

  for (const route of routes) {
    if (allDesignableIds.has(route.screenId) && !primaryIds.has(route.screenId)) {
      route.showInDefaultSelector = false;
    }
  }

  return [...routes, ...states, ...missing];
}
