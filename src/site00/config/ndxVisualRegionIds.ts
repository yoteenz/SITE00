/**
 * P0.VR.1D.4 — Canonical visual reconstruction region IDs (shared reference ↔ DOM).
 */

export const NDX_VR_REGION = {
  header: 'ndx.header',
  railNav: 'ndx.rail.nav',
  overviewHero: 'ndx.overview.hero',
  overviewMetrics: 'ndx.overview.metrics',
  overviewKpis: 'ndx.overview.kpis',
  overviewKpiAudience: 'ndx.overview.kpi.audience',
  productionRow: 'ndx.production.row',
  overviewProduction: 'ndx.overview.production',
  productionCardSubscription: 'ndx.overview.production.card.subscription',
  productionCardLayoff: 'ndx.overview.production.card.layoff',
  productionCardLateFees: 'ndx.overview.production.card.late-fees',
  radarList: 'ndx.radar.list',
  overviewRadar: 'ndx.overview.radar',
  bottomNav: 'ndx.bottom-nav',
  projectMenu: 'ndx.project.menu',
  notificationPanel: 'ndx.notification.panel',
  notificationHeader: 'ndx.notification.header',
  notificationTabs: 'ndx.notification.tabs',
  notificationList: 'ndx.notification.list',
  notificationRow: 'ndx.notification.row',
  notificationFooter: 'ndx.notification.footer',
  campaignWeekHeader: 'ndx.campaign.week-header',
  campaignPagesLane: 'ndx.campaign.pages-lane',
  campaignMarginsLane: 'ndx.campaign.margins-lane',
  campaignMotionLane: 'ndx.campaign.motion-lane',
  experimentGrid: 'ndx.experiment.grid',
  contentOpsDesk: 'ndx.content-ops.desk',
  culturalIntelligenceRadar: 'ndx.cultural-intelligence.radar',
  characterProfile: 'ndx.character.profile',
  performanceLearning: 'ndx.performance.learning',
  desktopComposite: 'ndx.overview.desktop-composite',
} as const;

export type NdxVisualRegionId = (typeof NDX_VR_REGION)[keyof typeof NDX_VR_REGION];

/** Legacy hyphen IDs from P0.VR.1D.3 — mapped during transition. */
export const NDX_VR_LEGACY_REGION_ALIASES: Record<string, NdxVisualRegionId> = {
  'ndx-header': NDX_VR_REGION.header,
  'ndx-overview-heading': NDX_VR_REGION.overviewHero,
  'ndx-metrics': NDX_VR_REGION.overviewMetrics,
  'ndx-production': NDX_VR_REGION.productionRow,
  'ndx-radar': NDX_VR_REGION.radarList,
  'ndx-bottom-nav': NDX_VR_REGION.bottomNav,
  'ndx-project-menu': NDX_VR_REGION.projectMenu,
  DESKTOP_COMPOSITE_OVERVIEW: NDX_VR_REGION.desktopComposite,
};

export function vrRegionAttr(id: NdxVisualRegionId | string): { 'data-vr-region': string } {
  return { 'data-vr-region': id };
}
