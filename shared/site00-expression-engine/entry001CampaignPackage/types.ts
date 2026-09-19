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
  /** B5.5 — preview available even when campaign board locked */
  previewReadiness: Entry001PreviewReadiness;
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

/** B5.5 — Format family for package workspaces. */
export type Entry001FormatFamily =
  | 'REEL'
  | 'CAROUSEL'
  | 'STORY'
  | 'TIKTOK'
  | 'X'
  | 'HIGHLIGHT'
  | 'STATIC'
  | 'OTHER';

export type Entry001DeliverableStatus =
  | 'PENDING'
  | 'UPLOADED'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'REMOVED'
  | 'ARCHIVED'
  | 'DELETED';

export type Entry001FormatWorkspaceStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AWAITING_REVIEW'
  | 'COMPLETE'
  | 'NEEDS_REVISION';

export type Entry001PreviewReadiness = 'AVAILABLE' | 'LOCKED';

export type Entry001DeliverableVersion = {
  version: string;
  assetId: string;
  filePath: string;
  title: string;
  at: string;
  status: 'CURRENT' | 'ARCHIVED';
};

/** B5.5 — First-class persistent deliverable record. */
export type Entry001DeliverableRecord = {
  deliverableId: string;
  entryId: 'entry-001';
  packageId: string | null;
  assetId: string;
  assetType: Entry001AssetType;
  assetRole: Entry001ContentRole | null;
  formatFamily: Entry001FormatFamily;
  platform: string | null;
  title: string;
  description: string | null;
  filePath: string;
  status: Entry001DeliverableStatus;
  source: Entry001AssetSource;
  approved: boolean;
  founderJudgment: string | null;
  version: string;
  sequenceIndex: number | null;
  parentFormatId: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  deletedAt: string | null;
  removedFromPackage: boolean;
  metadata: Record<string, unknown>;
  lineage: Entry001CampaignAsset['lineage'];
  history: Entry001DeliverableVersion[];
  caption: string | null;
  format: Entry001CampaignAsset['format'];
};

export type Entry001FormatWorkspaceSummary = {
  formatFamily: Entry001FormatFamily;
  label: string;
  platform: string;
  assetCount: number;
  approvedAssetCount: number;
  missingAssetCount: number;
  status: Entry001FormatWorkspaceStatus;
  previewable: boolean;
  complete: boolean;
  deliverableIds: string[];
  missingSlots: string[];
};

export type Entry001FormatPreviewSlot = {
  slotId: string;
  label: string;
  deliverable: Entry001DeliverableRecord | null;
  placeholder: boolean;
  placeholderLabel?: string;
};

export type Entry001FormatPreview = {
  formatFamily: Entry001FormatFamily;
  label: string;
  status: Entry001FormatWorkspaceStatus;
  slots: Entry001FormatPreviewSlot[];
  caption: string | null;
  copyText: string | null;
  sequenceTotal: number;
  sequenceCurrent: number;
};

export type Entry001PackagePreviewComposition = {
  entryId: 'entry-001';
  previewReadiness: Entry001PreviewReadiness;
  campaignBoardEligibility: boolean;
  formats: Entry001FormatPreview[];
  packageMap: Entry001SocialPackageMapNode[];
};

export type Entry001SocialPackageMapNode = {
  id: string;
  label: string;
  formatFamily: Entry001FormatFamily | null;
  children: Entry001SocialPackageMapNode[];
  status: Entry001FormatWorkspaceStatus;
};

export type Entry001PackagePreviewReadiness = {
  previewReadiness: Entry001PreviewReadiness;
  campaignBoardEligibility: boolean;
  incompleteFormats: Entry001FormatFamily[];
  completeFormats: Entry001FormatFamily[];
};
