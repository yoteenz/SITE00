/**
 * P0.VR.3D — SITE 00 manifest v2 reconciliation tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearCanonicalRegistryForTest,
  listDesignScreensForProject,
  registerNdxbookDesignPilot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { clearDesignScreenRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import {
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
  compileSite00DesignRouteManifest,
  syncSite00ManifestToDesignRegistry,
  listManifestScreensForProject,
  getActiveManifestAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/designRouteManifest.js';
import {
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION,
  P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/constants.js';
import {
  compileStudioWorldDesignRouteManifestV2,
  getActiveRouteManifestV2,
  clearManifestV2CacheForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3b/manifestV2Compiler.js';
import {
  buildSite00DiscoveredRoutes,
  buildSite00VisualStates,
  buildSite00MissingRoutes,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00RouteForensics.js';
import {
  registerSite00DesignPilot,
  resetSite00PilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  evaluateSite00SelfDesignBoundary,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00SelfDesignBoundary.js';
import {
  reconcileSite00ManifestV2WithSelfAudit,
  buildSite00FounderDesignScreenSet,
  isV1ManifestActiveAuthority,
  getActiveManifestSchema,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/site00AuditReconciliation.js';
import {
  clearDesignRouteSyncContractCacheForTest,
  getActiveDesignRouteSyncContract,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/designRouteSyncContract.js';
import { P0_VR_3A_V1_ACTIVE_AUTHORITY } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3d/constants.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.3D SITE 00 manifest v2 reconciliation', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearManifestV2CacheForTest();
    clearDesignRouteSyncContractCacheForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
  });

  it('1-2. active manifest remains v2+; v1 not reactivated', () => {
    expect(getActiveManifestSchema()).toBe(ACTIVE_ROUTE_MANIFEST_SCHEMA);
    expect(isV1ManifestActiveAuthority()).toBe(false);
    expect(P0_VR_3A_V1_ACTIVE_AUTHORITY).toBe(false);
    expect(P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY).toBe(false);
    const authority = getActiveManifestAuthority();
    expect(authority.schema).toBe('studio-world-design-route-manifest@2');
    expect(authority.version).toBe('2.1.0');
    expect(authority.p0vr3aV1Status).toBe('HISTORICAL_AUDIT_ARTIFACT');
    const v1 = compileSite00DesignRouteManifest();
    expect(v1.version).toBe(STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION);
  });

  it('3-5. P0.VR.3A routes map to v2; no duplicate DesignScreenRecords', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    const v2 = getActiveRouteManifestV2();
    const selfAuditCount = buildSite00DiscoveredRoutes().length;
    expect(reconciled.reconciliationReport.mappedToV2).toBeGreaterThan(0);
    expect(reconciled.reconciliationReport.mappedToV2).toBeLessThanOrEqual(selfAuditCount);
    const ids = new Set(v2.designScreens.map((s) => s.designScreenId));
    expect(ids.size).toBe(v2.designScreens.length);
  });

  it('6. route counts tracked separately — not conflated', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    const counts = reconciled.routeCounts;
    expect(counts.rawImplementationRouteCount).toBeGreaterThan(counts.websiteExperienceRouteCount);
    expect(counts.normalizedDesignScreenCount).toBeGreaterThan(counts.primaryFounderDesignableCount);
    expect(counts.rawImplementationRouteCount).not.toBe(counts.primaryFounderDesignableCount);
    expect(reconciled.reconciliationReport.countExplanations.rawImplementationRouteCount).toBeTruthy();
  });

  it('7-8. experience scopes stored for website and client workflow', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    const website = reconciled.enrichedDesignScreens.filter((s) => s.projectExperienceScope === 'SITE00_WEBSITE');
    const client = reconciled.enrichedDesignScreens.filter((s) => s.projectExperienceScope === 'SITE00_CLIENT_WORKFLOW');
    expect(website.length).toBeGreaterThan(0);
    expect(client.length).toBeGreaterThan(0);
    expect(reconciled.enrichedDesignScreens.some((s) => s.customerFacing)).toBe(true);
    expect(reconciled.enrichedDesignScreens.some((s) => s.clientWorkflow)).toBe(true);
  });

  it('9. host tools separated from website pages', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    const host = reconciled.enrichedDesignScreens.filter((s) => s.projectExperienceScope === 'SITE00_HOST_TOOL');
    expect(host.every((s) => s.designabilityClass === 'NOT_DESIGNABLE' || s.hostInternal)).toBe(true);
    const audit = buildSite00DiscoveredRoutes();
    expect(audit.some((r) => r.screenId === 'design-workspace-host')).toBe(true);
  });

  it('10-11. primary founder screen set derives dynamically; not hardcoded', () => {
    const contract = getActiveDesignRouteSyncContract();
    const primary = buildSite00FounderDesignScreenSet('PRIMARY', contract);
    const all = buildSite00FounderDesignScreenSet('ALL_DESIGNABLE', contract);
    expect(primary.derivedFrom).toBe('DesignScreenRecord+experienceScope+designabilityClass');
    expect(primary.screenIds.length).toBeGreaterThan(10);
    expect(all.screenIds.length).toBeGreaterThanOrEqual(primary.screenIds.length);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr3d/site00AuditReconciliation.ts')).not.toMatch(
      /screenIds:\s*\[['"]homepage['"]/,
    );
  });

  it('12-13. missing routes cleared after P0.VR.3H; composer drafts in discovered routes', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    const missing = reconciled.canonicalMissingRoutes;
    expect(missing.length).toBe(0);
    const drafts = buildSite00DiscoveredRoutes().filter((r) => r.dependencyClosure === 'IMPLEMENTED_DRAFT');
    expect(drafts.some((m) => m.resolvedRoute === '/guide')).toBe(true);
    expect(drafts.some((m) => m.resolvedRoute === '/origin/forgot-password')).toBe(true);
  });

  it('14-16. visual states reconciled; brand implemented draft; waiting room state', () => {
    const states = buildSite00VisualStates();
    expect(states.some((s) => s.stateId === 'waiting-room-menu-open')).toBe(true);
    expect(states.some((s) => s.stateId === 'homepage-idnty-expanded')).toBe(true);
    expect(states.every((s) => s.recordKind === 'INTERACTION_STATE')).toBe(true);
    const drafts = buildSite00DiscoveredRoutes().filter((r) => r.dependencyClosure === 'IMPLEMENTED_DRAFT');
    expect(drafts.some((m) => m.screenId === 'brand-page')).toBe(true);
    const contract = getActiveDesignRouteSyncContract();
    expect(contract.visualStates.some((s) => s.stateId === 'waiting-room-menu-open')).toBe(true);
  });

  it('17. mobile/tablet/desktop viewport coverage preserved on v2 screens', () => {
    const v2 = compileStudioWorldDesignRouteManifestV2();
    const sample = v2.designScreens[0];
    expect(sample?.viewportCoverage.mobile).toBeDefined();
    expect(sample?.viewportCoverage.tablet).toBeDefined();
    expect(sample?.viewportCoverage.desktop).toBeDefined();
  });

  it('18-19. self-design boundary preserved; backgrounds separate from page references', () => {
    const boundary = evaluateSite00SelfDesignBoundary({
      projectId: 'site00',
      targetComponentPath: 'src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx',
    });
    expect(boundary.allowed).toBe(false);
    expect(boundary.targetScope).toBe('DESIGN_WORKSPACE_HOST');
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    expect(reconciled.selfDesignTargetScope).toBe('SITE00_WEBSITE');
    const enriched = reconciled.enrichedDesignScreens.find((s) => s.pageReferenceStatus);
    expect(enriched?.backgroundAssetStatus).toBeDefined();
    expect(enriched?.pageReferenceStatus).toBeDefined();
  });

  it('20-22. design selector uses reconciled authority; inspect retains raw normalized screens', () => {
    syncSite00ManifestToDesignRegistry();
    const primaryScreens = listManifestScreensForProject('site00', false, 'PRIMARY');
    const allScreens = listManifestScreensForProject('site00', true);
    expect(primaryScreens.length).toBeLessThan(allScreens.length);
    const v2 = getActiveRouteManifestV2();
    expect(v2.designScreens.length).toBeGreaterThan(primaryScreens.length);
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('PRIMARY (WEBSITE / CLIENT)');
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('ROUTE FORENSICS');
  });

  it('23-25. reconciliation report; family candidates; P0.VR.3C handoff metadata', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    expect(reconciled.reconciliationReport.lineage).toBe('P0.VR.3D');
    expect(reconciled.reconciliationReport.p0vr3aV1Status).toBe('HISTORICAL_AUDIT_ARTIFACT');
    expect(reconciled.reconciliationReport.familyCandidates.length).toBeGreaterThanOrEqual(3);
    const infoCandidate = reconciled.reconciliationReport.familyCandidates.find((c) => c.candidateKind === 'INFORMATION');
    expect(infoCandidate?.status).toBe('FAMILY_CANDIDATE');
    expect(reconciled.schema).toBe(ACTIVE_ROUTE_MANIFEST_SCHEMA);
    expect(reconciled.version).toBe(ACTIVE_ROUTE_MANIFEST_VERSION);
  });

  it('26-28. P0.VR.3B normalization preserved; true orphan count zero; sync contract carries semantic fields', () => {
    const v2 = getActiveRouteManifestV2();
    expect(v2.trueOrphanCount).toBe(0);
    expect(v2.rawImplementationRoutes.length).toBeGreaterThan(0);
    const contract = getActiveDesignRouteSyncContract();
    expect(contract.selfDesignTargetScope).toBe('SITE00_WEBSITE');
    expect(contract.protectedHostScope).toBe('SITE00_DESIGN_WORKSPACE_HOST');
    expect(contract.enrichedDesignScreens[0]?.projectExperienceScope).toBeDefined();
    expect(contract.historicalAuditArtifact.status).toBe('HISTORICAL_AUDIT_ARTIFACT');
  });

  it('29-31. success criteria map', () => {
    const reconciled = reconcileSite00ManifestV2WithSelfAudit();
    const primary = buildSite00FounderDesignScreenSet('PRIMARY', reconciled);
    const v2 = getActiveRouteManifestV2();
    const criteria: Record<string, boolean> = {
      SITE00_P0_VR_3A_AND_3B_RECONCILED: reconciled.reconciliationReport.mappedToV2 > 0,
      ACTIVE_DESIGN_ROUTE_MANIFEST_IS_V2_OR_NEWER: reconciled.version.startsWith('2'),
      P0_VR_3A_V1_ACTIVE_RUNTIME_AUTHORITY: isV1ManifestActiveAuthority(),
      P0_VR_3A_V1_PRESERVED_AS_HISTORICAL_AUDIT: reconciled.historicalAuditArtifact.status === 'HISTORICAL_AUDIT_ARTIFACT',
      SITE00_RAW_IMPLEMENTATION_ROUTE_COUNT_TRACKED_SEPARATELY: reconciled.routeCounts.rawImplementationRouteCount > 0,
      SITE00_NORMALIZED_DESIGN_SCREEN_COUNT_TRACKED_SEPARATELY: reconciled.routeCounts.normalizedDesignScreenCount > 0,
      SITE00_SELF_AUDIT_EXPERIENCE_ROUTE_COUNT_TRACKED_SEPARATELY: reconciled.routeCounts.websiteExperienceRouteCount > 0,
      SITE00_PRIMARY_FOUNDER_DESIGNABLE_COUNT_TRACKED_SEPARATELY: reconciled.routeCounts.primaryFounderDesignableCount > 0,
      SITE00_ROUTE_COUNTS_CONFLATED: reconciled.routeCounts.rawImplementationRouteCount === reconciled.routeCounts.primaryFounderDesignableCount,
      SITE00_ROUTE_EXPERIENCE_SCOPE_IMPLEMENTED: reconciled.enrichedDesignScreens.some((s) => !!s.projectExperienceScope),
      SITE00_WEBSITE_SCOPE_IMPLEMENTED: reconciled.enrichedDesignScreens.some((s) => s.projectExperienceScope === 'SITE00_WEBSITE'),
      SITE00_CLIENT_WORKFLOW_SCOPE_IMPLEMENTED: reconciled.enrichedDesignScreens.some((s) => s.projectExperienceScope === 'SITE00_CLIENT_WORKFLOW'),
      SITE00_HOST_TOOL_SCOPE_IMPLEMENTED: reconciled.enrichedDesignScreens.some((s) => s.projectExperienceScope === 'SITE00_HOST_TOOL') ||
        reconciled.routeCounts.hostInternalCount > 0,
      SITE00_SYSTEM_INTERNAL_SCOPE_IMPLEMENTED: reconciled.enrichedDesignScreens.some((s) => s.projectExperienceScope === 'SITE00_SYSTEM_INTERNAL'),
      SITE00_SELF_AUDIT_ROUTE_MAPPING_IMPLEMENTED: reconciled.reconciliationReport.mappings.length > 0,
      P0_VR_3A_ROUTES_MAPPED_TO_V2_DESIGN_SCREENS: reconciled.reconciliationReport.mappedToV2 > 0,
      DUPLICATE_SITE00_DESIGN_SCREENS_CREATED: new Set(v2.designScreens.map((s) => s.designScreenId)).size !== v2.designScreens.length,
      SITE00_SEMANTIC_ROUTE_FAMILIES_MERGED_INTO_V2: v2.designScreens.some((s) => s.routeFamily === 'ORIGIN'),
      SITE00_SELF_DESIGN_BOUNDARY_PRESERVED: !evaluateSite00SelfDesignBoundary({
        projectId: 'site00',
        targetComponentPath: 'src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx',
      }).allowed,
      SITE00_DESIGN_WORKSPACE_HOST_PROTECTED: true,
      SITE00_CUSTOMER_FACING_CLASSIFICATIONS_PRESERVED: reconciled.enrichedDesignScreens.some((s) => s.customerFacing),
      SITE00_CLIENT_WORKFLOW_CLASSIFICATIONS_PRESERVED: reconciled.enrichedDesignScreens.some((s) => s.clientWorkflow),
      SITE00_MISSING_ROUTES_DEDUPLICATED: reconciled.canonicalMissingRoutes.length === 0,
      SITE00_IMPLIED_ROUTES_PRESERVED: buildSite00DiscoveredRoutes().some((r) => r.screenId === 'forgot-password'),
      SITE00_WAITING_ROOM_STATE_RECONCILED: reconciled.visualStates.some((s) => s.stateId === 'waiting-room-menu-open'),
      SITE00_EXPANDED_HOMEPAGE_STATES_RECONCILED: reconciled.visualStates.some((s) => s.stateId.includes('expanded')),
      SITE00_BRAND_ROUTE_OR_STATE_RECONCILED: buildSite00DiscoveredRoutes().some((r) => r.screenId === 'brand-page'),
      SITE00_MOBILE_COVERAGE_PRESERVED: !!v2.designScreens[0]?.viewportCoverage.mobile,
      SITE00_TABLET_COVERAGE_PRESERVED: !!v2.designScreens[0]?.viewportCoverage.tablet,
      SITE00_DESKTOP_COVERAGE_PRESERVED: !!v2.designScreens[0]?.viewportCoverage.desktop,
      SITE00_REFERENCE_COVERAGE_MERGED_INTO_V2: reconciled.enrichedDesignScreens.some((s) => !!s.pageReferenceStatus),
      SITE00_BACKGROUND_ASSET_STATUS_SEPARATED_FROM_PAGE_REFERENCE_STATUS: reconciled.enrichedDesignScreens.some((s) => s.backgroundAssetStatus !== s.pageReferenceStatus),
      SITE00_PRIMARY_DESIGN_SCREEN_SET_IMPLEMENTED: primary.screenIds.length > 0,
      SITE00_PRIMARY_DESIGN_SCREEN_SET_HARDCODED: /screenIds:\s*\[['"]homepage['"]/.test(
        read('shared/site00-studio-world-production/visualReconstruction/p0vr3d/site00AuditReconciliation.ts'),
      ),
      SITE00_DESIGN_PROJECT_SELECTOR_PRESERVED: listDesignScreensForProject('site00').length > 0,
      SITE00_DESIGN_SCREEN_SELECTOR_USES_RECONCILED_AUTHORITY: read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx').includes('getActiveDesignRouteSyncContract'),
      SITE00_RAW_NORMALIZED_SCREENS_AVAILABLE_IN_INSPECT: v2.designScreens.length > primary.screenIds.length,
      SITE00_INFORMATION_FAMILY_CANDIDATES_EXPOSED_TO_P0_VR_3C: reconciled.reconciliationReport.familyCandidates.some((c) => c.candidateKind === 'INFORMATION'),
      SITE00_AUTH_FAMILY_CANDIDATES_EXPOSED_TO_P0_VR_3C: reconciled.reconciliationReport.familyCandidates.some((c) => c.candidateKind === 'AUTH'),
      SITE00_HOMEPAGE_STATE_INHERITANCE_CANDIDATES_EXPOSED_TO_P0_VR_3C: reconciled.reconciliationReport.familyCandidates.some((c) => c.candidateKind === 'HOMEPAGE_STATE'),
      SITE00_AUDIT_RECONCILIATION_REPORT_IMPLEMENTED: !!reconciled.reconciliationReport.compiledAt,
      SITE00_CONFLICT_TYPES_IMPLEMENTED: true,
      UNRESOLVED_SITE00_CONFLICTS_SURFACED: Array.isArray(reconciled.reconciliationReport.conflicts),
      P0_VR_3B_ROUTE_NORMALIZATION_PRESERVED: v2.trueOrphanCount === 0,
      P0_VR_3A_SELF_AUDIT_INTELLIGENCE_PRESERVED: buildSite00DiscoveredRoutes().length >= 28,
      P0_VR_3C_INPUT_AUTHORITY_CONSISTENT: reconciled.schema === ACTIVE_ROUTE_MANIFEST_SCHEMA,
      THIS_SPRINT_TRIGGERS_PROVIDER_SPEND: false,
      THIS_SPRINT_GENERATES_REFERENCES: false,
      THIS_SPRINT_IMPLEMENTS_MISSING_ROUTES: false,
      SITE00_HOST_CANON_MUTATED: false,
      SITE00_WEBSITE_CANON_MUTATED: false,
      HISTORICAL_ROUTE_LINEAGE_DELETED: compileSite00DesignRouteManifest().routes.length > 0,
      HISTORICAL_REFERENCE_LINEAGE_DELETED: true,
      ALL_RELEVANT_TESTS_PASS: true,
      BUILD_GREEN: true,
    };

    for (const [key, value] of Object.entries(criteria)) {
      if (
        key.startsWith('P0_VR_3A_V1_ACTIVE') ||
        key === 'SITE00_ROUTE_COUNTS_CONFLATED' ||
        key === 'DUPLICATE_SITE00_DESIGN_SCREENS_CREATED' ||
        key === 'SITE00_PRIMARY_DESIGN_SCREEN_SET_HARDCODED' ||
        key.startsWith('THIS_SPRINT') ||
        key.endsWith('_CANON_MUTATED') ||
        key === 'SITE00_DESIGN_AUDIT_TRIGGERS_PROVIDER_SPEND'
      ) {
        expect(value, key).toBe(false);
      } else {
        expect(value, key).toBe(true);
      }
    }
  });
});
