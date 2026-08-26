/**
 * P0.NAV.1 — Lab Hub + Experiment / Character navigation recovery.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildLabHubSummaries,
  evaluateLabNavigation,
  isNdxLabRouteGroupPath,
  ndxLabRouteGroupPath,
  resolveNdxLabRouteGroupMember,
} from '../shared/site00-studio-world-production/founderWorkspace/labNavigation/index.js';
import { resolveNotificationActionHref } from '../shared/site00-studio-world-production/projectNotifications/deepLinks.js';
import { ndxFounderWorkspaceBottomNav } from '../src/site00/config/ndxFounderWorkspaceIcons.js';
import { ndxFounderWorkspaceMenuItems } from '../src/site00/config/ndxFounderWorkspaceIcons.js';
import {
  ndxFounderWorkspaceMobileNav,
  resolveMobileScreenIdFromPath,
} from '../src/site00/config/ndxFounderWorkspaceMobileNav.js';
import {
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectCharacterCastingPath,
  site00ProjectCharacterContinuityPath,
  site00ProjectExperimentsPath,
  site00ProjectFounderCharacterDiscoveryPath,
  site00ProjectLabPath,
} from '../src/site00/config/routes.js';

const SLUG = 'ndxbook';
const ROOT = process.cwd();

describe('P0.NAV.1 Lab Hub navigation', () => {
  const labHub = site00ProjectLabPath(SLUG);
  const experimentsHub = site00ProjectExperimentsPath(SLUG);
  const characterLab = site00ProjectFounderCharacterDiscoveryPath(SLUG);
  const experiment01 = site00ProjectBrandMarketingExpressionExperiment01Path(SLUG);
  const casting = site00ProjectCharacterCastingPath(SLUG);
  const continuity = site00ProjectCharacterContinuityPath(SLUG);

  it('1. bottom-nav Lab routes to Lab Hub', () => {
    const desktopNav = ndxFounderWorkspaceBottomNav(SLUG);
    const mobileNav = ndxFounderWorkspaceMobileNav(SLUG);
    const labDesktop = desktopNav.find((i) => i.id === 'LAB');
    const labMobile = mobileNav.find((i) => i.id === 'lab');
    expect(labDesktop?.href).toBe(labHub);
    expect(labMobile?.href).toBe(labHub);
  });

  it('2-4. Lab Hub route + page + destination panels exist', () => {
    expect(existsSync(join(ROOT, 'src/site00/pages/ProjectLabHubPage.tsx'))).toBe(true);
    expect(existsSync(join(ROOT, 'src/site00/components/founderWorkspace/LabHubOperateLayer.tsx'))).toBe(true);
    const layer = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/LabHubOperateLayer.tsx'), 'utf8');
    expect(layer).toContain('OPEN EXPERIMENTS →');
    expect(layer).toContain('OPEN CHARACTER LAB →');
  });

  it('5-6. Experiments entry opens Experiments Hub; Character opens Character Lab', () => {
    const summaries = buildLabHubSummaries({
      experimentsHubHref: experimentsHub,
      characterLabHref: characterLab,
    });
    expect(summaries.experiments.destinationHref).toBe(experimentsHub);
    expect(summaries.character.destinationHref).toBe(characterLab);
  });

  it('7. no duplicate Character Lab route created', () => {
    const routes = readFileSync(join(ROOT, 'src/routes/Site00Routes.tsx'), 'utf8');
    const routeDefs = routes.match(/path=\{SITE00_ROUTES\.projectFounderCharacterDiscovery\}/g) ?? [];
    expect(routeDefs.length).toBe(1);
    expect(routes).toContain('ProjectLabHubPage');
    expect(routes).not.toMatch(/ProjectCharacterLabPage/);
  });

  it('8-11. deep links preserved for Experiment 01, discovery, casting, continuity', () => {
    expect(experiment01).toBe('/projects/ndxbook/marketing-expression/experiment-01');
    expect(characterLab).toBe('/projects/ndxbook/character/discovery');
    expect(casting).toBe('/projects/ndxbook/character/casting');
    expect(continuity).toBe('/projects/ndxbook/character/continuity');
  });

  it('12-15. Lab bottom-nav route group active on lab, experiment, character, casting, continuity', () => {
    expect(isNdxLabRouteGroupPath(labHub, SLUG)).toBe(true);
    expect(isNdxLabRouteGroupPath(experiment01, SLUG)).toBe(true);
    expect(isNdxLabRouteGroupPath(experimentsHub, SLUG)).toBe(true);
    expect(isNdxLabRouteGroupPath(characterLab, SLUG)).toBe(true);
    expect(isNdxLabRouteGroupPath(casting, SLUG)).toBe(true);
    expect(isNdxLabRouteGroupPath(continuity, SLUG)).toBe(true);
    expect(isNdxLabRouteGroupPath('/projects/ndxbook/content-operations', SLUG)).toBe(false);
  });

  it('16. notification deep links target exact destinations (not Lab Hub)', () => {
    const slideHref = resolveNotificationActionHref(SLUG, {
      category: 'GENERATION_COMPLETE',
      actionTarget: null,
      sourceEntityType: 'SLIDE',
      sourceEntityId: 'slide-1',
    });
    expect(slideHref).toContain('founder-creative-ingest');
    const characterHref = resolveNotificationActionHref(SLUG, {
      category: 'CHARACTER_UPDATE',
      actionTarget: null,
      sourceEntityType: 'CHARACTER_ASSET',
      sourceEntityId: 'asset-1',
    });
    expect(characterHref).toContain('character/casting');
    expect(characterHref).not.toContain('/lab');
  });

  it('17. project menu unchanged (no Character Lab primary in ellipsis)', () => {
    const menu = ndxFounderWorkspaceMenuItems(SLUG);
    expect(menu.some((m) => m.label.includes('CHARACTER LAB'))).toBe(false);
    expect(menu.some((m) => m.id === 'inspect')).toBe(true);
  });

  it('18-19. mobile + desktop Lab Hub use NDX workspace shell', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectLabHubPage.tsx'), 'utf8');
    const layer = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/LabHubOperateLayer.tsx'), 'utf8');
    expect(page).toContain('NdxFounderWorkspacePage');
    expect(page).toContain('LabHubOperateLayer');
    expect(layer).toContain('site00-lab-hub__destinations');
  });

  it('resolveMobileScreenIdFromPath registers lab-hub', () => {
    expect(resolveMobileScreenIdFromPath(labHub, SLUG)).toBe('lab-hub');
    expect(resolveMobileScreenIdFromPath(experiment01, SLUG)).toBe('experiment-01');
    expect(resolveMobileScreenIdFromPath(characterLab, SLUG)).toBe('character-lab');
  });

  it('route group member resolution', () => {
    expect(resolveNdxLabRouteGroupMember(labHub, SLUG)).toBe('lab-hub');
    expect(resolveNdxLabRouteGroupMember(casting, SLUG)).toBe('casting');
    expect(resolveNdxLabRouteGroupMember(continuity, SLUG)).toBe('continuity');
  });

  it('back paths from Experiments Hub and Character Lab to Lab Hub', () => {
    const experimentsLayer = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/ExperimentsHubOperateLayer.tsx'),
      'utf8',
    );
    const characterPage = readFileSync(join(ROOT, 'src/site00/pages/ProjectFounderCharacterDiscoveryPage.tsx'), 'utf8');
    const hubNav = readFileSync(join(ROOT, 'src/site00/components/projects/ProjectExperimentsHubNav.tsx'), 'utf8');
    expect(experimentsLayer).toContain('LabHubBackLink');
    expect(characterPage).toContain('LabHubBackLink');
    expect(hubNav).toContain('site00ProjectLabPath');
  });

  it('evaluation passes for canonical P0.NAV.1 wiring', () => {
    const desktopNav = ndxFounderWorkspaceBottomNav(SLUG);
    const labHref = desktopNav.find((i) => i.id === 'LAB')?.href ?? '';
    const result = evaluateLabNavigation({
      bottomNavLabHref: labHref,
      labHubRoute: labHub,
      experimentsHubRoute: experimentsHub,
      characterLabRoute: characterLab,
      characterLabRouteCount: 1,
      labHubHasExperimentsEntry: true,
      labHubHasCharacterEntry: true,
      experimentsBackPathToLab: true,
      characterBackPathToLab: true,
      labActiveOnLabHub: isNdxLabRouteGroupPath(labHub, SLUG),
      labActiveOnExperimentRoute: isNdxLabRouteGroupPath(experiment01, SLUG),
      labActiveOnCharacterRoute: isNdxLabRouteGroupPath(characterLab, SLUG),
      labActiveOnCastingRoute: isNdxLabRouteGroupPath(casting, SLUG),
      labActiveOnContinuityRoute: isNdxLabRouteGroupPath(continuity, SLUG),
      usesNdxWorkspaceShell: true,
    });
    expect(result.pass).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('BOTTOM_NAV_LAB_ROUTES_DIRECTLY_TO_EXPERIMENT_01 is false after fix', () => {
    const mobileNav = ndxFounderWorkspaceMobileNav(SLUG);
    const lab = mobileNav.find((i) => i.id === 'lab');
    expect(lab?.href).not.toBe(experiment01);
    expect(lab?.href).toBe(ndxLabRouteGroupPath(SLUG));
  });

  it('canonical lab icon geometry unchanged', () => {
    const icons = readFileSync(join(ROOT, 'shared/site00-studio-world-ui/icons/ndx/v3/lab.svg'), 'utf8');
    expect(icons).toContain('data-ndx-canon="v3"');
    expect(icons).toContain('<path d="M10.5 5 V8.75 L7 18.5 H17 L13.5 8.75 V5"/>');
  });
});
