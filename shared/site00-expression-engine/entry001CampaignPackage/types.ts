/**
 * B5.2 / B5.4 — Entry 001 Campaign Package canonical types.
 */

export type Entry001AssetSource =
  | 'FOUNDER_SUPPLIED'
  | 'STUDIO_WORLD_DERIVED'
  | 'PROVIDER_GENERATED'
  | 'IMPORTED';

/** Canonical content-type taxonomy (B5.4). */
export type Entry001AssetType =
  | 'REEL'
  | 'REEL_COVER'
  | 'HIGHLIGHT_ICON'
  | 'CAROUSEL'
  | 'CAROUSEL_SLIDE'
  | 'STORY'
  | 'STORY_FRAME'
  | 'TIKTOK'
  | 'X_POST'
  | 'STATIC_POST'
  | 'QUOTE_POST'
  | 'INFOGRAPHIC'
  | 'CTA_FRAME'
  | 'REFERENCE_ONLY'
  | 'OTHER';

/** Chapter-argument or structural role within a format (B5.4). */
export type Entry001ContentRole =
  | 'COVER'
  | 'CLAIM'
  | 'RECEIPT'
  | 'CONTRADICTION'
  | 'LENS'
  | 'INTERJECTION'
  | 'SYNTHESIS'
  | 'CTA'
  | 'SUPPORTING_EVIDENCE'
  | 'HERO'
  | 'OTHER';

/** Legacy role field — kept for deliverable slots + backward compatibility. */
export type Entry001AssetRole =
  | 'ENTRY_COVER'
  | 'ENTRY_HERO'
  | 'CAROUSEL_SLIDE'
  | 'SOCIAL_POST'
  | 'STORY_FRAME'
  | 'REFERENCE_GRAPHIC'
  | 'QUOTE_POST'
  | 'INFOGRAPHIC'
  | 'DERIVED_ASSET'
  | 'CAMPAIGN_PACKAGE_ASSET'
  | 'REEL_COVER'
  | 'HIGHLIGHT_ICON'
  | 'FINAL_REEL'
  | 'TIKTOK_POST'
  | 'X_POST';

export type Entry001AssetStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'AWAITING_FOUNDER_APPROVAL'
  | 'MISSING'
  | 'ARCHIVED';

export type Entry001ClassificationHistoryEntry = {
  at: string;
  previousAssetType?: Entry001AssetType;
  previousAssetRole?: Entry001ContentRole | null;
  newAssetType: Entry001AssetType;
  newAssetRole?: Entry001ContentRole | null;
  reason: 'FOUNDER_EDIT' | 'INGESTION' | 'MIGRATION';
};

export type Entry001CampaignAsset = {
  assetId: string;
  entryId: 'entry-001';
  filePath: string;
  title: string;
  format: 'IMAGE' | 'VIDEO' | 'ICON';
  /** Legacy — mirrors assetType for deliverables; archive assets retain mapped role. */
  role: Entry001AssetRole;
  /** B5.4 canonical content type. */
  assetType: Entry001AssetType;
  /** B5.4 optional chapter/structural role. */
  assetRole?: Entry001ContentRole | null;
  status: Entry001AssetStatus;
  source: Entry001AssetSource;
  approved: boolean;
  founderJudgment?: string | null;
  version: string;
  sequenceIndex?: number | null;
  parentAssetId?: string | null;
  packageId?: string | null;
  removedFromActiveArchive?: boolean;
  archivedAt?: string | null;
  lineage?: {
    sourceAssetIds?: string[];
    sourceEntryId?: string;
    derivationPlanId?: string;
    generationProvider?: string;
    visualContinuityVersion?: string;
    narrativeAuthorityVersion?: string;
    founderJudgment?: string;
    approvalState?: string;
  };
  classificationHistory?: Entry001ClassificationHistoryEntry[];
  dimensions?: { width: number; height: number };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Entry001ParentPackage = {
  packageId: string;
  entryId: 'entry-001';
  assetType: 'CAROUSEL' | 'STORY';
  title: string;
  status: 'APPROVED' | 'IN_PROGRESS' | 'ARCHIVED';
  childAssetIds: string[];
};

export type Entry001AssetClassificationSuggestion = {
  assetId: string;
  suggestedAssetType: Entry001AssetType;
  suggestedAssetRole: Entry001ContentRole | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
};

export type Entry001MigrationAuditRow = {
  assetId: string;
  title: string;
  currentClassification: string;
  recommendedAssetType: Entry001AssetType;
  recommendedAssetRole: Entry001ContentRole | null;
  activeRecommendation: 'KEEP' | 'REVIEW';
};

export type Entry001ArchiveFilter =
  | 'ALL'
  | 'REEL'
  | 'CAROUSEL'
  | 'STORY'
  | 'X'
  | 'TIKTOK'
  | 'STATIC';

export type Entry001PackageStatus =
  | 'IN_PROGRESS'
  | 'INCOMPLETE'
  | 'READY_FOR_DERIVATION'
  | 'COMPLETE';

export type Entry001PackageReadiness = {
  requiredAssetCount: number;
  approvedAssetCount: number;
  missingAssetCount: number;
  requiredTypes: Entry001AssetType[];
  approvedTypes: Entry001AssetType[];
  missingTypes: Entry001AssetType[];
  /** @deprecated use requiredTypes — kept for B5.2 compat */
  requiredRoles: Entry001AssetRole[];
  approvedRoles: Entry001AssetRole[];
  missingRoles: Entry001AssetRole[];
  packageStatus: Entry001PackageStatus;
  nextRequiredType: Entry001AssetType | null;
  nextRequiredRole: Entry001AssetRole | null;
  campaignBoardEligible: boolean;
  styleContinuityLocked: boolean;
  derivationReady: boolean;
  activeArchiveCount: number;
  typedCoverage: Partial<Record<Entry001AssetType, number>>;
};

export type Entry001DerivationTarget = {
  targetAssetType: Entry001AssetType;
  targetAssetRole?: Entry001ContentRole | null;
  /** @deprecated — use targetAssetType */
  role: Entry001AssetRole;
  derivable: boolean;
  recommendedSourceAssetIds: string[];
  sourceAssetTypes: Entry001AssetType[];
  recommendedContinuityReferences: string[];
  visualContinuityRules: string[];
  copyContinuityRules: string[];
  formatRules: string[];
  generationStrategy: string;
  founderApprovalRequired: boolean;
};

export type Entry001ArchiveDerivationPlan = {
  planId: string;
  entryId: 'entry-001';
  compiledAt: string;
  providerDispatchCount: 0;
  targets: Entry001DerivationTarget[];
};

export type Entry001VisualContinuitySummary = {
  entryId: 'entry-001';
  palette: string[];
  material: string[];
  typography: string[];
  imageLanguage: string[];
  annotation: string[];
  composition: string[];
  tone: string[];
  formatLanguage?: Partial<Record<Entry001AssetType, string[]>>;
};

export type Entry001NarrativeContinuityLink = {
  entryId: 'entry-001';
  thesis: string;
  argumentThemes: string[];
  narrativeAuthorityVersion: string;
  reelGapAcknowledged: boolean;
};

export type Entry001ArchiveIntelligenceSnapshot = {
  entryId: 'entry-001';
  existingAssetTypes: Entry001AssetType[];
  completeFormats: Entry001AssetType[];
  missingFormats: Entry001AssetType[];
  packageGroups: { packageId: string; assetType: Entry001AssetType; childCount: number }[];
  styleReferenceAssetIds: string[];
  doNotRegenerateTypes: Entry001AssetType[];
  derivableFromFamilies: Partial<Record<Entry001AssetType, Entry001AssetType[]>>;
};
