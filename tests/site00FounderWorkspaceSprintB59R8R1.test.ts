/**
 * B5.9R8R1 — Runtime client-view branch elimination + bundle verification.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {
  buildProjectsViewData,
} from '../shared/site00-projects/projectsViewDataAdapter.js';
import {
  auditProjectsIndexShellInvariance,
  assertProjectsMetricSlotCount,
} from '../shared/site00-projects/projectViewModeShellQA.js';
import {
  PROJECTS_PAGE_SHELL_CONFIG,
  PROJECTS_METRIC_SLOT_COUNT,
} from '../shared/site00-projects/projectsPageShellConfig.js';
import { buildProjectIndexItemsFromEntries } from '../shared/site00-projects/buildProjectIndexItems.js';
import { PROJECT_INDEX_CANONICAL_ORDER } from '../shared/site00-projects/projectIndexOrder.js';
import type { Site00ProjectIndexEntry } from '../shared/site00-projects/types.js';

const ROOT = join(import.meta.dirname, '..');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');
const HERO = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexHero.tsx'), 'utf8');
const SUMMARY = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexSummary.tsx'), 'utf8');
const SHELL = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectsPageShell.tsx'), 'utf8');
const LEGACY_HEADER = join(ROOT, 'src/site00/components/projectIndex/ProjectIndexHeader.tsx');

function syntheticEntry(slug: string): Site00ProjectIndexEntry {
  return {
    slug,
    name: slug,
    displayName: slug.replace(/-/g, ' ').toUpperCase(),
    organizationSlug: slug,
    organizationUuid: slug,
    classification: 'INTERNAL_BRAND',
    currentSystem: 'SITE 00',
    currentPhase: 'IN PROGRESS',
    focusNow: null,
    lastActivity: new Date().toISOString(),
    surfaces: [],
    detailRoute: `/projects/${slug}/overview`,
  };
}

describe('B5.9R8R1 runtime client-view branch elimination', () => {
  it('1. legacy ProjectIndexHeader.tsx removed', () => {
    expect(existsSync(LEGACY_HEADER)).toBe(false);
  });

  it('2. shell audit passes with runtime markers', () => {
    const audit = auditProjectsIndexShellInvariance({
      indexPage: INDEX_PAGE,
      hero: HERO,
      summary: SUMMARY,
      shell: SHELL,
      legacyHeaderExists: existsSync(LEGACY_HEADER),
    });
    expect(audit.ok).toBe(true);
  });

  it('3. hero uses static shell config only', () => {
    expect(HERO).toContain('PROJECTS_PAGE_SHELL_CONFIG');
    expect(HERO).toContain('data-site00-hero="shared"');
    expect(PROJECTS_PAGE_SHELL_CONFIG.tagline).toBe('ALL PROJECTS. ONE SYSTEM.');
  });

  it('4–5. metric arrays always length 4', () => {
    expect(PROJECTS_METRIC_SLOT_COUNT).toBe(4);
    const founderItems = buildProjectIndexItemsFromEntries(PROJECT_INDEX_CANONICAL_ORDER.map(syntheticEntry));
    const founder = buildProjectsViewData({
      viewMode: 'FOUNDER',
      founderItems,
      clientItems: [],
      projectItems: founderItems,
      availableFilters: ['ALL'],
      showFilteredEmpty: false,
    });
    const client = buildProjectsViewData({
      viewMode: 'CLIENT',
      founderItems,
      clientItems: [],
      projectItems: [],
      availableFilters: ['ALL'],
      showFilteredEmpty: true,
    });
    expect(founder.summaryTiles).toHaveLength(4);
    expect(client.summaryTiles).toHaveLength(4);
    assertProjectsMetricSlotCount(founder.summaryTiles);
    assertProjectsMetricSlotCount(client.summaryTiles);
  });

  it('6. client labels are YOUR PROJECTS / ACTIVE / IN REVIEW / COMPLETE', () => {
    const data = buildProjectsViewData({
      viewMode: 'CLIENT',
      founderItems: [],
      clientItems: [],
      projectItems: [],
      availableFilters: ['ALL'],
      showFilteredEmpty: true,
    });
    expect(data.summaryTiles.map((t) => t.label)).toEqual([
      'YOUR PROJECTS',
      'ACTIVE',
      'IN REVIEW',
      'COMPLETE',
    ]);
  });

  it('7. page tree markers for runtime DOM QA', () => {
    expect(INDEX_PAGE).toContain('data-site00-shell="projects"');
    expect(INDEX_PAGE).toContain('data-site00-view-mode');
    expect(SUMMARY).toContain('data-site00-metrics="shared"');
  });

  it('8. no simulation banner import on index page', () => {
    expect(INDEX_PAGE).not.toContain('ProjectIndexClientSimulationBanner');
    expect(INDEX_PAGE).not.toContain('RETURN TO FOUNDER VIEW');
  });

  it('9. production index bundle excludes legacy /projects client variant strings', () => {
    if (!existsSync(join(ROOT, 'dist/index.html'))) {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
    }
    const out = execSync('node scripts/verify-projects-index-bundle.mjs', { cwd: ROOT, encoding: 'utf8' });
    const report = JSON.parse(out) as { ok: boolean; expectedBundle: string; failures: unknown[] };
    expect(report.ok).toBe(true);
    expect(report.expectedBundle).toMatch(/^index\.[A-Za-z0-9_-]+\.js$/);
  });
});

describe('B5.9R8R1 codebase string audit', () => {
  it('YOUR PROJECTS. ONE SYSTEM. not in active hero component', () => {
    expect(HERO).not.toContain('YOUR PROJECTS. ONE SYSTEM.');
  });

  it('site00-pidx-client-banner CSS is deprecated only', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');
    expect(css).toContain('site00-pidx-client-banner');
    expect(INDEX_PAGE).not.toContain('site00-pidx-client-banner');
  });
});
