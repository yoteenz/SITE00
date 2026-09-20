import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';

export type PageConceptTargetType = 'PAGE';

export type PageConceptGenerationStatus =
  | 'IDLE'
  | 'PLANNED'
  | 'CGPT_RUNNING'
  | 'GPT2_RUNNING'
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

export type PageCreativeInjection = {
  injectionId: string;
  projectId: string;
  pageId: string;
  projectContextVersion: string;
  pageContextVersion: string;
  functionContractVersion: string;
  creativeThesis: string;
  pagePurposeInterpretation: string;
  visualOpportunity: string;
  hierarchyDirection: string;
  spatialDirection: string;
  informationPriority: string;
  imageDataBalance: string;
  responsiveDirection: string;
  mobileDirection: string;
  desktopDirection: string;
  creativeLatitude: string;
  immutableRequirements: readonly string[];
  referenceStrategy: string;
  assetStrategy: string;
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
  provider: 'NBP';
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
};

export type PageConceptPipelineSet = {
  pipelineSetId: string;
  projectId: string;
  pageId: string;
  targetType: PageConceptTargetType;
  captureSetId: string;
  functionContractId: string;
  creativeInjection: PageCreativeInjection | null;
  gpt2AuthorityConcept: PageGPT2AuthorityConcept | null;
  renditions: readonly PageConceptRendition[];
  creativeInjectionError?: string;
  gpt2AuthorityError?: string;
  createdAt: string;
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
};

export type PageConceptGenerationPlan = {
  targetType: PageConceptTargetType;
  projectId: string;
  pageId: string;
  projectLabel: string;
  pageLabel: string;
  cgptCalls: 1;
  gpt2Calls: 1;
  nbpRenditions: 3;
  nbpJobs: 6;
  outputCount: 6;
  captureSetId: string;
  functionContractId: string;
  estimatedCostNote: string;
};

export type PageConceptGenerationRunResult = {
  plan: PageConceptGenerationPlan;
  pipelineSet: PageConceptPipelineSet;
  jobs: readonly PageConceptGeneratedArtifact[];
};
