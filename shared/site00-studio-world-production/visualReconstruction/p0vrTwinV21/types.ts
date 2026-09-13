import type { P0_VR_TWIN_V21_BUILD, TWIN_GENERATION_MODES, TWIN_V2_STATUS_VALUES } from './constants.js';

export type TwinGenerationMode = (typeof TWIN_GENERATION_MODES)[number];

export type TwinV2Status = (typeof TWIN_V2_STATUS_VALUES)[number];

export type PageIntentModel = {
  pageType: string;
  primaryPurposes: string[];
  primaryUser: string;
  primaryDecision: string;
  summary: string;
};

export type PageFunctionGraph = {
  routes: string[];
  projectNavigation: string[];
  sectionNavigation: string[];
  currentPhase: string[];
  progress: string[];
  metrics: string[];
  currentFocus: string[];
  milestone: string[];
  recentActivity: string[];
  linksAndCtas: string[];
  shellBehavior: string[];
  dynamicState: string[];
};

export type CreativeBrandContext = {
  projectIdentity: string;
  editorialTone: string;
  methodology: string;
  colorLanguage: string[];
  typographicGrammar: string[];
  compositionRules: string[];
  hostClientFirewall: string;
};

export type BlueprintGrammar = {
  density: string;
  columnBehavior: string;
  spacingRhythm: string;
  typeHierarchy: string;
  imageToTextRatio: string;
  dividerBehavior: string;
  accentBehavior: string;
  navBehavior: string;
  informationBands: string[];
  metricTreatment: string;
  heroCompositionPatterns: string;
  activityTableBehavior: string;
  bottomNavBehavior: string;
  shellRelationships: string;
};

export type PageCreativeDirection = {
  creativePremise: string;
  experienceGoal: string;
  visualHierarchy: string[];
  heroConcept: string;
  sectionOrder: string[];
  sectionRoles: Record<string, string>;
  imageStrategy: string;
  typeStrategy: string;
  accentStrategy: string;
  informationDensity: string;
  interactionEmphasis: string[];
  contentPriorities: string[];
  assetPlan: string[];
  rationale: string;
  constraints: string[];
};

export type VisualPageConcept = {
  conceptId: string;
  imageUrl: string | null;
  imageStorageRef: string | null;
  provider: string;
  model: string;
  promptDigest: string;
  status: 'PENDING' | 'READY' | 'FAILED';
};

export type VisualConceptVersion = {
  versionId: string;
  sessionId: string;
  label: string;
  imageUrl: string | null;
  imageStorageRef: string | null;
  creativeDirection: PageCreativeDirection;
  founderInstruction: string | null;
  parentVersionId: string | null;
  status: 'DRAFT' | 'APPROVED' | 'SUPERSEDED';
  createdAt: string;
};

export type FounderJudgment = {
  lastAction: 'APPROVE' | 'REGENERATE' | 'REFINE' | null;
  refineInstruction: string | null;
  refineRegion: string | null;
  approvedVersionId: string | null;
  updatedAt: string | null;
};

export type ApprovedVisualAuthority = {
  versionId: string;
  imageUrl: string | null;
  imageStorageRef: string | null;
  lockedAt: string;
};

export type ApprovedVisualToCodePlan = {
  planId: string;
  approvedVersionId: string;
  bands: string[];
  shellRules: string[];
  functionBindingPolicy: 'TRANSPLANT_ONLY';
  assetSlots: string[];
};

export type TwinV2VisualSpec = {
  specId: string;
  bands: { id: string; role: string; notes: string }[];
  textHierarchy: string[];
  assetSlots: string[];
  colors: string[];
  shellRelationship: string;
  navPlacement: string;
};

export type ConceptDirectedTwinRendered = {
  renderMode: 'TWIN_V2_CONCEPT_DIRECTED_NDX_OVERVIEW';
  componentRef: 'ConceptDirectedNdxOverviewTwinV2';
  builtAt: string | null;
};

export type TwinV2FidelityReceipt = {
  visualAuthorityId: string;
  renderedTwinId: string;
  regionsMeasured: number;
  geometryMatch: number | null;
  typographyMatch: number | null;
  assetMatch: number | null;
  colorMatch: number | null;
  internalVisualMatch: number | null;
  outliers: string[];
  status: 'PENDING' | 'PARTIAL' | 'PASS';
};

export type ConceptDirectedTwinSession = {
  buildRef: typeof P0_VR_TWIN_V21_BUILD;
  generationMode: 'CONCEPT_DIRECTED_V2';
  /** P0.VR.TWINV2.2 — persistent concept gallery + executable lineage */
  conceptGallery?: import('../p0vrTwinV22/types.js').ConceptGalleryState;
  sessionId: string;
  projectId: string;
  pageId: string;
  viewport: 'mobile';
  pageIntent: PageIntentModel;
  functionGraph: PageFunctionGraph;
  brandContext: CreativeBrandContext;
  designLanguage: string;
  blueprintGrammar: BlueprintGrammar;
  referenceAssets: string[];
  creativeDirection: PageCreativeDirection | null;
  visualConcept: VisualPageConcept | null;
  founderJudgment: FounderJudgment;
  approvedVisualAuthority: ApprovedVisualAuthority | null;
  sourceGeneration: { codeAllowed: boolean; lastBuildAt: string | null };
  approvedVisualToCodePlan: ApprovedVisualToCodePlan | null;
  twinV2VisualSpec: TwinV2VisualSpec | null;
  renderedTwin: ConceptDirectedTwinRendered | null;
  fidelityReceipt: TwinV2FidelityReceipt | null;
  status: TwinV2Status;
  history: VisualConceptVersion[];
  createdAt: string;
  updatedAt: string;
};
