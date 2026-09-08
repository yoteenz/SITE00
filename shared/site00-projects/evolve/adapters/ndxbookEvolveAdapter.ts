/**
 * B5.9R3 — NDXBOOK Evolve adapter (mounts full marketing operating system).
 */

import type { ProjectEvolveAdapter, ProjectEvolveRouteRef } from '../types.js';

export const NdxbookEvolveAdapter: ProjectEvolveAdapter = {
  projectId: 'ndxbook',
  evolveType: 'NDXBOOK',
  usesSpecializedSurface: true,
  stateSource: 'PROJECT_OPERATING_STATE',
  clientEvolveEnabled: true,

  getDefaultSubnavId() {
    return 'CAMPAIGNS';
  },

  getSubnav(_projectSlug) {
    return [
      { id: 'CAMPAIGNS', label: 'CAMPAIGNS', mobileScreenId: 'campaign-board' },
      { id: 'CONTENT_OPS', label: 'CONTENT OPS', mobileScreenId: 'content-ops' },
      { id: 'LAB', label: 'LAB', mobileScreenId: 'lab-hub' },
      { id: 'MORE', label: 'MORE', mobileScreenId: 'experiments-hub' },
    ];
  },

  getSubnavOverflow(_projectSlug) {
    return [
      { id: 'EXPRESSION_ENGINE', label: 'EXPRESSION ENGINE', mobileScreenId: 'expression-engine' },
      { id: 'PERFORMANCE', label: 'PERFORMANCE', mobileScreenId: 'performance' },
      { id: 'CULTURAL_INTELLIGENCE', label: 'CULTURAL INTELLIGENCE', mobileScreenId: 'cultural-intelligence' },
    ];
  },

  resolveMobileScreenId(subnavId) {
    const map: Record<string, string> = {
      CAMPAIGNS: 'campaign-board',
      CONTENT_OPS: 'content-ops',
      LAB: 'lab-hub',
      MORE: 'experiments-hub',
      EXPRESSION_ENGINE: 'expression-engine',
      PERFORMANCE: 'performance',
      CULTURAL_INTELLIGENCE: 'cultural-intelligence',
    };
    return map[subnavId] ?? 'campaign-board';
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
