/**
 * P0.VR.3 — Studio World Design Route Manifest types.
 */

import type { RouteFamily, Site00RouteClassification } from '../p0vr2/types.js';
import type {
  DesignScreenDefinition,
  DesignViewportClass,
  DependencyClosureStatus,
  ImplementationCoverageStatus,
  ReferenceQualityLabel,
} from '../p0vr2/types.js';
import { STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION, P0_VR_3_LINEAGE } from './constants.js';

export { P0_VR_3_LINEAGE, STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION };

export type DesignableProjectRecord = {
  projectId: string;
  displayName: string;
  designable: boolean;
  hostProject?: boolean;
  selfDesignable?: boolean;
  routeNamespace: string;
  projectAccent: 'SITE00_HOST' | 'NDX_LIME' | 'PROJECT_CANONICAL' | 'NEUTRAL';
  showInProjectSelector: boolean;
};

export type Site00VisualStateRecord = {
  stateId: string;
  displayName: string;
  parentScreenId: string;
  routeFamily: RouteFamily;
  classification: Site00RouteClassification;
  recordKind: 'INTERACTION_STATE';
  sourceEvidence: string[];
};

export type Site00MissingRouteRecord = {
  screenId: string;
  displayName: string;
  suggestedRoute: string;
  parentFlowId: string;
  purpose: string;
  sourceEvidence: string[];
  recordKind: 'SITE00_REQUIRED_MISSING_ROUTE' | 'SITE00_IMPLIED_REQUIRED_ROUTE';
  implementationStatus: 'MISSING';
  referenceStatus: 'MISSING';
};

export type Site00RouteDependencyEdge = {
  fromScreenId: string;
  toScreenId: string;
  flowId: string;
  label?: string;
};

export type Site00RouteDependencyGraph = {
  flows: string[];
  edges: Site00RouteDependencyEdge[];
  closureByScreenId: Record<string, DependencyClosureStatus>;
};

export type ViewportCoverageSummary = {
  canonical: number;
  missing: number;
  stale: number;
  needsRebuild: number;
  partial: number;
  outdated: number;
};

export type Site00DesignCoverageSummary = {
  totalDesignablePages: number;
  totalImportantStates: number;
  mobile: ViewportCoverageSummary;
  tablet: ViewportCoverageSummary;
  desktop: ViewportCoverageSummary;
  ultrawide?: ViewportCoverageSummary;
  routeCompleteness: number;
  referenceCoverage: number;
  implementationCoverage: number;
  viewportCoverage: number;
};

export type NeedsReferenceQueueItem = {
  screenId: string;
  displayName: string;
  viewport: DesignViewportClass;
  status: ReferenceQualityLabel;
  priority: string;
};

export type NeedsBetterReferenceQueueItem = {
  screenId: string;
  displayName: string;
  viewport: DesignViewportClass;
  quality: ReferenceQualityLabel;
  reason: string;
};

export type StudioWorldDesignRouteManifestEntry = DesignScreenDefinition & {
  resolvedRoute: string;
  viewportCoverage: Partial<
    Record<
      DesignViewportClass,
      {
        referenceQuality: ReferenceQualityLabel;
        implementationCoverage: ImplementationCoverageStatus;
        tabletReference?: string | null;
        tabletImplementation?: ImplementationCoverageStatus;
        tabletStatus?: ReferenceQualityLabel;
      }
    >
  >;
};

export type StudioWorldDesignRouteManifest = {
  manifestId: 'STUDIO_WORLD_DESIGN_ROUTE_MANIFEST';
  version: typeof STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_VERSION;
  lineage: typeof P0_VR_3_LINEAGE;
  projectId: string;
  compiledAt: string;
  routes: StudioWorldDesignRouteManifestEntry[];
  visualStates: Site00VisualStateRecord[];
  missingRoutes: Site00MissingRouteRecord[];
  dependencyGraph: Site00RouteDependencyGraph;
  coverageSummary: Site00DesignCoverageSummary;
  needsReference: NeedsReferenceQueueItem[];
  needsBetterReference: NeedsBetterReferenceQueueItem[];
};

export type Site00SelfDesignBoundaryResult = {
  allowed: boolean;
  targetScope: 'SITE00_WEBSITE' | 'DESIGN_WORKSPACE_HOST' | 'BLOCKED';
  reason: string;
  hostComponentsProtected: string[];
};

export type Site00RouteForensicAuditResult = {
  projectId: 'site00';
  discoveredRoutes: StudioWorldDesignRouteManifestEntry[];
  visualStates: Site00VisualStateRecord[];
  missingRoutes: Site00MissingRouteRecord[];
  dependencyGraph: Site00RouteDependencyGraph;
  hostInternalExcluded: string[];
  auditTriggersProviderSpend: false;
  auditMutatesExistingDesign: false;
};
