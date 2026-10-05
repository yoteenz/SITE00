/**
 * P0.VR.1D.6 — Campaign Board correction types.
 */

import type { PixelMatchEvaluation, VisualDifferenceMap } from '../p0vr1d/types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import type { MappedReferenceDomDelta } from '../p0vr1d4/types.js';

export type CampaignBoardReferenceDetailStatus =
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

export type CampaignBoardReferenceDetailEntry = {
  detailId: string;
  label: string;
  regionId?: string;
  status: CampaignBoardReferenceDetailStatus;
};

export type CampaignBoardReferenceDetailAudit = {
  auditId: string;
  screenId: 'MOBILE_CAMPAIGN_BOARD';
  referencePath: string;
  entries: CampaignBoardReferenceDetailEntry[];
  matched: number;
  missing: number;
};

export type CampaignCardArtworkResolution = {
  cardId: string;
  source: 'EXISTING_CANONICAL' | 'REFERENCE_APPROVED_CROP' | 'ARTWORK_GENERATION_REQUIRED';
  assetId: string | null;
  artworkUrl: string | null;
  lineage: string;
  generationRequired: boolean;
};

export type NdxCampaignBoardCorrectionReport = {
  reportId: string;
  executedAt: string;
  referencePath: string;
  detailAudit: CampaignBoardReferenceDetailAudit;
  artworkResolutions: CampaignCardArtworkResolution[];
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
