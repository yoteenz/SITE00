/**
 * B5.9R6 test suite — New Project panel restoration at end of project grid.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildProjectIndexItemsFromEntries,
  buildSite00PlatformDesignIndexItem,
} from '../shared/site00-projects/buildProjectIndexItems.js';
import {
  orderProjectIndexItems,
  resolveProjectDisplayNumber,
  PROJECT_INDEX_CANONICAL_ORDER,
} from '../shared/site00-projects/projectIndexOrder.js';
import { computeProjectIndexSummaryMetrics } from '../shared/site00-projects/projectIndexMetrics.js';
import {
  PROJECT_INDEX_NEW_PROJECT_ENTRY_TYPE,
} from '../src/site00/components/projectIndex/ProjectIndexNewProjectCard.tsx';

const ROOT = join(import.meta.dirname, '..');
const INDEX_PAGE = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'), 'utf8');
const NEW_CARD = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexNewProjectCard.tsx'), 'utf8');
const INDEX_CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');
const HOOK = readFileSync(join(ROOT, 'src/site00/hooks/useProjectIndex.ts'), 'utf8');

describe('B5.9R6 New Project Panel Restoration', () => {
  it('1. new project tile exists', () => {
    expect(NEW_CARD).toContain('ProjectIndexNewProjectCard');
    expect(INDEX_PAGE).toContain('ProjectIndexNewProjectCard');
  });

  it('2. new project tile renders after last actual project', () => {
    expect(INDEX_PAGE).toContain('ProjectIndexProjectGrid');
    const gridFile = readFileSync(
      join(ROOT, 'src/site00/components/projectIndex/ProjectIndexPage.tsx'),
      'utf8',
    );
    expect(gridFile.indexOf('ProjectIndexProjectCard')).toBeLessThan(
      gridFile.indexOf('ProjectIndexNewProjectCard'),
    );
    expect(INDEX_PAGE).toMatch(/showNewProject \? <ProjectIndexNewProjectCard/);
  });

  it('3. new project tile is unnumbered', () => {
    expect(NEW_CARD).toContain('data-unnumbered');
    expect(NEW_CARD).not.toContain('resolveProjectDisplayNumber');
    expect(NEW_CARD).not.toContain('project-card__number');
  });

  it('4. astral world remains 05', () => {
    expect(resolveProjectDisplayNumber('astral-world')).toBe('05');
  });

  it('5. new project does not become 06', () => {
    expect(NEW_CARD).not.toContain('06');
    expect(NEW_CARD).not.toContain('formatProjectDisplayNumber');
  });

  it('6. new project excluded from total project count', () => {
    const items = [
      ...buildProjectIndexItemsFromEntries(
        PROJECT_INDEX_CANONICAL_ORDER.map((slug) => ({
          slug,
          name: slug,
          displayName: slug.replace(/-/g, ' ').toUpperCase(),
          organizationSlug: slug,
          organizationUuid: slug,
          classification: 'INTERNAL_BRAND',
          currentSystem: 'SITE 00',
          currentPhase: 'IN PROGRESS',
          focusNow: null,
          lastActivity: null,
          surfaces: [],
          detailRoute: `/projects/${slug}/overview`,
        })),
      ),
    ];
    expect(computeProjectIndexSummaryMetrics(items).total).toBe(5);
  });

  it('7. new project excluded from founder index count', () => {
    expect(HOOK).not.toContain('NEW_PROJECT');
    expect(HOOK).not.toContain('ProjectIndexNewProjectCard');
  });

  it('8. new project excluded from project progress', () => {
    expect(NEW_CARD).not.toContain('progress');
    expect(NEW_CARD).not.toContain('ProgressBlock');
  });

  it('9. new project card uses utility entry type', () => {
    expect(PROJECT_INDEX_NEW_PROJECT_ENTRY_TYPE).toBe('NEW_PROJECT_UTILITY');
    expect(NEW_CARD).toContain('data-site00-entry');
  });

  it('10. new project route works', () => {
    expect(NEW_CARD).toContain('bldrState');
    expect(NEW_CARD).toContain('CREATE PROJECT');
  });

  it('11. founder sees new project tile', () => {
    expect(INDEX_PAGE).toContain('showNewProject = !clientView');
    expect(INDEX_PAGE).toContain('showNewProject={showNewProject}');
  });

  it('12. client does not see founder creation tile by default', () => {
    expect(INDEX_PAGE).toContain('showNewProject = !clientView');
    expect(NEW_CARD).not.toContain('CLIENT');
  });

  it('13. mobile grid integration works', () => {
    expect(INDEX_CSS).toContain('site00-pidx-grid');
    expect(INDEX_PAGE).toContain('site00-pidx-grid');
  });

  it('14. desktop grid integration works', () => {
    expect(INDEX_CSS).toContain('site00-pidx--desktop');
    expect(INDEX_PAGE).toContain('site00-pidx--desktop');
  });

  it('15. uppercase UI applied', () => {
    expect(NEW_CARD).toContain('NEW PROJECT');
    expect(NEW_CARD).toMatch(/LET(&apos;|')S BUILD/);
    expect(INDEX_CSS).toContain('text-transform: uppercase');
  });

  it('16. no status dot rendered', () => {
    expect(NEW_CARD).not.toContain('status-dot');
    expect(NEW_CARD).not.toContain('statusDot');
  });

  it('17. no progress bar rendered', () => {
    expect(NEW_CARD).not.toContain('progress-track');
    expect(NEW_CARD).not.toContain('progress-fill');
  });

  it('18. no module count rendered', () => {
    expect(NEW_CARD).not.toContain('MODULES');
    expect(NEW_CARD).not.toContain('primaryModule');
  });

  it('19. project order unchanged', () => {
    const ordered = orderProjectIndexItems(
      buildProjectIndexItemsFromEntries(
        PROJECT_INDEX_CANONICAL_ORDER.map((slug) => ({
          slug,
          name: slug,
          displayName: slug.toUpperCase(),
          organizationSlug: slug,
          organizationUuid: slug,
          classification: 'INTERNAL_BRAND',
          currentSystem: 'SITE 00',
          currentPhase: 'IN PROGRESS',
          focusNow: null,
          lastActivity: null,
          surfaces: [],
          detailRoute: `/projects/${slug}/overview`,
        })),
      ),
    );
    expect(ordered.map((i) => i.projectId)).toEqual([...PROJECT_INDEX_CANONICAL_ORDER]);
  });

  it('20. design workspace remains first', () => {
    expect(INDEX_PAGE.indexOf('ProjectIndexDesignCard')).toBeLessThan(
      INDEX_PAGE.indexOf('ProjectIndexProjectGrid'),
    );
    const design = buildSite00PlatformDesignIndexItem();
    expect(design.projectName).toBe('DESIGN');
  });

  it('21. build passes — reference target motif present; tile not gated on project count', () => {
    expect(NEW_CARD).toContain('site00-pidx-new-card__target');
    expect(NEW_CARD).toContain('site00-pidx-new-card__plus');
    expect(INDEX_CSS).toContain('site00-pidx-new-card__target-ring');
    expect(INDEX_PAGE).toContain('showNewProject ? <ProjectIndexNewProjectCard');
    expect(INDEX_PAGE).not.toMatch(/projectItems\.length > 0[\s\S]*ProjectIndexNewProjectCard/);
  });
});
