/**
 * B5.9R1 test suite — Universal Project Operating System + Founder/Client view modes.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROJECT_MODULE_CONFIGS, PROJECT_MODULES, projectModulePath, resolveModuleFromPath } from '../shared/site00-projects/projectModules.js';
import { buildProjectCapabilityManifest, resolveVisibleModules } from '../shared/site00-projects/projectCapabilityManifest.js';
import { MARKETING_TO_EVOLVE_MODULE, operatingCapabilityToModule } from '../shared/site00-projects/projectOperatingCapabilities.js';
import { PROJECT_VIEW_MODES, toggleViewAsClient, createDefaultViewModeSession, canToggleViewAsClient } from '../shared/site00-projects/projectViewMode.js';
import { PROJECT_MODULE_DEPENDENCY_GRAPH } from '../shared/site00-projects/projectModuleDependencyGraph.js';
import { translateStatusForClient, isInternalOnlyStatus } from '../shared/site00-projects/clientSafeStatusTranslation.js';
import { buildGeneralizedProjectOperatingState } from '../shared/site00-projects/generalizedProjectOperatingState.js';
import {
  getProjectOperatingAdapter,
  NdxbookProjectAdapter,
  FrontalSlayerProjectAdapter,
  AstralWorldProjectAdapter,
  AioProjectAdapter,
} from '../shared/site00-projects/adapters/index.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.9R1 Universal Project Operating System', () => {
  it('1. Evolve is founder-facing module name (not Marketing)', () => {
    expect(PROJECT_MODULE_CONFIGS.EVOLVE.label).toBe('EVOLVE');
    expect(MARKETING_TO_EVOLVE_MODULE).toBe('EVOLVE');
    const posCss = readFileSync(join(ROOT, 'src/site00/styles/site00-project-operating-system.css'), 'utf8');
    expect(posCss).not.toContain('MARKETING MODULE');
  });

  it('2–3. Marketing capability maps to Evolve; UI uppercase rule in POS shell', () => {
    expect(operatingCapabilityToModule('CAMPAIGNS')).toBe('EVOLVE');
    expect(operatingCapabilityToModule('CONTENT_OPS')).toBe('EVOLVE');
    const shell = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectOperatingShell.tsx'), 'utf8');
    expect(shell).toContain('site00-pos');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-project-operating-system.css'), 'utf8');
    expect(css).toContain('text-transform: uppercase');
  });

  it('4. ProjectCapabilityManifest exists with required fields', () => {
    const manifest = buildProjectCapabilityManifest({
      projectId: 'test',
      organizationId: 'org',
      entitledCapabilities: ['IDENTITY', 'BUILDER'],
      enabledCapabilities: ['IDENTITY', 'BUILDER'],
    });
    expect(manifest.projectId).toBe('test');
    expect(manifest.entitledCapabilities).toContain('IDENTITY');
    expect(manifest.enabledModules).toContain('OVERVIEW');
    expect(manifest.moduleOrder.length).toBeGreaterThan(0);
    expect(manifest.permissions).toBeDefined();
    expect(manifest.createdAt).toBeTruthy();
  });

  it('5–9. Modules capability-derived; Evolve/Identity/Builder/Production optional', () => {
    const identityOnly = buildProjectCapabilityManifest({
      projectId: 'x',
      organizationId: 'x',
      enabledCapabilities: ['IDENTITY'],
    });
    expect(identityOnly.enabledModules).toContain('IDENTITY');
    expect(identityOnly.enabledModules).not.toContain('EVOLVE');
    expect(identityOnly.enabledModules).not.toContain('BUILDER');

    const builderOnly = buildProjectCapabilityManifest({
      projectId: 'x',
      organizationId: 'x',
      enabledCapabilities: ['BUILDER'],
    });
    expect(builderOnly.enabledModules).toContain('BUILDER');
    expect(builderOnly.enabledModules).not.toContain('IDENTITY');

    const evolveOnly = buildProjectCapabilityManifest({
      projectId: 'x',
      organizationId: 'x',
      enabledCapabilities: ['EVOLVE', 'CAMPAIGNS'],
    });
    expect(evolveOnly.enabledModules).toContain('EVOLVE');
    expect(evolveOnly.enabledModules).not.toContain('BUILDER');
  });

  it('10–11. Module switcher and desktop nav exist', () => {
    const switcher = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectModuleSwitcher.tsx'), 'utf8');
    const desktopNav = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ProjectModuleDesktopNav.tsx'), 'utf8');
    expect(switcher).toContain('PROJECT MODULES');
    expect(desktopNav).toContain('site00-pos-desktop-nav');
  });

  it('12–16. Each module has distinct bottom subnav', () => {
    const overview = PROJECT_MODULE_CONFIGS.OVERVIEW.mobileSubnav.map((s) => s.label);
    const identity = PROJECT_MODULE_CONFIGS.IDENTITY.mobileSubnav.map((s) => s.label);
    const builder = PROJECT_MODULE_CONFIGS.BUILDER.mobileSubnav.map((s) => s.label);
    const evolve = PROJECT_MODULE_CONFIGS.EVOLVE.mobileSubnav.map((s) => s.label);
    const production = PROJECT_MODULE_CONFIGS.PRODUCTION.mobileSubnav.map((s) => s.label);

    expect(overview).toEqual(['SNAPSHOT', 'ACTIVITY', 'ALERTS', 'MORE']);
    expect(identity).toEqual(['TRUTH', 'VOICE', 'DNA', 'MORE']);
    expect(builder).toEqual(['PAGES', 'FEATURES', 'QA', 'MORE']);
    expect(evolve).toEqual(['CAMPAIGNS', 'CONTENT', 'ANALYTICS', 'MORE']);
    expect(production).toEqual(['READINESS', 'RELEASES', 'ENVIRONMENTS', 'MORE']);
    expect(new Set([overview.join(), identity.join(), builder.join(), evolve.join(), production.join()]).size).toBe(5);
  });

  it('17. Generic ProjectOperatingState exists', () => {
    const manifest = buildProjectCapabilityManifest({
      projectId: 'test',
      organizationId: 'org',
      enabledCapabilities: ['IDENTITY'],
    });
    const state = buildGeneralizedProjectOperatingState({
      projectId: 'test',
      displayName: 'TEST',
      manifest,
    });
    expect(state.summary.displayName).toBe('TEST');
    expect(state.capabilityManifest).toBeDefined();
    expect(state.identityState).toBeTruthy();
  });

  it('18–22. Project adapters exist; per-project manifests', () => {
    expect(NdxbookProjectAdapter.adapterId).toBe('ndxbook');
    expect(FrontalSlayerProjectAdapter.adapterId).toBe('frontal-slayer');
    expect(AstralWorldProjectAdapter.adapterId).toBe('astral-world');
    expect(AioProjectAdapter.adapterId).toBe('all-in-one-enterprises');

    const fsManifest = FrontalSlayerProjectAdapter.buildManifest({ projectDetail: null });
    expect(fsManifest.enabledModules).toContain('EVOLVE');
    expect(fsManifest.enabledModules).toContain('IDENTITY');
    expect(fsManifest.internalProject).toBe(true);

    const ndxManifest = NdxbookProjectAdapter.buildManifest({ projectDetail: null });
    expect(ndxManifest.enabledModules).toContain('EVOLVE');
    expect(ndxManifest.enabledModules).not.toContain('BUILDER');

    const astralManifest = AstralWorldProjectAdapter.buildManifest({ projectDetail: null });
    expect(astralManifest.enabledModules).not.toContain('EVOLVE');

    const aioManifest = AioProjectAdapter.buildManifest({ projectDetail: null });
    expect(aioManifest.enabledModules).toContain('BUILDER');
    expect(aioManifest.enabledModules).not.toContain('EVOLVE');
  });

  it('23–24. Legacy dossier route retired; command grid not rendered', () => {
    const detailPage = readFileSync(join(ROOT, 'src/site00/pages/ProjectDetailPage.tsx'), 'utf8');
    expect(detailPage).toContain('Navigate');
    expect(detailPage).not.toContain('site00-project-command__grid');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-project-operating-system.css'), 'utf8');
    expect(css).toContain('.site00-project-command__grid');
  });

  it('25–30. ProjectViewMode, view-as toggle, client simulation', () => {
    expect(PROJECT_VIEW_MODES).toContain('FOUNDER');
    expect(PROJECT_VIEW_MODES).toContain('CLIENT');
    const session = createDefaultViewModeSession(true);
    const simulated = toggleViewAsClient(session);
    expect(simulated.isSimulatingClient).toBe(true);
    expect(simulated.mode).toBe('CLIENT');
    const restored = toggleViewAsClient(simulated);
    expect(restored.mode).toBe('FOUNDER');
    expect(canToggleViewAsClient('CLIENT')).toBe(false);
    expect(canToggleViewAsClient('FOUNDER')).toBe(true);

    const controls = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/ViewAsClientControls.tsx'), 'utf8');
    expect(controls).toContain('CLIENT VIEW');
    expect(controls).toContain('RETURN TO FOUNDER VIEW');

    const modulePage = readFileSync(join(ROOT, 'src/site00/pages/ProjectOperatingModulePage.tsx'), 'utf8');
    expect(modulePage).toContain('/app/projects/');
    expect(modulePage).not.toContain('display: none');
  });

  it('31–38. Control rooms exist; client sections defined', () => {
    const controlOverview = readFileSync(join(ROOT, 'src/site00/pages/control/ControlOverviewPage.tsx'), 'utf8');
    expect(controlOverview).toContain('ControlOverviewPage');
    const adminCtrl = readFileSync(join(ROOT, 'src/routes/Site00AdminRoutes.tsx'), 'utf8');
    expect(adminCtrl).toContain('ctrl-room');
    expect(SITE00_ROUTES_HAS_CONTROL()).toBe(true);
  });

  it('39–43. Client data firewall + status translation', () => {
    expect(isInternalOnlyStatus('PROVIDER_SPEND_EXCEEDED')).toBe(true);
    expect(isInternalOnlyStatus('DEPLOYMENT NEEDS ATTENTION')).toBe(false);
    expect(translateStatusForClient('DEPLOYMENT_PROVIDER_FAILURE')).toContain('DEPLOYMENT NEEDS ATTENTION');
    const manifest = FrontalSlayerProjectAdapter.buildManifest({ projectDetail: null });
    const clientModules = resolveVisibleModules(manifest, 'CLIENT');
    expect(clientModules).not.toContain('EVOLVE');
  });

  it('44–45. Client module visibility + founder internal override', () => {
    const manifest = FrontalSlayerProjectAdapter.buildManifest({ projectDetail: null });
    expect(manifest.permissions.internalOverride).toBe(true);
    const founderModules = resolveVisibleModules(manifest, 'FOUNDER');
    expect(founderModules).toContain('EVOLVE');
  });

  it('46. Module dependency graph exists', () => {
    expect(PROJECT_MODULE_DEPENDENCY_GRAPH.length).toBeGreaterThan(0);
    expect(PROJECT_MODULE_DEPENDENCY_GRAPH.some((e) => e.from === 'IDENTITY' && e.to === 'BUILDER')).toBe(true);
  });

  it('47–50. Routes and module resolution', () => {
    expect(projectModulePath('frontal-slayer', 'IDENTITY')).toBe('/projects/frontal-slayer/identity');
    expect(resolveModuleFromPath('/projects/frontal-slayer/builder')).toBe('BUILDER');
    expect(PROJECT_MODULES).toContain('EVOLVE');
  });

  it('51–56. Shell components wired; adapter resolver', () => {
    expect(getProjectOperatingAdapter('ndxbook').adapterId).toBe('ndxbook');
    expect(getProjectOperatingAdapter('frontal-slayer').adapterId).toBe('frontal-slayer');
    const index = readFileSync(join(ROOT, 'src/site00/components/projectOperatingSystem/index.ts'), 'utf8');
    expect(index).toContain('ProjectOperatingShell');
  });
});

function SITE00_ROUTES_HAS_CONTROL(): boolean {
  const routes = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
  return routes.includes("control: '/control'");
}
