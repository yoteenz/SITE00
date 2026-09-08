/**
 * B5.9R3 — Frontal Slayer Evolve adapter (project-specific, no NDXBOOK entries).
 */

import type { ProjectEvolveAdapter, ProjectEvolveAdapterState } from '../types.js';

export const FrontalSlayerEvolveAdapter: ProjectEvolveAdapter = {
  projectId: 'frontal-slayer',
  evolveType: 'FRONTAL_SLAYER',
  usesSpecializedSurface: true,
  stateSource: 'GENERALIZED',
  clientEvolveEnabled: false,

  getDefaultSubnavId() {
    return 'CAMPAIGNS';
  },

  getSubnav(_projectSlug) {
    return [
      { id: 'CAMPAIGNS', label: 'CAMPAIGNS' },
      { id: 'CONTENT', label: 'CONTENT OPS' },
      { id: 'ANALYTICS', label: 'ANALYTICS' },
      { id: 'MORE', label: 'MORE' },
    ];
  },

  resolveMobileScreenId() {
    return 'frontal-slayer-evolve';
  },

  getEvolveRoutes(projectSlug) {
    return [
      { id: 'evolve-home', label: 'EVOLVE', pathPattern: `/projects/${projectSlug}/evolve`, clientSafe: false },
    ];
  },

  deriveEvolveState({ generalized }): ProjectEvolveAdapterState {
    const evolve = generalized.evolveState;
    return {
      activeCampaigns: evolve?.activeCampaigns ?? 0,
      contentInProduction: evolve?.contentInProduction ?? 0,
      packagesReady: evolve?.packagesReady ?? 0,
      progressPercent: generalized.summary.progressPercent,
      currentPhase: generalized.summary.phase,
      needsYourEyeCount: generalized.needsYourEye.filter((n) => n.module === 'EVOLVE').length,
      chapterTitle: null,
      entriesAvailable: [],
    };
  },
};
