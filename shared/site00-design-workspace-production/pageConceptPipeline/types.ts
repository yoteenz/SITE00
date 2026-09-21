import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import type { PageConceptPanelProgress } from './pageConceptLiveProgress.js';
import type { PageConceptCgptSubstepRunDetail } from './pageConceptCgptSubstepRun.js';
import type { PageConceptPipelineLineageId } from './pageConceptCanonicalPipeline.js';
import type {
  PageConceptLiveRouteHashSnapshot,
  PageExperienceExpressionContract,
  PageGpt2MobileConcept,
  PageTwinViewportCapture,
  PageViewportAuthorityFamily,
  PageViewportAuthorityFamilyLock,
  TwinImplementationPackage,
} from './pageConceptViewportAuthorityFamily.js';
import type {
  OpusRepresentativeShellSet,
  PageFamilyContractExtension,
  PageFamilySkinBehaviorContract,
} from './pageConceptPageFamilySkinBehavior.js';
import type { PageFamilyComponentExpressionMap } from './pageConceptPageFamilyComponentExpression.js';

export type PageConceptTargetType = 'PAGE';

export type PageConceptGenerationStatus =
  | 'IDLE'
  | 'PLANNED'
  | 'STARTING_NEW_RUN'
  | 'CGPT_RUNNING'
  | 'CGPT_RATE_LIMITED'
  | 'CGPT_AWAITING_FOUNDER_REVIEW'
  | 'GPT2_RUNNING'
  | 'GPT2_AWAITING_FOUNDER_REVIEW'
  | 'GPT2_MOBILE_AWAITING_SELECTION'
  | 'VIEWPORT_TABLET_RUNNING'
  | 'VIEWPORT_DESKTOP_RUNNING'
  | 'VIEWPORT_FAMILY_REVIEW'
  | 'PAGE_FAMILY_CONTRACT_REVIEW'
  | 'VIEWPORT_FAMILY_LOCKED'
  | 'TWIN_IMPLEMENTATION_PACKAGE_READY'
  | 'TWIN_READY_FOR_REVIEW'
  | 'NBP_RUNNING'
  | 'PARTIAL_GENERATION'
  | 'READY_FOR_FOUNDER_REVIEW'
  | 'FAILED';

export type PageConceptReadiness =
  | 'BLOCKED_NO_PROJECT_CONTEXT'
  | 'BLOCKED_NO_PAGE_CONTEXT'
  | 'BLOCKED_NO_FUNCTION_CONTRACT'
  | 'BLOCKED_NO_SOURCE_CAPTURE'
  | 'BLOCKED_NO_MOBILE_CAPTURE'
  | 'BLOCKED_NO_DESKTOP_CAPTURE'
  | 'BLOCKED_NO_PROVIDER_CONFIG'
  | 'READY_FOR_CREATIVE_INJECTION';

/** Explicit capture refs sent to API (server cannot read browser localStorage). */
export type PageConceptSourceCaptureRef = {
  captureId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  artifactPath: string;
  route: string;
  buildVersion: string | null;
  timestamp: string;
  screenId: string;
};

export type ProjectCreativeContext = {
  projectId: string;
  brandTruth: string;
  projectPurpose: string;
  audience: string;
  brandPersonality: string;
  tone: string;
  creativeAppetite: string;
  designLanguage: string;
  typography: string;
  palette: string;
  materials: string;
  imagery: string;
  iconography: string;
  compositionRules: string;
  projectLore: string;
  projectConstraints: string;
  forbiddenPatterns: string;
  currentVisualSystem: string;
  approvedReferences: readonly string[];
  projectAssets: readonly string[];
  contextVersion: string;
};

export type PageCreativeContext = {
  pageId: string;
  projectId: string;
  pageName: string;
  route: string;
  pageRole: string;
  parentPageId: string | null;
  childPageIds: readonly string[];
  purpose: string;
  requiredContent: readonly string[];
  functionalRequirements: readonly string[];
  interactionContract: readonly string[];
  existingImplementation: string;
  currentCaptureSummary: string;
  existingReferences: readonly string[];
  inheritance: string;
  overrides: readonly string[];
  creativeLatitude: string;
  responsiveRequirements: readonly string[];
  stage: string;
  readiness: string;
  contextVersion: string;
};

export type PageConceptCgptBriefSourceLineage = {
  identityVersion?: string;
  intakeVersion?: string;
  skinVersion?: string;
  projectContextVersion?: string;
  pageContextVersion?: string;
  functionContractVersion?: string;
  captureRefs?: string;
};

export type PageConceptCgptBriefSectionSource = {
  sectionId: string;
  sourceLabel: string;
};

export type PageConceptCgptCreativeBrief = {
  briefId: string;
  version: string;
  contentHash: string;
  projectId: string;
  pageId: string;
  injectionId: string;
  creativePremise: string;
  pagePurpose: string;
  audienceIntent: string;
  pageStory: string;
  identitySignals: readonly string[];
  brandSignals: readonly string[];
  skinSignals: readonly string[];
  compositionStrategy: string;
  hierarchyStrategy: string;
  typographyStrategy: string;
  colorStrategy: string;
  materialStrategy: string;
  imageryStrategy: string;
  interactionCharacter: string;
  visualTerritory: string;
  imageStrategy: string;
  pageSurprise: string;
  mobileDirection: string;
  desktopDirection: string;
  mandatoryBrandSignals: readonly string[];
  keyMessages: readonly string[];
  requiredContent: readonly string[];
  functionalRequirements: readonly string[];
  creativeLatitude: string;
  distinctiveMove: string;
  avoidList: readonly string[];
  currentImplementationRole: 'FUNCTIONAL_REFERENCE_ONLY';
  aestheticAuthorityFromCapture: 'NO';
  sourceLineage: PageConceptCgptBriefSourceLineage;
  sectionSources: readonly PageConceptCgptBriefSectionSource[];
  createdAt: string;
};

export type PageCreativeInjection = {
  injectionId: string;
  projectId: string;
  pageId: string;
  projectContextVersion: string;
  pageContextVersion: string;
  functionContractVersion: string;
  creativeThesis: string;
  creativePremise?: string;
  pageStory?: string;
  pagePurposeInterpretation: string;
  visualOpportunity: string;
  visualTerritory?: string;
  hierarchyDirection: string;
  hierarchyStrategy?: string;
  spatialDirection: string;
  compositionStrategy?: string;
  informationPriority: string;
  imageDataBalance: string;
  responsiveDirection: string;
  mobileDirection: string;
  desktopDirection: string;
  creativeLatitude: string;
  immutableRequirements: readonly string[];
  referenceStrategy: string;
  assetStrategy: string;
  imageryStrategy?: string;
  imageStrategy?: string;
  interactionCharacter?: string;
  pageSurprise?: string;
  mandatoryBrandSignals?: readonly string[];
  audienceIntent?: string;
  distinctiveMove?: string;
  typographyStrategy?: string;
  colorStrategy?: string;
  materialStrategy?: string;
  avoidList?: readonly string[];
  createdAt: string;
  cgptProvider: string;
  cgptModel: string;
};

export type PageGPT2AuthorityConcept = {
  conceptId: string;
  projectId: string;
  pageId: string;
  injectionId: string;
  name: string;
  premise: string;
  hierarchyStrategy: string;
  compositionStrategy: string;
  visualLanguage: string;
  interactionPresentation: string;
  mobileIntent: string;
  desktopIntent: string;
  authorityArtifact: string | null;
  gpt2Provider: string;
  gpt2Model: string;
  createdAt: string;
  conceptRationale?: string;
  brandSignals?: string;
  imageStrategy?: string;
  avoidList?: string;
  groundingPackageVersion?: string;
  cgptBriefId?: string;
  cgptBriefVersion?: string;
};

export type PageConceptRenditionSlotId = 'RENDITION_A' | 'RENDITION_B' | 'RENDITION_C';

export type PageConceptRendition = {
  renditionId: string;
  slot: PageConceptRenditionSlotId;
  sourceGpt2ConceptId: string;
  mobileArtifactId: string | null;
  desktopArtifactId: string | null;
  status: 'PENDING' | 'PARTIAL' | 'READY' | 'FAILED';
  renditionDirective: string;
};

export type PageFunctionContract = {
  contractId: string;
  projectId: string;
  pageId: string;
  version: string;
  route: string;
  regions: readonly string[];
  interactions: readonly string[];
  immutableBehaviors: readonly string[];
  responsiveRequirements: readonly string[];
  createdAt: string;
};

export type PageConceptRenderLaneType = 'GPT2_DIRECT' | 'NBP';

export type PageConceptRenderMode = 'NBP_FULL_SET';

export type PageConceptRenderGroundingMeta = {
  authorityPriorityUsed: boolean;
  implementationCaptureRole: 'FUNCTIONAL_REFERENCE_ONLY' | 'OMITTED';
  skinGroundingPresent: boolean;
  identityGroundingPresent: boolean;
  functionContractPresent: boolean;
  forbiddenDriftApplied: boolean;
  renderLaneType: PageConceptRenderLaneType;
  renderMode: PageConceptRenderMode;
  authoritySourceRunId: string;
  authorityArtifactId: string;
};

export type PageConceptDualRenderLaneJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';

export type PageConceptDualRenderLaneJob = {
  jobKey: string;
  viewport: 'MOBILE' | 'DESKTOP';
  status: PageConceptDualRenderLaneJobStatus;
  artifactId: string | null;
};

export type PageConceptDualRenderLane = {
  laneType: PageConceptRenderLaneType;
  status: 'PENDING' | 'RUNNING' | 'PARTIAL' | 'READY' | 'FAILED';
  mobile: PageConceptDualRenderLaneJob;
  desktop: PageConceptDualRenderLaneJob;
};

export type PageConceptDualRenderFounderDecision =
  | 'PENDING_REVIEW'
  | 'GPT2_SELECTED'
  | 'NBP_SELECTED'
  | 'BOTH_KEPT'
  | 'ESCALATED_TO_FULL_RUN';

export type PageConceptDualRenderTestRun = {
  id: string;
  renderMode: 'DUAL_RENDER_TEST';
  upstreamCgptRunId: string;
  upstreamGpt2AuthorityRunId: string;
  approvedAuthorityArtifactId: string;
  authorityApprovalId: string;
  status: 'RUNNING' | 'READY_FOR_REVIEW' | 'FAILED';
  founderDecisionStatus: PageConceptDualRenderFounderDecision;
  gpt2Lane: PageConceptDualRenderLane;
  nbpLane: PageConceptDualRenderLane;
  createdAt: string;
};

export type PageConceptGeneratedArtifact = {
  artifactId: string;
  projectId: string;
  pageId: string;
  renditionSlot: PageConceptRenditionSlotId;
  viewport: PageViewportId;
  captureSetId: string;
  projectContextVersion: string;
  pageContextVersion: string;
  functionContractId: string;
  creativeInjectionId: string;
  gpt2AuthorityConceptId: string;
  renditionId: string;
  provider: 'NBP' | 'GPT2_DIRECT' | 'GPT2_MOBILE' | 'GPT2_TABLET' | 'GPT2_DESKTOP';
  model: string;
  providerJobId: string | null;
  promptVersion: string;
  createdAt: string;
  status: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED';
  artifactPath: string | null;
  imageUri: string | null;
  width: number;
  height: number;
  failureReason?: string;
  renderGrounding?: PageConceptRenderGroundingMeta;
};

export type PageConceptNbpLineage = {
  authorityApprovalId: string;
  cgptDirectionId: string;
  gpt2AuthorityId: string;
  gpt2AuthorityVersion: string;
  skinContractId: string;
  skinContractVersion: string;
};

export type PageConceptNbpPreDispatchInspector = {
  visualAuthorityPresent: boolean;
  skinContractVersion: string;
  cgptDirectionId: string;
  functionContractVersion: string;
  currentScreenshotRole: 'REFERENCE_ONLY' | 'OMITTED';
  imageInputOrder: readonly string[];
  authorityApprovalId: string | null;
  promptVersion: string;
};

export type PageConceptPipelineSet = {
  pipelineSetId: string;
  projectId: string;
  pageId: string;
  targetType: PageConceptTargetType;
  captureSetId: string;
  functionContractId: string;
  creativeInjection: PageCreativeInjection | null;
  cgptCreativeBrief?: PageConceptCgptCreativeBrief | null;
  gpt2AuthorityConcept: PageGPT2AuthorityConcept | null;
  renditions: readonly PageConceptRendition[];
  creativeInjectionError?: string;
  gpt2AuthorityError?: string;
  /** Frozen at founder continue-to-NBP (or test bypass). */
  nbpLineage?: PageConceptNbpLineage | null;
  nbpPreDispatchInspector?: PageConceptNbpPreDispatchInspector | null;
  renderMode?: PageConceptRenderMode | null;
  pipelineLineage?: PageConceptPipelineLineageId | null;
  mobileConcepts?: readonly PageGpt2MobileConcept[];
  selectedMobileConceptId?: string | null;
  viewportAuthorityFamily?: PageViewportAuthorityFamily | null;
  viewportAuthorityFamilyLock?: PageViewportAuthorityFamilyLock | null;
  experienceExpressionContract?: PageExperienceExpressionContract | null;
  pageFamilySkinBehaviorContract?: PageFamilySkinBehaviorContract | null;
  pageFamilyComponentExpressionMap?: PageFamilyComponentExpressionMap | null;
  opusRepresentativeShellSet?: OpusRepresentativeShellSet | null;
  pageFamilyContractExtensions?: readonly PageFamilyContractExtension[];
  twinShellApprovalId?: string | null;
  twinImplementationPackage?: TwinImplementationPackage | null;
  liveRouteHashBefore?: PageConceptLiveRouteHashSnapshot | null;
  liveRouteHashAfter?: PageConceptLiveRouteHashSnapshot | null;
  createdAt: string;
};

export type PageConceptArchivedRun = {
  archiveId: string;
  runId: string;
  pipelineSetId: string;
  archivedAt: string;
  label: string;
  reason: string;
  generationStatus: PageConceptGenerationStatus;
  pipelineSet: PageConceptPipelineSet;
  generationJobs: readonly PageConceptGeneratedArtifact[];
};

export type PageConceptGenerationState = {
  targetType: PageConceptTargetType;
  projectId: string;
  pageId: string;
  projectContext: ProjectCreativeContext | null;
  pageContext: PageCreativeContext | null;
  functionContract: PageFunctionContract | null;
  pipelineSet: PageConceptPipelineSet | null;
  generationJobs: readonly PageConceptGeneratedArtifact[];
  generationStatus: PageConceptGenerationStatus;
  lastFailure: { message: string; at: string } | null;
  history: readonly { type: string; at: string; summary: string }[];
  /** Completed run the founder is reviewing (pipelineSetId). */
  activeReviewRunId?: string | null;
  /** Prior branches preserved for lineage (not flattened). */
  archivedRuns?: readonly PageConceptArchivedRun[];
  /** Active run metadata (scoped to projectId + pageId). */
  activeGenerationRunId: string | null;
  activeGenerationRunStartedAt: string | null;
  activeGenerationStage: string | null;
  /** Latest panel progression snapshot (persisted for refresh/resume). */
  liveProgress: PageConceptPanelProgress | null;
  cgptSubsteps: PageConceptCgptSubstepRunDetail | null;
  /** @deprecated Legacy dual-render test runs (read-only hydration). */
  dualRenderTestRun?: PageConceptDualRenderTestRun | null;
  twinCaptures?: readonly PageTwinViewportCapture[];
};

export type PageConceptGenerationPlan = {
  targetType: PageConceptTargetType;
  projectId: string;
  pageId: string;
  projectLabel: string;
  pageLabel: string;
  cgptCalls: 1;
  gpt2Calls: number;
  gpt2MobileConceptCount?: number;
  nbpRenditions: number;
  nbpJobs: number;
  outputCount: number;
  captureSetId: string;
  functionContractId: string;
  pipelineLineage?: PageConceptPipelineLineageId;
  estimatedCostNote: string;
};

export type PageConceptGenerationRunResult = {
  plan: PageConceptGenerationPlan;
  pipelineSet: PageConceptPipelineSet;
  jobs: readonly PageConceptGeneratedArtifact[];
};
