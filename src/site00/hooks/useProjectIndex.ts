/**
 * B5.9R2 — Hydrated project index hook with filters and view mode.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildClientProjectIndexItems,
  buildProjectIndexItemsFromEntries,
  buildSite00PlatformDesignIndexItem,
  isSite00PlatformDesignIndexItem,
} from '../../../shared/site00-projects/buildProjectIndexItems.js';
import type { ProjectIndexItem, ProjectIndexStatus } from '../../../shared/site00-projects/projectIndexItem.js';
import { runProjectIndexStaleDataQA } from '../../../shared/site00-projects/projectIndexStaleDataQA.js';
import { useSite00ProjectsIndex } from './useSite00Projects.js';
import { useClientAppProjects } from './useClientAppProjects.js';
import { useProjectViewMode } from '../context/ProjectViewModeContext.js';
import {
  getProjectIndexStateVersion,
  subscribeProjectIndexState,
  bumpProjectIndexStateVersion,
} from '../services/projectIndexSyncService.js';

export type ProjectIndexFilter =
  | 'ALL'
  | 'FOUNDER'
  | 'CLIENT'
  | 'ACTIVE'
  | 'PRE_LAUNCH'
  | 'LAUNCHED'
  | 'ON_HOLD'
  | 'ARCHIVED';

export type ProjectIndexSort = 'LAST_UPDATED' | 'NAME' | 'PROGRESS' | 'STATUS' | 'DATE_CREATED';

function matchesFilter(item: ProjectIndexItem, filter: ProjectIndexFilter): boolean {
  switch (filter) {
    case 'ALL':
      return !item.isArchived;
    case 'FOUNDER':
      return item.ownerType === 'FOUNDER' && !item.isArchived;
    case 'CLIENT':
      return item.ownerType === 'CLIENT' && !item.isArchived;
    case 'ACTIVE':
      return (item.status === 'ACTIVE' || item.status === 'IN_PROGRESS' || item.status === 'POST_LAUNCH') && !item.isArchived;
    case 'PRE_LAUNCH':
      return item.status === 'PRE_LAUNCH' && !item.isArchived;
    case 'LAUNCHED':
      return (item.status === 'LAUNCHED' || item.status === 'POST_LAUNCH') && !item.isArchived;
    case 'ON_HOLD':
      return item.isOnHold;
    case 'ARCHIVED':
      return item.isArchived;
    default:
      return true;
  }
}

function matchesSearch(item: ProjectIndexItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    item.projectName.toLowerCase().includes(q) ||
    item.projectId.toLowerCase().includes(q) ||
    item.currentPhase.toLowerCase().includes(q) ||
    item.primaryModule.toLowerCase().includes(q) ||
    (item.currentFocus?.toLowerCase().includes(q) ?? false) ||
    (item.descriptor?.toLowerCase().includes(q) ?? false) ||
    (item.clientName?.toLowerCase().includes(q) ?? false)
  );
}

function sortItems(items: ProjectIndexItem[], sort: ProjectIndexSort): ProjectIndexItem[] {
  const copy = [...items];
  copy.sort((a, b) => {
    switch (sort) {
      case 'NAME':
        return a.projectName.localeCompare(b.projectName);
      case 'PROGRESS':
        return (b.progress.percent ?? 0) - (a.progress.percent ?? 0);
      case 'STATUS':
        return a.status.localeCompare(b.status);
      case 'DATE_CREATED':
      case 'LAST_UPDATED':
      default: {
        const aTime = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0;
        const bTime = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0;
        return bTime - aTime;
      }
    }
  });
  return copy;
}

export function useProjectIndex() {
  const { viewMode } = useProjectViewMode();
  const founderIndex = useSite00ProjectsIndex();
  const clientAppProjects = useClientAppProjects();
  const [indexVersion, setIndexVersion] = useState(getProjectIndexStateVersion());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProjectIndexFilter>('ALL');
  const [sort, setSort] = useState<ProjectIndexSort>('LAST_UPDATED');

  useEffect(() => subscribeProjectIndexState(() => setIndexVersion(getProjectIndexStateVersion())), []);

  const founderItems = useMemo(
    () => buildProjectIndexItemsFromEntries(founderIndex.projects),
    [founderIndex.projects, indexVersion],
  );

  const clientItems = useMemo(() => {
    const fromApi = buildClientProjectIndexItems(founderIndex.clientProjects ?? []);
    const fromApp =
      clientAppProjects.data?.projects.map((p) => {
        const synthetic = {
          id: p.slug,
          slug: p.slug,
          name: p.displayName,
          studioRoute: p.deepLink.replace(/^https?:\/\/[^/]+/, '') || `/app/projects/${p.slug}/home`,
        };
        return buildClientProjectIndexItems([synthetic])[0]!;
      }) ?? [];
    return fromApp.length ? fromApp : fromApi;
  }, [founderIndex.clientProjects, clientAppProjects.data, indexVersion]);

  const allItems = viewMode === 'CLIENT' ? clientItems : founderItems;

  const filtered = useMemo(() => {
    const matched = allItems.filter((item) => matchesFilter(item, filter) && matchesSearch(item, query));
    const sorted = sortItems(matched, sort);
    if (viewMode === 'CLIENT') return sorted;

    const platform = buildSite00PlatformDesignIndexItem();
    const rest = sorted.filter((item) => !isSite00PlatformDesignIndexItem(item));
    return [platform, ...rest];
  }, [allItems, filter, query, sort, viewMode]);

  const summary = useMemo(() => {
    const active = founderItems.filter(
      (i) => !i.isArchived && !i.isOnHold && i.status !== 'NOT_STARTED',
    ).length;
    const onHold = founderItems.filter((i) => i.isOnHold).length;
    const archived = founderItems.filter((i) => i.isArchived).length;
    return {
      total: founderItems.length,
      founderIndex: founderItems.filter((i) => i.ownerType === 'FOUNDER').length,
      clientProjects: clientItems.length,
      active,
      onHold,
      archived,
      sourceLabel: founderIndex.sourceLabel === 'LIVE' ? 'LIVE DATA' : founderIndex.sourceLabel,
    };
  }, [founderItems, clientItems, founderIndex.sourceLabel]);

  const staleQA = useMemo(
    () =>
      runProjectIndexStaleDataQA({
        items: filtered,
        viewMode,
        indexStateVersion: indexVersion,
      }),
    [filtered, viewMode, indexVersion],
  );

  const reload = useCallback(() => {
    founderIndex.reload();
    void clientAppProjects.reload();
    bumpProjectIndexStateVersion();
  }, [founderIndex, clientAppProjects]);

  return {
    viewMode,
    items: filtered,
    allItems,
    summary,
    state: founderIndex.state,
    error: founderIndex.error,
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
    reload,
    staleQA,
    indexStateVersion: indexVersion,
  };
}

export type { ProjectIndexItem, ProjectIndexStatus };
