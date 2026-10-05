/**
 * P0.EXPERIENCE.MODULE-WIRING1 — Experience project module entities (fixture-backed store).
 */

export type ExperienceType = 'CONFIGURATOR' | 'SIMULATION' | 'WORLD' | 'APP' | 'GAME';

export type ExperienceStatus =
  | 'IDEA'
  | 'PLANNING'
  | 'IN_PRODUCTION'
  | 'REVIEW'
  | 'ACTIVE'
  | 'ARCHIVED';

export type ExperiencePipelineStageId =
  | 'intent'
  | 'authority'
  | 'source'
  | 'asset_production'
  | 'scene_assembly'
  | 'mechanics'
  | 'integration'
  | 'runtime'
  | 'experience_review'
  | 'optimization'
  | 'release';

export type ExperiencePipelineStageState =
  | 'NOT_STARTED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REVIEW'
  | 'COMPLETE'
  | 'NOT_REQUIRED';

export type ExperienceAssetType =
  | 'MESH'
  | 'SKELETAL_MESH'
  | 'PROP'
  | 'ENVIRONMENT'
  | 'GROOM'
  | 'HAIR_CARD'
  | 'BRAID_MODULE'
  | 'MATERIAL'
  | 'TEXTURE'
  | 'ANIMATION'
  | 'AUDIO'
  | 'DECAL'
  | 'UI_2D'
  | 'REFERENCE'
  | 'BUILD_CAPTURE';

export type ExperienceAssetStatus =
  | 'SOURCE'
  | 'STAGED'
  | 'REVIEW'
  | 'APPROVED'
  | 'IMPLEMENTED'
  | 'ARCHIVED'
  | 'FAILED';

export type ExperienceBuildPlatform =
  | 'DESKTOP'
  | 'MOBILE'
  | 'WEB'
  | 'IOS'
  | 'ANDROID'
  | 'KIOSK'
  | 'INTERNAL_QA';

export type ExperienceBuildStatus =
  | 'QUEUED'
  | 'BUILDING'
  | 'READY'
  | 'REVIEW'
  | 'APPROVED'
  | 'FAILED'
  | 'ARCHIVED';

export type ExperienceMechanicCategory =
  | 'CAMERA'
  | 'NAVIGATION'
  | 'CHARACTER'
  | 'HAIR'
  | 'PRODUCT'
  | 'INTERACTION'
  | 'ASSESSMENT'
  | 'PROGRESSION'
  | 'WORLD'
  | 'UI'
  | 'COMMERCE'
  | 'STATE';

export type ExperienceTaskStatus =
  | 'DRAFT'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'RUNNING'
  | 'BLOCKED'
  | 'REVIEW'
  | 'COMPLETE'
  | 'CANCELLED'
  | 'FAILED';

export type ToolInstallationState = 'UNKNOWN' | 'NOT_INSTALLED' | 'INSTALLED' | 'AVAILABLE_REMOTE';
export type ToolConnectionState = 'NOT_CONFIGURED' | 'AVAILABLE' | 'CONNECTED' | 'BLOCKED' | 'ERROR';

export type ProjectModuleAvailability = {
  projectId: string;
  designEnabled: boolean;
  experienceEnabled: boolean;
  identityEnabled: boolean;
  productionEnabled: boolean;
  reviewsEnabled: boolean;
  libraryEnabled: boolean;
};

export type ExperienceRecord = {
  experienceId: string;
  projectId: string;
  slug: string;
  name: string;
  description: string;
  type: ExperienceType;
  status: ExperienceStatus;
  primaryRuntime: string;
  currentBuildId: string | null;
  primarySceneId: string | null;
  primaryCharacterId: string | null;
  currentMilestone: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type ExperienceScene = {
  sceneId: string;
  experienceId: string;
  parentSceneId: string | null;
  name: string;
  slug: string;
  description: string;
  sceneType: string;
  runtimePath: string | null;
  thumbnailAssetId: string | null;
  currentCaptureId: string | null;
  targetReferenceId: string | null;
  status: ExperienceStatus;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceCharacter = {
  characterId: string;
  experienceId: string;
  name: string;
  characterType: string;
  sourceAssetId: string | null;
  primaryDccTool: string | null;
  runtimeAssetPath: string | null;
  thumbnailAssetId: string | null;
  status: ExperienceStatus;
  metadata: Record<string, string | boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceAsset = {
  assetId: string;
  experienceId: string;
  sceneId: string | null;
  characterId: string | null;
  name: string;
  assetType: ExperienceAssetType;
  sourceTool: string;
  sourcePath: string | null;
  runtimePath: string | null;
  status: ExperienceAssetStatus;
  version: string;
  parentVersionId: string | null;
  thumbnail: string | null;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceMechanic = {
  mechanicId: string;
  experienceId: string;
  category: ExperienceMechanicCategory;
  name: string;
  description: string;
  status: ExperiencePipelineStageState;
  runtimeBinding: string | null;
  dependencies: readonly string[];
  testState: 'UNTESTED' | 'PASS' | 'FAIL' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
};

export type ExperienceBuild = {
  buildId: string;
  experienceId: string;
  version: string;
  runtime: string;
  runtimeVersion: string | null;
  sourceRevision: string | null;
  targetPlatform: ExperienceBuildPlatform;
  status: ExperienceBuildStatus;
  buildPath: string | null;
  captureAssetId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceTool = {
  toolId: string;
  name: string;
  category: string;
  vendor: string;
  integrationType: string;
  installationState: ToolInstallationState;
  connectionState: ToolConnectionState;
  executablePath: string | null;
  version: string | null;
  capabilities: readonly string[];
  supportedAssetTypes: readonly ExperienceAssetType[];
  supportsAutomation: boolean;
  supportsCli: boolean;
  supportsPython: boolean;
  supportsPlugin: boolean;
  notes: string;
};

export type ExperienceToolPlan = {
  toolPlanId: string;
  experienceId: string;
  taskType: string;
  inputAssets: readonly string[];
  approvedReferences: readonly string[];
  selectedTools: readonly string[];
  expectedOutputs: readonly string[];
  writeLocations: readonly string[];
  status: ExperienceTaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceTask = {
  taskId: string;
  experienceId: string;
  taskType: string;
  requestedBy: string;
  agent: 'ASTRA' | 'CODEX' | 'FOUNDER';
  toolPlanId: string | null;
  status: ExperienceTaskStatus;
  spendEstimate: number | null;
  approvalRequired: boolean;
  resultAssetIds: readonly string[];
  createdAt: string;
  updatedAt: string;
};

export type ExperiencePipelineStageRow = {
  id: ExperiencePipelineStageId;
  order: number;
  shortLabel: string;
  state: ExperiencePipelineStageState;
  applicable: boolean;
};

export type ExperienceActivityEvent = {
  eventId: string;
  projectId: string;
  experienceId: string;
  kind: string;
  summary: string;
  at: string;
};

export type ExperienceWorkspaceBundle = {
  projectId: string;
  experiences: readonly ExperienceRecord[];
  scenes: readonly ExperienceScene[];
  characters: readonly ExperienceCharacter[];
  assets: readonly ExperienceAsset[];
  mechanics: readonly ExperienceMechanic[];
  builds: readonly ExperienceBuild[];
  toolPlans: readonly ExperienceToolPlan[];
  tasks: readonly ExperienceTask[];
  activity: readonly ExperienceActivityEvent[];
  pipeline: readonly ExperiencePipelineStageRow[];
};

export type ExperienceAgentRole = {
  agent: 'ASTRA' | 'CODEX';
  label: string;
  responsibilities: readonly string[];
};

export const EXPERIENCE_WORKSPACE_TABS = [
  'overview',
  'scenes',
  'characters',
  'assets',
  'mechanics',
  'builds',
  'history',
  'more',
] as const;

export type ExperienceWorkspaceTab = (typeof EXPERIENCE_WORKSPACE_TABS)[number];
