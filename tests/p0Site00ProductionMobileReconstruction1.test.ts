/**
 * P0.SITE00-PRODUCTION-WORKSPACE-MOBILE-VISUAL-RECONSTRUCTION-SONNET1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PROJECT_REQUEST_ACTIONS,
  productionRequestScope,
  productionRequestTitle,
} from '../shared/site00-production-workspace/requestCatalog.js';
import { createProductionWorkspaceRequest } from '../shared/site00-production-workspace/projectProductionSummary.js';
import {
  PRODUCTION_TOP_LEVEL_WORKSPACES,
  subWorkspacesFor,
} from '../shared/site00-production-workspace/registry.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import {
  buildEntry002ProductionCastState,
  evaluateCastGate,
} from '../shared/site00-studio-world/acting-catalogue/index.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('P0 production mobile reconstruction', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('production hub renders exactly the three registry pillars', () => {
    expect([...PRODUCTION_TOP_LEVEL_WORKSPACES]).toEqual(['DESIGN', 'EXPERIENCE', 'EXPRESSION']);
    const hub = read('src/site00/pages/production/ProductionWorkspaceHubPage.tsx');
    expect(hub).toContain('PRODUCTION_TOP_LEVEL_WORKSPACES.map');
    expect(hub).not.toMatch(/CASTING|WARDROBE|PERFORMANCE/);
  });

  it('expression landing lists every registry sub-workspace and mounts a purpose-built screen for each', () => {
    const page = read('src/site00/pages/production/ExpressionProductionShellPage.tsx');
    for (const sub of subWorkspacesFor('EXPRESSION')) {
      expect(page).toContain(`case '${sub.id}'`);
    }
    const screens = read('src/site00/components/production/ExpressionSubScreens.tsx');
    for (const id of ['narrative', 'casting', 'wardrobe', 'performance', 'sets', 'storyboard', 'review']) {
      expect(screens).toContain(`expression-sub-screen-${id}`);
    }
  });

  it('libraries and queue are admin-guarded static leaves under the existing /production root', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    const cfg = read('src/site00/config/routes.ts');
    expect(cfg).toContain("productionLibraries: '/production/libraries'");
    expect(cfg).toContain("productionQueue: '/production/queue'");
    for (const page of ['ProductionLibrariesPage', 'ProductionQueuePage']) {
      const idx = routes.indexOf(`<${page} />`);
      expect(idx).toBeGreaterThan(0);
      expect(routes.slice(idx - 220, idx)).toContain('Site00InternalProductionGuard');
    }
    // Static leaves must be declared before the dynamic :projectSlug route.
    expect(routes.indexOf('SITE00_ROUTES.productionLibraries')).toBeLessThan(routes.indexOf('path={SITE00_ROUTES.productionProject}'));
  });

  it('every project action becomes a structured production request', () => {
    expect(PROJECT_REQUEST_ACTIONS.map((a) => a.kind)).toEqual([
      'DESIGN_REVISION',
      'EXPRESSION_NEW_CAMPAIGN',
      'EXPRESSION_NEW_CHARACTER',
      'EXPRESSION_WARDROBE_UPDATE',
      'EXPRESSION_SET_CHANGE',
      'UPLOAD_REFERENCES',
    ]);
    const targets = PROJECT_REQUEST_ACTIONS.map((a) => {
      const r = createProductionWorkspaceRequest({ projectSlug: 'ndxbook', kind: a.kind });
      return [r.targetWorkspace, r.targetSubWorkspace];
    });
    expect(targets).toEqual([
      ['DESIGN', 'work'],
      ['EXPRESSION', 'narrative'],
      ['EXPRESSION', 'casting'],
      ['EXPRESSION', 'wardrobe'],
      ['EXPRESSION', 'sets'],
      ['GENERAL', null],
    ]);
    expect(productionRequestTitle('EXPRESSION_SET_CHANGE')).toBe('Set adjustment');
    expect(productionRequestScope('EXPRESSION_NEW_CHARACTER')).toBe('Expression · Casting');
  });

  it('device request store round-trips a submitted request', async () => {
    const mem: Record<string, string> = {};
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => mem[k] ?? null,
        setItem: (k: string, v: string) => {
          mem[k] = v;
        },
      },
      dispatchEvent: () => true,
    });
    const { submitProductionRequest } = await import('../src/site00/state/productionRequestStore.js');
    const req = submitProductionRequest({ projectSlug: 'ndxbook', kind: 'EXPRESSION_NEW_CHARACTER' });
    expect(req.status).toBe('QUEUED');
    const stored = JSON.parse(mem['site00.production.requests.v1']!);
    expect(stored[0].kind).toBe('EXPRESSION_NEW_CHARACTER');
    expect(stored[0].projectSlug).toBe('ndxbook');
  });

  it('Projects surfaces never embed Production machinery', () => {
    const files = [
      'src/site00/components/projectIndex/PersonalProjectsMobile.tsx',
      'src/site00/components/projectIndex/PersonalProjectMobileDetail.tsx',
      'src/site00/components/projectIndex/ProjectActionsSheet.tsx',
    ];
    for (const f of files) {
      const src = read(f);
      expect(src, f).not.toMatch(/ExpressionSubScreens|DesignWorkspaceCore|acting-catalogue|ProductionWorkspaceProvider|listDesignEnabledManagedProjects|productionWorkspacePath|productionAdminDeepLink/);
    }
    const idx = read('src/site00/components/projectIndex/ProjectIndexPage.tsx');
    expect(idx).toContain('PersonalProjectsMobile');
    expect(idx).toContain('canAccessAdminPages');
    expect(idx).toContain('ProjectProductionSummaryStrip');
  });

  it('personal projects exclude client work', async () => {
    const { isPersonalProject, projectStatusLabel } = await import('../src/site00/components/projectIndex/PersonalProjectsMobile.js');
    const base = { projectId: 'ndxbook', openRoute: '/projects/ndxbook/overview' } as never;
    expect(isPersonalProject({ ...(base as object), ownerType: 'FOUNDER' } as never)).toBe(true);
    expect(isPersonalProject({ ...(base as object), ownerType: 'CLIENT' } as never)).toBe(false);
    expect(projectStatusLabel({ status: 'ACTIVE' } as never).label).toBe('IN PRODUCTION');
    expect(projectStatusLabel({ status: 'NOT_STARTED' } as never).label).toBe('PLANNING');
  });

  it('project detail only swaps in on mobile, for admin, personal projects', () => {
    const src = read('src/site00/pages/ProjectOperatingModulePage.tsx');
    expect(src).toContain('PersonalProjectMobileDetail');
    expect(src).toMatch(/!isWide\s*&&[\s\S]*canAccessAdminPages\(\)[\s\S]*!project\.classification\.includes\('CLIENT'\)/);
  });

  it('bottom navs follow the reference (production 4 tabs; projects 5 with production admin-only)', () => {
    const frame = read('src/site00/components/production/PwFrame.tsx');
    expect(frame).toContain("'PROJECTS'");
    expect(frame).toContain("label: 'SYSTEM'");
    expect(frame).toContain('...(admin ?');
    expect(frame).toContain('createPortal');
  });

  it('entry 002 package readiness is derived from canonical data', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const gate = evaluateCastGate(buildEntry002ProductionCastState());
    expect(plan.beats).toHaveLength(7);
    expect(typeof gate.allRequiredCharactersLocked).toBe('boolean');
    const hook = read('src/site00/components/production/useEntry002Production.ts');
    for (const id of ['narrative', 'cast', 'wardrobe', 'performance', 'sets', 'storyboard']) {
      expect(hook).toContain(`id: '${id}'`);
    }
  });

  it('host palette stays SITE 00 red — no project lime in the production shell css', () => {
    const css = read('src/site00/styles/site00-production-mobile.css');
    expect(css).toContain('--pw-red');
    expect(css.toLowerCase()).not.toContain('#c8f542');
  });
});
