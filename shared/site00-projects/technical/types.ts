/**
 * B5.10 — Project repository intelligence + technical readiness types.
 */

export type RepositoryProvider = 'GITHUB' | 'GITLAB' | 'BITBUCKET' | 'UNKNOWN';

export type ConnectionStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'SYNC_ERROR' | 'READ_ONLY' | 'PENDING';

export type SyncConfidence = 'HIGH' | 'MODERATE' | 'LOW';

export type ReadinessDomainStatus = 'PASS' | 'WARNING' | 'BLOCKED' | 'UNKNOWN' | 'NOT_APPLICABLE';

export type OverallReadiness = 'READY' | 'READY_WITH_WARNINGS' | 'NOT_READY' | 'BLOCKED' | 'UNKNOWN';

export type CiCheckStatus = 'PASSING' | 'FAILING' | 'WARNING' | 'NOT_CONFIGURED' | 'UNKNOWN';

export type DiagnosticSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectNoteType = 'FINDING' | 'DISCUSSION' | 'DECISION' | 'IDEA' | 'GENERAL';

export type ProjectMilestoneStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED';

export type ProjectRepositoryConnection = {
  projectId: string;
  provider: RepositoryProvider;
  repositoryOwner: string | null;
  repositoryName: string | null;
  repositoryId: string | null;
  repositoryUrl: string | null;
  defaultBranch: string | null;
  connected: boolean;
  connectionStatus: ConnectionStatus;
  connectionHealth: 'HEALTHY' | 'DEGRADED' | 'UNKNOWN';
  lastSyncedAt: string | null;
  syncConfidence: SyncConfidence;
  syncError: string | null;
  readOnly: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectBranchState = {
  defaultBranch: string | null;
  activeBranch: string | null;
  commitsAhead: number | null;
  commitsBehind: number | null;
  lastCommitSha: string | null;
  lastCommitMessage: string | null;
  lastCommitAuthor: string | null;
  lastCommitAt: string | null;
  branchProtectionKnown: boolean;
  dirtyStateIfKnown: boolean | null;
  syncStatus: 'SYNCED' | 'STALE' | 'UNKNOWN' | 'ERROR';
};

export type ProjectPullRequestSummary = {
  id: string;
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  author: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  reviewStatus: string | null;
  mergeability: string | null;
  branch: string | null;
  targetBranch: string | null;
  url: string | null;
  riskLevelIfDerived: 'LOW' | 'MEDIUM' | 'HIGH' | null;
};

export type ProjectIssueSummary = {
  id: string;
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED';
  priority: string | null;
  labels: string[];
  createdAt: string | null;
  updatedAt: string | null;
  url: string | null;
  blockingRelease: boolean;
  category: string | null;
};

export type ProjectCiCheckState = {
  status: CiCheckStatus;
  lastRun: string | null;
  duration: string | null;
  workflow: string | null;
  branch: string | null;
  commitSha: string | null;
  failureSummary: string | null;
};

export type ProjectDependencyPackage = {
  name: string;
  currentVersion: string;
  latestVersion: string | null;
  status: 'LATEST' | 'UPDATE' | 'MAJOR_UPDATE' | 'DEPRECATED' | 'SECURITY_REVIEW';
};

export type ProjectDependencyState = {
  packageManager: string | null;
  manifestFiles: string[];
  lockfileType: string | null;
  totalDependencies: number;
  productionDependencies: number;
  devDependencies: number;
  outdated: ProjectDependencyPackage[];
  majorUpdates: ProjectDependencyPackage[];
  deprecated: ProjectDependencyPackage[];
  securityAdvisories: Array<{ packageName: string; severity: string; summary: string }>;
  peerConflicts: string[];
  runtimeCompatibility: string | null;
  lastScannedAt: string | null;
  scanConfidence: SyncConfidence;
};

export type ProjectUpgradeRecommendation = {
  packageName: string;
  currentVersion: string;
  targetVersion: string;
  upgradeType: 'PATCH' | 'MINOR' | 'MAJOR';
  reason: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  breakingChangeRisk: boolean;
  recommendedOrder: number;
  prerequisites: string[];
  blocksRelease: boolean;
  confidence: SyncConfidence;
};

export type ProjectSecurityState = {
  knownAdvisories: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  lastScanAt: string | null;
  securityHeadersIfKnown: string | null;
  dependencyRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  secretScanningStatusIfAvailable: string | null;
  recommendations: string[];
};

export type ProjectDeploymentState = {
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  provider: string | null;
  status: 'ACTIVE' | 'NOT_DEPLOYED' | 'UPDATED' | 'FAILED' | 'UNKNOWN';
  deploymentId: string | null;
  deploymentUrl: string | null;
  releaseVersion: string | null;
  commitSha: string | null;
  startedAt: string | null;
  completedAt: string | null;
  duration: string | null;
  sourceBranch: string | null;
  health: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  errorSummary: string | null;
  rollbackAvailableIfKnown: boolean | null;
};

export type ProjectEnvironmentVariableStatus = {
  name: string;
  status: 'CONFIGURED' | 'MISSING' | 'INVALID';
  required: boolean;
};

export type ProjectEnvironmentState = {
  environmentId: string;
  name: string;
  type: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  status: 'ACTIVE' | 'NOT_DEPLOYED' | 'UNKNOWN';
  deploymentStatus: string | null;
  domain: string | null;
  sslStatus: 'VALID' | 'INVALID' | 'UNKNOWN' | 'NOT_CONFIGURED';
  uptime: string | null;
  responseTime: string | null;
  databaseStatus: 'OK' | 'WARNING' | 'ERROR' | 'UNKNOWN';
  integrationStatus: 'OK' | 'PARTIAL' | 'ERROR' | 'UNKNOWN';
  envVarConfiguredCount: number;
  envVarMissingCount: number;
  envVarInvalidCount: number;
  envVarStatuses: ProjectEnvironmentVariableStatus[];
  connectedServices: Array<{ name: string; status: 'CONNECTED' | 'DISCONNECTED' | 'UNKNOWN' }>;
  lastCheckedAt: string | null;
};

export type ProjectDiagnosticFinding = {
  findingId: string;
  projectId: string;
  category: string;
  severity: DiagnosticSeverity;
  title: string;
  summary: string;
  evidence: string;
  recommendedAction: string;
  affectedSystems: string[];
  blockingRelease: boolean;
  status: 'OPEN' | 'RESOLVED' | 'ACKNOWLEDGED';
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type ProjectNote = {
  noteId: string;
  projectId: string;
  type: ProjectNoteType;
  title: string;
  body: string;
  author: string | null;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  relatedRoute: string | null;
  relatedIssue: string | null;
  relatedRelease: string | null;
  relatedMilestone: string | null;
  internalOnly: boolean;
  clientVisible: boolean;
};

export type ProjectMilestone = {
  milestoneId: string;
  projectId: string;
  title: string;
  status: ProjectMilestoneStatus;
  dueDate: string | null;
  completedAt: string | null;
  progress: number | null;
  dependencies: string[];
  blockingIssues: string[];
  relatedRelease: string | null;
  relatedDeployment: string | null;
  owner: string | null;
  clientVisible: boolean;
  notes: string | null;
};

export type ProjectTechnicalActivityEvent = {
  id: string;
  projectId: string;
  type:
    | 'COMMIT_PUSHED'
    | 'PR_OPENED'
    | 'PR_MERGED'
    | 'ISSUE_CREATED'
    | 'BUILD_PASSED'
    | 'BUILD_FAILED'
    | 'DEPENDENCY_UPDATE_AVAILABLE'
    | 'SECURITY_WARNING'
    | 'DEPLOYMENT_STARTED'
    | 'DEPLOYMENT_SUCCEEDED'
    | 'DEPLOYMENT_FAILED'
    | 'ENVIRONMENT_UPDATED'
    | 'DIAGNOSTIC_CREATED'
    | 'NOTE_ADDED'
    | 'MILESTONE_UPDATED'
    | 'RELEASE_PUBLISHED';
  summary: string;
  timestamp: string;
  url: string | null;
  clientSafe: boolean;
};

export type ReadinessDomain = {
  domain: string;
  status: ReadinessDomainStatus;
  reason: string | null;
  evidence: string | null;
  lastCheckedAt: string | null;
  recommendedAction: string | null;
  blockingRelease: boolean;
};

export type ProjectTechnicalReadiness = {
  overall: OverallReadiness;
  overallPercent: number | null;
  percentDerivation: string | null;
  blockerCount: number;
  warningCount: number;
  domains: ReadinessDomain[];
  blockers: string[];
  warnings: string[];
};

export type ProjectStateReconciliation = {
  declaredPhase: string | null;
  observedPhase: string | null;
  mismatch: boolean;
  mismatchClass: 'PROJECT_STATE_MISMATCH' | null;
  explanation: string | null;
};

export type ProjectCodebaseIntelligence = {
  projectId: string;
  repositoryConnection: ProjectRepositoryConnection;
  branchState: ProjectBranchState;
  latestCommit: ProjectBranchState;
  recentCommits: Array<{ sha: string; message: string; author: string | null; at: string | null; url: string | null }>;
  pullRequests: ProjectPullRequestSummary[];
  issues: ProjectIssueSummary[];
  ciState: ProjectCiCheckState;
  buildState: ProjectCiCheckState;
  testState: ProjectCiCheckState;
  lintState: ProjectCiCheckState;
  typecheckState: ProjectCiCheckState;
  dependencyState: ProjectDependencyState;
  securityState: ProjectSecurityState;
  runtimeState: { nodeVersion: string | null; framework: string | null };
  frameworkState: { name: string | null; version: string | null };
  routeInventory: Array<{ route: string; pageName: string; status: string; sourcePath: string | null; lastChangedAt: string | null; deploymentState: string | null }>;
  featureInventory: Array<{ featureId: string; featureName: string; status: string; sourceEvidence: string | null; dependencies: string[]; lastChangedAt: string | null; releaseTarget: string | null }>;
  systemInventory: string[];
  environmentState: ProjectEnvironmentState[];
  migrationState: { pending: number; applied: number; lastAppliedAt: string | null };
  deploymentState: ProjectDeploymentState[];
  technicalDebt: Array<{ title: string; category: string; severity: DiagnosticSeverity; evidence: string; recommendedAction: string; targetMilestone: string | null; blocking: boolean; createdAt: string; resolvedAt: string | null }>;
  upgradeRecommendations: ProjectUpgradeRecommendation[];
  blockers: string[];
  readinessAssessment: ProjectTechnicalReadiness;
  diagnostics: ProjectDiagnosticFinding[];
  notes: ProjectNote[];
  milestones: ProjectMilestone[];
  activity: ProjectTechnicalActivityEvent[];
  reconciliation: ProjectStateReconciliation;
  lastAnalyzedAt: string | null;
  analysisConfidence: SyncConfidence;
  syncMode: 'MANUAL_SYNC' | 'ON_LOAD_IF_STALE' | 'SCHEDULED' | 'WEBHOOK';
};

export type ProjectTechnicalTabId =
  | 'OVERVIEW'
  | 'CODEBASE'
  | 'DEPENDENCIES'
  | 'DEPLOYMENTS'
  | 'ENVIRONMENTS'
  | 'DIAGNOSTICS'
  | 'NOTES'
  | 'MILESTONES'
  | 'READINESS';

export const PROJECT_TECHNICAL_TABS: ProjectTechnicalTabId[] = [
  'OVERVIEW',
  'CODEBASE',
  'DEPENDENCIES',
  'DEPLOYMENTS',
  'ENVIRONMENTS',
  'DIAGNOSTICS',
  'NOTES',
  'MILESTONES',
  'READINESS',
];
