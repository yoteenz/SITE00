/**
 * NDXBOOK mobile bottom nav — Image B screen family authority.
 */

import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectExperimentsPath,
  site00ProjectFounderCharacterDiscoveryPath,
  site00ProjectPath,
} from './routes';

export type NdxMobileNavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  screenId: string;
};

export function ndxFounderWorkspaceMobileNav(projectSlug: string): NdxMobileNavItem[] {
  return [
    { id: 'overview', label: 'OVERVIEW', href: site00ProjectPath(projectSlug), icon: '⌂', screenId: 'overview' },
    {
      id: 'campaigns',
      label: 'CAMPAIGNS',
      href: site00ProjectContentOperationsCampaignBoardPath(projectSlug),
      icon: '▤',
      screenId: 'campaign-board',
    },
    {
      id: 'content-ops',
      label: 'CONTENT OPS',
      href: site00ProjectContentOperationsPath(projectSlug),
      icon: '◎',
      screenId: 'content-ops',
    },
    {
      id: 'lab',
      label: 'LAB',
      href: site00ProjectFounderCharacterDiscoveryPath(projectSlug),
      icon: '⚗',
      screenId: 'character-lab',
    },
    { id: 'more', label: 'MORE', href: site00ProjectExperimentsPath(projectSlug), icon: '···', screenId: 'experiments-hub' },
  ];
}

export function resolveMobileScreenIdFromPath(pathname: string, projectSlug: string): string {
  const normalized = pathname.replace(/\/+$/, '');
  const base = `/projects/${projectSlug}`;
  if (normalized === base) return 'overview';
  if (normalized.includes('/content-operations/campaign-board')) return 'campaign-board';
  if (normalized.includes('/marketing-expression/experiment-01')) return 'experiment-01';
  if (normalized.includes('/content-operations')) return 'content-ops';
  if (normalized.includes('/cultural-intelligence')) return 'cultural-intelligence';
  if (normalized.includes('/character/')) return 'character-lab';
  if (normalized.includes('/content-operations/performance')) return 'performance';
  if (normalized.includes('/experiments')) return 'experiments-hub';
  return 'overview';
}
