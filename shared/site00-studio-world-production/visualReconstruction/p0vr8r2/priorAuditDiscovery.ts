/**
 * P0.VR.8R2 — Forensic discovery of prior route audit implementations.
 */

import { NDX_WORKSPACE_ROUTE_INVENTORY, summarizeRouteInventory } from '../../founderWorkspace/cohesion/routeInventory.js';
import { compileStudioWorldDesignRouteManifestV2 } from '../p0vr3b/manifestV2Compiler.js';
import { compileSite00DesignRouteManifestV1Historical } from '../p0vr3/designRouteManifest.js';
import { getActiveDesignRouteSyncContract } from '../p0vr3d/designRouteSyncContract.js';
import { NDX_DESIGN_SCREENS } from '../p0vr2/ndxPilotRegistration.js';
import { buildDesignScreenDefinitions } from '../../../site00-astral-world/screen-masters/vr2Adapter.js';
import { getProjectAuthority } from '../../../site00-design-control-plane/projectAuthorityRegistry.js';
import { FSBW_LEGACY_AUDIT_SNAPSHOT, getFsbwLegacyAuditId } from './fsbwLegacyRouteAudit.js';
import {
  KNOWN_REPOSITORIES,
  P0_VR_8R2_LINEAGE,
  PRIOR_AUDIT_SEARCH_LOCATIONS,
} from './constants.js';
import type { PriorAuditDiscoveryRecord, PriorRouteAuditRecoveryReport } from './types.js';

function auditRecord(
  partial: Omit<PriorAuditDiscoveryRecord, 'status'> & { status?: PriorAuditDiscoveryRecord['status'] },
): PriorAuditDiscoveryRecord {
  return { status: 'FOUND', ...partial };
}

export function discoverPriorRouteAudits(): PriorAuditDiscoveryRecord[] {
  const audits: PriorAuditDiscoveryRecord[] = [];

  const v1 = compileSite00DesignRouteManifestV1Historical();
  audits.push(
    auditRecord({
      auditId: 'p0vr3a-v1-historical',
      sourceKind: 'P0_VR_3A_V1_HISTORICAL',
      storageLocation: 'shared/.../p0vr3/designRouteManifest.ts',
      schema: 'STUDIO_WORLD_DESIGN_ROUTE_MANIFEST',
      schemaVersion: v1.version,
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      projectIds: ['site00'],
      routeCount: v1.routes.length,
      lastKnownCompleteAt: v1.compiledAt,
      sourceCommit: null,
      dynamicRoutesExpanded: true,
      childSurfacesIncluded: true,
      screenshotRecordsExist: true,
      projectAttributionExists: true,
    }),
  );

  const v2 = compileStudioWorldDesignRouteManifestV2();
  audits.push(
    auditRecord({
      auditId: 'p0vr3b-v2-manifest',
      sourceKind: 'P0_VR_3B_V2_MANIFEST',
      storageLocation: 'shared/.../p0vr3b/manifestV2Compiler.ts',
      schema: v2.schema,
      schemaVersion: v2.version,
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      projectIds: ['site00'],
      routeCount: v2.designScreens.length,
      lastKnownCompleteAt: v2.compiledAt,
      sourceCommit: null,
      dynamicRoutesExpanded: true,
      childSurfacesIncluded: false,
      screenshotRecordsExist: false,
      projectAttributionExists: true,
    }),
  );

  const contract = getActiveDesignRouteSyncContract();
  audits.push(
    auditRecord({
      auditId: 'p0vr3d-sync-contract',
      sourceKind: 'P0_VR_3D_SYNC_CONTRACT',
      storageLocation: 'shared/.../p0vr3d/site00AuditReconciliation.ts',
      schema: contract.schema,
      schemaVersion: contract.version,
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      projectIds: ['site00'],
      routeCount: contract.enrichedDesignScreens.length,
      lastKnownCompleteAt: contract.reconciliationReport.compiledAt,
      sourceCommit: null,
      dynamicRoutesExpanded: true,
      childSurfacesIncluded: true,
      screenshotRecordsExist: true,
      projectAttributionExists: true,
    }),
  );

  const ndxSummary = summarizeRouteInventory();
  audits.push(
    auditRecord({
      auditId: 'p0ui2-ndx-route-inventory',
      sourceKind: 'NDX_WORKSPACE_ROUTE_INVENTORY',
      storageLocation: 'shared/.../founderWorkspace/cohesion/routeInventory.ts',
      schema: 'NDX_WORKSPACE_ROUTE_INVENTORY',
      schemaVersion: 'P0.UI.2',
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      projectIds: ['ndxbook'],
      routeCount: ndxSummary.total,
      lastKnownCompleteAt: '2026-08-20T00:00:00.000Z',
      sourceCommit: null,
      dynamicRoutesExpanded: false,
      childSurfacesIncluded: true,
      screenshotRecordsExist: true,
      projectAttributionExists: true,
    }),
  );

  audits.push(
    auditRecord({
      auditId: 'p0vr2-ndx-pilot',
      sourceKind: 'NDX_DESIGN_PILOT',
      storageLocation: 'shared/.../p0vr2/ndxPilotRegistration.ts',
      schema: 'DESIGN_SCREEN_REGISTRY',
      schemaVersion: 'P0.VR.2',
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      projectIds: ['ndxbook'],
      routeCount: NDX_DESIGN_SCREENS.length,
      lastKnownCompleteAt: '2026-08-22T00:00:00.000Z',
      sourceCommit: null,
      dynamicRoutesExpanded: false,
      childSurfacesIncluded: false,
      screenshotRecordsExist: true,
      projectAttributionExists: true,
    }),
  );

  const astralScreens = buildDesignScreenDefinitions();
  audits.push(
    auditRecord({
      auditId: 'astral-vr2-adapter',
      sourceKind: 'ASTRAL_SCREEN_MASTERS',
      storageLocation: 'shared/site00-astral-world/screen-masters/vr2Adapter.ts',
      schema: 'ASTRAL_SCREEN_MASTER',
      schemaVersion: 'P0.E.FT5.2',
      repositoryId: KNOWN_REPOSITORIES.site00.repositoryId,
      projectIds: ['astral-world'],
      routeCount: astralScreens.length,
      lastKnownCompleteAt: '2026-08-25T00:00:00.000Z',
      sourceCommit: null,
      dynamicRoutesExpanded: false,
      childSurfacesIncluded: false,
      screenshotRecordsExist: true,
      projectAttributionExists: true,
    }),
  );

  audits.push(
    auditRecord({
      auditId: getFsbwLegacyAuditId(),
      sourceKind: 'FSBW_LEGACY_SNAPSHOT',
      storageLocation: 'shared/.../p0vr8r2/fsbwLegacyRouteAudit.ts (embedded LEGACY_AUDIT_SNAPSHOT)',
      schema: 'FSBW_LEGACY_ROUTE_AUDIT',
      schemaVersion: 'v1',
      repositoryId: KNOWN_REPOSITORIES.fsbw.repositoryId,
      projectIds: ['frontal-slayer', 'all-in-one-enterprises', 'studio-world'],
      routeCount: FSBW_LEGACY_AUDIT_SNAPSHOT.length,
      lastKnownCompleteAt: '2026-08-26T00:00:00.000Z',
      sourceCommit: null,
      dynamicRoutesExpanded: false,
      childSurfacesIncluded: false,
      screenshotRecordsExist: false,
      projectAttributionExists: true,
    }),
  );

  void NDX_WORKSPACE_ROUTE_INVENTORY;
  for (const projectId of ['frontal-slayer', 'all-in-one-enterprises', 'studio-world'] as const) {
    const auth = getProjectAuthority(projectId);
    if (auth?.executionMode === 'CROSS_REPO_FSBW') {
      void auth;
    }
  }

  return audits;
}

export function buildPriorRouteAuditRecoveryReport(): PriorRouteAuditRecoveryReport {
  const audits = discoverPriorRouteAudits();
  const found = audits.filter((a) => a.status === 'FOUND');
  const primary =
    found.find((a) => a.sourceKind === 'P0_VR_3B_V2_MANIFEST') ??
    found.find((a) => a.sourceKind === 'NDX_WORKSPACE_ROUTE_INVENTORY') ??
    found[0] ??
    null;

  const repositoryCoverage: Record<string, number> = {};
  const projectCoverage: Record<string, number> = {};
  for (const a of found) {
    repositoryCoverage[a.repositoryId] = Math.max(repositoryCoverage[a.repositoryId] ?? 0, a.routeCount);
    for (const pid of a.projectIds) {
      projectCoverage[pid] = Math.max(projectCoverage[pid] ?? 0, a.routeCount);
    }
  }

  return {
    reportId: `prior-route-audit-recovery:${Date.now()}`,
    compiledAt: new Date().toISOString(),
    lineage: P0_VR_8R2_LINEAGE,
    priorAuditFound: found.length > 0,
    audits: found,
    locationsSearched: PRIOR_AUDIT_SEARCH_LOCATIONS,
    repositoriesSearched: [KNOWN_REPOSITORIES.site00.repositoryId, KNOWN_REPOSITORIES.fsbw.repositoryId],
    lastCompleteAuditId: primary?.auditId ?? null,
    lastCompleteRouteCount: primary?.routeCount ?? 0,
    repositoryCoverage,
    projectCoverage,
  };
}
