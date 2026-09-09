/**
 * B5.9R8 — View-mode shell invariance QA (static source audit + failure classes).
 */

export type ViewModeShellFailureClass =
  | 'VIEW_MODE_SHELL_DRIFT'
  | 'VIEW_MODE_HERO_COPY_CHANGED'
  | 'VIEW_MODE_HERO_GEOMETRY_CHANGED'
  | 'VIEW_MODE_TOGGLE_REPLACED'
  | 'VIEW_MODE_DUPLICATE_CONTROL'
  | 'VIEW_MODE_STATS_GRID_COLLAPSED'
  | 'VIEW_MODE_SEARCH_MOVED'
  | 'VIEW_MODE_FILTER_MOVED'
  | 'VIEW_MODE_PROJECT_LAYOUT_CHANGED'
  | 'VIEW_MODE_CLIENT_DATA_LEAK'
  | 'VIEW_MODE_SCROLL_RESET';

export type ViewModeShellQAResult = {
  ok: boolean;
  failures: Array<{ class: ViewModeShellFailureClass; message: string }>;
};

export function auditProjectsIndexShellInvariance(sources: {
  indexPage: string;
  hero: string;
  summary: string;
  shell: string;
}): ViewModeShellQAResult {
  const failures: ViewModeShellQAResult['failures'] = [];

  if (sources.indexPage.includes('ClientProjectsPage')) {
    failures.push({
      class: 'VIEW_MODE_SHELL_DRIFT',
      message: 'Separate ClientProjectsPage tree detected',
    });
  }

  if (/if\s*\(\s*viewMode\s*===\s*['"]CLIENT['"]\s*\)\s*return\s*</.test(sources.indexPage)) {
    failures.push({
      class: 'VIEW_MODE_SHELL_DRIFT',
      message: 'Conditional page tree for client view',
    });
  }

  if (sources.indexPage.includes('ProjectIndexClientSimulationBanner')) {
    failures.push({
      class: 'VIEW_MODE_DUPLICATE_CONTROL',
      message: 'Duplicate client simulation banner on projects index',
    });
  }

  if (sources.indexPage.includes('!clientView ? <ProjectIndexViewStrip />')) {
    failures.push({
      class: 'VIEW_MODE_TOGGLE_REPLACED',
      message: 'View strip hidden in client view',
    });
  }

  if (sources.hero.includes('YOUR PROJECTS. ONE SYSTEM.')) {
    failures.push({
      class: 'VIEW_MODE_HERO_COPY_CHANGED',
      message: 'Hero copy differs in client view',
    });
  }

  if (sources.hero.includes('clientView')) {
    failures.push({
      class: 'VIEW_MODE_HERO_COPY_CHANGED',
      message: 'Hero accepts clientView branching prop',
    });
  }

  if (sources.summary.includes('site00-pidx-summary--client')) {
    failures.push({
      class: 'VIEW_MODE_STATS_GRID_COLLAPSED',
      message: 'Client summary uses collapsed grid variant',
    });
  }

  if (sources.summary.includes('if (clientView)')) {
    failures.push({
      class: 'VIEW_MODE_STATS_GRID_COLLAPSED',
      message: 'Summary component branches layout by clientView',
    });
  }

  if (!sources.shell.includes('ProjectsPageShell')) {
    failures.push({
      class: 'VIEW_MODE_SHELL_DRIFT',
      message: 'ProjectsPageShell not used for index layout',
    });
  }

  return { ok: failures.length === 0, failures };
}

/** Dynamic regions excluded from shell screenshot diff. */
export const VIEW_MODE_DYNAMIC_REGIONS = [
  'toggle-active-state',
  'metric-card-content',
  'project-card-content',
  'filter-chip-active-state',
] as const;
