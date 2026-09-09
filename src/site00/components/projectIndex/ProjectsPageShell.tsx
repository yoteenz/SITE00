/**
 * B5.9R8 — Projects index shell (geometry invariant across founder/client view modes).
 */

import type { ReactNode } from 'react';
import type { ProjectsSummaryTile } from '../../../../shared/site00-projects/projectsViewDataAdapter.js';
import { ProjectIndexHero } from './ProjectIndexHero';
import { ProjectIndexViewStrip } from './ProjectIndexViewStrip';
import { ProjectIndexSummary, ProjectIndexFilterChips, PROJECT_INDEX_FILTERS } from './ProjectIndexSummary';
import { ProjectIndexControls } from './ProjectIndexControls';
import type { ProjectIndexFilter, ProjectIndexSort } from '../../hooks/useProjectIndex.js';

export type ProjectsPageShellProps = {
  isDesktop: boolean;
  summaryTiles: [
    ProjectsSummaryTile,
    ProjectsSummaryTile,
    ProjectsSummaryTile,
    ProjectsSummaryTile,
  ];
  query: string;
  onQueryChange: (value: string) => void;
  sort: ProjectIndexSort;
  onSortChange: (sort: ProjectIndexSort) => void;
  filter: ProjectIndexFilter;
  onFilterChange: (filter: ProjectIndexFilter) => void;
  filterChips: Array<{ filter: string; disabled: boolean }>;
  onFilterButtonClick: () => void;
  children: ReactNode;
};

export function ProjectsPageShell({
  isDesktop,
  summaryTiles,
  query,
  onQueryChange,
  sort,
  onSortChange,
  filter,
  onFilterChange,
  filterChips,
  onFilterButtonClick,
  children,
}: ProjectsPageShellProps) {
  return (
    <>
      <ProjectIndexHero />

      <ProjectIndexViewStrip />

      <ProjectIndexSummary tiles={summaryTiles} />

      <ProjectIndexControls
        query={query}
        onQueryChange={onQueryChange}
        sort={sort}
        onSortChange={onSortChange}
        showSort={isDesktop}
        showFilterButton={!isDesktop}
        onFilterButtonClick={onFilterButtonClick}
      />

      <ProjectIndexFilterChips
        active={filter}
        onChange={onFilterChange}
        chips={filterChips}
        allFilters={PROJECT_INDEX_FILTERS}
      />

      {children}
    </>
  );
}
