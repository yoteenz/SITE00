import type { CriticalReconstructionRegionId } from './constants.js';

export type ActualToCodeReconstructionDirective = {
  id: string;
  packageId: string;
  actualAuthorityId: string;
  blueprintAuthorityId: string;
  translationBriefId: string;
  expressionIrId: string;
  targetMode: 'PIXEL_FIDELITY_RECONSTRUCTION';
  visualAuthority: 'APPROVED_ACTUAL';
  creativeFreedom: 'NONE';
  layoutInvention: 'FORBIDDEN';
  styleInvention: 'FORBIDDEN';
  genericComponentSubstitution: 'FORBIDDEN';
  runtimeAuthorityRasterUsage: 'FORBIDDEN';
  screenshotComparisonRequired: true;
  iterativeCorrectionRequired: true;
  regionReconstructionRules: CriticalReconstructionRegionId[];
  hash: string;
  status: 'ACTIVE';
};

export type ActualRegionReconstructionContract = {
  regionId: CriticalReconstructionRegionId;
  actualRegionBounds: { xRatio: number; yRatio: number; widthRatio: number; heightRatio: number };
  blueprintRegionBounds: { xRatio: number; yRatio: number; widthRatio: number; heightRatio: number };
  targetWidthRatio: number;
  targetHeightRatio: number;
  targetInternalColumns: number;
  targetInternalRows: number;
  targetAlignment: string;
  targetPadding: number;
  targetGapRelationships: string;
  targetTypographyHierarchy: string;
  targetImagePlacement: string;
  targetControlGrouping: string;
  targetVisualWeight: number;
  targetContrast: string;
  targetSectionDensity: string;
  doNotReinterpret: true;
};

export type VisualWeightObjectEntry = {
  objectKey: string;
  dominanceRank: number;
  relativeArea: number;
  contrastWeight: number;
  typographyWeight: number;
  colorEmphasis: string;
  positionalPriority: number;
};

export type VisualWeightContract = {
  id: string;
  objects: VisualWeightObjectEntry[];
  hash: string;
};

export type CompositionRelationshipTargets = {
  heroLeftRightRatio: number;
  heroToAuthorityPanelRatio: number;
  headlineBlockWidthRatio: number;
  artifactWidthRatio: number;
  galleryCardAspect: string;
  galleryCardGapPx: number;
  structuredOutputCardWidthRatio: number;
  readinessClusterWidthRatio: number;
  bottomNavItemWidthRatio: number;
  sectionVerticalSpacingPx: number;
};

export type TypographyReconstructionTarget = {
  objectKey: string;
  fontCategory: string;
  approximateFontSizePx: number;
  weight: number;
  lineHeight: number;
  tracking: string;
  casing: string;
  lineCountTarget: number;
  widthConstraintRatio: number;
  alignment: string;
  visualProminence: number;
};

export type ControlReconstructionTarget = {
  objectKey: string;
  visibleWidthPx: number;
  visibleHeightPx: number;
  borderTreatment: string;
  fillTreatment: string;
  labelAlignment: string;
  textScalePx: number;
  selectedTreatment: string;
  hierarchyRole: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  groupSpacingPx: number;
};

export type AssetReconstructionTarget = {
  canonicalAssetId: string;
  objectKey: string;
  targetRegionId: CriticalReconstructionRegionId;
  aspectRatio: string;
  crop: string;
  objectFit: string;
  focalPoint: string;
  visibleScale: number;
  surroundingPaddingPx: number;
  borderFraming: string;
};

export type ActualAssetIdentityGateResult = {
  id: string;
  gateId: string;
  objectKey: string;
  canonicalAssetId: string;
  result: 'PASS' | 'FAIL';
  failureCode?: typeof import('./constants.js').CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL;
};

export type ActualFirstVisualReconstructionPrompt = {
  id: string;
  fullText: string;
  hash: string;
  injected: true;
};

export type VisualReconstructionPlanDecision = {
  decisionId: string;
  description: string;
  actualEvidenceRegion: CriticalReconstructionRegionId;
  blueprintEvidenceRegion: CriticalReconstructionRegionId;
  translationEvidence: string;
  structuredObjectIds: string[];
};

export type VisualReconstructionPlan = {
  id: string;
  pageComposition: string;
  sectionOrder: CriticalReconstructionRegionId[];
  regionProportions: Record<string, number>;
  nestingDescription: string;
  sideBySideRelationships: string[];
  visualWeightHierarchy: string[];
  assetPlacementNotes: string[];
  typographyTargetsSummary: string[];
  controlGroupTargetsSummary: string[];
  responsivePreservationStrategy: string;
  decisions: VisualReconstructionPlanDecision[];
  hash: string;
};

export type LiveImplementationCanonicalScreenshot = {
  id: string;
  screenshotHash: string;
  viewport: { widthPx: number; heightPx: number };
  buildId: string;
  implementationVersion: string;
  timestamp: string;
  iteration: number;
};

export type ActualToLiveVisualComparison = {
  id: string;
  actualAuthorityHash: string;
  liveScreenshotHash: string;
  globalSilhouetteScore: number;
  sectionHeightsScore: number;
  regionPositionsScore: number;
  typographyScaleScore: number;
  assetIdentityScore: number;
  visualWeightScore: number;
  limeUsageScore: number;
  hash: string;
};

export type PerceptualDifferenceMap = {
  id: string;
  normalizedDiffScore: number;
  edgeDiffScore: number;
  regionColorDistributionScore: number;
  structuralSimilarityScore: number;
  boundingGeometryScore: number;
  typographyBlockScore: number;
  hash: string;
};

export type ActualToLiveRegionDrift = {
  regionId: CriticalReconstructionRegionId;
  geometryDrift: number;
  typographyDrift: number;
  assetDrift: number;
  spacingDrift: number;
  hierarchyDrift: number;
  colorMaterialDrift: number;
  visualWeightDrift: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH_DRIFT';
  recommendedCorrection: string;
};

export type VisualReconstructionConvergenceGate = {
  id: string;
  globalCompositionPass: boolean;
  criticalRegionGeometryPass: boolean;
  typographyHierarchyPass: boolean;
  assetIdentityPass: boolean;
  visualWeightPass: boolean;
  controlHierarchyPass: boolean;
  colorMaterialPass: boolean;
  criticalHighDriftRegions: CriticalReconstructionRegionId[];
  status: 'PASS' | 'REVIEW_READY' | 'FAIL';
  founderImplementationReview: 'FOUNDER_IMPLEMENTATION_REVIEW' | 'BLOCKED';
};

export type ActualFirstMaterialChangeReceipt = {
  id: string;
  priorLiveScreenshotHash: string;
  newLiveScreenshotHash: string;
  distanceToActualBefore: number;
  distanceToActualAfter: number;
  distanceToActualImproved: boolean;
  result: 'PASS' | typeof import('./constants.js').REBUILD_CHANGED_BUT_DID_NOT_CONVERGE;
};

export type ActualFirstImplementationArtifacts = {
  actualFirstComponentTree: { id: string; hash: string; rootClass: string; sectionIds: string[] };
  actualFirstLayoutContract: { id: string; hash: string };
  actualFirstStyleContract: { id: string; hash: string; cssVariables: Record<string, string> };
};

export type ReconstructionIterationRecord = {
  iteration: number;
  liveScreenshot: LiveImplementationCanonicalScreenshot;
  comparison: ActualToLiveVisualComparison;
  differenceMap: PerceptualDifferenceMap;
  regionDrifts: ActualToLiveRegionDrift[];
  codeCorrectionsApplied: string[];
};
