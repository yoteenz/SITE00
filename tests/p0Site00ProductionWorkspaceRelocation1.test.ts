/**
 * P0.SITE00-PRODUCTION-WORKSPACE-RELOCATION-AND-ADMIN-BOUNDARY1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildProjectsViewData } from '../shared/site00-projects/projectsViewDataAdapter.js';
import {
  PRODUCTION_TOP_LEVEL_WORKSPACES,
  isSubWorkspaceUnderExpression,
  productionTopLevelWorkspaceCount,
  subWorkspacesFor,
} from '../shared/site00-production-workspace/registry.js';
import {
  legacyProjectsDesignRedirectTarget,
  productionDesignPath,
  PRODUCTION_WORKSPACE_ROOT,
} from '../shared/site00-production-workspace/routes.js';
import {
  mergeProductionContextOnWorkspaceSwitch,
  writeProductionWorkspaceContext,
} from '../shared/site00-production-workspace/productionContextStorage.js';
import { createProductionWorkspaceRequest } from '../shared/site00-production-workspace/projectProductionSummary.js';
import { buildCanonicalDesignWorkspacePath } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0 production workspace relocation', () => {
  it('production route root is /production', () => {
    expect(PRODUCTION_WORKSPACE_ROOT).toBe('/production');
    expect(read('src/site00/config/routes.ts')).toContain("productionWorkspace: '/production'");
  });

  it('route wiring — admin guard wraps production hub and project shell', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('Site00InternalProductionGuard');
    expect(routes).toContain('ProductionWorkspaceHubPage');
    expect(routes).toContain('ProductionWorkspaceProjectLayout');
    expect(routes).toContain('ExperienceProductionShellPage');
    expect(routes).toContain('ExpressionProductionShellPage');
  });

  it('internal production guard enforces sign-in and admin pages', () => {
    const guard = read('src/site00/components/guards/Site00InternalProductionGuard.tsx');
    expect(guard).toContain('canAccessAdminPages');
    expect(guard).toContain('productionAccessDenied');
  });

  it('production nav is admin-only in ecosystem config', () => {
    expect(read('src/site00/config/ecosystem-nav.ts')).toContain('adminOnly: true');
    expect(read('src/site00/components/ecosystem/OperatingWorldTopNav.tsx')).toContain('canAccessAdminPages');
  });

  it('exactly three top-level production workspaces', () => {
    expect(productionTopLevelWorkspaceCount()).toBe(3);
    expect([...PRODUCTION_TOP_LEVEL_WORKSPACES]).toEqual(['DESIGN', 'EXPERIENCE', 'EXPRESSION']);
  });

  it('casting, wardrobe, performance, sets nest under expression', () => {
    for (const id of ['casting', 'wardrobe', 'performance', 'sets'] as const) {
      expect(isSubWorkspaceUnderExpression(id)).toBe(true);
      expect(subWorkspacesFor('EXPRESSION').some((s) => s.id === id)).toBe(true);
    }
    expect(subWorkspacesFor('DESIGN').some((s) => s.id === 'casting')).toBe(false);
    expect(subWorkspacesFor('EXPERIENCE').some((s) => s.id === 'casting')).toBe(false);
  });

  it('design removed from projects index adapter (summary-only on page)', () => {
    const data = buildProjectsViewData({
      viewMode: 'FOUNDER',
      founderItems: [],
      clientItems: [],
      projectItems: [],
      availableFilters: ['ALL'],
      showFilteredEmpty: false,
    });
    expect(data.showDesignCard).toBe(false);
    expect(data.designItem).toBeNull();
    expect(data.showExperienceCard).toBe(false);
    expect(read('src/site00/components/projectIndex/ProjectIndexPage.tsx')).toContain('ProjectProductionSummaryStrip');
    expect(read('src/site00/components/projectIndex/ProjectIndexPage.tsx')).not.toContain('ProjectIndexDesignCard');
  });

  it('design canonical paths live under production', () => {
    expect(buildCanonicalDesignWorkspacePath({ project: 'ndxbook' })).toBe('/production/ndxbook/design');
    expect(productionDesignPath('ndxbook')).toBe('/production/ndxbook/design');
  });

  it('legacy /projects/design/:slug redirects to production design', () => {
    expect(legacyProjectsDesignRedirectTarget('ndxbook', 'pages', '?tab=skins')).toBe(
      '/production/ndxbook/design/pages?tab=skins',
    );
  });

  it('production context persists project across workspace switch', () => {
    const seeded = writeProductionWorkspaceContext({
      projectSlug: 'ndxbook',
      activeWorkspace: 'DESIGN',
      campaignId: null,
      entryId: null,
      entryLabel: null,
    });
    expect(seeded.projectSlug).toBe('ndxbook');
    const next = mergeProductionContextOnWorkspaceSwitch('ndxbook', 'EXPERIENCE');
    expect(next.projectSlug).toBe('ndxbook');
    expect(next.activeWorkspace).toBe('EXPERIENCE');
  });

  it('expression campaign entry persists in context state', () => {
    const ctx = writeProductionWorkspaceContext({
      projectSlug: 'ndxbook',
      activeWorkspace: 'EXPRESSION',
      campaignId: 'ndxbook-campaign',
      entryId: '002',
      entryLabel: 'ENTRY 002',
    });
    expect(ctx.entryId).toBe('002');
    expect(ctx.campaignId).toBe('ndxbook-campaign');
  });

  it('project action requests map to production targets without exposing routes to clients', () => {
    const req = createProductionWorkspaceRequest({
      projectSlug: 'ndxbook',
      kind: 'EXPRESSION_NEW_CHARACTER',
    });
    expect(req.targetWorkspace).toBe('EXPRESSION');
    expect(req.targetSubWorkspace).toBe('casting');
    const strip = read('src/site00/components/projectIndex/ProjectProductionSummaryStrip.tsx');
    expect(strip).toContain('REVIEW DESIGN');
    expect(strip).toContain('open-in-production-admin');
    expect(strip).toContain('canAccessAdminPages');
  });

  it('commercial fulfillment adapter points design workspace at production', () => {
    expect(read('shared/site00-commercial-canon/adapters/registerAll.ts')).toContain('/production/');
  });
});
