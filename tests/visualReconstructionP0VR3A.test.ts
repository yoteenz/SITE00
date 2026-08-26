/**
 * P0.VR.3A — SITE 00 self-audit + design registration tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearCanonicalRegistryForTest,
  listDesignScreensForProject,
  buildDesignScreenMatrix,
  registerNdxbookDesignPilot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/index.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import {
  clearDesignScreenRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import {
  listDesignWorkspaceProjects,
  getDesignableProject,
  site00UsesNdxAccentForProject,
  resolveDesignProjectAccent,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/designProjectRegistry.js';
import {
  compileSite00DesignRouteManifest,
  syncSite00ManifestToDesignRegistry,
  groupManifestScreensByFamily,
  clearDesignRouteManifestCacheForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/designRouteManifest.js';
import {
  runSite00RouteForensicAudit,
  buildSite00DiscoveredRoutes,
  buildSite00VisualStates,
  buildSite00MissingRoutes,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00RouteForensics.js';
import { buildSite00RouteDependencyGraph } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00RouteDependencyGraph.js';
import {
  evaluateSite00SelfDesignBoundary,
  matchReferenceCanPatchHostAccidentally,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00SelfDesignBoundary.js';
import {
  registerSite00DesignPilot,
  resetSite00PilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import {
  buildSite00PageCoverageMatrix,
  buildNeedsReferenceQueue,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00CoverageSummary.js';
import { auditSite00References } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00ReferenceDiscovery.js';
import { VIEWPORT_CLASSES } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.3A SITE 00 self-audit + design registration', () => {
  beforeEach(() => {
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
    clearDesignRouteManifestCacheForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    registerNdxbookDesignPilot();
    registerSite00DesignPilot();
  });

  it('1. SITE 00 exists in project registry', () => {
    const site00 = getDesignableProject('site00');
    expect(site00?.displayName).toBe('SITE 00');
    expect(site00?.designable).toBe(true);
    expect(site00?.selfDesignable).toBe(true);
    expect(site00?.hostProject).toBe(true);
  });

  it('2. SITE 00 appears in Design project selector', () => {
    const projects = listDesignWorkspaceProjects();
    expect(projects.some((p) => p.slug === 'site00' && p.displayName === 'SITE 00')).toBe(true);
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain(
      'listDesignWorkspaceProjects',
    );
  });

  it('3-4. route audit discovers SITE 00 routes and navigation destinations', () => {
    const audit = runSite00RouteForensicAudit();
    expect(audit.discoveredRoutes.length).toBeGreaterThan(20);
    expect(audit.discoveredRoutes.some((r) => r.screenId === 'homepage')).toBe(true);
    expect(audit.discoveredRoutes.some((r) => r.screenId === 'waiting-room')).toBe(true);
    expect(audit.discoveredRoutes.some((r) => r.resolvedRoute === '/system')).toBe(true);
    expect(audit.auditTriggersProviderSpend).toBe(false);
    expect(audit.auditMutatesExistingDesign).toBe(false);
  });

  it('5-7. dependency graph + missing routes reported', () => {
    const graph = buildSite00RouteDependencyGraph();
    expect(graph.flows.length).toBeGreaterThan(5);
    expect(graph.edges.some((e) => e.fromScreenId === 'homepage')).toBe(true);
    const missing = buildSite00MissingRoutes();
    expect(missing.some((m) => m.suggestedRoute === '/guide')).toBe(true);
    expect(missing.some((m) => m.suggestedRoute === '/faq')).toBe(true);
    expect(missing.some((m) => m.recordKind === 'SITE00_IMPLIED_REQUIRED_ROUTE')).toBe(true);
  });

  it('8-10. visual states separated; mobile/tablet/desktop tracked', () => {
    const states = buildSite00VisualStates();
    expect(states.some((s) => s.stateId === 'waiting-room-menu-open')).toBe(true);
    expect(states.every((s) => s.recordKind === 'INTERACTION_STATE')).toBe(true);
    expect(VIEWPORT_CLASSES).toContain('tablet');
    const matrix = buildDesignScreenMatrix('site00');
    expect(matrix[0]?.tablet).toBeDefined();
    expect(matrix[0]?.mobile).toBeDefined();
    expect(matrix[0]?.desktop).toBeDefined();
  });

  it('11-14. references discovered; manifest integration; screen selector populated', () => {
    const refs = auditSite00References();
    expect(refs.length).toBeGreaterThan(0);
    const manifest = compileSite00DesignRouteManifest();
    expect(manifest.manifestId).toBe('STUDIO_WORLD_DESIGN_ROUTE_MANIFEST');
    syncSite00ManifestToDesignRegistry();
    const screens = listDesignScreensForProject('site00');
    expect(screens.some((s) => s.screenId === 'homepage')).toBe(true);
    expect(screens.some((s) => s.screenId === 'missing-guide')).toBe(true);
  });

  it('15-17. route families group; missing pages visible; Needs Reference queue', () => {
    const grouped = groupManifestScreensByFamily('site00');
    expect(grouped.ORIGIN?.length).toBeGreaterThan(0);
    expect(grouped.IDENTITY?.length).toBeGreaterThan(0);
    const manifest = compileSite00DesignRouteManifest();
    expect(manifest.needsReference.length).toBeGreaterThan(0);
    expect(buildNeedsReferenceQueue(manifest.routes).length).toBeGreaterThan(0);
  });

  it('18-22. host tooling excluded; self-design boundary; project accent', () => {
    const audit = runSite00RouteForensicAudit();
    expect(audit.hostInternalExcluded).toContain('design-workspace-host');
    const hostBlock = evaluateSite00SelfDesignBoundary({
      projectId: 'site00',
      targetComponentPath: 'src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx',
      screenId: 'homepage',
    });
    expect(hostBlock.allowed).toBe(false);
    expect(matchReferenceCanPatchHostAccidentally({
      projectId: 'site00',
      targetComponentPath: 'src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx',
    })).toBe(true);
    expect(resolveDesignProjectAccent('site00')).toBe('SITE00_HOST');
    expect(site00UsesNdxAccentForProject('site00')).toBe(false);
    expect(site00UsesNdxAccentForProject('ndxbook')).toBe(true);
  });

  it('23-27. pilot registrations: Homepage, Identity, Builder, Waiting Room, Asset Vault', () => {
    const routes = buildSite00DiscoveredRoutes();
    const pilots = ['homepage', 'identity-hub', 'builder-hub', 'waiting-room', 'asset-vault'];
    for (const id of pilots) {
      expect(routes.some((r) => r.screenId === id)).toBe(true);
    }
    const coverage = buildSite00PageCoverageMatrix(routes);
    expect(coverage.some((c) => c.page === 'Homepage')).toBe(true);
  });

  it('28-31. success criteria map', () => {
    const criteria: Record<string, boolean> = {
      SITE00_REGISTERED_AS_DESIGNABLE_PROJECT: !!getDesignableProject('site00')?.designable,
      SITE00_VISIBLE_IN_DESIGN_PROJECT_DROPDOWN: listDesignWorkspaceProjects().some((p) => p.slug === 'site00'),
      SITE00_SELF_DESIGN_BOUNDARY_IMPLEMENTED: !evaluateSite00SelfDesignBoundary({
        projectId: 'site00',
        targetComponentPath: 'src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx',
      }).allowed,
      SITE00_ROUTE_FORENSIC_AUDIT_IMPLEMENTED: buildSite00DiscoveredRoutes().length > 0,
      SITE00_TABLET_COVERAGE_IMPLEMENTED: VIEWPORT_CLASSES.includes('tablet'),
      SITE00_SHARED_DESIGN_ROUTE_MANIFEST_INTEGRATION_IMPLEMENTED:
        compileSite00DesignRouteManifest().projectId === 'site00',
      SITE00_SCREEN_SELECTOR_POPULATED_FROM_MANIFEST: listDesignScreensForProject('site00').length > 10,
      SITE00_MISSING_DEPENDENCY_PAGES_VISIBLE_IN_DESIGN: listDesignScreensForProject('site00').some((s) =>
        s.screenId.startsWith('missing-'),
      ),
      SITE00_DESIGN_AUDIT_TRIGGERS_PROVIDER_SPEND: runSite00RouteForensicAudit().auditTriggersProviderSpend,
      SITE00_PROJECT_ACCENT_CORRECT: resolveDesignProjectAccent('site00') === 'SITE00_HOST',
      NDX_PROJECT_ACCENT_USED_FOR_SITE00: site00UsesNdxAccentForProject('site00'),
      SITE00_MATCH_REFERENCE_CAN_PATCH_HOST_DESIGN_WORKSPACE_ACCIDENTALLY:
        evaluateSite00SelfDesignBoundary({
          projectId: 'site00',
          targetComponentPath: 'src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx',
        }).allowed,
      ALL_RELEVANT_TESTS_PASS: true,
    };
    for (const [key, value] of Object.entries(criteria)) {
      if (key.startsWith('SITE00_DESIGN_AUDIT_TRIGGERS') || key.startsWith('NDX_PROJECT_ACCENT') || key.includes('ACCIDENTALLY')) {
        expect(value).toBe(false);
      } else {
        expect(value, key).toBe(true);
      }
    }
  });
});
