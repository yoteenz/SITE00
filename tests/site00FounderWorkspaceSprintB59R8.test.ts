/**
 * B5.9R8 — View-mode shell invariance + panel-only data substitution.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildProjectsViewData,
  buildProjectsFilterChips,
} from '../shared/site00-projects/projectsViewDataAdapter.js';
import {
  auditProjectsIndexShellInvariance,
  VIEW_MODE_DYNAMIC_REGIONS,
} from '../shared/site00-projects/projectViewModeShellQA.js';
import { computeProjectIndexSummaryMetrics } from '../shared/site00-projects/projectIndexMetrics.js';
import { buildProjectIndexItemsFromEntries } from '../shared/site00-projects/buildProjectIndexItems.js';
import { runProjectIndexStaleDataQA } from '../shared/site00-projects/projectIndexStaleDataQA.js';
import type { Site00ProjectIndexEntry } from '../shared/site00-projects/types.js';
import { PROJECT_INDEX_CANONICAL_ORDER } from '../shared/site00-projects/projectIndexOrder.js';
import { PROJECTS_PAGE_SHELL_CONFIG } from '../shared/site00-projects/projectsPageShellConfig.js';

const ROOT = join(import.meta.dirname, '..');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');
const HERO = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexHero.tsx'), 'utf8');
const SUMMARY = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexSummary.tsx'), 'utf8');
const SHELL = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectsPageShell.tsx'), 'utf8');
const VIEW_STRIP = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexViewStrip.tsx'), 'utf8');
const ADAPTER = readFileSync(join(ROOT, 'shared/site00-projects/projectsViewDataAdapter.ts'), 'utf8');
const HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useProjectIndex.ts'), 'utf8');
const CONTEXT = readFileSync(join(ROOT, 'src/site00/context/ProjectViewModeContext.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');

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

describe('B5.9R8 View-mode shell invariance', () => {
  it('1. founder and client use same ProjectsPageShell', () => {
    expect(INDEX_PAGE).toContain('ProjectsPageShell');
    expect(INDEX_PAGE).not.toContain('ClientProjectsPage');
    const audit = auditProjectsIndexShellInvariance({ indexPage: INDEX_PAGE, hero: HERO, summary: SUMMARY, shell: SHELL });
    expect(audit.ok).toBe(true);
  });

  it('2. no separate ClientProjectsPage tree', () => {
    expect(INDEX_PAGE).not.toMatch(/viewMode\s*===\s*['"]CLIENT['"][\s\S]*return\s*</);
  });

  it('3. hero copy is identical in both modes', () => {
    expect(HERO).toContain('PROJECTS_PAGE_SHELL_CONFIG');
    expect(PROJECTS_PAGE_SHELL_CONFIG.tagline).toBe('ALL PROJECTS. ONE SYSTEM.');
    expect(HERO).not.toContain('YOUR PROJECTS');
    expect(HERO).not.toContain('clientView');
  });

  it('4–6. hero geometry, planet, toggle remain mounted', () => {
    expect(SHELL).toContain('ProjectIndexHero');
    expect(SHELL).toContain('ProjectIndexViewStrip');
    expect(HERO).toContain('ProjectsHeaderPlanet');
    expect(INDEX_PAGE).not.toContain('ProjectIndexClientSimulationBanner');
  });

  it('7–8. toggle active side follows view mode', () => {
    expect(VIEW_STRIP).toContain("viewMode === 'FOUNDER'");
    expect(VIEW_STRIP).toContain('is-active');
    expect(VIEW_STRIP).toContain('data-dynamic-region="toggle-active-state"');
  });

  it('9. no separate client-view black bar on index', () => {
    expect(INDEX_PAGE).not.toContain('ProjectIndexClientSimulationBanner');
    expect(INDEX_PAGE).not.toContain('RETURN TO FOUNDER VIEW');
  });

  it('10. admin control center row preserved in shell', () => {
    expect(VIEW_STRIP).toContain('ADMIN CONTROL CENTER');
    expect(SHELL).toContain('ProjectIndexViewStrip');
  });

  it('11. metric grid remains 2x2 mobile / 4-col desktop', () => {
    expect(SUMMARY).toContain('site00-pidx-summary');
    expect(SUMMARY).not.toContain('site00-pidx-summary--client');
    expect(CSS).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(CSS).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))');
  });

  it('12–14. founder vs client metric data + no false counts', () => {
    const founderItems = buildProjectIndexItemsFromEntries(PROJECT_INDEX_CANONICAL_ORDER.map(syntheticEntry));
    const founderData = buildProjectsViewData({
      viewMode: 'FOUNDER',
      founderItems,
      clientItems: [],
      projectItems: founderItems,
      availableFilters: ['ALL', 'ACTIVE'],
      showFilteredEmpty: false,
    });
    expect(founderData.summaryTiles[0]?.label).toBe('TOTAL PROJECTS');
    expect(founderData.summaryTiles[0]?.value).toBe('05');

    const clientData = buildProjectsViewData({
      viewMode: 'CLIENT',
      founderItems,
      clientItems: [],
      projectItems: [],
      availableFilters: ['ALL', 'ACTIVE'],
      showFilteredEmpty: true,
    });
    expect(clientData.summaryTiles[0]?.label).toBe('YOUR PROJECTS');
    expect(clientData.summaryTiles[0]?.value).toBe('00');
    expect(clientData.summaryTiles[1]?.value).toBe('00');
  });

  it('15. project dataset changes by permission in hook', () => {
    expect(HOOK).toContain("viewMode === 'CLIENT' ? clientItems : founderItems");
    expect(ADAPTER).toContain('resolveProjectsIndexItems');
  });

  it('16–18. search, filter, pills stay in shell', () => {
    expect(SHELL).toContain('ProjectIndexControls');
    expect(SHELL).toContain('ProjectIndexFilterChips');
    expect(SHELL).toMatch(/ProjectIndexHero[\s\S]*ProjectIndexViewStrip[\s\S]*ProjectIndexSummary[\s\S]*ProjectIndexControls[\s\S]*ProjectIndexFilterChips/);
  });

  it('19. filter pills stay in same container with disabled founder-only chips', () => {
    const chips = buildProjectsFilterChips({ clientView: true, available: ['ALL', 'ACTIVE'] });
    expect(chips).toHaveLength(8);
    expect(chips.find((c) => c.filter === 'FOUNDER')?.disabled).toBe(true);
    expect(chips.find((c) => c.filter === 'CLIENT')?.disabled).toBe(true);
    expect(SUMMARY).toContain('allFilters');
  });

  it('20. client firewall holds', () => {
    const qa = runProjectIndexStaleDataQA({
      items: [
        {
          ...buildProjectIndexItemsFromEntries([syntheticEntry('frontal-slayer')])[0]!,
          internalProject: true,
          clientFacing: false,
        },
      ],
      viewMode: 'CLIENT',
      indexStateVersion: 1,
    });
    expect(qa.ok).toBe(false);
    expect(qa.failures.some((f) => f.class === 'CLIENT_PROJECT_LEAK')).toBe(true);
  });

  it('21. scroll position preserved on toggle', () => {
    expect(CONTEXT).toContain('window.scrollY');
    expect(CONTEXT).toContain('window.scrollTo');
  });

  it('22–23. shell QA + dynamic region map', () => {
    expect(VIEW_MODE_DYNAMIC_REGIONS).toContain('metric-card-content');
    expect(VIEW_MODE_DYNAMIC_REGIONS).toContain('project-card-content');
    expect(INDEX_PAGE).toContain('data-dynamic-region');
  });

  it('24–25. design card shell placeholder preserves layout in client view', () => {
    expect(INDEX_PAGE).toContain('interactive={designRender.interactive}');
    expect(INDEX_PAGE).toContain('showDesignCard');
    expect(ADAPTER).toContain('showDesignCard: true');
  });

  it('26. adapter owns panel substitution not structure', () => {
    expect(HOOK).toContain('buildProjectsViewData');
    expect(ADAPTER).toContain('ProjectsViewData');
    expect(ADAPTER).toContain('summaryTiles');
  });
});

describe('B5.9R8 adapter unit metrics', () => {
  it('founder metrics match computeProjectIndexSummaryMetrics', () => {
    const items = buildProjectIndexItemsFromEntries(PROJECT_INDEX_CANONICAL_ORDER.map(syntheticEntry));
    const metrics = computeProjectIndexSummaryMetrics(items);
    const data = buildProjectsViewData({
      viewMode: 'FOUNDER',
      founderItems: items,
      clientItems: [],
      projectItems: items,
      availableFilters: ['ALL'],
      showFilteredEmpty: false,
    });
    expect(data.summaryTiles[0]?.value).toBe(String(metrics.total).padStart(2, '0'));
    expect(data.summaryTiles[1]?.value).toBe(String(metrics.active).padStart(2, '0'));
  });
});
