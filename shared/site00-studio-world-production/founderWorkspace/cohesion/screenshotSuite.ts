/**
 * P0.UI.2 — NDXWorkspaceCohesionScreenshotSuite
 */

import type { MigrationStatus, ScreenshotCaptureEntry } from './types.js';
import { NDX_WORKSPACE_ROUTE_INVENTORY } from './routeInventory.js';
import { evaluateWorkspaceCohesion } from './workspaceCohesionEvaluation.js';

export type ScreenshotSuiteConfig = {
  viewports: Array<'mobile' | 'tablet' | 'desktop'>;
  highPriorityRouteIds: string[];
  outputDir?: string;
};

export const DEFAULT_SCREENSHOT_SUITE_CONFIG: ScreenshotSuiteConfig = {
  viewports: ['mobile', 'desktop'],
  highPriorityRouteIds: [
    'overview',
    'content-operations',
    'campaign-board',
    'experiments-hub',
    'experiment-01',
    'cultural-intelligence',
    'performance',
    'character-discovery',
    'archive',
    'daily-plan',
  ],
};

export function buildScreenshotSuiteMatrix(config: ScreenshotSuiteConfig = DEFAULT_SCREENSHOT_SUITE_CONFIG): ScreenshotCaptureEntry[] {
  const entries: ScreenshotCaptureEntry[] = [];

  for (const route of NDX_WORKSPACE_ROUTE_INVENTORY) {
    const cohesion = evaluateWorkspaceCohesion(route);
    const viewports =
      config.highPriorityRouteIds.includes(route.routeId) && config.viewports.includes('tablet')
        ? config.viewports
        : config.viewports.filter((v) => v !== 'tablet' || config.highPriorityRouteIds.includes(route.routeId));

    for (const viewport of viewports) {
      entries.push({
        routeId: route.routeId,
        path: route.path.replace(':projectSlug', 'ndxbook'),
        viewport,
        migrationStatus: route.migrationStatus as MigrationStatus,
        shellStatus: route.workspaceShell,
        accentStatus: route.projectAccentSource,
        legacyDetected: route.legacyDependencies.length > 0,
        cohesionScore: cohesion.aggregateScore,
      });
    }
  }

  return entries;
}

export function summarizeScreenshotSuite(entries: ScreenshotCaptureEntry[]): {
  routesCaptured: number;
  mobileCaptures: number;
  desktopCaptures: number;
  tabletCaptures: number;
  cohesionFailures: number;
} {
  const routeIds = new Set(entries.map((e) => e.routeId));
  return {
    routesCaptured: routeIds.size,
    mobileCaptures: entries.filter((e) => e.viewport === 'mobile').length,
    desktopCaptures: entries.filter((e) => e.viewport === 'desktop').length,
    tabletCaptures: entries.filter((e) => e.viewport === 'tablet').length,
    cohesionFailures: entries.filter((e) => e.cohesionScore < 0.85 || e.legacyDetected).length,
  };
}

export type NdxWorkspaceCohesionScreenshotSuite = ReturnType<typeof buildScreenshotSuiteMatrix>;
