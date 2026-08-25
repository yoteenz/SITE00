import type { WorkspaceNavId } from '../../../shared/site00-studio-world-production/founderWorkspace/types.js';
import type { NDXIconName } from '../../../shared/site00-studio-world-ui/icons/index.js';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectFounderCharacterDiscoveryPath,
  site00ProjectFounderWorkspaceArchivePath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectCulturalIntelligencePath,
  site00ProjectExperimentsPath,
  site00ProjectPath,
} from './routes';

export const NDX_WORKSPACE_NAV_ICONS: Record<WorkspaceNavId, NDXIconName> = {
  OVERVIEW: 'overview',
  EXPERIMENTS: 'experiments_hub',
  CAMPAIGN: 'campaign_board',
  CONTENT_OPS: 'content_ops',
  CREATE: 'content_ops',
  REVIEW: 'campaign_board',
  LEARN: 'performance_learning',
  INTELLIGENCE: 'cultural_intelligence',
  CHARACTER: 'character_lab',
  ARCHIVE: 'archive',
};

export type NdxBottomNavId = 'OVERVIEW' | 'CAMPAIGNS' | 'CONTENT_OPS' | 'LAB' | 'MORE';

export type NdxBottomNavItem = {
  id: NdxBottomNavId;
  label: string;
  href: string;
  icon: NDXIconName;
};

export function ndxFounderWorkspaceBottomNav(projectSlug: string): NdxBottomNavItem[] {
  return [
    { id: 'OVERVIEW', label: 'OVERVIEW', href: site00ProjectPath(projectSlug), icon: 'overview' },
    {
      id: 'CAMPAIGNS',
      label: 'CAMPAIGNS',
      href: site00ProjectContentOperationsCampaignBoardPath(projectSlug),
      icon: 'campaigns',
    },
    {
      id: 'CONTENT_OPS',
      label: 'CONTENT OPS',
      href: site00ProjectContentOperationsPath(projectSlug),
      icon: 'content_ops',
    },
    {
      id: 'LAB',
      label: 'LAB',
      href: site00ProjectFounderCharacterDiscoveryPath(projectSlug),
      icon: 'lab',
    },
    { id: 'MORE', label: 'MORE', href: '#more', icon: 'more' },
  ];
}

export type NdxProjectMenuItem = {
  id: string;
  label: string;
  href: string;
  icon: NDXIconName;
};

export function ndxFounderWorkspaceMenuItems(projectSlug: string): NdxProjectMenuItem[] {
  return [
    { id: 'project-overview', label: 'PROJECT OVERVIEW', href: site00ProjectPath(projectSlug), icon: 'project_overview' },
    { id: 'project-settings', label: 'PROJECT SETTINGS', href: `${site00ProjectPath(projectSlug)}/setup`, icon: 'project_settings' },
    { id: 'back-to-projects', label: 'BACK TO PROJECTS', href: '/projects', icon: 'back_to_projects' },
    { id: 'return-to-origin', label: 'RETURN TO ORIGIN', href: '/origin', icon: 'return_to_origin' },
    { id: 'inspect', label: 'INSPECT', href: site00ProjectExperimentsPath(projectSlug), icon: 'inspect' },
    { id: 'help', label: 'HELP', href: '/help', icon: 'help' },
  ];
}

export function ndxFounderWorkspaceOverflowNav(projectSlug: string) {
  return [
    { id: 'LEARN' as const, label: 'LEARN', href: site00ProjectContentOperationsPerformancePath(projectSlug), icon: 'performance_learning' as NDXIconName },
    { id: 'INTELLIGENCE' as const, label: 'INTELLIGENCE', href: site00ProjectCulturalIntelligencePath(projectSlug), icon: 'cultural_intelligence' as NDXIconName },
    { id: 'ARCHIVE' as const, label: 'ARCHIVE', href: site00ProjectFounderWorkspaceArchivePath(projectSlug), icon: 'archive' as NDXIconName },
    { id: 'EXPERIMENTS' as const, label: 'EXPERIMENTS HUB', href: site00ProjectExperimentsPath(projectSlug), icon: 'experiments_hub' as NDXIconName },
  ];
}
