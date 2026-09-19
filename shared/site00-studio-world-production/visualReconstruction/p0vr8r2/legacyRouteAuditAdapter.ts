/**
 * P0.VR.8R2 — LegacyRouteAuditAdapter
 * Converts prior audit schemas → current project-scoped route inventory + design screens.
 */

import { NDX_WORKSPACE_ROUTE_INVENTORY } from '../../founderWorkspace/cohesion/routeInventory.js';
import { NDX_DESIGN_SCREENS } from '../p0vr2/ndxPilotRegistration.js';
import { buildDesignScreenDefinitions } from '../../../site00-astral-world/screen-masters/vr2Adapter.js';
import { getActiveDesignRouteSyncContract } from '../p0vr3d/designRouteSyncContract.js';
import { buildReconciledSite00DesignScreens } from '../p0vr3d/client.js';
import { getFsbwLegacyAuditSnapshot } from './fsbwLegacyRouteAudit.js';
import { LEGACY_AUDIT_SNAPSHOT_LABEL, P0_VR_8R2_LINEAGE } from './constants.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import type { RecoveredRouteInventory, RecoveredRouteRecord } from './types.js';
import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';

const NDXBOOK_SLUG = 'ndxbook';

function ndxPathToPattern(path: string): string {
  return path.replace(/\/projects\/ndxbook/g, '/projects/:projectSlug');
}

function ndxEntryToRecovered(entry: (typeof NDX_WORKSPACE_ROUTE_INVENTORY)[number], auditId: string): RecoveredRouteRecord {
  const path = entry.path.replace(':projectSlug', NDXBOOK_SLUG);
  return {
    routeId: `ndxbook:${entry.routeId}`,
    repositoryId: 'yoteenz/SITE00',
    projectId: 'ndxbook',
    path,
    routePattern: ndxPathToPattern(entry.path),
    pageName: entry.routeId.replace(/-/g, ' ').toUpperCase(),
    module: entry.routeId,
    sourceFile: `src/site00/pages/${entry.component}.tsx`,
    parentRoute: entry.isNested ? '/projects/ndxbook' : null,
    childRoutes: [],
    dynamicParams: entry.path.includes(':') ? ['projectSlug'] : [],
    visibility: entry.migrationStatus === 'LEGACY' ? 'HISTORICAL' : 'ACTIVE',
    routeType: entry.migrationStatus,
    lastAuditedAt: '2026-08-20T00:00:00.000Z',
    historicalCaptureIds: [],
    historicalReferenceIds: [],
    historicalCompletionState: entry.migrationStatus,
    screenId: entry.routeId,
    sourceAuditId: auditId,
    routeCurrentness: 'ROUTE_CURRENT',
    captureCurrentness: 'CAPTURE_STALE',
    completionCurrentness: 'COMPLETION_STALE',
    referenceCurrentness: 'REFERENCE_STALE',
  };
}

function ndxEntryToDesignScreen(entry: (typeof NDX_WORKSPACE_ROUTE_INVENTORY)[number]): DesignScreenDefinition {
  const pilot = NDX_DESIGN_SCREENS.find((s) => s.screenId === entry.routeId);
  if (pilot) return { ...pilot };

  return {
    screenId: entry.routeId,
    displayName: entry.routeId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    routePattern: ndxPathToPattern(entry.path),
    scopeTargetId: `${entry.routeId}Screen`,
    sharedComponentPaths: [`src/site00/pages/${entry.component}.tsx`],
    showInDefaultSelector: entry.migrationStatus === 'CANONICAL' || entry.migrationStatus === 'PARTIAL',
    routeFamily: 'OTHER',
    classification: 'FOUNDER_WORKSPACE',
    recordKind: 'ROUTE',
    priority: entry.isTopLevel ? 'PRIMARY' : 'SECONDARY',
    sourceEvidence: ['shared/.../cohesion/routeInventory.ts', LEGACY_AUDIT_SNAPSHOT_LABEL],
  };
}

function fsbwRecordToDesignScreen(record: RecoveredRouteRecord): DesignScreenDefinition {
  const absolute = !record.routePattern.includes(':projectSlug');
  return {
    screenId: record.screenId,
    displayName: record.pageName,
    routePattern: record.routePattern,
    scopeTargetId: `${record.screenId}Screen`,
    absoluteRoute: absolute,
    showInDefaultSelector: true,
    routeFamily: 'OTHER',
    classification: record.projectId === 'studio-world' ? 'CUSTOMER_FACING' : 'FOUNDER_WORKSPACE',
    recordKind: 'ROUTE',
    priority: record.screenId === 'overview' ? 'CRITICAL' : 'PRIMARY',
    sourceEvidence: [record.sourceFile ?? 'fsbwLegacyRouteAudit.ts', LEGACY_AUDIT_SNAPSHOT_LABEL],
  };
}

function site00ScreenToRecovered(screen: DesignScreenDefinition, auditId: string): RecoveredRouteRecord {
  const path = screen.absoluteRoute
    ? screen.routePattern
    : screen.routePattern.replace(':projectSlug', 'site00');
  return {
    routeId: `site00:${screen.screenId}`,
    repositoryId: 'yoteenz/SITE00',
    projectId: 'site00',
    path,
    routePattern: screen.routePattern,
    pageName: screen.displayName,
    module: screen.screenId,
    sourceFile: screen.sharedComponentPaths?.[0] ?? null,
    parentRoute: screen.parentScreenId ?? null,
    childRoutes: [],
    dynamicParams: screen.routePattern.includes(':') ? ['slug'] : [],
    visibility: 'ACTIVE',
    routeType: screen.recordKind ?? 'ROUTE',
    lastAuditedAt: new Date().toISOString(),
    historicalCaptureIds: [],
    historicalReferenceIds: [],
    historicalCompletionState: null,
    screenId: screen.screenId,
    sourceAuditId: auditId,
    routeCurrentness: 'ROUTE_CURRENT',
    captureCurrentness: 'CAPTURE_STALE',
    completionCurrentness: 'COMPLETION_STALE',
    referenceCurrentness: 'REFERENCE_STALE',
  };
}

export function adaptLegacyAuditToRecoveredInventory(projectId: string): RecoveredRouteInventory {
  const recoveredAt = new Date().toISOString();
  let routes: RecoveredRouteRecord[] = [];
  let priorAuditId = 'unknown';
  let repositoryId = 'yoteenz/SITE00';

  switch (projectId) {
    case SITE00_DESIGN_PROJECT_ID: {
      const contract = getActiveDesignRouteSyncContract();
      priorAuditId = 'p0vr3d-sync-contract';
      const screens = buildReconciledSite00DesignScreens(contract);
      routes = screens.map((s) => site00ScreenToRecovered(s, priorAuditId));
      break;
    }
    case 'ndxbook': {
      priorAuditId = 'p0ui2-ndx-route-inventory';
      routes = NDX_WORKSPACE_ROUTE_INVENTORY.map((e) => ndxEntryToRecovered(e, priorAuditId));
      break;
    }
    case 'astral-world': {
      priorAuditId = 'astral-vr2-adapter';
      routes = buildDesignScreenDefinitions().map((s) => ({
        ...site00ScreenToRecovered(s, priorAuditId),
        projectId: 'astral-world',
        routeId: `astral-world:${s.screenId}`,
        repositoryId: 'yoteenz/SITE00',
        path: s.routePattern,
      }));
      break;
    }
    case 'frontal-slayer':
    case 'all-in-one-enterprises':
    case 'studio-world': {
      priorAuditId = 'fsbw-legacy-route-audit:v1';
      repositoryId = 'yoteenz/fsbw';
      routes = getFsbwLegacyAuditSnapshot(projectId);
      break;
    }
    default:
      routes = [];
  }

  return {
    inventoryId: `${projectId}:recovered-inventory:${recoveredAt}`,
    projectId,
    repositoryId,
    recoveredAt,
    priorAuditId,
    routes,
    routeCount: routes.length,
    preservedAsLegacySnapshot: true,
  };
}

export function adaptLegacyAuditToDesignScreens(projectId: string): DesignScreenDefinition[] {
  switch (projectId) {
    case SITE00_DESIGN_PROJECT_ID: {
      const contract = getActiveDesignRouteSyncContract();
      return buildReconciledSite00DesignScreens(contract);
    }
    case 'ndxbook':
      return NDX_WORKSPACE_ROUTE_INVENTORY.map(ndxEntryToDesignScreen);
    case 'astral-world':
      return buildDesignScreenDefinitions();
    case 'frontal-slayer':
    case 'all-in-one-enterprises':
    case 'studio-world':
      return getFsbwLegacyAuditSnapshot(projectId).map(fsbwRecordToDesignScreen);
    default:
      return [];
  }
}

export function mergeDesignScreensWithoutDuplicates(
  existing: DesignScreenDefinition[],
  recovered: DesignScreenDefinition[],
): DesignScreenDefinition[] {
  const byId = new Map<string, DesignScreenDefinition>();
  for (const s of existing) byId.set(s.screenId, s);
  for (const s of recovered) {
    if (!byId.has(s.screenId)) {
      byId.set(s.screenId, s);
    } else {
      const prev = byId.get(s.screenId)!;
      byId.set(s.screenId, {
        ...prev,
        ...s,
        sharedComponentPaths: s.sharedComponentPaths ?? prev.sharedComponentPaths,
        sourceEvidence: [...new Set([...(prev.sourceEvidence ?? []), ...(s.sourceEvidence ?? []), P0_VR_8R2_LINEAGE])],
      });
    }
  }
  return [...byId.values()];
}
