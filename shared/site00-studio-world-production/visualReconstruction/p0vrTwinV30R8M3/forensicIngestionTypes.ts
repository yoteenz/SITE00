import type { ForensicSectionId } from '../p0vrTwinV30R8M2R5/constants.js';

export type ForensicBlueprintClassification =
  | 'FORENSIC_BLUEPRINT_MACHINE_USABLE_WITH_VALIDATION'
  | 'FORENSIC_BLUEPRINT_REVIEW_REQUIRED'
  | 'FORENSIC_BLUEPRINT_REJECTED';

export type MobileTwinForensicBlueprintArtifact = {
  id: string;
  packageId: string;
  artifactKind: 'FORENSIC_BLUEPRINT_IMPLEMENTATION_SPEC';
  contentUri: string;
  contentHash: string;
  sourceAuthorityId: string;
  sourceActualHash: string;
  classification: ForensicBlueprintClassification;
  status: 'INGESTED' | 'ACTIVE' | 'SUPERSEDED';
  ingestedAt: string;
};

export type ForensicBlueprintIngestionReceipt = {
  id: string;
  packageId: string;
  forensicBlueprintHash: string;
  classification: ForensicBlueprintClassification;
  ingestedAt: string;
  noRegeneration: true;
};

export type ForensicObjectSourceEvidence = {
  forensicBlueprintRegionRef: string | null;
  blueprintTableRowRef: string | null;
  actualRegionRef: string | null;
  packageObjectRef: string | null;
};

export type ForensicObjectValidationStatus =
  | 'VALIDATED'
  | 'VALIDATED_WITH_ADJUSTMENT'
  | 'REVIEW_REQUIRED'
  | 'REJECTED';

export type ForensicBlueprintObject = {
  forensicObjectId: string;
  semanticObjectId: string;
  parentSectionId: ForensicSectionId;
  siblingOrder: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  objectType: string;
  textRole: string | null;
  visualImportance: number;
  colorRole: string | null;
  dividerRole: string | null;
  elementKind: 'content' | 'control' | 'metadata' | 'asset_frame' | 'status_indicator';
  sourceEvidence: ForensicObjectSourceEvidence;
  confidence: number;
  validationStatus: ForensicObjectValidationStatus;
};

export type ForensicBlueprintObjectMap = {
  id: string;
  hash: string;
  objects: ForensicBlueprintObject[];
  coordinateFrame: { widthPx: number; heightPx: number; origin: 'top-left' };
};

export type CleanedForensicObjectMapReceipt = {
  id: string;
  cleanedObjectCount: number;
  rejectedForensicRows: string[];
  unresolvedForensicObjects: string[];
  extractedAt: string;
};

export type ForensicObjectValidationReceipt = {
  id: string;
  validatedCount: number;
  adjustedCount: number;
  reviewRequiredCount: number;
  rejectedCount: number;
};

export type ObjectMapAuthorityMergeReceipt = {
  id: string;
  precedenceApplied: ['actual', 'forensic', 'package', 'expression', 'defaults'];
  conflictCount: number;
};

export type MergedImplementationObject = ForensicBlueprintObject & {
  mergeSource: 'actual' | 'forensic' | 'package' | 'merged';
};

export type MergedImplementationObjectMap = {
  id: string;
  hash: string;
  objects: MergedImplementationObject[];
};

export type RegionDeltaReport = {
  regionId: string;
  beforeDriftScore: number;
  afterDriftScore: number;
  improved: boolean;
  primaryCause: string | null;
};

export type TranslationLayerEffectReceipt = {
  id: string;
  materialImprovement: boolean;
  distanceToActualBefore: number;
  distanceToActualAfter: number;
  heroDriftDecreased: boolean;
  authorityPanelDriftDecreased: boolean;
  galleryDriftDecreased: boolean;
  structuredOutputDriftDecreased: boolean;
  readinessDriftDecreased: boolean;
  bottomNavDriftDecreased: boolean;
};

export type ForensicReconstructionFidelityReceipt = {
  id: string;
  compileGeneration: 'R8M3';
  regionDeltas: RegionDeltaReport[];
  translationLayerEffect: TranslationLayerEffectReceipt;
  forensicEvidenceConsumed: boolean;
  unresolvedCriticalCount: number;
};
