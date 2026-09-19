import type { CriticalImplementationRegionId } from '../p0vrTwinV30R8M2/constants.js';

export type AuthorityReferenceState = {
  referenceAvailable: boolean;
  contentIngested: boolean;
  visuallyAnalyzed: boolean;
  uri: string | null;
  contentByteLength: number;
  contentHash: string | null;
};

export type VisualAuthorityIngestionAuditReceipt = {
  actualAuthorityAvailable: boolean;
  actualAuthorityBytesLoaded: boolean;
  actualAuthorityAnalyzed: boolean;
  blueprintAuthorityAvailable: boolean;
  blueprintAuthorityBytesLoaded: boolean;
  blueprintAuthorityAnalyzed: boolean;
  compositionStateLoaded: boolean;
  surgicalBlueprintLoaded: boolean;
  projectContextLoaded: boolean;
  visualPerceptionStageExists: boolean;
  typographyExtractionExists: boolean;
  spatialRelationshipExtractionExists: boolean;
  materialExtractionExists: boolean;
  stateTreatmentExtractionExists: boolean;
  assetTreatmentExtractionExists: boolean;
  genericFallbackCount: number;
  hardcodedStyleDefaultCount: number;
  unsupportedVisualPropertyCount: number;
  conclusion: string;
  blockers: string[];
  actualReference: AuthorityReferenceState;
  blueprintReference: AuthorityReferenceState;
  ingestionProvider: string;
  ingestionAnalysisMode: string;
  ingestionVersion: string;
};

export type ActualVisualAnalysisRegion = {
  regionId: string;
  bounds: { xRatio: number; yRatio: number; widthRatio: number; heightRatio: number };
  backgroundTreatment: string;
  borderTreatment: string;
  paddingPx: number;
  internalSpacingPx: number;
  dominance: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  visualWeight: number;
};

export type ActualVisualAnalysis = {
  id: string;
  global: {
    paletteUsage: string[];
    contrastHierarchy: string;
    density: 'COMPACT' | 'NORMAL' | 'LOOSE';
    visualRhythm: string;
    majorEmphasis: string[];
    whitespaceBehavior: string;
  };
  regions: ActualVisualAnalysisRegion[];
  perObject: Record<
    string,
    {
      visualRole: string;
      typographyRole: string;
      controlRole?: string;
      surfaceFill: string;
      assetFraming?: string;
    }
  >;
};

export type BlueprintVisualAnalysis = {
  id: string;
  regions: Array<{
    regionId: string;
    geometry: { xRatio: number; yRatio: number; widthRatio: number; heightRatio: number };
    alignment: string;
    nestingDepth: number;
  }>;
  perObject: Record<
    string,
    {
      xRatio: number;
      yRatio: number;
      widthRatio: number;
      heightRatio: number;
      gridBehavior: string;
      baselineRelation: string;
    }
  >;
};

export type ImplementationGlobalExpression = {
  atmosphere: string;
  dominantSurfaces: string;
  contrastPattern: string;
  accentPolicy: string;
  densityProfile: string;
  hierarchyStyle: string;
  radiusPolicy: string;
  borderPolicy: string;
};

export type ImplementationTypographyRoleSpec = {
  role: string;
  fontFamilyRole: string;
  sizePx: number;
  weight: number;
  lineHeight: number;
  tracking: string;
  casing: string;
  alignment: string;
  color: string;
  source: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'HOST_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
};

export type ImplementationTypographySystem = {
  roles: ImplementationTypographyRoleSpec[];
};

export type ImplementationSpatialRhythmSystem = {
  outerMarginPx: number;
  sectionGapPx: number;
  innerPanelPaddingPx: number;
  cardGapPx: number;
  rowGapPx: number;
  controlGapPx: number;
  textBlockSpacingPx: number;
  denseRegionBehavior: string;
  source: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED';
};

export type ImplementationMaterialSurfaceClass = {
  classId: string;
  fill: string;
  border: string;
  edgeTreatment: string;
  radiusPx: number;
  hierarchy: number;
  selectedState: string;
  nestedBehavior: string;
  source: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
};

export type ImplementationMaterialSystem = {
  surfaces: ImplementationMaterialSurfaceClass[];
};

export type ImplementationControlHierarchyEntry = {
  objectId: string;
  role: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'SELECTED' | 'LOCKED' | 'SYSTEM' | 'NEUTRAL';
  fill: string;
  border: string;
  radiusPx: number;
  labelTreatment: string;
  source: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
};

export type ImplementationControlHierarchy = {
  entries: ImplementationControlHierarchyEntry[];
};

export type ImplementationAssetTreatmentEntry = {
  objectId: string;
  assetSlotId: string | null;
  canonicalAssetId: string | null;
  aspectRatio: number;
  objectFit: string;
  cropMode: string;
  focalPoint: { x: number; y: number };
  borderTreatment: string;
  prominence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
};

export type ImplementationAssetTreatmentMap = {
  entries: ImplementationAssetTreatmentEntry[];
};

export type ImplementationExpressionObject = {
  objectId: string;
  parentObjectId: string | null;
  regionId: string;
  semanticRole: string;
  visualRole: string;
  ownership: string;
  featureId: string | null;
  functionId: string | null;
  geometry: {
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
    alignment: string;
    anchor: string;
  };
  typography: {
    familyRole: string;
    sizePx: number;
    weight: number;
    lineHeight: number;
    tracking: string;
    casing: string;
    alignment: string;
    maxLines: number;
  };
  surface: {
    background: string;
    border: string;
    borderWidthPx: number;
    borderRadiusPx: number;
    shadow: string;
    contrastRole: string;
  };
  spacing: {
    paddingPx: number;
    gapPx: number;
    marginBottomPx: number;
  };
  controlTreatment?: {
    role: string;
    selectedTreatment: string;
    activeTreatment: string;
    disabledTreatment: string;
  };
  assetTreatment?: ImplementationAssetTreatmentEntry;
  relationships: {
    sectionId: string;
    nestedWithin: string | null;
  };
  authorityEvidence: {
    actualRegion: string | null;
    blueprintRegion: string | null;
    evidenceConfidence: number;
  };
  styleSources: {
    typography: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
    spatial: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
    material: 'AUTHORITY_DERIVED' | 'PROJECT_CONTRACT_DERIVED' | 'GENERIC_FALLBACK';
  };
};

export type ImplementationAuthorityConflict = {
  objectId: string;
  property: string;
  actualValue: string;
  blueprintValue: string;
  resolution: 'UNRESOLVED' | 'ACTUAL_WINS' | 'BLUEPRINT_WINS';
};

export type ImplementationExpressionIR = {
  id: string;
  projectId: string;
  workspaceType: string;
  viewport: 'MOBILE';
  packageId: string;
  packageChecksum: string;
  compositionStateId: string;
  compositionHash: string;
  actualAuthorityId: string;
  blueprintAuthorityId: string;
  projectContextVersion: string;
  expressionVersion: string;
  globalExpression: ImplementationGlobalExpression;
  regionExpressions: Record<CriticalImplementationRegionId, { mapped: boolean; dominance: string }>;
  objectExpressions: ImplementationExpressionObject[];
  typographySystem: ImplementationTypographySystem;
  spatialRhythmSystem: ImplementationSpatialRhythmSystem;
  materialSystem: ImplementationMaterialSystem;
  controlHierarchy: ImplementationControlHierarchy;
  assetTreatments: ImplementationAssetTreatmentMap;
  stateTreatments: { selectedBorder: string; lockedBorder: string };
  relationships: string[];
  evidence: {
    actualAnalysisId: string;
    blueprintAnalysisId: string;
    mergeId: string;
  };
  unresolvedItems: string[];
  authorityConflicts: ImplementationAuthorityConflict[];
  readiness: ImplementationExpressionReadinessReceipt;
  hash: string;
  cacheKey: string;
};

export type GenericFallbackClassification =
  | 'AUTHORITY_DERIVED'
  | 'PROJECT_CONTRACT_DERIVED'
  | 'HOST_CONTRACT_DERIVED'
  | 'GENERIC_FALLBACK';

export type GenericFallbackInventoryEntry = {
  id: string;
  location: string;
  property: string;
  classification: GenericFallbackClassification;
  critical: boolean;
};

export type GenericFallbackAudit = {
  entries: GenericFallbackInventoryEntry[];
  criticalGenericFallbacks: GenericFallbackInventoryEntry[];
};

export type ImplementationExpressionReadinessReceipt = {
  id: string;
  status: 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
  criticalRegionsMapped: number;
  criticalObjectsWithExpression: number;
  unresolvedAuthorityConflicts: number;
  genericFallbackCount: number;
  criticalGenericFallbackCount: number;
  blockers: string[];
};

export type ImplementationDriftAudit = {
  id: string;
  priorCompilerGeneration: string;
  expressionIrId: string;
  driftItems: Array<{ objectId: string; cause: string; priorSource: string; expressionSource: string }>;
  primaryDriftCauses: string[];
};
