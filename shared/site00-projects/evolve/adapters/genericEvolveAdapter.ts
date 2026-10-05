/**
 * B5.9R3 — Generic Evolve fallback for projects with Evolve enabled but no specialized adapter.
 */

import type { ProjectEvolveAdapter, ProjectEvolveAdapterState } from '../types.js';

export function createGenericEvolveAdapter(projectId: string): ProjectEvolveAdapter {
  return {
    projectId,
    evolveType: 'GENERIC',
    usesSpecializedSurface: false,
    stateSource: 'GENERALIZED',
    clientEvolveEnabled: false,

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
      return 'generic-evolve';
    },

    getEvolveRoutes(projectSlug) {
      return [{ id: 'evolve-home', label: 'EVOLVE', pathPattern: `/projects/${projectSlug}/evolve`, clientSafe: false }];
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
}

export const GenericEvolveAdapter = createGenericEvolveAdapter('generic');
