/**
 * B5.9R3 — AIO Evolve adapter (AIO-specific marketing when Evolve enabled).
 */

import type { ProjectEvolveAdapter, ProjectEvolveAdapterState } from '../types.js';

export const AioEvolveAdapter: ProjectEvolveAdapter = {
  projectId: 'all-in-one-enterprises',
  evolveType: 'AIO',
  usesSpecializedSurface: true,
  stateSource: 'GENERALIZED',
  clientEvolveEnabled: true,

  getDefaultSubnavId() {
    return 'CAMPAIGNS';
  },

  getSubnav(_projectSlug) {
    return [
      { id: 'CAMPAIGNS', label: 'CAMPAIGNS' },
      { id: 'CONTENT', label: 'CONTENT' },
      { id: 'ANALYTICS', label: 'ANALYTICS' },
      { id: 'MORE', label: 'MORE' },
    ];
  },

  resolveMobileScreenId() {
    return 'aio-evolve';
  },

  getEvolveRoutes(projectSlug) {
    return [{ id: 'evolve-home', label: 'EVOLVE', pathPattern: `/projects/${projectSlug}/evolve`, clientSafe: true }];
  },

  deriveEvolveState({ generalized }): ProjectEvolveAdapterState {
    const evolve = generalized.evolveState;
    return {
      activeCampaigns: evolve?.activeCampaigns ?? 0,
      contentInProduction: evolve?.contentInProduction ?? 0,
      packagesReady: evolve?.packagesReady ?? 0,
      progressPercent: generalized.summary.progressPercent,
      currentPhase: generalized.summary.phase,
      needsYourEyeCount: generalized.needsYourEye.length,
      chapterTitle: null,
      entriesAvailable: [],
    };
  },
};
