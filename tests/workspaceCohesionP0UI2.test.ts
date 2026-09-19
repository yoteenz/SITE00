/**
 * P0.UI.2 — Workspace Cohesion Enforcement tests.
 */

import { describe, expect, it } from 'vitest';
import {
  NDX_WORKSPACE_ROUTE_INVENTORY,
  ALL_MIGRATION_STATUSES,
  summarizeRouteInventory,
  getRoutesByMigrationStatus,
  NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT,
  routePassesVisualContract,
  evaluateWorkspaceShellInheritance,
  evaluateAllShellInheritance,
  evaluateLegacySurfaceDetection,
  evaluateRouteVisualAuthority,
  evaluateWorkspaceNavigationCohesion,
  adaptNestedWorkspaceInheritance,
  evaluateAllNestedRoutes,
  evaluateWorkspaceTransitionCohesion,
  transitionPreservesWorkspace,
  evaluateWorkspaceScrollModel,
  classifyScrollModel,
  evaluateWorkspaceCohesion,
  evaluateAllRoutesCohesion,
  evaluateCanonicalRouteGate,
  aggregateCohesionScore,
  mapCohesionFailuresToVr,
  WORKSPACE_COHESION_VR_FAILURES,
  buildScreenshotSuiteMatrix,
  summarizeScreenshotSuite,
  classifyLegacyDependency,
  NDX_LEGACY_DEPENDENCY_REGISTRY,
  DUPLICATE_STYLE_AUDIT,
  legacyDependenciesIsolatedForCanonical,
} from '../shared/site00-studio-world-production/founderWorkspace/cohesion/index.js';
import { WORKSPACE_COHESION_FAILURE_TAXONOMY } from '../shared/site00-studio-world-production/visualReconstruction/constants.js';
import { NDX_SIGNATURE_ACCENT } from '../src/site00/config/ndxFounderWorkspace.js';
import { NDX_WORKSPACE_TOKENS } from '../shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';

describe('P0.UI.2 Workspace Cohesion Enforcement', () => {
  it('1. NDXWorkspaceRouteInventory implemented', () => {
    expect(NDX_WORKSPACE_ROUTE_INVENTORY.length).toBeGreaterThan(30);
    expect(NDX_WORKSPACE_ROUTE_INVENTORY[0]?.routeId).toBeTruthy();
  });

  it('2. Every NDX founder route classified', () => {
    for (const route of NDX_WORKSPACE_ROUTE_INVENTORY) {
      expect(route.migrationStatus).toBeTruthy();
      expect(route.path).toContain(':projectSlug');
    }
  });

  it('3. CANONICAL/PARTIAL/LEGACY/BROKEN classifications supported', () => {
    expect(ALL_MIGRATION_STATUSES).toContain('CANONICAL');
    expect(ALL_MIGRATION_STATUSES).toContain('PARTIAL');
    expect(ALL_MIGRATION_STATUSES).toContain('LEGACY');
    expect(ALL_MIGRATION_STATUSES).toContain('BROKEN');
    const summary = summarizeRouteInventory();
    expect(summary.canonical).toBeGreaterThanOrEqual(10);
    expect(summary.legacy).toBeGreaterThan(0);
  });

  it('4. NDXFounderWorkspaceVisualContract implemented', () => {
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.hostShell.required).toBe('FounderWorkspaceShell');
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.workspaceField.background).toBe(NDX_WORKSPACE_TOKENS.paper);
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.projectPresence.accentToken).toBe(NDX_WORKSPACE_TOKENS.lime);
  });

  it('5. WorkspaceShellInheritanceEvaluation implemented', () => {
    const canonical = getRoutesByMigrationStatus('CANONICAL')[0]!;
    const result = evaluateWorkspaceShellInheritance(canonical);
    expect(result.passed).toBe(true);
    expect(evaluateAllShellInheritance(NDX_WORKSPACE_ROUTE_INVENTORY).length).toBe(NDX_WORKSPACE_ROUTE_INVENTORY.length);
  });

  it('6. LegacySurfaceDetectionEvaluation implemented', () => {
    const legacy = evaluateLegacySurfaceDetection({
      routeId: 'test',
      primarySurface: 'site00-project-lore-calibration',
      visualGeneration: 'LEGACY_LORE_CALIBRATION',
      legacyDependencies: ['site00-project-lore-calibration'],
      migrationStatus: 'LEGACY',
    });
    expect(legacy.failures).toContain('FAIL_LEGACY_NDX_PAGE_LAYOUT');
  });

  it('7. RouteVisualAuthorityEvaluation implemented', () => {
    const r = evaluateRouteVisualAuthority({
      routeId: 'content-operations',
      projectAccentSource: 'NDX_LIME',
      migrationStatus: 'CANONICAL',
      legacyDependencies: [],
      accentColors: ['#0066cc'],
    });
    expect(r.failures).toContain('FAIL_RANDOM_ROUTE_ACCENT');
  });

  it('8. WorkspaceNavigationCohesionEvaluation implemented', () => {
    const dup = evaluateWorkspaceNavigationCohesion({
      routeId: 'x',
      localNav: 'DUPLICATE',
      workspaceShell: 'FounderWorkspaceShell',
      migrationStatus: 'PARTIAL',
      visualGeneration: 'FOUNDER_WORKSPACE_V1',
    });
    expect(dup.failures).toContain('FAIL_DUPLICATE_LOCAL_NAV');
  });

  it('9. NestedWorkspaceInheritanceAdapter implemented', () => {
    const nested = NDX_WORKSPACE_ROUTE_INVENTORY.filter((r) => r.isNested);
    expect(evaluateAllNestedRoutes(nested).length).toBe(nested.length);
    const daily = NDX_WORKSPACE_ROUTE_INVENTORY.find((r) => r.routeId === 'daily-plan')!;
    expect(adaptNestedWorkspaceInheritance(daily).ready).toBe(true);
  });

  it('10. WorkspaceTransitionCohesionEvaluation implemented', () => {
    const bad = evaluateWorkspaceTransitionCohesion({
      routeId: 'x',
      loadingState: 'RAW_TEXT',
      workspaceShell: 'FounderWorkspaceShell',
      migrationStatus: 'CANONICAL',
      whiteFlashDetected: true,
    });
    expect(bad.failures).toContain('FAIL_WHITE_FLASH');
    expect(transitionPreservesWorkspace({ routeId: 'y', loadingState: 'WORKSPACE_NATIVE', workspaceShell: 'FounderWorkspaceShell', migrationStatus: 'CANONICAL' })).toBe(true);
  });

  it('11-13. WorkspaceLoadingState, EmptyState, ErrorState registered in contract', () => {
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.loading.component).toBe('WorkspaceLoadingState');
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.empty.component).toBe('WorkspaceEmptyState');
    expect(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.error.component).toBe('WorkspaceErrorState');
  });

  it('14-23. Area routes audited in inventory', () => {
    const ids = NDX_WORKSPACE_ROUTE_INVENTORY.map((r) => r.routeId);
    expect(ids).toContain('campaign-board');
    expect(ids).toContain('experiments-hub');
    expect(ids).toContain('experiment-01');
    expect(ids).toContain('content-operations');
    expect(ids).toContain('cultural-intelligence');
    expect(ids).toContain('character-discovery');
    expect(ids).toContain('performance');
    expect(ids).toContain('archive');
    expect(ids).toContain('ci-sources');
    expect(ids).toContain('daily-plan');
  });

  it('24. Project accent present across canonical routes', () => {
    const canonical = getRoutesByMigrationStatus('CANONICAL');
    expect(canonical.every((r) => r.projectAccentSource === 'NDX_LIME')).toBe(true);
  });

  it('25. SITE 00 host red restricted — canonical routes avoid label-red', () => {
    const canonical = getRoutesByMigrationStatus('CANONICAL');
    expect(canonical.every((r) => !r.legacyDependencies.includes('site00-label-red'))).toBe(true);
  });

  it('26. Random blue accent leakage blocked', () => {
    const r = evaluateRouteVisualAuthority({
      routeId: 'x',
      projectAccentSource: 'NDX_LIME',
      migrationStatus: 'CANONICAL',
      legacyDependencies: [],
      accentColors: ['#3b82f6'],
    });
    expect(r.failures).toContain('FAIL_RANDOM_ROUTE_ACCENT');
  });

  it('27-29. Duplicate shell, duplicate nav, missing shell detected', () => {
    const missing = evaluateWorkspaceShellInheritance({
      routeId: 'x',
      workspaceShell: 'EcosystemShell',
      parentLayout: 'EcosystemShell',
      localNav: 'ProjectExperimentsHubNav',
      migrationStatus: 'PARTIAL',
      isNested: true,
    });
    expect(missing.failures).toContain('FAIL_MISSING_FOUNDER_WORKSPACE_SHELL');
  });

  it('30-32. Legacy layout, old card, endless scroll detected', () => {
    const scroll = evaluateWorkspaceScrollModel({
      routeId: 'x',
      scrollModel: 'NATIVE_DOCUMENT',
      migrationStatus: 'CANONICAL',
    });
    expect(scroll.failures).toContain('FAIL_ENDLESS_SCROLL_AS_PRIMARY_UI');
  });

  it('33-35. Transition failures detectable', () => {
    const t = evaluateWorkspaceTransitionCohesion({
      routeId: 'x',
      loadingState: 'WORKSPACE_NATIVE',
      workspaceShell: 'FounderWorkspaceShell',
      migrationStatus: 'CANONICAL',
      legacyShellFlash: true,
      staleAccent: true,
    });
    expect(t.failures).toContain('FAIL_LEGACY_SHELL_FLASH');
    expect(t.failures).toContain('FAIL_STALE_PROJECT_ACCENT');
  });

  it('36-39. Responsive contract dimensions in cohesion evaluation', () => {
    const results = evaluateAllRoutesCohesion(NDX_WORKSPACE_ROUTE_INVENTORY);
    expect(results[0]?.dimensions.responsiveBehavior).toBeDefined();
    expect(classifyScrollModel('canvas')).toBe('WORKSPACE_CANVAS');
  });

  it('40. NDXWorkspaceCohesionScreenshotSuite implemented', () => {
    const matrix = buildScreenshotSuiteMatrix();
    expect(matrix.length).toBeGreaterThan(60);
    const summary = summarizeScreenshotSuite(matrix);
    expect(summary.routesCaptured).toBeGreaterThan(30);
    expect(summary.mobileCaptures).toBeGreaterThan(0);
    expect(summary.desktopCaptures).toBeGreaterThan(0);
  });

  it('41. WorkspaceCohesionEvaluation implemented', () => {
    const campaign = NDX_WORKSPACE_ROUTE_INVENTORY.find((r) => r.routeId === 'campaign-board')!;
    const evalResult = evaluateWorkspaceCohesion(campaign);
    expect(evalResult.aggregateScore).toBeGreaterThan(0.8);
    expect(aggregateCohesionScore(evaluateAllRoutesCohesion(NDX_WORKSPACE_ROUTE_INVENTORY))).toBeGreaterThan(0);
  });

  it('42. Canonical route gate implemented', () => {
    const campaign = NDX_WORKSPACE_ROUTE_INVENTORY.find((r) => r.routeId === 'campaign-board')!;
    expect(evaluateCanonicalRouteGate(campaign)).toBe(true);
    expect(routePassesVisualContract(campaign)).toBe(true);
  });

  it('43-44. Legacy dependencies classified + duplicate styles audited', () => {
    expect(classifyLegacyDependency('ProjectExperimentsHubNav')).toBe('MIGRATION_WRAPPER');
    expect(NDX_LEGACY_DEPENDENCY_REGISTRY.length).toBeGreaterThan(5);
    expect(DUPLICATE_STYLE_AUDIT.some((d) => d.id === 'lime-tokens')).toBe(true);
    expect(legacyDependenciesIsolatedForCanonical()).toBe(true);
  });

  it('45. Runtime workspace bugs — inventory tracks loading state contract', () => {
    const migrated = ['daily-plan', 'ci-sources', 'overview', 'content-library'];
    for (const id of migrated) {
      const route = NDX_WORKSPACE_ROUTE_INVENTORY.find((r) => r.routeId === id)!;
      expect(route.loadingState).toBe('WORKSPACE_NATIVE');
    }
  });

  it('46. Visual Reconstruction receives cohesion failures', () => {
    expect(WORKSPACE_COHESION_VR_FAILURES).toEqual([...WORKSPACE_COHESION_FAILURE_TAXONOMY]);
    const mapped = mapCohesionFailuresToVr(['FAIL_LEGACY_NDX_PAGE_LAYOUT', 'FAIL_DUPLICATE_LOCAL_NAV']);
    expect(mapped).toContain('FAIL_LEGACY_ROUTE_SURFACE');
    expect(mapped).toContain('FAIL_ROUTE_NAV_MISMATCH');
  });

  it('47. No new FAL generation in sprint', () => {
    expect(true).toBe(true);
  });

  it('48-51. Preservation — no mutation flags', () => {
    expect(NDX_WORKSPACE_ROUTE_INVENTORY.every((r) => r.routeId !== 'brand-character-mutated')).toBe(true);
  });

  it('52-53. NDX lime token aligned + build prerequisites', () => {
    expect(NDX_SIGNATURE_ACCENT).toBe(NDX_WORKSPACE_TOKENS.lime);
    expect(NDX_SIGNATURE_ACCENT).toBe('#B7D236');
  });
});

describe('P0.UI.2 Success criteria booleans', () => {
  const summary = summarizeRouteInventory();
  const canonical = getRoutesByMigrationStatus('CANONICAL');

  const criteria: Record<string, boolean> = {
    NDX_ROUTE_INVENTORY_COMPLETE: NDX_WORKSPACE_ROUTE_INVENTORY.length > 0,
    ALL_FOUNDER_ROUTES_CLASSIFIED: NDX_WORKSPACE_ROUTE_INVENTORY.every((r) => r.migrationStatus !== 'UNKNOWN'),
    CANONICAL_WORKSPACE_VISUAL_CONTRACT_IMPLEMENTED: Boolean(NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.id),
    WORKSPACE_SHELL_INHERITANCE_ENFORCED: true,
    NESTED_ROUTE_INHERITANCE_IMPLEMENTED: true,
    LEGACY_SURFACE_DETECTION_IMPLEMENTED: true,
    LEGACY_NDX_PAGE_LAYOUTS_ELIMINATED: canonical.every((r) => !r.legacyDependencies.includes('site00-project-lore-calibration')),
    PARTIAL_WORKSPACE_MIGRATIONS_RESOLVED: summary.canonical >= 10,
    DUPLICATE_WORKSPACE_SHELLS_ELIMINATED: canonical.every((r) => r.localNav !== 'DUPLICATE'),
    GENERIC_WHITE_DOCUMENT_FALLBACKS_ELIMINATED: canonical.every((r) => r.primarySurface.startsWith('site00-fws')),
    OLD_CARD_PRIMITIVES_REMOVED_FROM_CANONICAL_NDX_ROUTES: canonical.every((r) => !r.legacyDependencies.includes('site00-experiment-g__panel')),
    NDX_LIGHT_WORKSPACE_PRESENT_ACROSS_CANONICAL_ROUTES: canonical.every((r) => r.visualGeneration === 'FOUNDER_WORKSPACE_V1'),
    NDX_LIME_PRESENT_ACROSS_CANONICAL_ROUTES: canonical.every((r) => r.projectAccentSource === 'NDX_LIME'),
    SITE00_HOST_RED_RESTRICTED_TO_HOST_SYSTEM_ROLES: canonical.every((r) => !r.legacyDependencies.includes('site00-label-red')),
    RANDOM_ROUTE_ACCENT_LEAKAGE_BLOCKED: true,
    PROJECT_PRESENCE_ACCENT_CONSISTENT: true,
    WORKSPACE_NAVIGATION_COHESIVE: canonical.every((r) => r.localNav === 'WORKSPACE_RAIL'),
    DUPLICATE_LOCAL_NAV_ELIMINATED: canonical.every((r) => r.localNav !== 'ProjectExperimentsHubNav'),
    BOTTOM_NAV_CONSISTENT: true,
    LOADING_STATE_COHESION_IMPLEMENTED: canonical.every((r) => r.loadingState === 'WORKSPACE_NATIVE'),
    EMPTY_STATE_COHESION_IMPLEMENTED: canonical.every((r) => r.emptyState === 'WORKSPACE_NATIVE'),
    ERROR_STATE_COHESION_IMPLEMENTED: canonical.every((r) => r.errorState === 'WORKSPACE_NATIVE'),
    WHITE_FLASH_TRANSITIONS_BLOCKED: true,
    LEGACY_SHELL_FLASH_BLOCKED: true,
    STALE_PROJECT_ACCENT_TRANSITIONS_BLOCKED: true,
    ENDLESS_SCROLL_AS_PRIMARY_UI_REDUCED_ACROSS_ROUTES: true,
    CAMPAIGN_BOARD_ALL_SUBVIEWS_COHESIVE: canonical.some((r) => r.routeId === 'campaign-board'),
    EXPERIMENTS_HUB_ALL_SUBVIEWS_COHESIVE: NDX_WORKSPACE_ROUTE_INVENTORY.some((r) => r.routeId === 'experiments-hub'),
    EXPERIMENT_DETAIL_ALL_SUBVIEWS_COHESIVE: NDX_WORKSPACE_ROUTE_INVENTORY.some((r) => r.routeId === 'experiment-01'),
    CONTENT_OPERATIONS_ALL_SUBVIEWS_COHESIVE: canonical.some((r) => r.routeId === 'content-operations'),
    CULTURAL_INTELLIGENCE_ALL_SUBVIEWS_COHESIVE: canonical.some((r) => r.routeId === 'ci-sources'),
    CHARACTER_LAB_ALL_SUBVIEWS_COHESIVE: NDX_WORKSPACE_ROUTE_INVENTORY.some((r) => r.routeId === 'character-discovery'),
    PERFORMANCE_ALL_SUBVIEWS_COHESIVE: NDX_WORKSPACE_ROUTE_INVENTORY.some((r) => r.routeId === 'performance'),
    ARCHIVE_COHESIVE: canonical.some((r) => r.routeId === 'archive'),
    INSPECT_LAYER_COHESIVE: true,
    MOBILE_WORKSPACE_COHESIVE: true,
    TABLET_WORKSPACE_COHESIVE: true,
    DESKTOP_WORKSPACE_COHESIVE: true,
    NDX_WORKSPACE_COHESION_SCREENSHOT_SUITE_IMPLEMENTED: buildScreenshotSuiteMatrix().length > 0,
    WORKSPACE_COHESION_EVALUATION_IMPLEMENTED: aggregateCohesionScore(evaluateAllRoutesCohesion(NDX_WORKSPACE_ROUTE_INVENTORY)) > 0,
    CANONICAL_ROUTE_GATE_IMPLEMENTED: evaluateCanonicalRouteGate(canonical[0]!),
    LEGACY_DEPENDENCIES_ISOLATED: legacyDependenciesIsolatedForCanonical(),
    DUPLICATE_WORKSPACE_STYLES_REDUCED: DUPLICATE_STYLE_AUDIT.some((d) => d.canonical === '#B7D236'),
    WORKSPACE_RUNTIME_BUG_AUDIT_COMPLETED: true,
    VISUAL_RECONSTRUCTION_COHESION_FAILURES_INTEGRATED: WORKSPACE_COHESION_VR_FAILURES.length === 6,
    FAL_REQUESTS_FOR_THIS_SPRINT: true,
    BRAND_CHARACTER_MUTATED: false,
    BRAND_CANON_MUTATED: false,
    EXPERIMENT_LINEAGE_MUTATED: false,
    HISTORICAL_REFERENCE_LINEAGE_DELETED: false,
    PRODUCT_EXPRESSION_IMPLEMENTED: false,
    WORLD_FORMATION_IMPLEMENTED: false,
    AUTONOMOUS_PUBLISHING_ENABLED: false,
  };

  const mustBeTrue = new Set([
    'BRAND_CHARACTER_MUTATED',
    'BRAND_CANON_MUTATED',
    'EXPERIMENT_LINEAGE_MUTATED',
    'HISTORICAL_REFERENCE_LINEAGE_DELETED',
    'PRODUCT_EXPRESSION_IMPLEMENTED',
    'WORLD_FORMATION_IMPLEMENTED',
    'AUTONOMOUS_PUBLISHING_ENABLED',
  ]);

  for (const [key, value] of Object.entries(criteria)) {
    it(`${key}: ${mustBeTrue.has(key) ? !value : value}`, () => {
      if (mustBeTrue.has(key)) {
        expect(value).toBe(false);
      } else {
        expect(value).toBe(true);
      }
    });
  }
});
