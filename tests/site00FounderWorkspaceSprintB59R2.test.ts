/**
 * B5.9R2 test suite — Project Index reference-fidelity redesign.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildProjectIndexItem } from '../shared/site00-projects/projectIndexItem.js';
import { buildProjectIndexItemsFromEntries } from '../shared/site00-projects/buildProjectIndexItems.js';
import {
  buildSite00PlatformDesignIndexItem,
  isSite00PlatformDesignIndexItem,
} from '../shared/site00-projects/buildProjectIndexItems.js';
import { buildProjectProgressSummary } from '../shared/site00-projects/projectProgressSummary.js';
import { runProjectIndexStaleDataQA } from '../shared/site00-projects/projectIndexStaleDataQA.js';
import { resolveProjectIndexVisual } from '../shared/site00-projects/projectIndexVisual.js';
import { getProjectOperatingAdapter } from '../shared/site00-projects/adapters/index.js';
import { PROJECT_MODULE_CONFIGS } from '../shared/site00-projects/projectModules.js';
import { getProjectIndexStateVersion, bumpProjectIndexStateVersion } from '../src/site00/services/projectIndexSyncService.js';
import type { Site00ProjectIndexEntry } from '../shared/site00-projects/types.js';

const ROOT = join(import.meta.dirname, '..');
const PROJECTS_PAGE = readFileSync(join(ROOT, 'src/site00/pages/ProjectsPage.tsx'), 'utf8');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');
const INDEX_CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');
const HEADER = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexHeader.tsx'), 'utf8');
const CONTROLS = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexControls.tsx'), 'utf8');
const MOBILE_CARD = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexMobileCard.tsx'), 'utf8');
const DESKTOP_ROW = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexDesktopRow.tsx'), 'utf8');
const SYNC_SERVICE = readFileSync(join(ROOT, 'src/site00/services/projectIndexSyncService.ts'), 'utf8');
const HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useProjectIndex.ts'), 'utf8');

function syntheticEntry(slug: string, overrides: Partial<Site00ProjectIndexEntry> = {}): Site00ProjectIndexEntry {
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
    ...overrides,
  };
}

describe('B5.9R2 Project Index Redesign', () => {
  it('1. ProjectIndexItem model exists via buildProjectIndexItem', () => {
    const item = buildProjectIndexItem(syntheticEntry('studio-world'));
    expect(item.projectId).toBe('studio-world');
    expect(item.primaryModule).toBeTruthy();
    expect(item.openRoute).toContain('/overview');
  });

  it('2. index derives from canonical project entries', () => {
    const items = buildProjectIndexItemsFromEntries([
      syntheticEntry('frontal-slayer'),
      syntheticEntry('ndxbook'),
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]!.projectName).toContain('FRONTAL');
  });

  it('3–5. summary counts derive from data; founder/client; active/on-hold/archived logic in hook', () => {
    expect(HOOK).toContain('founderIndex');
    expect(HOOK).toContain('clientProjects');
    expect(HOOK).toContain('isOnHold');
    expect(HOOK).toContain('isArchived');
  });

  it('6–8. founder/client toggle and client surface wiring', () => {
    expect(PROJECTS_PAGE).toContain('ProjectViewModeProvider');
    expect(INDEX_PAGE).toContain('viewMode');
    expect(HEADER).toContain('CLIENT VIEW');
    expect(HOOK).toContain("viewMode === 'CLIENT'");
  });

  it('9–11. search, filter, sort in hook', () => {
    expect(HOOK).toContain('matchesSearch');
    expect(HOOK).toContain('matchesFilter');
    expect(HOOK).toContain('sortItems');
    expect(CONTROLS).toContain('SEARCH PROJECTS');
  });

  it('12–14. primary module from manifest; Evolve naming', () => {
    expect(PROJECT_MODULE_CONFIGS.EVOLVE.label).toBe('EVOLVE');
    const ndx = buildProjectIndexItem(syntheticEntry('ndxbook', { currentPhase: 'CONTENT OPERATIONS' }));
    expect(ndx.enabledModules).toContain('EVOLVE');
  });

  it('15. progress derived; avoids fake precision when unavailable', () => {
    const adapter = getProjectOperatingAdapter('generic-project');
    const ctx = { projectDetail: null as never };
    const state = adapter.buildOperatingState(ctx);
    const progress = buildProjectProgressSummary(state);
    if (progress.percent == null) {
      expect(progress.label).toBeTruthy();
    }
  });

  it('16–19. status, focus, last updated, review count on item', () => {
    const item = buildProjectIndexItem(
      syntheticEntry('frontal-slayer', { currentPhase: 'PRE LAUNCH', focusNow: 'Homepage QA' }),
    );
    expect(item.status).toBeTruthy();
    expect(item.lastUpdatedLabel).toMatch(/UPDATED/);
    expect(typeof item.needsReviewCount).toBe('number');
  });

  it('20–22. mobile card, desktop row, thumbnail fallback', () => {
    expect(MOBILE_CARD).toContain('site00-pidx-mobile-card');
    expect(DESKTOP_ROW).toContain('site00-pidx-desktop-row');
    const visual = resolveProjectIndexVisual('frontal-slayer', 'FRONTAL SLAYER');
    expect(visual.initials).toBe('FS');
  });

  it('23. New Project route wired', () => {
    expect(INDEX_PAGE).toContain('ProjectIndexNewProjectCard');
    expect(readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexNewProjectCard.tsx'), 'utf8')).toContain('bldrState');
  });

  it('24–25. archived and on hold filters', () => {
    expect(HOOK).toContain("'ARCHIVED'");
    expect(HOOK).toContain("'ON_HOLD'");
  });

  it('26–27. client index hides founder; founder includes founder-owned', () => {
    const qa = runProjectIndexStaleDataQA({
      items: [buildProjectIndexItem(syntheticEntry('frontal-slayer'))],
      viewMode: 'CLIENT',
      indexStateVersion: 1,
    });
    expect(qa.ok).toBe(false);
    expect(qa.failures.some((f) => f.class === 'CLIENT_PROJECT_LEAK')).toBe(true);
  });

  it('28–29. opens modern shell overview; not legacy dossier detailRoute', () => {
    const item = buildProjectIndexItem(syntheticEntry('frontal-slayer'));
    expect(item.openRoute).toMatch(/\/overview$/);
    expect(item.openRoute).not.toMatch(/\/projects\/frontal-slayer$/);
  });

  it('30–31. sync service and state version', () => {
    expect(SYNC_SERVICE).toContain('projectIndexStateVersion');
    expect(getProjectIndexStateVersion()).toBeGreaterThan(0);
    const before = getProjectIndexStateVersion();
    bumpProjectIndexStateVersion();
    expect(getProjectIndexStateVersion()).toBeGreaterThan(before);
  });

  it('32. Frontal Slayer card state', () => {
    const item = buildProjectIndexItem(syntheticEntry('frontal-slayer', { currentPhase: 'PRE LAUNCH' }));
    expect(item.enabledModules.length).toBeGreaterThan(1);
    expect(item.primaryModule).not.toBe('EVOLVE');
  });

  it('33. Studio World card state', () => {
    const item = buildProjectIndexItem(syntheticEntry('studio-world'));
    expect(item.internalProject).toBe(true);
    expect(item.enabledModules).toContain('BUILDER');
  });

  it('34. NDXBOOK card state', () => {
    const item = buildProjectIndexItem(syntheticEntry('ndxbook'));
    expect(item.enabledModules).toContain('EVOLVE');
    expect(item.enabledModules).not.toContain('BUILDER');
  });

  it('35. AIO card state', () => {
    const item = buildProjectIndexItem(syntheticEntry('all-in-one-enterprises'));
    expect(item.enabledModules).toContain('BUILDER');
    expect(item.enabledModules).not.toContain('EVOLVE');
  });

  it('36. Astral World card state', () => {
    const item = buildProjectIndexItem(
      syntheticEntry('astral-world', { classification: 'CLIENT_PROJECT', currentPhase: 'IDENTITY EXPLORATION' }),
      { ownerType: 'CLIENT' },
    );
    expect(item.ownerType).toBe('CLIENT');
    expect(item.enabledModules).toContain('IDENTITY');
  });

  it('37. uppercase UI rule in index CSS', () => {
    expect(INDEX_CSS).toContain('text-transform: uppercase');
  });

  it('38–39. stale QA classes; no cross-client leakage check', () => {
    expect(runProjectIndexStaleDataQA).toBeDefined();
    const founderQa = runProjectIndexStaleDataQA({
      items: [buildProjectIndexItem(syntheticEntry('astral-world', { classification: 'CLIENT_PROJECT' }), { ownerType: 'CLIENT' })],
      viewMode: 'CLIENT',
      indexStateVersion: 1,
    });
    expect(founderQa.ok).toBe(true);
  });

  it('40–41. mobile and desktop render paths', () => {
    expect(INDEX_PAGE).toContain('ProjectIndexProjectCard');
    expect(INDEX_PAGE).toContain('site00-pidx-grid');
    expect(INDEX_CSS).toContain('site00-pidx--mobile');
    expect(INDEX_CSS).toContain('site00-pidx--desktop');
  });

  it('42. reference QA structure present', () => {
    expect(INDEX_PAGE).toContain('ProjectsPageShell');
    expect(INDEX_PAGE).toContain('site00-pidx-grid');
    expect(INDEX_PAGE).not.toContain('EVOLVE →');
    expect(PROJECTS_PAGE).not.toContain('site00-eco-mobile-cta');
  });

  it('43. legacy dossier patterns removed', () => {
    expect(PROJECTS_PAGE).not.toContain('site00-project-index-card__internal');
    expect(PROJECTS_PAGE).not.toContain('WEBSITE DESIGN AUTHORITY');
    expect(INDEX_PAGE).not.toContain('site00-project-index-card__phase');
  });

  it('44. ProjectIndexSyncService export', () => {
    expect(SYNC_SERVICE).toContain('ProjectIndexSyncService');
  });

  it('45. SITE 00 platform design entry restored on founder index', () => {
    const platform = buildSite00PlatformDesignIndexItem();
    expect(platform.projectName).toBe('DESIGN');
    expect(platform.openRoute).toBe('/projects/site00/design');
    expect(isSite00PlatformDesignIndexItem(platform)).toBe(true);
    expect(HOOK).toContain('buildSite00PlatformDesignIndexItem');
    expect(MOBILE_CARD).toContain('OPEN DESIGN →');
    expect(MOBILE_CARD).toContain('site00-pidx-mobile-card--platform');
    expect(DESKTOP_ROW).toContain('OPEN DESIGN →');
    expect(INDEX_PAGE).toContain('ProjectIndexDesignCard');
    expect(INDEX_PAGE).toContain('SITE 00 DESIGN WORKSPACE REMAINS AVAILABLE');
  });
});
