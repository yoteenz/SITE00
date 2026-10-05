/** P0.VR.TWINV3.0R5F1 — Design workspace feature authority models. */

export type DesignWorkspaceFeatureManifestStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

export type WorkspaceFeatureLifecycleStatus =
  | 'ACTIVE'
  | 'ADDED'
  | 'MODIFIED'
  | 'EXPERIMENTAL'
  | 'DEPRECATED'
  | 'REMOVED'
  | 'REPLACED';

export type WorkspaceFeatureChangeType =
  | 'ADD_FEATURE'
  | 'MODIFY_FEATURE'
  | 'REMOVE_FEATURE'
  | 'REPLACE_FEATURE'
  | 'RESTORE_FEATURE'
  | 'CHANGE_REQUIREMENT'
  | 'CHANGE_OWNERSHIP'
  | 'CHANGE_PRESENTATION_CONTRACT';

export type MasterAuthorityAmendmentType =
  | 'FEATURE_ADDITION'
  | 'FEATURE_MODIFICATION'
  | 'FEATURE_REMOVAL'
  | 'FEATURE_REPLACEMENT'
  | 'FUNCTIONAL_CORRECTION'
  | 'LAYOUT_CORRECTION'
  | 'PROJECT_CONTEXT_UPDATE';

export type MasterEvolutionMode = 'FULL_MASTER_REGENERATION' | 'MASTER_AMENDMENT';

export type FeatureCoverageResult = 'PASS' | 'FAIL';

export type DesignWorkspaceFeatureManifest = {
  id: string;
  workspaceType: 'DESIGN_PAGE_V3';
  version: string;
  projectScope: string;
  featureIds: string[];
  requiredFeatureIds: string[];
  optionalFeatureIds: string[];
  experimentalFeatureIds: string[];
  deprecatedFeatureIds: string[];
  removedFeatureIds: string[];
  replacementMap: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  parentManifestVersion: string | null;
  changeSetIds: string[];
  checksum: string;
  status: DesignWorkspaceFeatureManifestStatus;
};

export type WorkspaceFeatureDefinition = {
  featureId: string;
  featureName: string;
  description: string;
  functionalPurpose: string;
  lifecycleStatus: WorkspaceFeatureLifecycleStatus;
  required: boolean;
  ownership: 'HOST' | 'PROJECT' | 'SHARED';
  interactionClass: string;
  visualPresenceRequirement: string;
  allowablePresentationModes: string[];
  dataDependencies: string[];
  functionDependencies: string[];
  authorityRequirements: string[];
  introducedInVersion: string;
  modifiedInVersion: string | null;
  deprecatedInVersion: string | null;
  removedInVersion: string | null;
  replacedByFeatureId: string | null;
  notes: string;
};

export type WorkspaceFeatureChangeSet = {
  id: string;
  workspaceType: 'DESIGN_PAGE_V3';
  baseManifestVersion: string | null;
  resultingManifestVersion: string;
  changeType: WorkspaceFeatureChangeType;
  affectedFeatureIds: string[];
  addedFeatures: string[];
  modifiedFeatures: string[];
  removedFeatures: string[];
  replacementPairs: Array<{ from: string; to: string }>;
  founderIntent: string;
  reason: string;
  affectedAuthorityRegions: string[];
  preservationRequirements: string[];
  requiresMasterAmendment: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  status: 'DRAFT' | 'APPROVED' | 'APPLIED' | 'SUPERSEDED';
};

export type MasterAuthorityAmendment = {
  id: string;
  baseAuthorityId: string | null;
  baseAuthorityPairId: string | null;
  featureChangeSetId: string;
  viewport: 'MOBILE' | 'DESKTOP' | 'PAIR';
  amendmentType: MasterAuthorityAmendmentType;
  affectedFeatureIds: string[];
  affectedRegions: string[];
  preservationZones: string[];
  mutableZones: string[];
  visualChangeInstructions: string[];
  parentAuthorityHash: string | null;
  resultingAuthorityId: string | null;
  resultingAuthorityHash: string | null;
  status: 'DRAFT' | 'APPROVED' | 'APPLIED' | 'SUPERSEDED';
  version: number;
  evolutionMode: MasterEvolutionMode;
};

export type FeatureCoverageReceipt = {
  authorityCandidateId: string;
  manifestVersion: string;
  requiredFeatureCount: number;
  representedFeatureCount: number;
  missingFeatureIds: string[];
  deprecatedFeatureIdsPresent: string[];
  removedFeatureIdsPresent: string[];
  unapprovedFeatureIdsPresent: string[];
  ambiguousFeatureBindings: string[];
  coveragePercent: number;
  result: FeatureCoverageResult;
  generatedAt: string;
};

export type MasterFeatureBinding = {
  id: string;
  featureId: string;
  authorityId: string;
  viewport: 'mobile' | 'desktop';
  visualRegionId: string;
  visualObjectIds: string[];
  presentationMode: string;
  interactionIntent: string;
  ownership: 'HOST' | 'PROJECT' | 'SHARED';
  structuralBindingState: 'UNBOUND' | 'PLANNED' | 'BOUND';
  functionBindingState: 'UNBOUND' | 'PLANNED' | 'BOUND';
  implementationBindingState: 'UNBOUND' | 'PLANNED' | 'BOUND';
  qaState: 'UNKNOWN' | 'PASS' | 'FAIL';
};

export type DesignWorkspaceFeatureAuthorityState = {
  activeManifest: DesignWorkspaceFeatureManifest;
  changeSets: WorkspaceFeatureChangeSet[];
  amendments: MasterAuthorityAmendment[];
  candidateCoverageById: Record<string, FeatureCoverageReceipt>;
  masterBindings: MasterFeatureBinding[];
};
