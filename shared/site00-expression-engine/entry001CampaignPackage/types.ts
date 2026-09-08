/**
 * B5.2 — Entry 001 Campaign Package canonical types.
 */

export type Entry001AssetSource =
  | 'FOUNDER_SUPPLIED'
  | 'STUDIO_WORLD_DERIVED'
  | 'PROVIDER_GENERATED'
  | 'IMPORTED';

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

export type Entry001AssetStatus = 'APPROVED' | 'PENDING' | 'AWAITING_FOUNDER_APPROVAL' | 'MISSING';

export type Entry001CampaignAsset = {
  assetId: string;
  entryId: 'entry-001';
  filePath: string;
  title: string;
  format: 'IMAGE' | 'VIDEO' | 'ICON';
  role: Entry001AssetRole;
  status: Entry001AssetStatus;
  source: Entry001AssetSource;
  approved: boolean;
  version: string;
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
  dimensions?: { width: number; height: number };
  notes?: string;
};

export type Entry001PackageStatus =
  | 'IN_PROGRESS'
  | 'INCOMPLETE'
  | 'READY_FOR_DERIVATION'
  | 'COMPLETE';

export type Entry001PackageReadiness = {
  requiredAssetCount: number;
  approvedAssetCount: number;
  missingAssetCount: number;
  requiredRoles: Entry001AssetRole[];
  approvedRoles: Entry001AssetRole[];
  missingRoles: Entry001AssetRole[];
  packageStatus: Entry001PackageStatus;
  nextRequiredRole: Entry001AssetRole | null;
  campaignBoardEligible: boolean;
  styleContinuityLocked: boolean;
  derivationReady: boolean;
};

export type Entry001DerivationTarget = {
  role: Entry001AssetRole;
  derivable: boolean;
  recommendedSourceAssetIds: string[];
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
};

export type Entry001NarrativeContinuityLink = {
  entryId: 'entry-001';
  thesis: string;
  argumentThemes: string[];
  narrativeAuthorityVersion: string;
  reelGapAcknowledged: boolean;
};
