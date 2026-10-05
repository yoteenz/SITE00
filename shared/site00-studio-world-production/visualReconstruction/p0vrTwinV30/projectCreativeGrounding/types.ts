/** P0.VR.TWINV3.0R4 — project creative grounding (authority generation inputs). */

export const PROJECT_CREATIVE_CONTEXT_VERSION = 'ndxbook-pilot-r4-v1' as const;

export type ProjectCreativeContextStatus = 'READY' | 'INCOMPLETE' | 'DRAFT';

export type ProjectCreativeDNA = {
  projectPurpose: string;
  projectPremise: string;
  projectAudience: string;
  projectTone: string;
  emotionalRegister: string;
  creativeRisk: string;
  visualDensity: string;
  editorialVsProductBalance: string;
  abstractionLevel: string;
  rawness: string;
  polish: string;
  culturalPosition: string;
  worldview: string;
  narrativeBehavior: string;
  founderCreativeAppetite: string;
  brandTruths: string[];
  nonNegotiables: string[];
};

export type ProjectArtifactVocabularyEntry = {
  artifactType: string;
  name: string;
  description: string;
  allowedContexts: string[];
  visualTreatment: string;
  preferredAspectRatios: string[];
  framingRules: string;
  surfaceRules: string;
  allowedSources: string[];
  generationAllowed: boolean;
  placeholderAllowed: boolean;
  status: 'APPROVED' | 'PILOT';
};

export type ProjectArtifactVocabulary = {
  projectId: string;
  version: string;
  entries: ProjectArtifactVocabularyEntry[];
};

export type ProjectAssetSourceEntry = {
  sourceId: string;
  sourceType:
    | 'APPROVED_PROJECT_ASSET'
    | 'PRIOR_CONCEPT_AUTHORITY'
    | 'CAMPAIGN_ARTIFACT'
    | 'PROJECT_REFERENCE'
    | 'CANONICAL_IMAGE'
    | 'PROJECT_TEXTURE'
    | 'GENERATED_PROJECT_ASSET'
    | 'PROJECT_PLACEHOLDER';
  label: string;
  pathOrRef: string;
  artifactTypes: string[];
  priority: number;
};

export type ProjectAssetSourceMap = {
  projectId: string;
  version: string;
  sources: ProjectAssetSourceEntry[];
};

export type ProjectVisualLanguage = {
  primaryPalette: string[];
  accentPalette: string[];
  contrastBehavior: string;
  surfaceBehavior: string;
  imageTreatment: string;
  graphicTreatment: string;
  lineLanguage: string;
  spacingRhythm: string;
  compositionTendency: string;
  density: string;
  materialBehavior: string;
  motionBehavior: string;
  visualMotifs: string[];
  forbiddenMotifs: string[];
};

export type ProjectTypographyExpression = {
  hostTypography: string;
  projectTypography: string;
  allowedMixing: string;
  displayBehavior: string;
  editorialBehavior: string;
  metadataBehavior: string;
  uiCaseRule: string;
  allPagesCaseRule: string;
};

export type ProjectMaterialLanguage = {
  allowedMaterials: string[];
  allowedTextures: string[];
  allowedImageProcesses: string[];
  allowedEffects: string[];
  forbiddenMaterials: string[];
  forbiddenEffects: string[];
};

export type ProjectSymbolicLanguage = {
  allowedSymbols: string[];
  forbiddenSymbols: string[];
  meaningMap: Record<string, string>;
};

export type ProjectWorkspaceExpressionContract = {
  projectAccentUsage: string;
  projectSurfaceUsage: string;
  artifactFrameBehavior: string;
  activeSelectionBehavior: string;
  projectTypographyUsage: string;
  projectImageUsage: string;
  projectStatusUsage: string;
  projectInteractionHighlight: string;
  hostBoundaries: string[];
  status: 'READY';
};

export type DesignWorkspaceFunctionContract = {
  version: string;
  jobs: string[];
  compositionRule: string;
};

export type ProjectCreativeContextPackage = {
  projectId: string;
  projectName: string;
  projectType: string;
  creativeDNA: ProjectCreativeDNA;
  artifactVocabulary: ProjectArtifactVocabulary;
  visualLanguage: ProjectVisualLanguage;
  typographyExpression: ProjectTypographyExpression;
  paletteSystem: { host: string[]; project: string[]; system: string[] };
  materialLanguage: ProjectMaterialLanguage;
  imageLanguage: string;
  symbolicLanguage: ProjectSymbolicLanguage;
  contentLanguage: string;
  interactionExpression: string;
  workspaceExpression: ProjectWorkspaceExpressionContract;
  doRules: string[];
  dontRules: string[];
  assetSourceMap: ProjectAssetSourceMap;
  approvedReferences: string[];
  knownProjectArtifacts: string[];
  brandTruths: string[];
  projectNarrative: string;
  status: ProjectCreativeContextStatus;
  version: typeof PROJECT_CREATIVE_CONTEXT_VERSION;
};

export type ProjectCreativeGroundingGateResult = {
  projectCreativeDNAReady: boolean;
  artifactVocabularyReady: boolean;
  visualLanguageReady: boolean;
  typographyReady: boolean;
  assetSourceMapReady: boolean;
  workspaceExpressionReady: boolean;
  functionContractReady: boolean;
  pass: boolean;
  missing: string[];
};

export type AssetGroundingRecord = {
  assetDisplayId: string;
  projectId: string;
  artifactType: string;
  sourceType: ProjectAssetSourceEntry['sourceType'] | 'PROJECT_VALID_PLACEHOLDER' | 'GENERATION_SPEC';
  sourceId: string;
  generationReason: string;
  projectGroundingRule: string;
  isProjectValid: boolean;
  status: 'GROUNDED' | 'UNGROUNDED';
};

export type AuthorityGroundedAssetManifest = {
  authorityId: string;
  projectId: string;
  territoryId: 'A' | 'B' | 'C';
  viewport: 'mobile' | 'desktop';
  assets: AssetGroundingRecord[];
  ungroundedAssetCount: number;
  projectValidAssetCount: number;
  status: 'PASS' | 'FAIL';
};

export type ProjectGroundingReviewSummary = {
  projectGrounding: 'PASS' | 'FAIL';
  artifactVocabulary: 'PASS' | 'FAIL';
  randomAssetRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  territoryContentConsistency: 'PASS' | 'FAIL';
  hostProjectFirewall: 'PASS' | 'FAIL';
};

export type AuthorityCreativeGenerationPayload = {
  site00HostContractRef: string;
  activeProjectExpressionContractRef: string;
  projectCreativeContextPackage: ProjectCreativeContextPackage;
  projectArtifactVocabulary: ProjectArtifactVocabulary;
  projectAssetSourceMap: ProjectAssetSourceMap;
  designWorkspaceFunctionContract: DesignWorkspaceFunctionContract;
  territoryId: 'A' | 'B' | 'C';
  viewport: 'mobile' | 'desktop';
  projectCreativeContextVersion: typeof PROJECT_CREATIVE_CONTEXT_VERSION;
  sharedArtifactFamily: string[];
  sourcePriorityRule: string;
};
