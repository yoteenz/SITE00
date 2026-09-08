/**
 * B5.9R7 — All In One Enterprises overview adapter.
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

function buildAio(ctx: ProjectOverviewAdapterContext, clientSafe: boolean): ProjectOverviewViewModel {
  const { generalized, technicalIntelligence } = ctx;
  const progress = buildBaseOverviewProgress(generalized);
  const needs = countNeedsYourEye(generalized);
  const blockers = generalized.blockers.length;
  const builder = generalized.builderState;
  const production = generalized.productionState;

  return {
    projectId: 'all-in-one-enterprises',
    displayName: generalized.summary.displayName,
    descriptor: generalized.summary.tagline ?? 'ALL IN ONE ENTERPRISES',
    phase: deriveOperatingPhase(generalized, 'OPERATIONS'),
    lifecycleBadge: generalized.summary.lifecycleStage,
    visual: resolveOverviewVisual('all-in-one-enterprises', generalized.summary.displayName),
    moduleChips: moduleChipLabels(generalized.capabilityManifest),
    progress,
    needsYourEyeCount: needs,
    blockerCount: blockers,
    primarySignals: [
      {
        id: 'operations',
        title: 'OPERATIONS',
        value: builder ? `${builder.complete}/${builder.pages}` : 'ACTIVE',
        status: 'DELIVERABLES',
        tone: 'blue',
      },
      {
        id: 'production',
        title: 'PRODUCTION',
        value: production?.production ?? 'STAGING',
        status: production?.staging ?? 'IN PROGRESS',
        tone: 'green',
      },
      {
        id: 'technical',
        title: 'TECHNICAL HEALTH',
        value: technicalIntelligence?.readinessAssessment.overall.replace(/_/g, ' ') ?? 'PARTIAL',
        status: 'READINESS',
        tone: 'amber',
      },
      {
        id: 'blockers',
        title: 'BLOCKERS',
        value: String(blockers).padStart(2, '0'),
        status: blockers > 0 ? 'ACTION NEEDED' : 'CLEAR',
        tone: blockers > 0 ? 'red' : 'green',
      },
    ],
    currentFocus: generalized.currentFocus
      ? { label: generalized.currentFocus.toUpperCase(), href: projectModulePath('all-in-one-enterprises', 'BUILDER') }
      : null,
    nextMilestone: { label: 'LAUNCH READINESS', sublabel: 'PRODUCTION CHECKLIST' },
    recentActivity: mapRecentActivity(generalized, clientSafe),
    primaryAction: { label: 'OPEN BUILDER', href: projectModulePath('all-in-one-enterprises', 'BUILDER') },
    partialState: progress.percent == null && needs === 0,
    partialMessage: progress.percent == null ? 'PROGRESS NOT YET SCORED' : null,
    adapterId: 'all-in-one-enterprises',
  };
}

export const AioOverviewAdapter: ProjectOverviewAdapter = {
  adapterId: 'all-in-one-enterprises',
  projectId: 'all-in-one-enterprises',
  usesSpecializedOverview: true,
  stateSource: 'GENERALIZED',
  buildFounderOverview(ctx) {
    return buildAio(ctx, false);
  },
  buildClientOverview(ctx) {
    return buildAio(ctx, true);
  },
};
