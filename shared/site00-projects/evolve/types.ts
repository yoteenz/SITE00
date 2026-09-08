/**
 * B5.9R3 — Project-specific Evolve adapter contract.
 * Universal shell mounts modules; adapters own specialized Evolve intelligence.
 */

import type { ProjectModuleSubnavItem } from '../projectModules.js';
import type { ProjectOperatingState } from '../../site00-brand-lore/founderWorkspace/projectOperatingState/types.js';
import type { GeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';

export type ProjectEvolveType = 'NDXBOOK' | 'FRONTAL_SLAYER' | 'AIO' | 'GENERIC';

export type ProjectEvolveSubnavItem = ProjectModuleSubnavItem & {
  /** Mobile founder workspace screen id when embedded in POS Evolve module */
  mobileScreenId?: string;
  /** Deep route when user should navigate out of POS shell */
  href?: string;
};

export type ProjectEvolveRouteRef = {
  id: string;
  label: string;
  pathPattern: string;
  clientSafe: boolean;
};

export type ProjectEvolveAdapterState = {
  activeCampaigns: number;
  contentInProduction: number;
  packagesReady: number;
  progressPercent: number | null;
  currentPhase: string;
  needsYourEyeCount: number;
  chapterTitle: string | null;
  entriesAvailable: string[];
};

export type ProjectEvolveAdapter = {
  projectId: string;
  evolveType: ProjectEvolveType;
  /** When true, POS Evolve module must not use GenericEvolveAdapter surface */
  usesSpecializedSurface: boolean;
  stateSource: 'PROJECT_OPERATING_STATE' | 'GENERALIZED';
  getSubnav(projectSlug: string): ProjectEvolveSubnavItem[];
  getSubnavOverflow?(projectSlug: string): ProjectEvolveSubnavItem[];
  resolveMobileScreenId(subnavId: string): string;
  getDefaultSubnavId(): string;
  getEvolveRoutes(projectSlug: string): ProjectEvolveRouteRef[];
  deriveEvolveState(args: {
    generalized: GeneralizedProjectOperatingState;
    ndxOperatingState?: ProjectOperatingState | null;
  }): ProjectEvolveAdapterState;
  /** Client-safe Evolve is a separate surface — never CSS-hide founder internals */
  clientEvolveEnabled: boolean;
};
