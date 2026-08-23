/**
 * Sequence Creative System — post-level art direction contract for multi-frame executions.
 */

import type {
  AnchorComparisonResult,
  CohesionGateResult,
  FrameRole,
  PaletteUsageRole,
  ReferenceStrategy,
  SequenceType,
} from './constants.js';

export type PaletteUsageEntry = {
  color: string;
  role: PaletteUsageRole;
  proportionalGuidance: string;
  narrativePurpose: string;
};

export type SequenceTypographySystem = {
  displayFamily: string;
  supportFamily: string;
  metadataFamily: string;
  annotationFamily: string | null;
  displayBehavior: string;
  weightRelationships: string;
  caseBehavior: string;
  scaleRatios: string;
  trackingBehavior: string;
  alignmentBehavior: string;
  allowedExceptions: string[];
};

export type SequenceGraphicGrammar = {
  primaryGraphicDevices: string[];
  secondaryGraphicDevices: string[];
  deviceFrequency: string;
  lineBehavior: string;
  frameBehavior: string;
  annotationBehavior: string;
  shapeLanguage: string;
  imageMaskBehavior: string;
  textureRules: string;
};

export type SequenceDeviationEvent = {
  frameIndex: number;
  propertyBeingBroken: string;
  baselineBehavior: string;
  deviation: string;
  narrativeReason: string;
  returnBehavior: string;
  intentionality: 'DELIBERATE' | 'UNEXPLAINED';
};

export type SequenceCreativeSystem = {
  sequenceCreativeSystemId: string;
  sequenceId: string;
  sequenceType: SequenceType;
  sequenceVersion: number;
  territoryId: string | null;
  worldExpressionSystemId: string | null;
  topicId: string | null;
  topicName: string | null;
  anchorAssetId: string;
  anchorFrameIndex: number;
  allowedPalette: string[];
  paletteUsageHierarchy: PaletteUsageEntry[];
  typographySystem: SequenceTypographySystem;
  graphicGrammar: SequenceGraphicGrammar;
  imageTreatment: string;
  materialTreatment: string;
  textureBehavior: string;
  spacingRhythm: string;
  densityProfile: string;
  gridBehavior: string;
  edgeBehavior: string;
  recurringDevices: string[];
  accentFrequency: string;
  visualTemperature: string;
  contrastBehavior: string;
  brandRecognitionSignals: string[];
  worldRecognitionSignals: string[];
  referenceStrategy: ReferenceStrategy;
  allowedVariation: string[];
  prohibitedDrift: string[];
  plannedDeviations: SequenceDeviationEvent[];
  methodologyVersion: string;
  createdAt: string;
};

export type SequenceCohesionDimensionResult = {
  dimension: string;
  result: CohesionGateResult;
  notes: string[];
};

export type SequenceCohesionGateReport = {
  passed: boolean;
  overallResult: CohesionGateResult;
  dimensions: SequenceCohesionDimensionResult[];
  driftWarnings: string[];
  intentionalDeviations: SequenceDeviationEvent[];
  visionEvaluated: boolean;
};

export type FrameSequenceContext = {
  frameIndex: number;
  frameRole: FrameRole;
  sequenceCreativeSystemId: string;
  anchorSummary: string;
  previousFrameSummary: string | null;
  controlledDeviation: SequenceDeviationEvent | null;
};

export type FrameAnchorComparison = {
  frameIndex: number;
  result: AnchorComparisonResult;
  overlappingTraits: string[];
  driftTraits: string[];
  notes: string[];
};

export type SequenceLineageExtension = {
  sequenceId: string;
  sequenceType: SequenceType;
  sequenceVersion: number;
  sequenceCreativeSystemId: string;
  frameIndex: number;
  frameRole: FrameRole | string;
  anchorAssetId: string;
  parentConceptTerritoryId: string | null;
  worldExpressionSystemId: string | null;
  intentionalDeviation: boolean;
  cohesionStatus: CohesionGateResult;
};
