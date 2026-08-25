/**
 * P0.VR.1D.4 — Visual reconstruction component registry.
 */

export type VisualReconstructionComponentRegistryEntry = {
  canonicalRegionId: string;
  componentId: string;
  filePath: string;
  styleSource: string;
  layoutProperties: string[];
};

export const VISUAL_RECONSTRUCTION_COMPONENT_REGISTRY: VisualReconstructionComponentRegistryEntry[] = [
  {
    canonicalRegionId: 'ndx.header',
    componentId: 'MobileFounderWorkspaceChrome',
    filePath: 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['padding', 'min-height', 'gap'],
  },
  {
    canonicalRegionId: 'ndx.overview.hero',
    componentId: 'OverviewMobileHomeScreen',
    filePath: 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['font-size', 'line-height', 'margin'],
  },
  {
    canonicalRegionId: 'ndx.overview.metrics',
    componentId: 'OverviewMobileHomeScreen',
    filePath: 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['grid-template-columns', 'gap'],
  },
  {
    canonicalRegionId: 'ndx.production.row',
    componentId: 'OverviewMobileHomeScreen',
    filePath: 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['flex', 'gap', 'min-width', 'min-height'],
  },
  {
    canonicalRegionId: 'ndx.radar.list',
    componentId: 'OverviewMobileHomeScreen',
    filePath: 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['padding', 'grid-template-columns'],
  },
  {
    canonicalRegionId: 'ndx.bottom-nav',
    componentId: 'MobileFounderWorkspaceChrome',
    filePath: 'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['height', 'min-height', 'grid-template-columns'],
  },
  {
    canonicalRegionId: 'ndx.project.menu',
    componentId: 'FounderWorkspaceProjectMenu',
    filePath: 'src/site00/components/founderWorkspace/FounderWorkspaceProjectMenu.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['width', 'top', 'right', 'padding'],
  },
  {
    canonicalRegionId: 'ndx.campaign.pages-lane',
    componentId: 'CampaignBoardProductionWall',
    filePath: 'src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['grid-template-columns', 'gap'],
  },
  {
    canonicalRegionId: 'ndx.campaign.week-header',
    componentId: 'MobileCampaignBoardScreen',
    filePath: 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['gap', 'padding'],
  },
  {
    canonicalRegionId: 'ndx.experiment.grid',
    componentId: 'MobileExperiment01Screen',
    filePath: 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['grid-template-columns', 'gap'],
  },
  {
    canonicalRegionId: 'ndx.content-ops.desk',
    componentId: 'ContentOperationsEditorialDesk',
    filePath: 'src/site00/components/founderWorkspace/ContentOperationsEditorialDesk.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['padding', 'gap'],
  },
  {
    canonicalRegionId: 'ndx.cultural-intelligence.radar',
    componentId: 'MobileCulturalIntelligenceScreen',
    filePath: 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['width', 'height'],
  },
  {
    canonicalRegionId: 'ndx.character.profile',
    componentId: 'MobileCharacterLabScreen',
    filePath: 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['width', 'height', 'padding'],
  },
  {
    canonicalRegionId: 'ndx.overview.desktop-composite',
    componentId: 'OverviewFounderWorkspaceBoard',
    filePath: 'src/site00/components/founderWorkspace/OverviewFounderWorkspaceBoard.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['grid-template-columns', 'gap'],
  },
  {
    canonicalRegionId: 'ndx.rail.nav',
    componentId: 'FounderWorkspaceShell',
    filePath: 'src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx',
    styleSource: 'src/site00/styles/site00-founder-workspace.css',
    layoutProperties: ['width', 'padding'],
  },
];

export function registryEntryForCanonicalRegion(canonicalRegionId: string): VisualReconstructionComponentRegistryEntry | undefined {
  return VISUAL_RECONSTRUCTION_COMPONENT_REGISTRY.find((e) => e.canonicalRegionId === canonicalRegionId);
}

export function visualReconstructionComponentRegistryImplemented(): boolean {
  return VISUAL_RECONSTRUCTION_COMPONENT_REGISTRY.length >= 10;
}
