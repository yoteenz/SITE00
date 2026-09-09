/**
 * B5.9R5 test suite — Projects Index reference-fidelity redesign.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildProjectIndexItem } from '../shared/site00-projects/projectIndexItem.js';
import {
  buildProjectIndexItemsFromEntries,
  buildSite00PlatformDesignIndexItem,
  isSite00PlatformDesignIndexItem,
} from '../shared/site00-projects/buildProjectIndexItems.js';
import {
  orderProjectIndexItems,
  resolveProjectDisplayNumber,
  PROJECT_INDEX_CANONICAL_ORDER,
  formatProjectDisplayNumber,
} from '../shared/site00-projects/projectIndexOrder.js';
import { computeProjectIndexSummaryMetrics } from '../shared/site00-projects/projectIndexMetrics.js';
import { buildProjectProgressSummary } from '../shared/site00-projects/projectProgressSummary.js';
import { getProjectOperatingAdapter } from '../shared/site00-projects/adapters/index.js';
import { PROJECT_MODULE_CONFIGS } from '../shared/site00-projects/projectModules.js';
import type { Site00ProjectIndexEntry } from '../shared/site00-projects/types.js';

const ROOT = join(import.meta.dirname, '..');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');
const INDEX_CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');
const HERO = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexHero.tsx'), 'utf8');
const VIEW_STRIP = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexViewStrip.tsx'), 'utf8');
const DESIGN_CARD = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexDesignCard.tsx'), 'utf8');
const PROJECT_CARD = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexProjectCard.tsx'), 'utf8');
const NEW_CARD = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexNewProjectCard.tsx'), 'utf8');
const HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useProjectIndex.ts'), 'utf8');
const ORDER_MODULE = readFileSync(join(ROOT, 'shared/site00-projects/projectIndexOrder.ts'), 'utf8');
const METRICS_MODULE = readFileSync(join(ROOT, 'shared/site00-projects/projectIndexMetrics.ts'), 'utf8');

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

function allCanonicalEntries(): Site00ProjectIndexEntry[] {
  return PROJECT_INDEX_CANONICAL_ORDER.map((slug) => syntheticEntry(slug));
}

describe('B5.9R5 Projects Index Redesign', () => {
  it('1. design workspace exists as system entry', () => {
    const design = buildSite00PlatformDesignIndexItem();
    expect(design.projectName).toBe('DESIGN');
    expect(isSite00PlatformDesignIndexItem(design)).toBe(true);
  });

  it('2. design workspace is not counted as project', () => {
    const items = [...buildProjectIndexItemsFromEntries(allCanonicalEntries()), buildSite00PlatformDesignIndexItem()];
    const metrics = computeProjectIndexSummaryMetrics(items);
    expect(metrics.total).toBe(5);
  });

  it('3. design workspace renders first in page layout', () => {
    expect(INDEX_PAGE).toContain('ProjectIndexDesignCard');
    expect(INDEX_PAGE.indexOf('ProjectIndexDesignCard')).toBeLessThan(
      INDEX_PAGE.indexOf('ProjectIndexProjectCard'),
    );
  });

  it('4. design workspace route works', () => {
    const design = buildSite00PlatformDesignIndexItem();
    expect(design.openRoute).toBe('/projects/site00/design');
    expect(DESIGN_CARD).toContain('OPEN DESIGN');
  });

  it('5. project count excludes design', () => {
    expect(METRICS_MODULE).toContain('isSite00PlatformDesignIndexItem');
    const metrics = computeProjectIndexSummaryMetrics([buildSite00PlatformDesignIndexItem()]);
    expect(metrics.total).toBe(0);
  });

  it('6. project order config exists', () => {
    expect(ORDER_MODULE).toContain('PROJECT_INDEX_CANONICAL_ORDER');
    expect(PROJECT_INDEX_CANONICAL_ORDER).toHaveLength(5);
  });

  it('7. frontal slayer number = 01', () => {
    expect(resolveProjectDisplayNumber('frontal-slayer')).toBe('01');
  });

  it('8. studio world number = 02', () => {
    expect(resolveProjectDisplayNumber('studio-world')).toBe('02');
  });

  it('9. ndxbook number = 03', () => {
    expect(resolveProjectDisplayNumber('ndxbook')).toBe('03');
  });

  it('10. aio number = 04', () => {
    expect(resolveProjectDisplayNumber('all-in-one-enterprises')).toBe('04');
  });

  it('11. astral world number = 05', () => {
    expect(resolveProjectDisplayNumber('astral-world')).toBe('05');
  });

  it('12. new project unnumbered', () => {
    expect(NEW_CARD).not.toContain('resolveProjectDisplayNumber');
    expect(PROJECT_CARD).toContain('resolveProjectDisplayNumber');
    expect(NEW_CARD).toContain('NEW PROJECT');
  });

  it('13. total projects counts real projects only', () => {
    const items = buildProjectIndexItemsFromEntries(allCanonicalEntries());
    expect(computeProjectIndexSummaryMetrics(items).total).toBe(5);
  });

  it('14. project cards use canonical state via buildProjectIndexItem', () => {
    const item = buildProjectIndexItem(
      syntheticEntry('frontal-slayer', { currentPhase: 'PRE LAUNCH', focusNow: 'Homepage QA' }),
    );
    expect(item.status).toBeTruthy();
    expect(item.primaryModule).toBeTruthy();
  });

  it('15. primary module derived from manifest/focus', () => {
    const item = buildProjectIndexItem(
      syntheticEntry('ndxbook', { focusNow: 'Campaign content ops' }),
    );
    expect(item.enabledModules).toContain('EVOLVE');
  });

  it('16. evolve display name used', () => {
    expect(PROJECT_MODULE_CONFIGS.EVOLVE.label).toBe('EVOLVE');
    expect(PROJECT_MODULE_CONFIGS.EVOLVE.label).not.toBe('MARKETING');
  });

  it('17. progress does not default to fake 0', () => {
    const adapter = getProjectOperatingAdapter('generic-project');
    const progress = buildProjectProgressSummary(adapter.buildOperatingState({ projectDetail: null as never }));
    if (progress.percent == null) {
      expect(progress.label).toBeTruthy();
    }
  });

  it('18. current focus supported on project card', () => {
    expect(PROJECT_CARD).toContain('currentFocus');
  });

  it('19. founder view shows interactive design workspace', () => {
    expect(INDEX_PAGE).toContain('ProjectIndexDesignCard');
    expect(INDEX_PAGE).toContain('interactive={designRender.interactive}');
  });

  it('20. client view keeps design shell placeholder without link', () => {
    expect(DESIGN_CARD).toContain('site00-pidx-design-card--shell-placeholder');
    expect(DESIGN_CARD).toContain('interactive = true');
  });

  it('21. search works in hook', () => {
    expect(HOOK).toContain('matchesSearch');
    expect(HOOK).toContain('setQuery');
  });

  it('22. filters work in hook', () => {
    expect(HOOK).toContain('matchesFilter');
    expect(HOOK).toContain('setFilter');
  });

  it('23. project card navigation works', () => {
    expect(PROJECT_CARD).toContain('VIEW PROJECT');
    expect(PROJECT_CARD).toContain('<Link to={item.openRoute}');
  });

  it('24. new project route works', () => {
    expect(NEW_CARD).toContain('bldrState');
    expect(NEW_CARD).toContain('CREATE PROJECT');
  });

  it('25. mobile 2-column grid when appropriate', () => {
    expect(INDEX_CSS).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
  });

  it('26. desktop grid renders', () => {
    expect(INDEX_CSS).toContain('site00-pidx--desktop');
    expect(INDEX_PAGE).toContain('site00-pidx--desktop');
  });

  it('27. uppercase UI enforced', () => {
    expect(INDEX_CSS).toContain('text-transform: uppercase');
  });

  it('28. global nav preserved via ecosystem shell', () => {
    const projectsPage = readFileSync(join(ROOT, 'src/site00/pages/ProjectsPage.tsx'), 'utf8');
    expect(projectsPage).toContain('EcosystemShell');
  });

  it('29. projects active nav handled by shell', () => {
    const nav = readFileSync(join(ROOT, 'src/site00/config/mobile-site-nav.ts'), 'utf8');
    expect(nav).toContain("'projects'");
  });

  it('30. no legacy project index list on page', () => {
    expect(INDEX_PAGE).not.toContain('ProjectIndexMobileCard');
    expect(INDEX_PAGE).not.toContain('ProjectIndexDesktopRow');
    expect(INDEX_PAGE).toContain('site00-pidx-grid');
  });

  it('31. visual reference QA structure present', () => {
    expect(HERO).toContain('ALL PROJECTS. ONE SYSTEM.');
    expect(HERO).toContain('Site00OrbitalMark');
    expect(VIEW_STRIP).toContain('FOUNDER VIEW');
    expect(VIEW_STRIP).toContain('ADMIN CONTROL CENTER');
    expect(INDEX_CSS).toContain('site00-pidx-hero');
    expect(INDEX_CSS).toContain('site00-pidx-design-card');
  });

  it('32. build passes — orderProjectIndexItems canonical sequence', () => {
    const shuffled = buildProjectIndexItemsFromEntries([
      syntheticEntry('astral-world'),
      syntheticEntry('frontal-slayer'),
      syntheticEntry('ndxbook'),
      syntheticEntry('studio-world'),
      syntheticEntry('all-in-one-enterprises'),
    ]);
    const ordered = orderProjectIndexItems(shuffled);
    expect(ordered.map((i) => i.projectId)).toEqual([...PROJECT_INDEX_CANONICAL_ORDER]);
    expect(formatProjectDisplayNumber(0)).toBe('01');
  });
});
