import type { ESTIMATOR_VERSION } from './version';

export type ProjectType = 'SITE' | 'WORLD' | 'SYSTEM' | 'HYBRID';
export type BuildLevel = 'SIMPLE' | 'ADVANCED' | 'CUSTOM';
export type DeliveryMode = 'STANDARD' | 'PRIORITY' | 'CUSTOM_SCHEDULE';
export type ConfidenceLevel = 'EARLY' | 'BLUEPRINT' | 'LOCKED';
export type DocumentKind = 'ESTIMATE' | 'QUOTE' | 'LOCKED_SCHEDULE';
export type FamilyClass = 'LIGHT' | 'STANDARD' | 'ADVANCED' | 'SYSTEM' | 'WORLD';
export type ResponsiveMode =
  | 'MOBILE_ONLY'
  | 'MOBILE_DESKTOP'
  | 'MOBILE_TABLET_DESKTOP'
  | 'MULTI_VIEWPORT_ADVANCED'
  | 'SPATIAL_RESPONSIVE';
export type VisualComplexity =
  | 'TEMPLATE_LED'
  | 'CUSTOMIZED_TEMPLATE'
  | 'BESPOKE_EDITORIAL'
  | 'CINEMATIC'
  | 'GENERATIVE_ASSET_HEAVY'
  | 'SPATIAL_WORLD';

export type StructuralArchetypeId =
  | 'EDITORIAL'
  | 'GALLERY'
  | 'COMMERCE'
  | 'SERVICE'
  | 'PORTAL'
  | 'HOSPITALITY'
  | 'COMMUNITY'
  | 'HYBRID';

export type WorldArchetypeId =
  | 'ESTATE'
  | 'PROMENADE'
  | 'HUB'
  | 'DISTRICT'
  | 'SANCTUARY'
  | 'SHOWROOM'
  | 'SOCIAL'
  | 'STORY'
  | 'HYBRID_WORLD';

export type VisualSystemId =
  | 'EDITORIAL_OBJECT'
  | 'ARCHITECTURAL_MINIMAL'
  | 'CINEMATIC_LUXURY'
  | 'SOFT_ORGANIC'
  | 'INDUSTRIAL_COMMAND'
  | 'POP_EDITORIAL';

export type FeatureId =
  | 'CUSTOM_INTERACTIONS'
  | 'AUTH_ACCOUNT'
  | 'ECOMMERCE'
  | 'PAYMENTS'
  | 'DATABASE'
  | 'DASHBOARDS'
  | 'USER_ROLES'
  | 'THIRD_PARTY_INTEGRATION'
  | 'GENERATED_ASSET_SYSTEM'
  | 'ADVANCED_MOTION'
  | '3D'
  | 'WORLD_SPATIAL'
  | 'MULTILINGUAL'
  | 'DATA_MIGRATION'
  | 'COMPLEX_RESPONSIVE'
  | 'CUSTOM_SEARCH'
  | 'NOTIFICATIONS'
  | 'EMAIL_ENGINE'
  | 'FILE_UPLOADS'
  | 'DOCUMENT_MANAGEMENT'
  | 'REAL_TIME'
  | 'ANALYTICS'
  | 'CMS'
  | 'BOOKING'
  | 'MEMBERSHIP'
  | 'COMMUNITY'
  | 'MARKETPLACE'
  | 'AI_ASSISTED_FEATURES';

export type RiskFlagId =
  | 'CLIENT_CONTENT_PENDING'
  | 'BRAND_NOT_FINAL'
  | 'THIRD_PARTY_APPROVAL'
  | 'MIGRATION_COMPLEXITY'
  | 'UNKNOWN_DATA_MODEL'
  | 'CUSTOM_INTEGRATION'
  | 'HEAVY_GENERATIVE_ASSETS'
  | 'WORLD_COMPLEXITY'
  | 'MULTI_ROLE_PERMISSIONS'
  | 'REGULATED_WORKFLOW'
  | 'LARGE_DESCENDANT_TREE';

export type InhabitantComplexity = 'NONE' | 'LIGHT' | 'STANDARD' | 'HEAVY';
export type ThreeDAssetLoad = 'NONE' | 'LIGHT' | 'STANDARD' | 'HEAVY';
export type NavigationComplexity = 'SIMPLE' | 'STANDARD' | 'ADVANCED';
export type IdentityScope = 'NONE' | 'SEPARATE' | 'HYBRID_OPTION_D';

export type OverrideField =
  | 'familyUnits'
  | 'timelineWeeks'
  | 'investment'
  | 'riskWiden'
  | 'familyClass'
  | 'priorityFeasible';

export type FamilyInput = {
  id: string;
  label: string;
  familyClass: FamilyClass;
  descendantCount: number;
};

export type WorldScopeInput = {
  archetypeId: WorldArchetypeId;
  zoneCount: number;
  sceneCount: number;
  interactionCount: number;
  inhabitantComplexity: InhabitantComplexity;
  stateCount: number;
  threeDAssetLoad: ThreeDAssetLoad;
  navigationComplexity: NavigationComplexity;
};

export type ManualOverride = {
  id: string;
  field: OverrideField;
  /** Family id when the override retargets one family class. */
  targetId?: string;
  value: number | string | boolean;
  reason: string;
  author: string;
  timestamp: string;
};

export type ProjectEstimateConfig = {
  projectType: ProjectType;
  buildLevel: BuildLevel;
  structuralArchetype: StructuralArchetypeId | null;
  visualSystemId: VisualSystemId | null;
  visualComplexity: VisualComplexity;
  families: FamilyInput[];
  /** Additional system surfaces that are not already listed as families. */
  systems: string[];
  featureIds: FeatureId[];
  responsiveMode: ResponsiveMode;
  worldScopes: WorldScopeInput[];
  identityScope: IdentityScope;
  deliveryMode: DeliveryMode;
  reviewRounds: number;
  clientReviewSlaDays: number;
  confidenceLevel: ConfidenceLevel;
  documentKind: DocumentKind;
  riskFlags: RiskFlagId[];
  manualModifiers: ManualOverride[];
  customScheduleNote?: string;
};

export type FamilyBreakdownLine = {
  id: string;
  label: string;
  familyClass: FamilyClass;
  baseFu: number;
  descendantModifierFu: number;
  responsiveFu: number;
  visualFu: number;
  totalFu: number;
  customScopeRequired: boolean;
};

export type PhaseEstimate = {
  id: string;
  label: string;
  minimumWeeks: number;
  estimatedWeeks: number;
  parallelizable: boolean;
  clientDependency: boolean;
  studioDependency: boolean;
};

export type DependencyEdge = {
  from: string;
  to: string;
  serial: boolean;
  note: string;
};

export type InvestmentBreakdown = {
  baseBuild: number;
  familyUnitContribution: number;
  identityNote: string;
  optionDAddition: number;
  priorityMultiplier: number;
  expectedBeforeRound: number;
  calibrationNeeded: boolean;
};

export type ProjectEstimateResult = {
  estimatorVersion: typeof ESTIMATOR_VERSION;
  documentKind: DocumentKind;
  bindingQuote: false;
  approvals: {
    foundationApproved: false;
    quoteApproved: false;
    timelineLocked: boolean;
    clientAccepted: false;
  };
  familyUnits: number;
  calculatedFamilyUnits: number;
  rawProductionWeeks: number;
  serialWeeks: number;
  parallelWeeks: number;
  effectiveLanes: number;
  priorityCompression: number;
  priorityFeasible: boolean;
  effectiveProductionWeeks: number;
  reviewBufferWeeks: number;
  riskBufferNote: string;
  lowWeeks: number;
  expectedWeeks: number;
  highWeeks: number;
  investmentLow: number;
  investmentExpected: number;
  investmentHigh: number;
  calculatedInvestmentExpected: number;
  complexityBand: string;
  deliveryMode: DeliveryMode;
  confidence: ConfidenceLevel;
  assumptions: string[];
  dependencies: DependencyEdge[];
  riskFlags: RiskFlagId[];
  breakdown: FamilyBreakdownLine[];
  phases: PhaseEstimate[];
  investment: InvestmentBreakdown;
  referenceBand: { id: string; label: string; window: string; note: string };
  worldCalibrationNeeded: boolean;
  customScopeRequired: boolean;
  overridesApplied: ManualOverride[];
};

export type ClientBlueprintEstimate = {
  document: 'PROJECTED ESTIMATE';
  binding: false;
  projectType: string;
  buildLevel: string;
  selectedStructure: string;
  selectedVisualSystem: string;
  estimatedFamilyCount: number;
  complexity: string;
  productionWindow: string;
  investmentRange: string;
  presentationPolicyVersion: string;
  /** Raw estimator weeks. Display rounding is not written back here. */
  canonicalWindowWeeks: { low: number; high: number };
  canonicalInvestment: { low: number; expected: number; high: number };
  timelineFounderReview: boolean;
  investmentFounderReview: boolean;
  presentationNote: string | null;
  deliveryMode: string;
  includedSystems: string[];
  dependencies: string[];
  assumptions: string[];
  whatHappensNext: string;
  confidence: ConfidenceLevel;
  /** Platform usage is disclosed beside the build range. It is not added into investmentRange. */
  platformUsage: {
    applicable: boolean;
    rateLabel: string | null;
    summary: string;
    includedInBuildInvestment: false;
    learnHowThisWorks: string;
  };
  ongoingService: {
    status: 'OPTIONAL' | 'SELECTED' | 'NOT_CONTRACTED';
    summary: string;
  };
};

export type SavedEstimateRecord = {
  estimatorVersion: string;
  savedAt: string;
  config: ProjectEstimateConfig;
  result: ProjectEstimateResult;
};

export type CalibrationRecord = {
  estimateId: string;
  estimatedFu: number;
  actualProductionWeeks: number | null;
  estimatedWeeks: number;
  actualWeeks: number | null;
  estimatedCost: number;
  actualInternalCost: number | null;
  revisionCount: number | null;
  delayCauses: string[];
  recordedAt: string;
};

export type EstimateOutcome =
  | { ok: true; result: ProjectEstimateResult }
  | { ok: false; errors: string[] };
