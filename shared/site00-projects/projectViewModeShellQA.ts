/**
 * B5.9R8 / B5.9R8R1 — View-mode shell invariance QA (static source audit + failure classes).
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
  | 'VIEW_MODE_SCROLL_RESET'
  | 'PROJECTS_LEGACY_CLIENT_VARIANT_ACTIVE'
  | 'PROJECTS_CLIENT_SIMULATION_BAR_ACTIVE'
  | 'PROJECTS_CLIENT_HERO_COPY_OVERRIDE'
  | 'PROJECTS_CLIENT_METRIC_ARRAY_TRUNCATED'
  | 'PROJECTS_CLIENT_STRUCTURAL_BRANCH'
  | 'PROJECTS_RUNTIME_TREE_DIVERGENCE'
  | 'PROJECTS_DEPLOYED_BUNDLE_STALE'
  | 'PROJECTS_LIVE_QA_NOT_RUN';

export type ViewModeShellQAResult = {
  ok: boolean;
  failures: Array<{ class: ViewModeShellFailureClass; message: string }>;
};

export function auditProjectsIndexShellInvariance(sources: {
  indexPage: string;
  hero: string;
  summary: string;
  shell: string;
  legacyHeaderExists?: boolean;
}): ViewModeShellQAResult {
  const failures: ViewModeShellQAResult['failures'] = [];

  if (sources.indexPage.includes('ClientProjectsPage')) {
    failures.push({
      class: 'PROJECTS_RUNTIME_TREE_DIVERGENCE',
      message: 'Separate ClientProjectsPage tree detected',
    });
  }

  if (/if\s*\(\s*viewMode\s*===\s*['"]CLIENT['"]\s*\)\s*return\s*</.test(sources.indexPage)) {
    failures.push({
      class: 'PROJECTS_CLIENT_STRUCTURAL_BRANCH',
      message: 'Conditional page tree for client view',
    });
  }

  if (sources.indexPage.includes('ProjectIndexClientSimulationBanner')) {
    failures.push({
      class: 'PROJECTS_CLIENT_SIMULATION_BAR_ACTIVE',
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
      class: 'PROJECTS_CLIENT_HERO_COPY_OVERRIDE',
      message: 'Hero copy differs in client view',
    });
  }

  if (sources.hero.includes('clientView')) {
    failures.push({
      class: 'PROJECTS_CLIENT_HERO_COPY_OVERRIDE',
      message: 'Hero accepts clientView branching prop',
    });
  }

  if (sources.summary.includes('site00-pidx-summary--client')) {
    failures.push({
      class: 'PROJECTS_CLIENT_METRIC_ARRAY_TRUNCATED',
      message: 'Client summary uses collapsed grid variant',
    });
  }

  if (sources.summary.includes('if (clientView)')) {
    failures.push({
      class: 'PROJECTS_CLIENT_METRIC_ARRAY_TRUNCATED',
      message: 'Summary component branches layout by clientView',
    });
  }

  if (!sources.shell.includes('ProjectsPageShell')) {
    failures.push({
      class: 'PROJECTS_RUNTIME_TREE_DIVERGENCE',
      message: 'ProjectsPageShell not used for index layout',
    });
  }

  if (!sources.shell.includes('data-site00-shell="projects"')) {
    failures.push({
      class: 'PROJECTS_RUNTIME_TREE_DIVERGENCE',
      message: 'Missing data-site00-shell marker on ProjectsPageShell',
    });
  }

  if (sources.legacyHeaderExists) {
    failures.push({
      class: 'PROJECTS_LEGACY_CLIENT_VARIANT_ACTIVE',
      message: 'Legacy ProjectIndexHeader.tsx still present with client-variant branches',
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
  'account-eyebrow',
] as const;

export function assertProjectsMetricSlotCount(tiles: readonly unknown[]): void {
  if (tiles.length !== 4) {
    throw new Error(`PROJECTS_CLIENT_METRIC_ARRAY_TRUNCATED: expected 4 slots, got ${tiles.length}`);
  }
}
