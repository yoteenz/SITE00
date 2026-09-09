/**
 * B5.9R7 — Astral World overview adapter (identity / world production focus).
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

function buildAstralWorld(ctx: ProjectOverviewAdapterContext, clientSafe: boolean): ProjectOverviewViewModel {
  const { generalized } = ctx;
  const progress = buildBaseOverviewProgress(generalized);
  const needs = countNeedsYourEye(generalized);
  const blockers = generalized.blockers.length;
  const identity = generalized.identityState;

  return {
    projectId: 'astral-world',
    displayName: generalized.summary.displayName,
    descriptor: generalized.summary.tagline ?? 'ASTRAL WORLD',
    phase: deriveOperatingPhase(generalized, 'IDENTITY EXPLORATION'),
    lifecycleBadge: 'CLIENT PROJECT',
    visual: resolveOverviewVisual('astral-world', generalized.summary.displayName),
    moduleChips: moduleChipLabels(generalized.capabilityManifest),
    progress,
    needsYourEyeCount: needs,
    blockerCount: blockers,
    primarySignals: [
      {
        id: 'identity',
        title: 'IDENTITY',
        value: identity?.visualDna ?? 'IN PROGRESS',
        status: identity?.brandTruth ?? 'EXPLORATION',
        tone: 'blue',
      },
      {
        id: 'world',
        title: 'WORLD PRODUCTION',
        value: generalized.builderState ? `${generalized.builderState.buildProgressPercent}%` : 'ACTIVE',
        status: 'BUILDER',
        tone: 'green',
      },
      {
        id: 'reviews',
        title: 'APPROVALS',
        value: String(generalized.reviewsState.filter((r) => r.status === 'PENDING').length).padStart(2, '0'),
        status: needs > 0 ? 'PENDING' : 'CLEAR',
        tone: needs > 0 ? 'amber' : 'green',
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
      ? { label: generalized.currentFocus.toUpperCase(), href: projectModulePath('astral-world', 'IDENTITY') }
      : { label: 'IDENTITY EXPLORATION', sublabel: 'WORLD DEFINITION' },
    nextMilestone: { label: 'WORLD APPROVAL', sublabel: 'CLIENT REVIEW' },
    recentActivity: mapRecentActivity(generalized, clientSafe),
    primaryAction: { label: 'OPEN IDENTITY', href: projectModulePath('astral-world', 'IDENTITY') },
    partialState: false,
    partialMessage: null,
    adapterId: 'astral-world',
  };
}

export const AstralWorldOverviewAdapter: ProjectOverviewAdapter = {
  adapterId: 'astral-world',
  projectId: 'astral-world',
  usesSpecializedOverview: true,
  stateSource: 'GENERALIZED',
  buildFounderOverview(ctx) {
    return buildAstralWorld(ctx, false);
  },
  buildClientOverview(ctx) {
    return buildAstralWorld(ctx, true);
  },
};
