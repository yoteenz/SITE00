/**
 * P0.VR.3D — SITE 00 audit reconciliation (3A semantic → 3B v2 authority).
 */

import { ACTIVE_ROUTE_MANIFEST_SCHEMA, ACTIVE_ROUTE_MANIFEST_VERSION } from '../p0vr3b/constants.js';
import { getActiveRouteManifestV2, findDesignScreenByPath } from '../p0vr3b/manifestV2Compiler.js';
import { normalizePathKey } from '../p0vr3b/site00DesignScreenNormalization.js';
import type { DesignScreenRecord } from '../p0vr3b/types.js';
import { STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION } from '../p0vr3/types.js';
import {
  buildSite00DiscoveredRoutes,
  buildSite00MissingRoutes,
  buildSite00VisualStates,
} from '../p0vr3a/site00RouteForensics.js';
import { detectBackgroundAssetForRoute } from '../p0vr3a/site00ReferenceDiscovery.js';
import { auditSite00References } from '../p0vr3a/site00ReferenceDiscovery.js';
import type {
  EnrichedDesignScreenRecord,
  Site00AuditReconciliationReport,
  Site00DesignabilityClass,
  Site00FamilyCandidate,
  Site00FounderDesignScreenSet,
  Site00RouteExperienceScope,
  Site00SelfAuditRouteMapping,
  ReconciledActiveManifest,
  DesignRouteSyncContract,
} from './types.js';
import { P0_VR_3D_LINEAGE } from './constants.js';
import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';
import type { RouteFamily, Site00RouteClassification } from '../p0vr2/types.js';

function scopeFromClassification(
  classification: Site00RouteClassification | undefined,
  screenId: string,
): Site00RouteExperienceScope {
  if (screenId === 'design-workspace-host') return 'SITE00_HOST_TOOL';
  switch (classification) {
    case 'CUSTOMER_FACING':
      return 'SITE00_WEBSITE';
    case 'CLIENT_WORKFLOW':
      return 'SITE00_CLIENT_WORKFLOW';
    case 'FOUNDER_WORKSPACE':
      return 'SITE00_FOUNDER_WORKSPACE';
    case 'HOST_INTERNAL':
      return 'SITE00_HOST_TOOL';
    case 'SYSTEM_INTERNAL':
      return 'SITE00_SYSTEM_INTERNAL';
    case 'DEV_ONLY':
      return 'SITE00_DEV_ONLY';
    case 'DEPRECATED':
      return 'SITE00_HISTORICAL';
    default:
      return 'SITE00_WEBSITE';
  }
}

function designabilityFromScope(
  scope: Site00RouteExperienceScope,
  showInDefaultSelector: boolean | undefined,
  recordKind?: string,
): Site00DesignabilityClass {
  if (scope === 'SITE00_HOST_TOOL' || scope === 'SITE00_DEV_ONLY') return 'NOT_DESIGNABLE';
  if (scope === 'SITE00_FOUNDER_WORKSPACE') return 'INSPECT_ONLY';
  if (recordKind === 'SITE00_REQUIRED_MISSING_ROUTE' || recordKind === 'SITE00_IMPLIED_REQUIRED_ROUTE') {
    return 'PRIMARY';
  }
  if (scope === 'SITE00_WEBSITE' || scope === 'SITE00_CLIENT_WORKFLOW') {
    return showInDefaultSelector === false ? 'EXTENDED' : 'PRIMARY';
  }
  if (scope === 'SITE00_SYSTEM_INTERNAL') return showInDefaultSelector ? 'EXTENDED' : 'INSPECT_ONLY';
  return 'INSPECT_ONLY';
}

function mapSelfAuditToV2(selfAuditRouteId: string, resolvedRoute: string, routeFamily: RouteFamily): Site00SelfAuditRouteMapping {
  const v2 = getActiveRouteManifestV2();
  const normalized = normalizePathKey(resolvedRoute);
  const screen =
    v2.designScreens.find((s) => s.normalizedPath === normalized) ??
    findDesignScreenByPath(resolvedRoute);

  const implIds =
    screen?.implementationRouteIds ??
    v2.rawImplementationRoutes
      .filter((r) => normalizePathKey(r.pathPattern) === normalized)
      .map((r) => r.implementationRouteId);

  return {
    selfAuditRouteId,
    implementationRouteIds: implIds,
    designScreenId: screen?.designScreenId ?? null,
    experienceScope: scopeFromClassification(screen?.classification, selfAuditRouteId),
    routeFamily: screen?.routeFamily ?? routeFamily,
    site00RouteFamily: routeFamily,
    designabilityClass: 'PRIMARY',
    mappingConfidence: screen ? 'HIGH' : implIds.length ? 'MEDIUM' : 'UNMAPPED',
    unmappedReason: screen ? undefined : 'MISSING_FROM_V2_AUDIT',
  };
}

function enrichDesignScreen(
  screen: DesignScreenRecord,
  selfAuditRouteId: string | null,
  refQuality: string,
  bgStatus: string,
): EnrichedDesignScreenRecord {
  const scope = scopeFromClassification(screen.classification, selfAuditRouteId ?? screen.designScreenId);
  const designabilityClass = designabilityFromScope(scope, screen.designableByDefault);

  return {
    ...screen,
    projectExperienceScope: scope,
    designabilityClass,
    site00RouteFamily: screen.routeFamily,
    site00ExperienceRole: screen.displayName,
    selfAuditRouteId,
    customerFacing: scope === 'SITE00_WEBSITE',
    clientWorkflow: scope === 'SITE00_CLIENT_WORKFLOW',
    founderWorkspace: scope === 'SITE00_FOUNDER_WORKSPACE',
    hostInternal: scope === 'SITE00_HOST_TOOL',
    systemInternal: scope === 'SITE00_SYSTEM_INTERNAL',
    requiredMissing: false,
    impliedRequired: false,
    pageReferenceStatus: refQuality,
    backgroundAssetStatus: bgStatus,
    familyCandidateId: null,
  };
}

function buildFamilyCandidates(): Site00FamilyCandidate[] {
  const manifest = getActiveRouteManifestV2();
  const infoScreens = manifest.designScreens.filter((s) => s.routeFamily === 'INFORMATION').map((s) => s.designScreenId);
  const authScreens = manifest.designScreens.filter((s) => s.routeFamily === 'ACCOUNT').map((s) => s.designScreenId);
  const homepageStates = buildSite00VisualStates()
    .filter((s) => s.parentScreenId === 'homepage')
    .map((s) => s.stateId);

  return [
    {
      candidateId: 'family-candidate-information',
      familySeed: 'INFORMATION',
      screenIds: infoScreens,
      candidateKind: 'INFORMATION',
      status: 'FAMILY_CANDIDATE',
    },
    {
      candidateId: 'family-candidate-auth',
      familySeed: 'AUTH/ACCOUNT',
      screenIds: authScreens,
      candidateKind: 'AUTH',
      status: 'FAMILY_CANDIDATE',
    },
    {
      candidateId: 'family-candidate-homepage-states',
      familySeed: 'ORIGIN',
      screenIds: homepageStates,
      candidateKind: 'HOMEPAGE_STATE',
      status: 'FAMILY_CANDIDATE',
    },
  ];
}

function dedupeMissingRoutes(): ReturnType<typeof buildSite00MissingRoutes> {
  const missing = buildSite00MissingRoutes();
  const byRoute = new Map<string, (typeof missing)[number]>();
  for (const m of missing) {
    const existing = byRoute.get(m.suggestedRoute);
    if (!existing) {
      byRoute.set(m.suggestedRoute, { ...m, sourceEvidence: [...m.sourceEvidence, 'P0.VR.3A'] });
      continue;
    }
    byRoute.set(m.suggestedRoute, {
      ...existing,
      sourceEvidence: [...new Set([...existing.sourceEvidence, ...m.sourceEvidence, 'P0.VR.3', 'P0.VR.3A'])],
    });
  }
  return [...byRoute.values()];
}

export function buildSite00FounderDesignScreenSet(mode: 'PRIMARY' | 'ALL_DESIGNABLE', contract: DesignRouteSyncContract): Site00FounderDesignScreenSet {
  const visualStateIds = contract.visualStates.map((s) => s.stateId);
  const missingIds = contract.canonicalMissingRoutes.map((m) => m.screenId);

  const auditRoutes = buildSite00DiscoveredRoutes().filter(
    (r) => r.classification !== 'HOST_INTERNAL' && r.showInDefaultSelector !== false,
  );

  if (mode === 'ALL_DESIGNABLE') {
    const extendedIds = contract.enrichedDesignScreens
      .filter((s) => s.designabilityClass === 'EXTENDED' || s.designabilityClass === 'PRIMARY')
      .map((s) => s.selfAuditRouteId)
      .filter((id): id is string => !!id);

    return {
      mode,
      screenIds: [...new Set([...auditRoutes.map((r) => r.screenId), ...extendedIds, ...visualStateIds, ...missingIds])],
      derivedFrom: 'DesignScreenRecord+experienceScope+designabilityClass',
    };
  }

  const primaryAuditIds = auditRoutes
    .filter((r) => r.classification === 'CUSTOMER_FACING' || r.classification === 'CLIENT_WORKFLOW')
    .map((r) => r.screenId);

  return {
    mode,
    screenIds: [...new Set([...primaryAuditIds, ...visualStateIds, ...missingIds])],
    derivedFrom: 'DesignScreenRecord+experienceScope+designabilityClass',
  };
}

export function reconcileSite00ManifestV2WithSelfAudit(): ReconciledActiveManifest {
  const v2 = getActiveRouteManifestV2();
  const selfAuditRoutes = buildSite00DiscoveredRoutes();
  const visualStates = buildSite00VisualStates();
  const missingRoutes = dedupeMissingRoutes();
  const refs = auditSite00References();

  const mappings: Site00SelfAuditRouteMapping[] = [];
  const conflicts: Site00AuditReconciliationReport['conflicts'] = [];
  let mapped = 0;
  let unmapped = 0;

  const selfAuditByScreenId = new Map(selfAuditRoutes.map((r) => [r.screenId, r]));

  for (const auditRoute of selfAuditRoutes) {
    const mapping = mapSelfAuditToV2(auditRoute.screenId, auditRoute.resolvedRoute, auditRoute.routeFamily ?? 'OTHER');
    mappings.push(mapping);
    if (mapping.designScreenId) mapped++;
    else unmapped++;
  }

  for (const state of visualStates) {
    mappings.push({
      selfAuditRouteId: state.stateId,
      implementationRouteIds: [],
      designScreenId: selfAuditByScreenId.get(state.parentScreenId)?.screenId ?? null,
      experienceScope: 'SITE00_WEBSITE',
      routeFamily: state.routeFamily,
      site00RouteFamily: state.routeFamily,
      designabilityClass: 'PRIMARY',
      mappingConfidence: 'HIGH',
      unmappedReason: 'VISUAL_STATE',
    });
  }

  for (const missing of missingRoutes) {
    mappings.push({
      selfAuditRouteId: missing.screenId,
      implementationRouteIds: [],
      designScreenId: null,
      experienceScope: 'SITE00_WEBSITE',
      routeFamily: 'INFORMATION',
      site00RouteFamily: 'OTHER',
      designabilityClass: 'PRIMARY',
      mappingConfidence: 'UNMAPPED',
      unmappedReason:
        missing.recordKind === 'SITE00_IMPLIED_REQUIRED_ROUTE' ? 'IMPLIED_REQUIRED_ROUTE' : 'MISSING_REQUIRED_ROUTE',
    });
  }

  const enrichedDesignScreens: EnrichedDesignScreenRecord[] = v2.designScreens.map((screen) => {
    const selfAudit = [...selfAuditByScreenId.entries()].find(([, r]) => {
      const m = mapSelfAuditToV2(r.screenId, r.resolvedRoute, r.routeFamily ?? 'OTHER');
      return m.designScreenId === screen.designScreenId;
    });
    const ref = refs.find((r) => r.route === screen.normalizedPath);
    const bg = detectBackgroundAssetForRoute(screen.normalizedPath);
    return enrichDesignScreen(
      screen,
      selfAudit?.[0] ?? null,
      ref?.quality ?? 'MISSING',
      bg.backgroundStatus ?? 'NOT_APPLICABLE',
    );
  });

  const websiteExperienceRouteCount = selfAuditRoutes.filter(
    (r) => r.classification === 'CUSTOMER_FACING' || r.classification === 'CLIENT_WORKFLOW',
  ).length;

  const primarySet = buildSite00FounderDesignScreenSet('PRIMARY', {
    schema: ACTIVE_ROUTE_MANIFEST_SCHEMA,
    version: ACTIVE_ROUTE_MANIFEST_VERSION,
    projectId: SITE00_DESIGN_PROJECT_ID,
    selfDesignTargetScope: 'SITE00_WEBSITE',
    protectedHostScope: 'SITE00_DESIGN_WORKSPACE_HOST',
    routeCounts: v2.routeCounts,
    enrichedDesignScreens,
    visualStates,
    canonicalMissingRoutes: missingRoutes,
    historicalAuditArtifact: { lineage: 'P0.VR.3A', version: 'v1', status: 'HISTORICAL_AUDIT_ARTIFACT' },
  });

  const routeCounts = {
    ...v2.routeCounts,
    websiteExperienceRouteCount,
    primaryFounderDesignableCount: primarySet.screenIds.length,
    visualStateCount: visualStates.length,
    missingDependencyCount: missingRoutes.length,
    hostInternalCount: selfAuditRoutes.filter((r) => r.classification === 'HOST_INTERNAL').length,
    trueOrphanCount: 0,
  };

  const countExplanations: Record<string, string> = {
    rawImplementationRouteCount:
      'P0.VR.3B full router universe: SITE00_ROUTES + assessment wildcards + ASSTS nested + desktop mirrors.',
    normalizedDesignScreenCount: 'P0.VR.3B reachability-normalized DesignScreenRecords (mobile/desktop collapsed).',
    websiteExperienceRouteCount: 'P0.VR.3A semantic subset: CUSTOMER_FACING + CLIENT_WORKFLOW website experience.',
    primaryFounderDesignableCount: 'Curated PRIMARY set: website/client workflow + states + missing dependencies.',
  };

  const reconciliationReport: Site00AuditReconciliationReport = {
    lineage: P0_VR_3D_LINEAGE,
    compiledAt: new Date().toISOString(),
    p0vr3aV1Status: 'HISTORICAL_AUDIT_ARTIFACT',
    activeManifestSchema: ACTIVE_ROUTE_MANIFEST_SCHEMA,
    activeManifestVersion: ACTIVE_ROUTE_MANIFEST_VERSION,
    selfAuditRecords: selfAuditRoutes.length + visualStates.length + missingRoutes.length,
    mappedToV2: mapped,
    merged: enrichedDesignScreens.filter((s) => s.selfAuditRouteId).length,
    unmapped,
    duplicatesPrevented: selfAuditRoutes.length - mapped,
    mappings,
    conflicts,
    routeCounts,
    familyCandidates: buildFamilyCandidates(),
    countExplanations,
  };

  const contract: DesignRouteSyncContract = {
    schema: ACTIVE_ROUTE_MANIFEST_SCHEMA,
    version: ACTIVE_ROUTE_MANIFEST_VERSION,
    projectId: SITE00_DESIGN_PROJECT_ID,
    selfDesignTargetScope: 'SITE00_WEBSITE',
    protectedHostScope: 'SITE00_DESIGN_WORKSPACE_HOST',
    routeCounts,
    enrichedDesignScreens,
    visualStates,
    canonicalMissingRoutes: missingRoutes,
    historicalAuditArtifact: {
      lineage: 'P0.VR.3A',
      version: STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION,
      status: 'HISTORICAL_AUDIT_ARTIFACT',
    },
  };

  return { ...contract, reconciliationReport };
}

export function isV1ManifestActiveAuthority(): boolean {
  return false;
}

export function getActiveManifestSchema(): string {
  return ACTIVE_ROUTE_MANIFEST_SCHEMA;
}
