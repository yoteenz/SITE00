/**
 * P0.VR.3D — Reconciliation types.
 */

import type { RouteFamily } from '../p0vr2/types.js';
import type { DesignScreenRecord, Site00RouteCountModel } from '../p0vr3b/types.js';
import type { Site00MissingRouteRecord, Site00VisualStateRecord } from '../p0vr3/types.js';
import { P0_VR_3D_LINEAGE } from './constants.js';

export { P0_VR_3D_LINEAGE };

export type Site00RouteExperienceScope =
  | 'SITE00_WEBSITE'
  | 'SITE00_CLIENT_WORKFLOW'
  | 'SITE00_FOUNDER_WORKSPACE'
  | 'SITE00_HOST_TOOL'
  | 'SITE00_SYSTEM_INTERNAL'
  | 'SITE00_DEV_ONLY'
  | 'SITE00_HISTORICAL';

export type Site00DesignabilityClass = 'PRIMARY' | 'EXTENDED' | 'INSPECT_ONLY' | 'NOT_DESIGNABLE';

export type Site00ReconciliationConflictType =
  | 'ROUTE_EXISTENCE_CONFLICT'
  | 'DESIGNABILITY_CONFLICT'
  | 'SCOPE_CONFLICT'
  | 'STATE_VS_ROUTE_CONFLICT'
  | 'REFERENCE_STATUS_CONFLICT'
  | 'MISSING_ROUTE_CONFLICT';

export type Site00SelfAuditRouteMapping = {
  selfAuditRouteId: string;
  implementationRouteIds: string[];
  designScreenId: string | null;
  experienceScope: Site00RouteExperienceScope;
  routeFamily: RouteFamily;
  site00RouteFamily: RouteFamily;
  designabilityClass: Site00DesignabilityClass;
  mappingConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNMAPPED';
  unmappedReason?: 'MISSING_FROM_V2_AUDIT' | 'VISUAL_STATE' | 'MISSING_REQUIRED_ROUTE' | 'IMPLIED_REQUIRED_ROUTE' | 'ROUTE_DISCOVERY_GAP';
};

export type Site00FamilyCandidate = {
  candidateId: string;
  familySeed: string;
  screenIds: string[];
  candidateKind: 'INFORMATION' | 'AUTH' | 'HOMEPAGE_STATE' | 'OTHER';
  status: 'FAMILY_CANDIDATE';
};

export type Site00AuditReconciliationReport = {
  lineage: typeof P0_VR_3D_LINEAGE;
  compiledAt: string;
  p0vr3aV1Status: 'HISTORICAL_AUDIT_ARTIFACT';
  activeManifestSchema: string;
  activeManifestVersion: string;
  selfAuditRecords: number;
  mappedToV2: number;
  merged: number;
  unmapped: number;
  duplicatesPrevented: number;
  mappings: Site00SelfAuditRouteMapping[];
  conflicts: Array<{
    type: Site00ReconciliationConflictType;
    selfAuditRouteId: string;
    message: string;
    resolution: string;
    requiresReview: boolean;
  }>;
  routeCounts: Site00RouteCountModel;
  familyCandidates: Site00FamilyCandidate[];
  countExplanations: Record<string, string>;
};

export type DesignRouteSyncContract = {
  schema: string;
  version: string;
  projectId: string;
  selfDesignTargetScope: 'SITE00_WEBSITE';
  protectedHostScope: 'SITE00_DESIGN_WORKSPACE_HOST';
  routeCounts: Site00RouteCountModel;
  enrichedDesignScreens: EnrichedDesignScreenRecord[];
  visualStates: Site00VisualStateRecord[];
  canonicalMissingRoutes: Site00MissingRouteRecord[];
  historicalAuditArtifact: {
    lineage: 'P0.VR.3A';
    version: 'v1';
    status: 'HISTORICAL_AUDIT_ARTIFACT';
  };
};

export type EnrichedDesignScreenRecord = DesignScreenRecord & {
  projectExperienceScope: Site00RouteExperienceScope;
  designabilityClass: Site00DesignabilityClass;
  site00RouteFamily: RouteFamily;
  site00ExperienceRole: string;
  selfAuditRouteId: string | null;
  customerFacing: boolean;
  clientWorkflow: boolean;
  founderWorkspace: boolean;
  hostInternal: boolean;
  systemInternal: boolean;
  requiredMissing: boolean;
  impliedRequired: boolean;
  pageReferenceStatus: string;
  backgroundAssetStatus: string;
  familyCandidateId: string | null;
};

export type Site00FounderDesignScreenSet = {
  mode: 'PRIMARY' | 'ALL_DESIGNABLE';
  screenIds: string[];
  derivedFrom: 'DesignScreenRecord+experienceScope+designabilityClass';
};

export type ReconciledActiveManifest = DesignRouteSyncContract & {
  reconciliationReport: Site00AuditReconciliationReport;
};
