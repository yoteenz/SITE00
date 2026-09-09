/**
 * B5.9R7 — Studio World overview adapter (systems / infrastructure focus).
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

function buildStudioWorld(ctx: ProjectOverviewAdapterContext, clientSafe: boolean): ProjectOverviewViewModel {
  const { generalized, technicalIntelligence } = ctx;
  const progress = buildBaseOverviewProgress(generalized);
  const needs = countNeedsYourEye(generalized);
  const blockers = generalized.blockers.length;
  const builder = generalized.builderState;

  return {
    projectId: 'studio-world',
    displayName: generalized.summary.displayName,
    descriptor: generalized.summary.tagline ?? 'STUDIO WORLD INFRASTRUCTURE',
    phase: deriveOperatingPhase(generalized, 'SYSTEMS ACTIVE'),
    lifecycleBadge: 'INFRASTRUCTURE',
    visual: resolveOverviewVisual('studio-world', generalized.summary.displayName),
    moduleChips: moduleChipLabels(generalized.capabilityManifest),
    progress,
    needsYourEyeCount: needs,
    blockerCount: blockers,
    primarySignals: [
      {
        id: 'platform',
        title: 'PLATFORM HEALTH',
        value: builder ? `${builder.buildProgressPercent}%` : 'ACTIVE',
        status: 'SYSTEMS',
        tone: 'green',
      },
      {
        id: 'builder',
        title: 'BUILDER',
        value: String(builder?.pages ?? 0),
        status: 'PAGES',
        tone: 'blue',
      },
      {
        id: 'technical',
        title: 'TECHNICAL HEALTH',
        value: technicalIntelligence?.repositoryConnection.connected ? 'CONNECTED' : 'PARTIAL',
        status: technicalIntelligence?.buildState.status.replace(/_/g, ' ') ?? 'SYNC',
        tone: technicalIntelligence?.repositoryConnection.connected ? 'green' : 'neutral',
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
      ? { label: generalized.currentFocus.toUpperCase() }
      : { label: 'CREATIVE PLATFORM QA', sublabel: 'SYSTEM SURFACES' },
    nextMilestone: { label: 'DESIGN WORKSPACE READY', sublabel: 'SITE 00 SYSTEM' },
    recentActivity: mapRecentActivity(generalized, clientSafe),
    primaryAction: { label: 'OPEN BUILDER', href: projectModulePath('studio-world', 'BUILDER') },
    partialState: false,
    partialMessage: null,
    adapterId: 'studio-world',
  };
}

export const StudioWorldOverviewAdapter: ProjectOverviewAdapter = {
  adapterId: 'studio-world',
  projectId: 'studio-world',
  usesSpecializedOverview: true,
  stateSource: 'GENERALIZED',
  buildFounderOverview(ctx) {
    return buildStudioWorld(ctx, false);
  },
  buildClientOverview(ctx) {
    return buildStudioWorld(ctx, true);
  },
};
