/** Browser-safe P0.VR.3A exports. */
export {
  runSite00RouteForensicAudit,
  listSite00DesignableScreens,
  buildSite00DiscoveredRoutes,
  buildSite00VisualStates,
  buildSite00MissingRoutes,
} from './site00RouteForensics.js';
export { buildSite00RouteDependencyGraph, formatSite00RouteMapTree } from './site00RouteDependencyGraph.js';
export {
  auditSite00References,
  evaluateSite00ReferenceQuality,
  detectBackgroundAssetForRoute,
} from './site00ReferenceDiscovery.js';
export {
  buildSite00DesignCoverageSummary,
  buildNeedsReferenceQueue,
  buildNeedsBetterReferenceQueue,
  buildSite00PageCoverageMatrix,
} from './site00CoverageSummary.js';
export {
  evaluateSite00SelfDesignBoundary,
  matchReferenceCanPatchHostAccidentally,
  detectSharedComponentImpactForSite00,
} from './site00SelfDesignBoundary.js';
export { registerSite00DesignPilot, resetSite00PilotForTest, ensureSite00DesignPilotRegistered } from './site00PilotRegistration.js';
