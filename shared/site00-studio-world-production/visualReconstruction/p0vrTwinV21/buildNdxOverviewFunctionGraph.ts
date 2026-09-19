import type { PageFunctionGraph } from './types.js';

/** Function authority extracted from live NDXBOOK overview — no visual copying. */
export function buildNdxOverviewFunctionGraph(): PageFunctionGraph {
  return {
    routes: ['/projects/ndxbook', '/projects/ndxbook/pages/overview'],
    projectNavigation: ['PROJECTS › NDXBOOK', 'module tabs: OVERVIEW, IDENTITY, EVOLVE, PRODUCTION, REVIEWS, LIBRARY'],
    sectionNavigation: ['OVERVIEW', 'IDENTITY', 'EVOLVE', 'PRODUCTION', 'REVIEWS', 'LIBRARY'],
    currentPhase: ['CULTURE INTELLIGENCE ARCHIVE', 'IN PROGRESS badge'],
    progress: ['PROJECT PROGRESS percentage', 'phase label', 'progress track'],
    metrics: ['READINESS', 'STATUS chips', 'compact metric row grammar'],
    currentFocus: ['CURRENT FOCUS editorial block', 'image + headline pairing'],
    milestone: ['NEXT MILESTONE row', 'date / label'],
    recentActivity: ['RECENT ACTIVITY table', 'time / title / actor'],
    linksAndCtas: ['hero CTA', 'module navigation', 'deep links to production/reviews'],
    shellBehavior: ['SITE 00 host header', 'bottom nav host strip', 'founder avatar / menu'],
    dynamicState: ['project phase', 'progress %', 'activity feed timestamps'],
  };
}
