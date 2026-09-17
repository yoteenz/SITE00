/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildDesignModuleHierarchy,
  buildDesignProjectIntelligence,
  buildProjectDesignPageRegistry,
  compileDesignPageContext,
  formatDesignModuleBreadcrumb,
} from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { resolveLegacyProjectDesignRedirect } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { site00ProjectDesignPath } from '../src/site00/config/routes';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-PROJECT-BINDING1R1', () => {
  it('canonical hierarchy is PROJECTS > DESIGN > ACTIVE PROJECT', () => {
    const segments = buildDesignModuleHierarchy({
      activeProjectId: 'ndxbook',
      activeProjectLabel: 'NDXBOOK',
    });
    expect(formatDesignModuleBreadcrumb(segments)).toBe('PROJECTS > DESIGN > NDXBOOK');
  });

  it('canonical design path is /projects/design/:slug', () => {
    expect(site00ProjectDesignPath('ndxbook')).toBe('/projects/design/ndxbook');
    const resolution = resolveLegacyProjectDesignRedirect('ndxbook', '');
    expect(resolution.target.pathname).toBe('/projects/design/ndxbook');
  });

  it('binds NDXBOOK page registry from route discovery (no empty registry)', () => {
    const pages = buildProjectDesignPageRegistry('ndxbook').filter((p) => !p.isConceptOrphan);
    expect(pages.length).toBeGreaterThan(3);
    expect(pages.some((p) => p.screenId === 'overview')).toBe(true);
    expect(pages.some((p) => p.screenId === 'cultural-intelligence')).toBe(true);
  });

  it('separates concept candidates from real site pages on overview model', () => {
    const all = buildProjectDesignPageRegistry('ndxbook');
    const concept = all.find((p) => p.isConceptOrphan);
    expect(concept?.pageRole).toBe('CONCEPT_CANDIDATE');
    expect(all.filter((p) => !p.isConceptOrphan).every((p) => p.pageRole !== 'CONCEPT_CANDIDATE')).toBe(true);
  });

  it('project intelligence summarizes page design completion', () => {
    const intel = buildDesignProjectIntelligence('ndxbook');
    expect(intel?.displayName).toBe('NDXBOOK');
    expect(intel?.totalPages).toBeGreaterThan(0);
    expect(intel!.pagesApproved + intel!.pagesNeedingDesign + intel!.pagesInReview).toBeGreaterThan(0);
  });

  it('compiles page-scoped context for Opus contract (no Opus call)', () => {
    const page = buildProjectDesignPageRegistry('ndxbook').find((p) => p.screenId === 'overview');
    expect(page).toBeTruthy();
    const ctx = compileDesignPageContext('ndxbook', page!.pageId);
    expect(ctx?.activeModule).toBe('DESIGN');
    expect(ctx?.activeProjectId).toBe('ndxbook');
    expect(ctx?.route).toContain('/projects/ndxbook');
  });

  it('routes register DESIGN module hub and legacy redirect', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('projectsDesignModule');
    expect(routes).toContain('projectsDesignActiveProject');
    expect(routes).toContain('DesignLegacyProjectDesignRedirect');
    expect(routes).toContain('DesignProjectsDesignHubPage');
  });
});
