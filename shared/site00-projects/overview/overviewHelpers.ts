/**
 * B5.9R7 — Shared overview helpers.
 */

import { PROJECT_MODULE_CONFIGS, type ProjectModuleId } from '../projectModules.js';
import { resolveProjectIndexVisual } from '../projectIndexVisual.js';
import { buildProjectProgressSummary } from '../projectProgressSummary.js';
import type { GeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import type { ProjectOverviewVisual, ProjectOverviewViewModel } from './types.js';

export function resolveOverviewVisual(projectId: string, displayName: string): ProjectOverviewVisual {
  const v = resolveProjectIndexVisual(projectId, displayName);
  return {
    imageUrl: v.imageUrl,
    initials: v.initials,
    visualClass: v.visualClass,
    accent: v.accent,
    accentBg: v.accentBg,
  };
}

export function moduleChipLabels(
  manifest: GeneralizedProjectOperatingState['capabilityManifest'],
): string[] {
  return manifest.enabledModules
    .filter((m) => m !== 'OVERVIEW' && m !== 'MORE')
    .map((m) => PROJECT_MODULE_CONFIGS[m as ProjectModuleId]?.label ?? m);
}

export function deriveOperatingPhase(
  generalized: GeneralizedProjectOperatingState,
  fallback?: string,
): string {
  const phase = generalized.summary.phase?.trim();
  if (phase && !/^EVOLVE$|^BUILDER$|^IDENTITY$|^PRODUCTION$|^REVIEWS$|^LIBRARY$/i.test(phase)) {
    return phase.toUpperCase();
  }
  if (generalized.currentFocus) return generalized.currentFocus.toUpperCase();
  if (fallback) return fallback.toUpperCase();
  return 'IN PROGRESS';
}

export function buildBaseOverviewProgress(
  generalized: GeneralizedProjectOperatingState,
): ReturnType<typeof buildProjectProgressSummary> {
  return buildProjectProgressSummary(generalized);
}

export function countNeedsYourEye(generalized: GeneralizedProjectOperatingState): number {
  return generalized.needsYourEye.length;
}

export function mapRecentActivity(generalized: GeneralizedProjectOperatingState, clientSafe: boolean) {
  const items = clientSafe
    ? generalized.activity.filter((a) => a.clientSafe)
    : generalized.activity;
  return items.slice(0, 4).map((a) => ({
    id: a.id,
    summary: a.summary,
    timestamp: a.timestamp,
  }));
}

export function isGenericModulePhase(phase: string): boolean {
  return /^(EVOLVE|BUILDER|IDENTITY|PRODUCTION|REVIEWS|LIBRARY|OVERVIEW)$/i.test(phase.trim());
}

export function overviewHasEmptyBody(model: ProjectOverviewViewModel): boolean {
  return (
    model.primarySignals.length === 0 &&
    !model.currentFocus &&
    !model.nextMilestone &&
    model.recentActivity.length === 0
  );
}
