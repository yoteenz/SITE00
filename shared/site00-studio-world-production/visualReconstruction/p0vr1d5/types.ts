/**
 * P0.VR.1D.5 — Reference detail audit types + failure taxonomy.
 */

export type ReferenceDetailAuditStatus =
  | 'MATCHED'
  | 'MISSING'
  | 'POSITION_DRIFT'
  | 'STYLE_DRIFT'
  | 'ASSET_MISSING'
  | 'TEXT_MISSING'
  | 'BORDER_MISSING'
  | 'SPACING_DRIFT'
  | 'TYPOGRAPHY_DRIFT'
  | 'COLOR_DRIFT';

export type ReferenceDetailAuditEntry = {
  detailId: string;
  label: string;
  status: ReferenceDetailAuditStatus;
  regionId?: string;
  notes?: string;
};

export type ReferenceDetailAudit = {
  auditId: string;
  screenId: string;
  referencePath: string;
  entries: ReferenceDetailAuditEntry[];
  matched: number;
  missing: number;
  spacingDrift: number;
  typographyDrift: number;
  borderDrift: number;
  assetDrift: number;
};

export type ProductionCardArtworkSource =
  | 'EXISTING_CANONICAL'
  | 'EXISTING_PIPELINE'
  | 'REFERENCE_APPROVED_CROP'
  | 'GENERATED_NEW'
  | 'PLACEHOLDER_RETAINED'
  | 'ARTWORK_GENERATION_REQUIRED';

export type ProductionCardArtworkResolution = {
  cardId: string;
  title: string;
  source: ProductionCardArtworkSource;
  assetId: string | null;
  artworkUrl: string | null;
  lineage: string;
  generated: boolean;
  crop: { objectFit: string; objectPosition: string; aspectRatio: string } | null;
  generationRequired: boolean;
};

export const FAIL_REFERENCE_DETAIL_MISSING = 'FAIL_REFERENCE_DETAIL_MISSING' as const;
export const FAIL_KPI_VALUE_MISSING = 'FAIL_KPI_VALUE_MISSING' as const;
export const FAIL_AUDIENCE_COUNT_MISSING = 'FAIL_AUDIENCE_COUNT_MISSING' as const;
export const FAIL_BORDER_MISSING = 'FAIL_BORDER_MISSING' as const;
export const FAIL_TEXT_CROWDING = 'FAIL_TEXT_CROWDING' as const;
export const FAIL_SECTION_SPACING_DRIFT = 'FAIL_SECTION_SPACING_DRIFT' as const;
export const FAIL_ARTWORK_BINDING_MISSING = 'FAIL_ARTWORK_BINDING_MISSING' as const;
export const FAIL_ARTWORK_ASSET_MISSING = 'FAIL_ARTWORK_ASSET_MISSING' as const;
export const FAIL_ARTWORK_CROP_DRIFT = 'FAIL_ARTWORK_CROP_DRIFT' as const;
export const FAIL_CARD_GEOMETRY_DRIFT = 'FAIL_CARD_GEOMETRY_DRIFT' as const;
export const FAIL_VIEW_ALL_COUNT_MISSING = 'FAIL_VIEW_ALL_COUNT_MISSING' as const;
export const FAIL_RADAR_ROW_SPACING_DRIFT = 'FAIL_RADAR_ROW_SPACING_DRIFT' as const;
export const FAIL_MICRO_TYPOGRAPHY_DRIFT = 'FAIL_MICRO_TYPOGRAPHY_DRIFT' as const;

export type NdxOverviewMicroFidelityReport = {
  reportId: string;
  executedAt: string;
  referencePath: string;
  detailAudit: ReferenceDetailAudit;
  artworkResolutions: ProductionCardArtworkResolution[];
  firstVisualScore: number | null;
  finalVisualScore: number | null;
  overlayPath: string | null;
  differenceMapPath: string | null;
  remainingMismatches: string[];
};
