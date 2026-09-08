/**
 * B5.9R1 — Codebase-aware project state for Builder/Production modules.
 */

export type ProjectCodebaseSyncStatus = 'SYNCED' | 'STALE' | 'UNKNOWN' | 'ERROR';

export type ProjectRouteInventoryEntry = {
  path: string;
  label: string;
  status: 'LIVE' | 'DRAFT' | 'PLANNED' | 'DEPRECATED';
};

export type ProjectFeatureInventoryEntry = {
  id: string;
  label: string;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'PLANNED' | 'BLOCKED';
};

export type ProjectDeploymentTarget = {
  id: string;
  label: string;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  url: string | null;
  lastDeployedAt: string | null;
  status: 'ACTIVE' | 'NOT_DEPLOYED' | 'UPDATED' | 'FAILED';
};

export type ProjectCodebaseState = {
  projectId: string;
  repositoryKey: string | null;
  routeInventory: ProjectRouteInventoryEntry[];
  featureInventory: ProjectFeatureInventoryEntry[];
  systemInventory: string[];
  currentRelease: string | null;
  deploymentTargets: ProjectDeploymentTarget[];
  lastBuild: string | null;
  lastDeployment: string | null;
  knownImplementationState: string;
  syncStatus: ProjectCodebaseSyncStatus;
  syncConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  lastSyncedAt: string | null;
};

export function createEmptyCodebaseState(projectId: string): ProjectCodebaseState {
  return {
    projectId,
    repositoryKey: null,
    routeInventory: [],
    featureInventory: [],
    systemInventory: [],
    currentRelease: null,
    deploymentTargets: [
      { id: 'dev', label: 'DEVELOPMENT', environment: 'DEVELOPMENT', url: null, lastDeployedAt: null, status: 'NOT_DEPLOYED' },
      { id: 'staging', label: 'STAGING', environment: 'STAGING', url: null, lastDeployedAt: null, status: 'NOT_DEPLOYED' },
      { id: 'prod', label: 'PRODUCTION', environment: 'PRODUCTION', url: null, lastDeployedAt: null, status: 'NOT_DEPLOYED' },
    ],
    lastBuild: null,
    lastDeployment: null,
    knownImplementationState: 'UNKNOWN',
    syncStatus: 'UNKNOWN',
    syncConfidence: 'LOW',
    lastSyncedAt: null,
  };
}
