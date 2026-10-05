/**
 * P0.UI.2 — NDXFounderWorkspaceVisualContract
 * Required founder-facing workspace behavior for NDXBOOK routes.
 */

import { NDX_WORKSPACE_TOKENS } from '../../../site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';

export const NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT = {
  id: 'ndx-founder-workspace-visual-contract-v1',
  hostShell: {
    required: 'FounderWorkspaceShell',
    parent: 'EcosystemShell',
    duplicateShellForbidden: true,
  },
  projectPresence: {
    projectId: 'ndxbook',
    accentToken: NDX_WORKSPACE_TOKENS.lime,
    accentCssVar: '--site00-project-presence-accent',
    hostAccentToken: NDX_WORKSPACE_TOKENS.hostRed,
    hostAccentCssVar: '--site00-host-accent',
    diamondInheritsProject: true,
  },
  workspaceField: {
    background: NDX_WORKSPACE_TOKENS.paper,
    cssClass: 'site00-fws',
    cssVar: '--ndx-paper',
  },
  ink: {
    primary: NDX_WORKSPACE_TOKENS.ink,
    muted: NDX_WORKSPACE_TOKENS.muted,
    cssVar: '--ndx-ink',
  },
  typography: {
    fontFamily: 'var(--site00-font-mono, ui-monospace, monospace)',
    headerClass: 'site00-fws-header__title',
    bodyClass: 'site00-fws-panel',
  },
  surfaceVocabulary: {
    panel: 'site00-fws-panel',
    lane: 'site00-fws-lane',
    asset: 'site00-fws-asset',
    empty: 'site00-fws-empty',
    loading: 'site00-fws-loading',
    error: 'site00-fws-error',
    prohibited: ['site00-project-lore-calibration', 'site00-experiment-g__panel', 'site00-label-red'],
  },
  spacing: {
    railWidth: '220px',
    canvasPadding: '24px',
    mobileGutter: '16px',
    desktopGutter: '24px',
    editorialGap: '20px',
  },
  navigation: {
    railClass: 'site00-fws-rail',
    bottomNavClass: 'site00-fws-mobile-nav',
    duplicateLocalNavForbidden: true,
    legacyHubNavForbidden: 'ProjectExperimentsHubNav',
  },
  inspect: {
    drawerClass: 'site00-fws-inspector',
    triggerClass: 'site00-fws-inspect-trigger',
    progressiveDisclosure: true,
  },
  responsive: {
    desktop: { minWidth: 1024, railVisible: true },
    tablet: { minWidth: 768, railCollapsible: true },
    mobile: { maxWidth: 767, bottomNav: true, overflowHidden: true },
  },
  loading: {
    component: 'WorkspaceLoadingState',
    preserveShell: true,
    preserveNav: true,
    preserveBackground: true,
    prohibited: ['Loading...', 'blank white', 'raw spinner only'],
  },
  empty: {
    component: 'WorkspaceEmptyState',
    preserveShell: true,
  },
  error: {
    component: 'WorkspaceErrorState',
    hostDangerColor: NDX_WORKSPACE_TOKENS.hostRed,
    fullScreenRedForbidden: true,
  },
  artworkAuthority: {
    assetClass: 'site00-fws-asset',
    boardClass: 'site00-fws-board',
    artworkFirst: true,
  },
  supersededDirection: 'SUPERSEDED_VISUAL_DIRECTION',
} as const;

export type NdxFounderWorkspaceVisualContract = typeof NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT;

export function routePassesVisualContract(route: {
  migrationStatus: string;
  workspaceShell: string;
  visualGeneration: string;
  projectAccentSource: string;
  localNav: string;
  loadingState: string;
  legacyDependencies: string[];
}): boolean {
  if (route.migrationStatus !== 'CANONICAL') return false;
  if (route.workspaceShell !== 'FounderWorkspaceShell') return false;
  if (route.visualGeneration !== 'FOUNDER_WORKSPACE_V1') return false;
  if (route.projectAccentSource !== 'NDX_LIME') return false;
  if (route.localNav === 'ProjectExperimentsHubNav' || route.localNav === 'DUPLICATE') return false;
  if (route.loadingState !== 'WORKSPACE_NATIVE') return false;
  if (route.legacyDependencies.some((d) => (NDX_FOUNDER_WORKSPACE_VISUAL_CONTRACT.surfaceVocabulary.prohibited as readonly string[]).includes(d))) {
    return false;
  }
  return true;
}
