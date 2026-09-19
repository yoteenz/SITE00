/**
 * P0.DEPLOY.1 — Release pipeline types.
 */

export const RELEASE_PIPELINE_STAGES = [
  'VALIDATE',
  'TEST',
  'BUILD',
  'DEPLOY_BACKEND',
  'VERIFY_BACKEND',
  'DEPLOY_FRONTEND',
  'VERIFY_FRONTEND',
  'VERIFY_COMPATIBILITY',
  'COMPLETE',
] as const;

export type ReleasePipelineStage = (typeof RELEASE_PIPELINE_STAGES)[number];

export const RELEASE_STATUSES = [
  'PLANNING',
  'TESTING',
  'BUILDING',
  'BACKEND_DEPLOYING',
  'BACKEND_VERIFYING',
  'FRONTEND_DEPLOYING',
  'FRONTEND_VERIFYING',
  'VERIFYING_COMPATIBILITY',
  'READY',
  'FAILED',
  'PARTIAL',
  'ROLLED_BACK',
] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export type ReleaseManifest = {
  releaseId: string;
  version: string;
  commitSha: string;
  frontendBuild: string;
  apiBuild: string;
  workerBuild: string;
  builtAt: string;
  bundleEntry?: string | null;
};

export type BackendHealthReceipt = {
  ok: boolean;
  releaseId: string | null;
  commitSha: string | null;
  apiBuild: string | null;
  workerBuild: string | null;
  contractVersion: string | null;
  serviceReady: boolean;
  gitCommit?: string | null;
};

export type FrontendHealthReceipt = {
  ok: boolean;
  releaseId: string | null;
  version: string | null;
  commitSha: string | null;
  bundleEntry: string | null;
};

export type ProductionReleaseReceipt = {
  releaseId: string;
  commitSha: string;
  frontendVersion: string;
  apiVersion: string;
  workerVersion: string;
  frontendUrl: string;
  backendHealth: BackendHealthReceipt;
  frontendHealth: FrontendHealthReceipt;
  compatibilityStatus: 'COMPATIBLE' | 'VERSION_MISMATCH' | 'UNKNOWN';
  deployedAt: string;
  status: ReleaseStatus;
  errors: string[];
  stages: Array<{ stage: ReleasePipelineStage; startedAt: string; finishedAt: string | null; result: 'PASS' | 'FAIL' | 'SKIP' }>;
};

export type ReleaseHistoryEntry = {
  releaseId: string;
  version: string;
  commitSha: string;
  status: ReleaseStatus;
  deployedAt: string;
  rollbackFrom: string | null;
  notes: string | null;
};

export type RollbackReceipt = {
  fromRelease: string;
  toRelease: string;
  reason: string;
  frontendStatus: ReleaseStatus;
  backendStatus: ReleaseStatus;
  completedAt: string;
};

export const DEPLOYMENT_ERROR_CODES = [
  'TEST_FAILED',
  'BUILD_FAILED',
  'RAILWAY_DEPLOY_TIMEOUT',
  'RAILWAY_HEALTH_FAILED',
  'CPANEL_CONNECTION_FAILED',
  'CPANEL_AUTH_FAILED',
  'FRONTEND_UPLOAD_FAILED',
  'FRONTEND_PROMOTION_FAILED',
  'FRONTEND_SMOKE_FAILED',
  'VERSION_MISMATCH',
  'COMPATIBILITY_FAILED',
  'ROLLBACK_FAILED',
  'UNKNOWN_DEPLOYMENT_ERROR',
] as const;

export type DeploymentErrorCode = (typeof DEPLOYMENT_ERROR_CODES)[number];

export type DeploymentTarget = {
  targetId: string;
  projectId: string;
  environment: 'production' | 'staging';
  frontendStrategy: 'cpanel_ftp' | 'cpanel_ssh_rsync' | 'cpanel_git';
  frontendHost: string;
  backendStrategy: 'railway_auto';
  backendHost: string;
  buildCommand: string;
  outputDir: string;
  releasePath: string;
  verificationUrl: string;
  enabled: boolean;
};
