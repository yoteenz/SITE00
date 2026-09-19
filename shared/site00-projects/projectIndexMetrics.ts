/**
 * B5.9R5 — Project index summary metrics (actual projects only — excludes DESIGN workspace).
 */

import type { ProjectIndexItem } from './projectIndexItem.js';
import { isSite00PlatformDesignIndexItem } from './buildProjectIndexItems.js';

export type ProjectIndexSummaryMetrics = {
  total: number;
  active: number;
  preLaunch: number;
  complete: number;
};

export function computeProjectIndexSummaryMetrics(items: ProjectIndexItem[]): ProjectIndexSummaryMetrics {
  const projects = items.filter((item) => !isSite00PlatformDesignIndexItem(item));

  const active = projects.filter(
    (i) =>
      !i.isArchived &&
      !i.isOnHold &&
      (i.status === 'ACTIVE' || i.status === 'IN_PROGRESS'),
  ).length;

  const preLaunch = projects.filter((i) => i.status === 'PRE_LAUNCH' && !i.isArchived).length;

  const complete = projects.filter(
    (i) => (i.status === 'LAUNCHED' || i.status === 'POST_LAUNCH') && !i.isArchived,
  ).length;

  return {
    total: projects.length,
    active,
    preLaunch,
    complete,
  };
}
