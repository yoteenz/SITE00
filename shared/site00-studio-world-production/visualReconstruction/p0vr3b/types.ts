/**
 * P0.VR.3B — Normalized design route manifest v2 types.
 */

import type {
  DesignViewportClass,
  ImplementationCoverageStatus,
  ReferenceQualityLabel,
  RouteFamily,
  Site00RouteClassification,
} from '../p0vr2/types.js';
import {
  ACTIVE_ROUTE_MANIFEST_SCHEMA,
  ACTIVE_ROUTE_MANIFEST_VERSION,
  P0_VR_3B_LINEAGE,
  STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_ID,
} from './constants.js';

export type ImplementationRouteRecord = {
  implementationRouteId: string;
  pathPattern: string;
  componentHint: string | null;
  sourceFile: string;
  reachable: boolean;
  isRedirect: boolean;
  isDesktopVariant: boolean;
  designScreenId: string | null;
};

export type DesignScreenRecord = {
  designScreenId: string;
  displayName: string;
  normalizedPath: string;
  routeFamily: RouteFamily;
  genericRouteFamily: string;
  implementationRouteIds: string[];
  componentName: string | null;
  classification: Site00RouteClassification;
  designableByDefault: boolean;
  orphan: false;
  viewportCoverage: Partial<
    Record<
      DesignViewportClass,
      {
        pageReferenceStatus: ReferenceQualityLabel;
        backgroundAssetStatus: ReferenceQualityLabel | 'LOCKED' | 'NOT_APPLICABLE';
        implementationCoverage: ImplementationCoverageStatus;
      }
    >
  >;
};

export type Site00RouteCountModel = {
  rawImplementationRouteCount: number;
  normalizedDesignScreenCount: number;
  websiteExperienceRouteCount: number;
  primaryFounderDesignableCount: number;
  visualStateCount: number;
  missingDependencyCount: number;
  hostInternalCount: number;
  trueOrphanCount: number;
};

export type StudioWorldDesignRouteManifestV2 = {
  manifestId: typeof STUDIO_WORLD_DESIGN_ROUTE_MANIFEST_ID;
  schema: typeof ACTIVE_ROUTE_MANIFEST_SCHEMA;
  version: typeof ACTIVE_ROUTE_MANIFEST_VERSION;
  lineage: typeof P0_VR_3B_LINEAGE;
  projectId: string;
  compiledAt: string;
  rawImplementationRoutes: ImplementationRouteRecord[];
  designScreens: DesignScreenRecord[];
  routeCounts: Site00RouteCountModel;
  trueOrphanCount: 0;
};

export { P0_VR_3B_LINEAGE, ACTIVE_ROUTE_MANIFEST_SCHEMA, ACTIVE_ROUTE_MANIFEST_VERSION };
