/**
 * B5.9R7 — Frontal Slayer overview adapter (build / deploy / dependencies focus).
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

function buildFrontalSlayer(ctx: ProjectOverviewAdapterContext, clientSafe: boolean): ProjectOverviewViewModel {
  const { generalized, technicalIntelligence } = ctx;
  const progress = buildBaseOverviewProgress(generalized);
  const needs = countNeedsYourEye(generalized);
  const blockers = generalized.blockers.length;
  const builder = generalized.builderState;
  const production = generalized.productionState;

  const buildPct = builder?.buildProgressPercent;
  const deployStatus = production?.staging ?? 'STAGING';
  const depCount = technicalIntelligence?.dependencyState.outdated.length ?? builder?.inReview ?? 0;

  return {
    projectId: 'frontal-slayer',
    displayName: generalized.summary.displayName,
    descriptor: generalized.summary.tagline ?? 'LUXURY RAW HAIR BRAND',
    phase: deriveOperatingPhase(generalized, 'PRE LAUNCH'),
    lifecycleBadge: 'PRE LAUNCH',
    visual: resolveOverviewVisual('frontal-slayer', generalized.summary.displayName),
    moduleChips: moduleChipLabels(generalized.capabilityManifest),
    progress: progress.percent != null ? progress : { percent: buildPct ?? null, label: buildPct == null ? 'PRE LAUNCH' : null, confidence: 'MEDIUM' },
    needsYourEyeCount: needs,
    blockerCount: blockers,
    primarySignals: [
      {
        id: 'build',
        title: 'BUILD HEALTH',
        value: buildPct != null ? `${buildPct}%` : 'IN PROGRESS',
        status: buildPct != null && buildPct >= 80 ? 'GOOD' : 'IN PROGRESS',
        tone: buildPct != null && buildPct >= 80 ? 'green' : 'amber',
      },
      {
        id: 'deploy',
        title: 'DEPLOYMENT',
        value: deployStatus,
        status: production?.production === 'LIVE' ? 'LIVE' : 'UPDATED RECENTLY',
        tone: 'green',
      },
      {
        id: 'deps',
        title: 'DEPENDENCIES',
        value: String(depCount).padStart(2, '0'),
        status: depCount > 0 ? 'NEED REVIEW' : 'CLEAR',
        tone: depCount > 0 ? 'amber' : 'green',
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
      ? { label: generalized.currentFocus.toUpperCase(), href: projectModulePath('frontal-slayer', 'BUILDER') }
      : { label: 'HOMEPAGE QA', sublabel: 'REVIEW MOBILE LAYOUT', href: projectModulePath('frontal-slayer', 'BUILDER') },
    nextMilestone: { label: 'BETA LAUNCH', sublabel: 'LAUNCH READINESS' },
    recentActivity: mapRecentActivity(generalized, clientSafe),
    primaryAction: { label: 'OPEN BUILDER', href: projectModulePath('frontal-slayer', 'BUILDER') },
    partialState: false,
    partialMessage: null,
    adapterId: 'frontal-slayer',
  };
}

export const FrontalSlayerOverviewAdapter: ProjectOverviewAdapter = {
  adapterId: 'frontal-slayer',
  projectId: 'frontal-slayer',
  usesSpecializedOverview: true,
  stateSource: 'GENERALIZED',
  buildFounderOverview(ctx) {
    return buildFrontalSlayer(ctx, false);
  },
  buildClientOverview(ctx) {
    return buildFrontalSlayer(ctx, true);
  },
};
