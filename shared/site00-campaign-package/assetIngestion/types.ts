/**
 * B5.7 — Asset ingestion context + classification decision records.
 */

import type {
  Entry001AssetType,
  Entry001ContentRole,
} from '../../site00-expression-engine/entry001CampaignPackage/types.js';

export type AssetFormatFamily =
  | 'CAROUSEL'
  | 'STORY'
  | 'REEL'
  | 'TIKTOK'
  | 'X'
  | 'HIGHLIGHT'
  | 'GENERAL_ARCHIVE';

export type AssetUploadIntent = 'ADD_TO_PACKAGE' | 'ADD_TO_ARCHIVE' | 'REPLACE_SLOT';

export type AssetIngestionContext = {
  projectId: string;
  entryId: string;
  packageId?: string;
  currentTab?: string;
  formatFamily: AssetFormatFamily;
  destinationSlot?: string;
  expectedAssetType?: Entry001AssetType;
  expectedRole?: Entry001ContentRole | null;
  sequenceId?: string;
  existingSequenceCount?: number;
  platform?: string;
  sourceRoute?: string;
  uploadIntent: AssetUploadIntent;
};

export type CampaignAssetMediaMetadata = {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE';
  duration?: number;
  mimeType: string;
  fileSize: number;
  mediaType: 'IMAGE' | 'VIDEO' | 'GIF' | 'AUDIO' | 'DOCUMENT';
  frameRate?: number;
  hasAudio?: boolean;
};

export type AspectRatioClassification = {
  ratio: number;
  orientation: CampaignAssetMediaMetadata['orientation'];
  likelyFormatFamilies: AssetFormatFamily[];
  likelyAssetTypes: Entry001AssetType[];
  confidence: AssetClassificationConfidence;
  matchedFamily?: '9:16' | '4:5' | '1:1' | '16:9' | 'OTHER';
};

export type AssetClassificationConfidence = 'HIGH' | 'MODERATE' | 'LOW';

export type AssetClassificationDecision = {
  assetId: string;
  fileName: string;
  contextSignals: string[];
  ratioSignals: string[];
  filenameSignals: string[];
  visualSignals: string[];
  existingPackageSignals: string[];
  suggestedType: Entry001AssetType;
  suggestedRole: Entry001ContentRole | null;
  confidence: AssetClassificationConfidence;
  rationale: string;
  founderOverride?: boolean;
  finalType?: Entry001AssetType;
  finalRole?: Entry001ContentRole | null;
  createdAt: string;
};

export type BatchClassificationSummary = {
  homogeneous: boolean;
  primaryType: Entry001AssetType;
  primaryRole: Entry001ContentRole | null;
  confidence: AssetClassificationConfidence;
  totalCount: number;
  autoAcceptCount: number;
  reviewCount: number;
  anomalies: Array<{ assetId: string; reason: string }>;
  headline: string;
};

export type AssetUsageGraphNode = {
  assetId: string;
  archiveStatus: 'ACTIVE' | 'ARCHIVED' | 'REMOVED';
  packageMembership: string[];
  formatSequences: Array<{ formatFamily: string; sequenceIndex: number | null }>;
  derivedAssets: string[];
  previewUsage: boolean;
  productionUsage: boolean;
};
