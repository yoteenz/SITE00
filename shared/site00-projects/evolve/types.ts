/**
 * B5.9R3 — Project-specific Evolve adapter contract.
 * Universal shell mounts modules; adapters own specialized Evolve intelligence.
 */

import type { NDXIconName } from '../../site00-studio-world-ui/icons/index.js';
import type { ProjectModuleSubnavItem } from '../projectModules.js';
import type { ProjectOperatingState } from '../../site00-brand-lore/founderWorkspace/projectOperatingState/types.js';
import type { GeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import type { EvolveMoreItem, EvolveSubshellTabId } from './evolveSubshellTypes.js';

export type ProjectEvolveType = 'NDXBOOK' | 'FRONTAL_SLAYER' | 'AIO' | 'GENERIC';

export type ProjectEvolveSubnavItem = ProjectModuleSubnavItem & {
  /** Mobile founder workspace screen id when embedded in POS Evolve module */
  mobileScreenId?: string;
  /** Deep route when user should navigate out of POS shell */
  href?: string;
  /** Approved NDX bottom-nav icon registry key */
  icon?: NDXIconName;
  /** URL segment under /projects/:slug/evolve/:segment */
  routeSegment?: string;
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
  /** When true, Evolve subshell owns internal tab nav — POS must not render generic subnav */
  ownsEvolveSubshell?: boolean;
  stateSource: 'PROJECT_OPERATING_STATE' | 'GENERALIZED';
  getSubnav(projectSlug: string): ProjectEvolveSubnavItem[];
  /** @deprecated B5.9R4 — use getMoreItems for EvolveMorePanel instead of POS overflow */
  getSubnavOverflow?(projectSlug: string): ProjectEvolveSubnavItem[];
  getMoreItems?(projectSlug: string): EvolveMoreItem[];
  resolveMobileScreenId(subnavId: string): string;
  resolveSubnavFromTab?(tabId: EvolveSubshellTabId): string;
  getDefaultSubnavId(): string;
  getEvolveRoutes(projectSlug: string): ProjectEvolveRouteRef[];
  deriveEvolveState(args: {
    generalized: GeneralizedProjectOperatingState;
    ndxOperatingState?: ProjectOperatingState | null;
  }): ProjectEvolveAdapterState;
  /** Client-safe Evolve is a separate surface — never CSS-hide founder internals */
  clientEvolveEnabled: boolean;
};
