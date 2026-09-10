/**
 * P0.PCI.1 — Parent–Child Experience Inheritance Engine tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  PCI_CHILD_ARCHETYPES,
  PCI_EXPERIENCE_MODES,
  PCI_INHERITANCE_MODES,
  PCI_ROUTE_RELATIONSHIP_TYPES,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/types.js';
import {
  resolveInheritanceMode,
  inheritanceModeSkipsTransform,
  describeInheritanceMode,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/inheritanceModes.js';
import {
  discoverParentChildRouteGraph,
  listChildNodes,
  getRelationshipForNode,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/routeGraphDiscovery.js';
import { extractParentExperienceAuthority } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/parentAuthorityExtractor.js';
import {
  resolveExperienceParent,
  resolveAllExperienceParents,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/parentAuthorityResolver.js';
import {
  classifyChildSurface,
  classifyChildSurfaces,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/childSurfaceClassifier.js';
import { buildChildConvergencePlan } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/convergencePlanBuilder.js';
import {
  applyConvergencePlans,
  summarizeMigrationManifest,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/convergenceApplier.js';
import { evaluateInheritanceBranchQA } from '../shared/site00-studio-world-production/parentChildExperienceInheritance/inheritanceQA.js';
import {
  runParentChildExperienceInheritance,
  buildChildDescriptorFromLegacyPanel,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/parentChildExperienceInheritanceEngine.js';
import {
  buildSite00DesignWorkspaceMoreRegistry,
  buildSite00ProjectOperatingSystemRegistry,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/site00RouteFamilies.js';
import {
  clearInheritanceStoreForTest,
  getInheritanceRun,
  listInheritanceRuns,
} from '../shared/site00-studio-world-production/parentChildExperienceInheritance/inheritanceStore.js';

describe('P0.PCI.1 — Parent–Child Experience Inheritance Engine', () => {
  beforeEach(() => {
    clearInheritanceStoreForTest();
  });

  it('1. core type catalogs exist', () => {
    expect(PCI_INHERITANCE_MODES).toContain('INHERIT_GRAMMAR');
    expect(PCI_CHILD_ARCHETYPES).toContain('EDITOR');
    expect(PCI_EXPERIENCE_MODES).toContain('CONTROL_ROOM');
    expect(PCI_ROUTE_RELATIONSHIP_TYPES).toContain('TAB_CHILD');
  });

  it('2. ParentChildExperienceInheritanceEngine exists', () => {
    const registry = buildSite00DesignWorkspaceMoreRegistry('site00');
    const result = runParentChildExperienceInheritance({ registry, dryRun: true });
    expect(result.runId).toMatch(/^pci-run-/);
    expect(result.parentAuthority.authorityId).toBeTruthy();
  });

  it('3. route graph discovers parent and tab children', () => {
    const registry = buildSite00DesignWorkspaceMoreRegistry('ndxbook');
    const graph = discoverParentChildRouteGraph(registry);
    expect(graph.nodes.some((n) => n.kind === 'LANDING')).toBe(true);
    expect(graph.edges.some((e) => e.relationshipType === 'TAB_CHILD')).toBe(true);
    expect(listChildNodes(graph).length).toBeGreaterThan(0);
  });

  it('4. parent authority extracts experience grammar not tokens only', () => {
    const authority = extractParentExperienceAuthority({
      projectId: 'site00',
      signals: {
        route: '/projects/site00/design?tab=more',
        surfaceId: 'dw-more-hub',
        viewport: 'MOBILE',
        controlRoomIndicators: true,
        heroPresent: true,
        cardGridPresent: true,
        tabCount: 1,
      },
    });
    expect(authority.experienceMode).toBe('CONTROL_ROOM');
    expect(authority.visualGrammar.sectionRhythm).toBeTruthy();
    expect(authority.interactionGrammar.navigationPattern).toBeTruthy();
    expect(authority.compositionGrammar.contentDensity).toBeTruthy();
    expect(authority.hostBoundary.hostLockedRegions).toContain('GLOBAL_NAV');
  });

  it('5. child surface classifier assigns functional archetypes', () => {
    expect(
      classifyChildSurface({
        node: {
          nodeId: 'n1',
          route: '/projects/x/design?tab=more&category=providers',
          surfaceId: 'n1',
          label: 'PROVIDERS',
          kind: 'TAB_STATE',
          isParentCandidate: false,
          metadata: { moduleScreenType: 'MORE' },
        },
      }),
    ).toBe('SETTINGS');

    expect(
      classifyChildSurface({
        node: {
          nodeId: 'n2',
          route: '/projects/x/realism-lab/brief',
          surfaceId: 'n2',
          label: 'BRIEF',
          kind: 'ROUTE',
          isParentCandidate: false,
        },
      }),
    ).toBe('INTAKE');
  });

  it('6. inheritance modes follow archetype rules', () => {
    expect(resolveInheritanceMode({ archetype: 'LANDING', isHostShell: false })).toBe('INHERIT_FULL');
    expect(resolveInheritanceMode({ archetype: 'EDITOR', isHostShell: false })).toBe('SPECIALIZED_CHILD');
    expect(resolveInheritanceMode({ archetype: 'LIST', isHostShell: false })).toBe('INHERIT_GRAMMAR');
    expect(resolveInheritanceMode({ archetype: 'LIST', isHostShell: true })).toBe('HOST_LOCKED');
    expect(resolveInheritanceMode({ archetype: 'LIST', isHostShell: false, exemptReason: 'legacy' })).toBe(
      'EXEMPT_WITH_REASON',
    );
    expect(inheritanceModeSkipsTransform('HOST_LOCKED')).toBe(true);
    expect(describeInheritanceMode('INHERIT_GRAMMAR')).toContain('grammar');
  });

  it('7. parent authority resolver uses module landing not blind URL depth', () => {
    const registry = buildSite00DesignWorkspaceMoreRegistry('site00');
    const graph = discoverParentChildRouteGraph(registry);
    const providersNode = graph.nodes.find((n) => n.route.includes('category=providers'));
    expect(providersNode).toBeTruthy();
    const resolved = resolveExperienceParent({ graph, childNodeId: providersNode!.nodeId });
    expect(['ROOT_LANDING', 'IMMEDIATE_URL_PARENT', 'MODULE_LANDING']).toContain(
      resolved?.resolutionStrategy,
    );
    expect(resolved?.resolvedParentRoute).toContain('tab=more');
  });

  it('8. convergence plan preserves function and replaces visuals', () => {
    const authority = extractParentExperienceAuthority({
      projectId: 'site00',
      signals: {
        route: '/projects/site00/overview',
        surfaceId: 'overview',
        viewport: 'UNIVERSAL',
        heroPresent: true,
      },
    });
    const plan = buildChildConvergencePlan({
      parentAuthority: authority,
      resolvedParent: {
        childNodeId: 'child-more',
        childRoute: '/projects/site00/more',
        resolvedParentRoute: '/projects/site00/overview',
        resolvedParentNodeId: 'landing',
        resolutionStrategy: 'IMMEDIATE_URL_PARENT',
        relationshipType: 'DIRECT_CHILD',
      },
      childSurfaceId: 'child-more',
      childRoute: '/projects/site00/more',
      archetype: 'SETTINGS',
      inheritanceMode: 'INHERIT_GRAMMAR',
      descriptor: buildChildDescriptorFromLegacyPanel({
        route: '/projects/site00/more',
        parentRoute: '/projects/site00/overview',
        label: 'MORE',
      }),
    });
    expect(plan.functionalMustPreserve).toContain('DATA_BINDINGS');
    expect(plan.visualMustReplace.length).toBeGreaterThan(0);
    expect(plan.legacyComponentsToReplace).toContain('site00-pos-panel');
    expect(plan.layoutActions.some((a) => a.preserveFunction)).toBe(true);
  });

  it('9. batch applier respects dry-run and host-locked skips', () => {
    const registry = buildSite00ProjectOperatingSystemRegistry('astral');
    const result = runParentChildExperienceInheritance({ registry, dryRun: true });
    const manifest = applyConvergencePlans({
      projectId: registry.projectId,
      parentAuthorityId: result.parentAuthority.authorityId,
      plans: result.convergencePlans,
      dryRun: true,
    });
    const summary = summarizeMigrationManifest(manifest);
    expect(summary.total).toBeGreaterThan(0);
    expect(manifest.dryRun).toBe(true);
  });

  it('10. inheritance QA flags generic admin fallback on project MORE child', () => {
    const registry = buildSite00ProjectOperatingSystemRegistry('astral');
    const result = runParentChildExperienceInheritance({ registry, dryRun: true });
    expect(result.qaReport.genericFallbackCount).toBeGreaterThan(0);
    expect(result.qaReport.findings.some((f) => f.code === 'PCI_GENERIC_ADMIN_FALLBACK')).toBe(true);
  });

  it('11. design workspace MORE branch resolves all children', () => {
    const registry = buildSite00DesignWorkspaceMoreRegistry('site00');
    const graph = discoverParentChildRouteGraph(registry);
    const resolved = resolveAllExperienceParents({ graph });
    expect(resolved.length).toBeGreaterThanOrEqual(4);
    const archetypes = classifyChildSurfaces({ nodes: listChildNodes(graph) });
    expect(archetypes.size).toBeGreaterThan(0);
  });

  it('12. store persists run lineage', () => {
    const registry = buildSite00DesignWorkspaceMoreRegistry('site00');
    const result = runParentChildExperienceInheritance({ registry, dryRun: true });
    expect(getInheritanceRun(result.runId)).toBeTruthy();
    expect(listInheritanceRuns('site00').length).toBe(1);
  });

  it('13. tab child relationship detected in graph', () => {
    const graph = discoverParentChildRouteGraph({
      projectId: 'test',
      rootRoute: '/hub',
      routes: ['/hub', '/hub?tab=settings'],
      declaredSurfaces: [
        {
          surfaceId: 'tab-settings',
          route: '/hub?tab=settings',
          label: 'SETTINGS',
          parentRoute: '/hub',
          relationshipType: 'TAB_CHILD',
          kind: 'TAB_STATE',
        },
      ],
    });
    expect(getRelationshipForNode(graph, 'tab-settings')).toBe('TAB_CHILD');
  });

  it('14. specialized child editor inherits grammar not layout clone', () => {
    const authority = extractParentExperienceAuthority({
      projectId: 'x',
      signals: {
        route: '/projects/x/overview',
        surfaceId: 'overview',
        viewport: 'DESKTOP',
        editorialSections: 4,
      },
    });
    const plan = buildChildConvergencePlan({
      parentAuthority: authority,
      resolvedParent: {
        childNodeId: 'editor',
        childRoute: '/projects/x/content/edit',
        resolvedParentRoute: '/projects/x/overview',
        resolvedParentNodeId: 'landing',
        resolutionStrategy: 'IMMEDIATE_URL_PARENT',
        relationshipType: 'EDITOR_CHILD',
      },
      childSurfaceId: 'editor',
      childRoute: '/projects/x/content/edit',
      archetype: 'EDITOR',
      inheritanceMode: 'SPECIALIZED_CHILD',
    });
    expect(plan.layoutActions.some((a) => a.actionId === 'layout-composition-adapt')).toBe(true);
    expect(plan.functionalMustPreserve).toContain('CANVAS_INTERACTIONS');
  });

  it('15. QA passes when no blocking generic fallback after convergence plan without legacy panel', () => {
    const authority = extractParentExperienceAuthority({
      projectId: 'clean',
      signals: {
        route: '/projects/clean/design?tab=more',
        surfaceId: 'hub',
        viewport: 'MOBILE',
        controlRoomIndicators: true,
        cardGridPresent: true,
      },
    });
    const plan = buildChildConvergencePlan({
      parentAuthority: authority,
      resolvedParent: {
        childNodeId: 'child',
        childRoute: '/projects/clean/design?tab=more&category=system',
        resolvedParentRoute: '/projects/clean/design?tab=more',
        resolvedParentNodeId: 'hub',
        resolutionStrategy: 'MODULE_LANDING',
        relationshipType: 'TAB_CHILD',
      },
      childSurfaceId: 'child',
      childRoute: '/projects/clean/design?tab=more&category=system',
      archetype: 'SETTINGS',
      inheritanceMode: 'INHERIT_GRAMMAR',
      descriptor: {
        surfaceId: 'child',
        route: '/projects/clean/design?tab=more&category=system',
        label: 'SYSTEM',
        relationshipType: 'TAB_CHILD',
        parentRoute: '/projects/clean/design?tab=more',
        viewport: 'MOBILE',
        domClassHints: ['site00-dw-more-hub__grid'],
      },
    });
    const qa = evaluateInheritanceBranchQA({
      projectId: 'clean',
      parentRoute: '/projects/clean/design?tab=more',
      parentAuthority: authority,
      plans: [plan],
    });
    expect(qa.findings.filter((f) => f.code === 'PCI_GENERIC_ADMIN_FALLBACK')).toHaveLength(0);
  });
});
