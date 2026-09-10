/**
 * P0.VR.8R2 — Documents where prior route audit lineage broke.
 */

import type { RouteAuditLineageBreak } from './types.js';
import { P0_VR_8R2_LINEAGE } from './constants.js';

export const ROUTE_AUDIT_LINEAGE_BREAK: RouteAuditLineageBreak = {
  previousProducer:
    'P0.VR.3B manifestV2Compiler + P0.VR.3D DesignRouteSyncContract + P0.UI.2 NDX_WORKSPACE_ROUTE_INVENTORY + P0.VR.2 ndxPilotRegistration',
  previousStore:
    'designRouteManifest v2 (site00), founderWorkspace/cohesion/routeInventory.ts (ndxbook), designScreenRegistry PROJECT_SCREENS map',
  currentConsumer: 'P0.VR.8 ProjectPageRegistry via routeDiscoveryService.discoverProjectRoutes',
  missingAdapter:
    'P0.VR.8R1 managedProjectDesignBootstrap registered minimal pilot screens only; no LegacyRouteAuditAdapter between historical inventories and ProjectPageRegistry',
  breakDescription:
    'Design workspace redesign (P0.VR.8R1) switched page discovery to listDesignScreensForProject() for non-site00 projects without migrating the full prior route inventories. SITE 00 retained manifest authority; NDXBOOK and other projects lost connection to routeInventory.ts (~42 routes) and FSBW legacy snapshots.',
  releaseOrCommit: null,
  introducedBySprint: 'P0.VR.8R1 Project-Scoped Design Context',
};

export function getRouteAuditLineageBreak(): RouteAuditLineageBreak {
  return { ...ROUTE_AUDIT_LINEAGE_BREAK, missingAdapter: `${ROUTE_AUDIT_LINEAGE_BREAK.missingAdapter} → resolved by ${P0_VR_8R2_LINEAGE}` };
}
