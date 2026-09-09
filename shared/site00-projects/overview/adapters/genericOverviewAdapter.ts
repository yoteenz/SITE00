/**
 * B5.9R7 — Generic project overview adapter (intentional partial — never fake zeros).
 */

import { projectModulePath } from '../../projectModules.js';
import type { ProjectOverviewAdapter, ProjectOverviewAdapterContext, ProjectOverviewViewModel } from '../types.js';
import {
  buildBaseOverviewProgress,
  countNeedsYourEye,
  deriveOperatingPhase,
  mapRecentActivity,
  moduleChipLabels,
  resolveOverviewVisual,
} from '../overviewHelpers.js';

function buildGeneric(ctx: ProjectOverviewAdapterContext, clientSafe: boolean): ProjectOverviewViewModel {
  const { generalized } = ctx;
  const progress = buildBaseOverviewProgress(generalized);
  const needs = countNeedsYourEye(generalized);
  const blockers = generalized.blockers.length;
  const partial = progress.percent == null && needs === 0 && blockers === 0;

  return {
    projectId: generalized.projectId,
    displayName: generalized.summary.displayName,
    descriptor: generalized.summary.tagline ?? generalized.summary.displayName,
    phase: deriveOperatingPhase(generalized),
    lifecycleBadge: generalized.summary.lifecycleStage,
    visual: resolveOverviewVisual(generalized.projectId, generalized.summary.displayName),
    moduleChips: moduleChipLabels(generalized.capabilityManifest),
    progress,
    needsYourEyeCount: needs,
    blockerCount: blockers,
    primarySignals: [
      {
        id: 'progress',
        title: 'PROJECT PROGRESS',
        value: progress.percent != null ? `${progress.percent}%` : (progress.label ?? 'IN PROGRESS'),
        status: progress.confidence === 'HIGH' ? 'TRACKED' : 'PARTIAL',
        tone: progress.percent != null && progress.percent >= 50 ? 'green' : 'amber',
      },
      {
        id: 'reviews',
        title: 'NEEDS YOUR EYE',
        value: String(needs).padStart(2, '0'),
        status: needs > 0 ? 'ACTION NEEDED' : 'CLEAR',
        tone: needs > 0 ? 'red' : 'neutral',
      },
      {
        id: 'blockers',
        title: 'BLOCKERS',
        value: String(blockers).padStart(2, '0'),
        status: blockers > 0 ? 'ACTION NEEDED' : 'CLEAR',
        tone: blockers > 0 ? 'red' : 'green',
      },
      {
        id: 'phase',
        title: 'CURRENT PHASE',
        value: deriveOperatingPhase(generalized),
        status: generalized.summary.lifecycleStage ?? 'ACTIVE',
        tone: 'blue',
      },
    ],
    currentFocus: generalized.currentFocus
      ? { label: generalized.currentFocus.toUpperCase(), href: projectModulePath(generalized.projectId, 'OVERVIEW') }
      : partial
        ? { label: 'PROJECT DATA PARTIAL', sublabel: 'SYNC REQUIRED' }
        : null,
    nextMilestone: null,
    recentActivity: mapRecentActivity(generalized, clientSafe),
    primaryAction: {
      label: 'OPEN PROJECT WORKSPACE',
      href: projectModulePath(generalized.projectId, 'OVERVIEW'),
    },
    partialState: partial,
    partialMessage: partial ? 'PROJECT DATA PARTIAL — SYNC REQUIRED' : null,
    adapterId: 'generic',
  };
}

export function createGenericOverviewAdapter(projectId: string): ProjectOverviewAdapter {
  return {
    adapterId: 'generic',
    projectId,
    usesSpecializedOverview: false,
    stateSource: 'GENERALIZED',
    buildFounderOverview(ctx) {
      return buildGeneric(ctx, false);
    },
    buildClientOverview(ctx) {
      return buildGeneric(ctx, true);
    },
  };
}

export const GenericProjectOverviewAdapter = createGenericOverviewAdapter('generic');
