/**
 * P0.VR.DESIGN-REGRESSION-RECOVERY1
 *
 * Guards against the EXPERIENCE merge regression (PR #1008 @ 3986143e) that deleted
 * project-level DESIGN surfaces and reverted tab sections to overlay-only grammar.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const PROJECT_SURFACE_PATHS = [
  'src/site00/components/designBench/production/designProjectSurfaceKit.tsx',
  'src/site00/styles/site00-design-project-surface.css',
  'src/site00/components/designBench/production/projectTabs/ProjectReferencesSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectAssetsSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectPagesSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectSkinsSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectHistorySurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectMoreSurface.tsx',
  'src/site00/components/designBench/production/projectTabs/ProjectWorkspaceDrawer.tsx',
] as const;

describe('P0.VR.DESIGN-REGRESSION-RECOVERY1', () => {
  it('project surface kit and tab modules exist (not deleted by EXPERIENCE merge)', () => {
    for (const rel of PROJECT_SURFACE_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    const kit = read('src/site00/components/designBench/production/designProjectSurfaceKit.tsx');
    expect(kit).toContain('ProjectSurface');
    expect(kit).toContain('ProjectActionBar');
    const css = read('src/site00/styles/site00-design-project-surface.css');
    expect(css.length).toBeGreaterThan(1500);
    expect(css).toContain('.tod-ps');
  });

  it('production DESIGN sections use project tab surfaces (not overlay-only fallback)', () => {
    const sections = read('src/site00/components/designBench/production/DesignProductionSections.tsx');
    expect(sections).toContain('P0.VR.DESIGN.OPUS-PROJECT-TABS1');
    expect(sections).toContain('ProjectReferencesSurface');
    expect(sections).toContain('ProjectAssetsSurface');
    expect(sections).not.toContain('OverlayBody');
    expect(sections).not.toContain('TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH');
  });

  it('DesignWorkspaceCore loads NEW_WORKSPACE twin shell + project surface CSS', () => {
    const core = read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx');
    expect(core).toContain('TwinOpusDirectScreen');
    expect(core).toContain('site00-design-project-surface.css');
    expect(core).toContain('NEW_WORKSPACE');
    expect(core).not.toContain('site00-experience-workspace.css');
  });

  it('canonical production route and legacy redirect stay separate from EXPERIENCE', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('DesignProductionWorkspaceLayout');
    expect(routes).toContain('DesignLegacyProjectDesignRedirect');
    expect(routes).toContain('ProjectExperienceModuleGate');
    const expRoute = routes.slice(routes.indexOf('path={SITE00_ROUTES.projectExperience}'));
    expect(expRoute).toContain('<Site00Layout>');
    const expCss = read('src/site00/styles/site00-experience-workspace.css');
    expect(expCss).toContain('.site00-expws');
    expect(expCss).not.toMatch(/^\.workspace\b/m);
  });

  it('legacy /projects/:slug/design redirects to /projects/design/:slug', () => {
    const legacy = read('src/site00/pages/DesignLegacyProjectDesignRedirect.tsx');
    expect(legacy).toContain('/projects/design/');
  });
});
