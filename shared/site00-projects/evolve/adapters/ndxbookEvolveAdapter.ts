/**
 * B5.9R4 — NDXBOOK Evolve adapter (mounts full marketing operating system + subshell nav).
 */

import type { ProjectEvolveAdapter, ProjectEvolveRouteRef } from '../types.js';
import {
  EVOLVE_SUBSHELL_ICON_NAMES,
  EVOLVE_SUBSHELL_TAB_SEGMENTS,
  type EvolveMoreItem,
} from '../evolveSubshellTypes.js';

function evolvePaths(projectSlug: string) {
  const base = `/projects/${projectSlug}`;
  return {
    campaignBoard: `${base}/content-operations/campaign-board`,
    contentOps: `${base}/content-operations`,
    lab: `${base}/lab`,
    expressionEngine: `${base}/content-operations/expression-engine`,
    performance: `${base}/content-operations/performance`,
    culturalIntelligence: `${base}/cultural-intelligence`,
    experiments: `${base}/experiments`,
  };
}

export const NdxbookEvolveAdapter: ProjectEvolveAdapter = {
  projectId: 'ndxbook',
  evolveType: 'NDXBOOK',
  usesSpecializedSurface: true,
  ownsEvolveSubshell: true,
  stateSource: 'PROJECT_OPERATING_STATE',
  clientEvolveEnabled: true,

  getDefaultSubnavId() {
    return 'CAMPAIGNS';
  },

  getSubnav(projectSlug) {
    const paths = evolvePaths(projectSlug);
    return [
      {
        id: 'CAMPAIGNS',
        label: 'CAMPAIGNS',
        mobileScreenId: 'campaign-board',
        icon: EVOLVE_SUBSHELL_ICON_NAMES.CAMPAIGNS,
        routeSegment: EVOLVE_SUBSHELL_TAB_SEGMENTS.CAMPAIGNS,
        href: paths.campaignBoard,
      },
      {
        id: 'CONTENT_OPS',
        label: 'CONTENT OPS',
        mobileScreenId: 'content-ops',
        icon: EVOLVE_SUBSHELL_ICON_NAMES.CONTENT_OPS,
        routeSegment: EVOLVE_SUBSHELL_TAB_SEGMENTS.CONTENT_OPS,
        href: paths.contentOps,
      },
      {
        id: 'LAB',
        label: 'LAB',
        mobileScreenId: 'lab-hub',
        icon: EVOLVE_SUBSHELL_ICON_NAMES.LAB,
        routeSegment: EVOLVE_SUBSHELL_TAB_SEGMENTS.LAB,
        href: paths.lab,
      },
      {
        id: 'MORE',
        label: 'MORE',
        mobileScreenId: 'evolve-more',
        icon: EVOLVE_SUBSHELL_ICON_NAMES.MORE,
        routeSegment: EVOLVE_SUBSHELL_TAB_SEGMENTS.MORE,
      },
    ];
  },

  getMoreItems(projectSlug): EvolveMoreItem[] {
    const paths = evolvePaths(projectSlug);
    return [
      {
        id: 'EXPRESSION_ENGINE',
        label: 'EXPRESSION ENGINE',
        icon: 'campaign_board',
        href: paths.expressionEngine,
        mobileScreenId: 'expression-engine',
      },
      {
        id: 'PERFORMANCE',
        label: 'PERFORMANCE',
        icon: 'performance_learning',
        href: paths.performance,
        mobileScreenId: 'performance',
      },
      {
        id: 'CULTURAL_INTELLIGENCE',
        label: 'CULTURAL INTELLIGENCE',
        icon: 'cultural_intelligence',
        href: paths.culturalIntelligence,
        mobileScreenId: 'cultural-intelligence',
      },
      {
        id: 'EXPERIMENTS_HUB',
        label: 'EXPERIMENTS HUB',
        icon: 'experiments_hub',
        href: paths.experiments,
        mobileScreenId: 'experiments-hub',
      },
    ];
  },

  resolveMobileScreenId(subnavId) {
    const map: Record<string, string> = {
      CAMPAIGNS: 'campaign-board',
      CONTENT_OPS: 'content-ops',
      LAB: 'lab-hub',
      MORE: 'evolve-more',
      EXPRESSION_ENGINE: 'expression-engine',
      PERFORMANCE: 'performance',
      CULTURAL_INTELLIGENCE: 'cultural-intelligence',
    };
    return map[subnavId] ?? 'campaign-board';
  },

  resolveSubnavFromTab(tabId) {
    return tabId;
  },

  getEvolveRoutes(projectSlug): ProjectEvolveRouteRef[] {
    const base = `/projects/${projectSlug}`;
    return [
      { id: 'campaign-board', label: 'CAMPAIGN BOARD', pathPattern: `${base}/content-operations/campaign-board`, clientSafe: false },
      { id: 'content-ops', label: 'CONTENT OPS', pathPattern: `${base}/content-operations`, clientSafe: false },
      { id: 'entry-001', label: 'ENTRY 001', pathPattern: `${base}/content-operations/campaign-board/entry/001`, clientSafe: false },
      { id: 'entry-002', label: 'ENTRY 002', pathPattern: `${base}/content-operations/expression-engine`, clientSafe: false },
      { id: 'entry-003', label: 'ENTRY 003', pathPattern: `${base}/content-operations/expression-engine`, clientSafe: false },
      { id: 'lab', label: 'LAB', pathPattern: `${base}/lab`, clientSafe: false },
      { id: 'expression-engine', label: 'EXPRESSION ENGINE', pathPattern: `${base}/content-operations/expression-engine`, clientSafe: false },
      { id: 'experiment-01', label: 'EXPERIMENT 01', pathPattern: `${base}/marketing-expression/experiment-01`, clientSafe: true },
      { id: 'evolve-campaigns', label: 'EVOLVE CAMPAIGNS', pathPattern: `${base}/evolve/campaigns`, clientSafe: false },
      { id: 'evolve-content-ops', label: 'EVOLVE CONTENT OPS', pathPattern: `${base}/evolve/content-ops`, clientSafe: false },
      { id: 'evolve-lab', label: 'EVOLVE LAB', pathPattern: `${base}/evolve/lab`, clientSafe: false },
      { id: 'evolve-more', label: 'EVOLVE MORE', pathPattern: `${base}/evolve/more`, clientSafe: false },
    ];
  },

  deriveEvolveState({ ndxOperatingState, generalized }) {
    const ndx = ndxOperatingState;
    const entries = ndx?.entries.map((e) => e.entryId) ?? [];
    const inProduction = ndx?.inProduction.length ?? 0;
    const approvals = ndx?.approvalsNeeded.length ?? 0;
    const packagesReady = ndx?.entry001Audit
      ? Math.max(0, (ndx.entry001Audit.packageDeliverableCount ?? 0) > 0 ? 1 : 0)
      : 0;

    return {
      activeCampaigns: Math.max(inProduction, entries.length > 0 ? 1 : 0),
      contentInProduction: inProduction,
      packagesReady: packagesReady || (ndx?.entry001Audit?.carouselSlideCount ?? 0) > 0 ? 1 : 0,
      progressPercent: ndx?.pulse.counts.beingMade
        ? Math.min(100, Math.round((ndx.pulse.counts.beingMade / Math.max(entries.length, 1)) * 100))
        : generalized.summary.progressPercent,
      currentPhase: ndx?.chapterTitle ?? generalized.summary.phase,
      needsYourEyeCount: ndx?.pulse.counts.needYourEye ?? approvals,
      chapterTitle: ndx?.chapterTitle ?? 'WHICH ONE IS IT?',
      entriesAvailable: entries,
    };
  },
};
