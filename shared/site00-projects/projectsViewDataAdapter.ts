/**
 * B5.9R8 — Projects index view-mode data adapter (shell-invariant panel substitution).
 */

import type { ProjectIndexItem } from './projectIndexItem.js';
import { isSite00PlatformDesignIndexItem, buildSite00PlatformDesignIndexItem } from './buildProjectIndexItems.js';
import { computeProjectIndexSummaryMetrics, type ProjectIndexSummaryMetrics } from './projectIndexMetrics.js';
import {
  PROJECTS_CLIENT_METRIC_LABELS,
  PROJECTS_FOUNDER_METRIC_LABELS,
  PROJECTS_METRIC_SLOT_COUNT,
} from './projectsPageShellConfig.js';
import { assertProjectsMetricSlotCount } from './projectViewModeShellQA.js';
import type { ProjectViewMode } from './projectViewMode.js';

export type ProjectsSummaryTileIcon = 'stack' | 'pulse' | 'orbit' | 'check';

export type ProjectsSummaryTile = {
  value: string;
  label: string;
  icon: ProjectsSummaryTileIcon;
};

export type ProjectsIndexFilterChip = {
  filter: string;
  disabled: boolean;
};

export type ProjectsViewEmptyState = {
  title: string;
  body: string;
  showStartCta: boolean;
};

export type ProjectsViewData = {
  viewMode: ProjectViewMode;
  clientView: boolean;
  summaryTiles: [ProjectsSummaryTile, ProjectsSummaryTile, ProjectsSummaryTile, ProjectsSummaryTile];
  showDesignCard: boolean;
  designItem: ProjectIndexItem | null;
  showNewProject: boolean;
  projectItems: ProjectIndexItem[];
  filterChips: ProjectsIndexFilterChip[];
  emptyState: ProjectsViewEmptyState | null;
};

function padCount(n: number): string {
  return String(n).padStart(2, '0');
}

function founderSummaryTiles(metrics: ProjectIndexSummaryMetrics): ProjectsViewData['summaryTiles'] {
  const tiles = [
    { value: padCount(metrics.total), label: PROJECTS_FOUNDER_METRIC_LABELS[0], icon: 'stack' as const },
    { value: padCount(metrics.active), label: PROJECTS_FOUNDER_METRIC_LABELS[1], icon: 'pulse' as const },
    { value: padCount(metrics.preLaunch), label: PROJECTS_FOUNDER_METRIC_LABELS[2], icon: 'orbit' as const },
    { value: padCount(metrics.complete), label: PROJECTS_FOUNDER_METRIC_LABELS[3], icon: 'check' as const },
  ] as const;
  assertProjectsMetricSlotCount(tiles);
  return tiles as ProjectsViewData['summaryTiles'];
}

function clientInReviewCount(items: ProjectIndexItem[]): number {
  return items.filter(
    (i) =>
      !i.isArchived &&
      !i.isOnHold &&
      (i.status === 'PRE_LAUNCH' || (i.needsReviewCount ?? 0) > 0),
  ).length;
}

function clientSummaryTiles(items: ProjectIndexItem[]): ProjectsViewData['summaryTiles'] {
  const metrics = computeProjectIndexSummaryMetrics(items);
  const inReview = clientInReviewCount(items);
  const tiles = [
    { value: padCount(metrics.total), label: PROJECTS_CLIENT_METRIC_LABELS[0], icon: 'stack' as const },
    { value: padCount(metrics.active), label: PROJECTS_CLIENT_METRIC_LABELS[1], icon: 'pulse' as const },
    { value: padCount(inReview), label: PROJECTS_CLIENT_METRIC_LABELS[2], icon: 'orbit' as const },
    { value: padCount(metrics.complete), label: PROJECTS_CLIENT_METRIC_LABELS[3], icon: 'check' as const },
  ] as const;
  assertProjectsMetricSlotCount(tiles);
  return tiles as ProjectsViewData['summaryTiles'];
}

const ALL_FILTERS = [
  'ALL',
  'FOUNDER',
  'CLIENT',
  'ACTIVE',
  'PRE_LAUNCH',
  'LAUNCHED',
  'ON_HOLD',
  'ARCHIVED',
] as const;

export function buildProjectsFilterChips(args: {
  clientView: boolean;
  available: readonly string[];
}): ProjectsIndexFilterChip[] {
  const founderOnly = new Set(['FOUNDER', 'CLIENT']);
  return ALL_FILTERS.map((filter) => {
    const inAvailable = args.available.includes(filter);
    const disabled = args.clientView && founderOnly.has(filter) ? true : !inAvailable;
    return { filter, disabled };
  });
}

export function buildProjectsViewData(args: {
  viewMode: ProjectViewMode;
  founderItems: ProjectIndexItem[];
  clientItems: ProjectIndexItem[];
  projectItems: ProjectIndexItem[];
  availableFilters: readonly string[];
  showFilteredEmpty: boolean;
}): ProjectsViewData {
  const clientView = args.viewMode === 'CLIENT';
  const founderMetrics = computeProjectIndexSummaryMetrics(args.founderItems);
  const summaryTiles = clientView
    ? clientSummaryTiles(args.clientItems)
    : founderSummaryTiles(founderMetrics);

  const designItem = buildSite00PlatformDesignIndexItem();

  const emptyState: ProjectsViewEmptyState | null = args.showFilteredEmpty
    ? clientView
      ? {
          title: 'NO PROJECTS YET',
          body: 'START A PROJECT TO BEGIN YOUR STUDIO EXPERIENCE.',
          showStartCta: true,
        }
      : {
          title: 'NO MATCHING PROJECTS',
          body: 'ADJUST SEARCH OR FILTERS.',
          showStartCta: false,
        }
    : null;

  return {
    viewMode: args.viewMode,
    clientView,
    summaryTiles,
    showDesignCard: true,
    designItem,
    showNewProject: !clientView,
    projectItems: args.projectItems,
    filterChips: buildProjectsFilterChips({ clientView, available: args.availableFilters }),
    emptyState,
  };
}

export { PROJECTS_METRIC_SLOT_COUNT };

export function resolveProjectsIndexItems(args: {
  viewMode: ProjectViewMode;
  founderItems: ProjectIndexItem[];
  clientItems: ProjectIndexItem[];
}): ProjectIndexItem[] {
  return args.viewMode === 'CLIENT' ? args.clientItems : args.founderItems;
}

export function resolveProjectsDesignItemForRender(args: {
  viewMode: ProjectViewMode;
  designItem: ProjectIndexItem;
}): { interactive: boolean; item: ProjectIndexItem } {
  return {
    interactive: args.viewMode === 'FOUNDER',
    item: args.designItem,
  };
}

export { isSite00PlatformDesignIndexItem };
