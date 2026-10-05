/**
 * P0.VR.1D.8 — Lab / Experiment 01 correction types.
 */

import type { PixelMatchEvaluation, VisualDifferenceMap } from '../p0vr1d/types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import type { MappedReferenceDomDelta } from '../p0vr1d4/types.js';

export type LabReferenceDetailStatus =
  | 'MATCHED'
  | 'MISSING'
  | 'POSITION_DRIFT'
  | 'SPACING_DRIFT'
  | 'TYPOGRAPHY_DRIFT'
  | 'ASSET_MISSING'
  | 'BORDER_MISSING'
  | 'COLOR_DRIFT'
  | 'CROP_DRIFT'
  | 'DATA_MISSING';

export type LabReferenceDetailAudit = {
  auditId: string;
  screenId: 'MOBILE_LAB_EXPERIMENT_01';
  referencePath: string;
  entries: Array<{
    detailId: string;
    label: string;
    regionId?: string;
    status: LabReferenceDetailStatus;
  }>;
  matched: number;
  missing: number;
};

export type ExperimentCardArtworkResolution = {
  cardId: string;
  source: 'REFERENCE_APPROVED_CROP' | 'EXISTING_CANONICAL' | 'EXISTING_PIPELINE' | 'ARTWORK_GENERATION_REQUIRED' | 'GENERATED_NEW' | 'BLOCKED';
  assetId: string | null;
  artworkUrl: string | null;
  lineage: string;
  generationRequired: boolean;
};

export type NdxLabExperiment01CorrectionReport = {
  reportId: string;
  executedAt: string;
  referencePath: string;
  detailAudit: LabReferenceDetailAudit;
  artworkResolutions: ExperimentCardArtworkResolution[];
  domMeasurement: RenderedDomMeasurementMap | null;
  mappedDelta: MappedReferenceDomDelta | null;
  pixelMatch: PixelMatchEvaluation | null;
  differenceMap: VisualDifferenceMap | null;
  structuralScore: number;
  visualScore: number;
  iterations: number;
  patchesGenerated: number;
  patchesExecuted: number;
  overlayPath: string | null;
  renderPath: string | null;
};
