/**
 * B5.6 — Generic campaign package persistence types (brand-agnostic).
 */

export const CAMPAIGN_PACKAGE_STORAGE_SOURCES = [
  'STATIC_PUBLIC',
  'SUPABASE_STORAGE',
  'PROVIDER',
  'IMPORTED',
  'EXTERNAL_REFERENCE',
  'BLOB_SESSION',
] as const;
export type CampaignPackageStorageSource = (typeof CAMPAIGN_PACKAGE_STORAGE_SOURCES)[number];

export const CAMPAIGN_PACKAGE_ASSET_SOURCES = [
  'FOUNDER_SUPPLIED',
  'STUDIO_WORLD_DERIVED',
  'PROVIDER_GENERATED',
  'IMPORTED',
  'SEED',
] as const;
export type CampaignPackageAssetSource = (typeof CAMPAIGN_PACKAGE_ASSET_SOURCES)[number];

export const CAMPAIGN_PACKAGE_STATUSES = [
  'IN_PROGRESS',
  'INCOMPLETE',
  'READY_FOR_DERIVATION',
  'COMPLETE',
  'ARCHIVED',
] as const;
export type CampaignPackageStatus = (typeof CAMPAIGN_PACKAGE_STATUSES)[number];

export const CAMPAIGN_AUDIT_EVENT_TYPES = [
  'ASSET_ADDED',
  'ASSET_RECLASSIFIED',
  'ASSET_REMOVED',
  'ASSET_RESTORED',
  'DELIVERABLE_ADDED',
  'DELIVERABLE_REPLACED',
  'DELIVERABLE_REMOVED',
  'CAPTION_EDITED',
  'SEQUENCE_REORDERED',
  'VERSION_CHANGED',
  'MIGRATION_COMPLETED',
] as const;
export type CampaignAuditEventType = (typeof CAMPAIGN_AUDIT_EVENT_TYPES)[number];

export type CampaignPackageRecord = {
  packageId: string;
  packageKey: string;
  projectId: string;
  brandId: string;
  entryId: string;
  packageType: string;
  status: CampaignPackageStatus;
  previewReadiness: string;
  campaignBoardEligibility: boolean;
  migrationVersion: number;
  migrationComplete: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type CampaignAssetRecord = {
  assetId: string;
  packageId: string;
  entryId: string;
  assetType: string;
  assetRole: string | null;
  formatFamily: string | null;
  platform: string | null;
  title: string;
  filePath: string;
  format: 'IMAGE' | 'VIDEO' | 'ICON';
  legacyRole: string;
  source: CampaignPackageAssetSource;
  storageSource: CampaignPackageStorageSource;
  status: string;
  founderJudgment: string | null;
  approved: boolean;
  sequenceIndex: number | null;
  parentAssetId: string | null;
  packageMembershipId: string | null;
  removedFromActiveArchive: boolean;
  archivedAt: string | null;
  caption: string | null;
  versionLabel: string;
  metadata: Record<string, unknown>;
  lineage: Record<string, unknown>;
  classificationHistory: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
};

export type CampaignDeliverableRecord = {
  deliverableId: string;
  packageId: string;
  assetId: string | null;
  formatFamily: string;
  platform: string;
  deliverableType: string;
  status: string;
  currentVersionId: string | null;
  removedFromPackage: boolean;
  metadata: Record<string, unknown>;
  lineage: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CampaignDeliverableVersionRecord = {
  versionId: string;
  deliverableId: string;
  versionNumber: number;
  filePath: string;
  caption: string | null;
  title: string;
  assetType: string;
  assetRole: string | null;
  sequenceIndex: number | null;
  source: CampaignPackageAssetSource;
  storageSource: CampaignPackageStorageSource;
  createdAt: string;
  createdBy: string | null;
  supersededAt: string | null;
  metadata: Record<string, unknown>;
};

export type CampaignFormatSequenceRecord = {
  sequenceId: string;
  packageId: string;
  formatFamily: 'CAROUSEL' | 'STORY';
  platform: string;
  orderedAssetIds: string[];
  versionNumber: number;
  isCurrent: boolean;
  sequenceChangedAt: string | null;
  updatedAt: string;
  metadata: Record<string, unknown>;
};

export type CampaignPackageMigrationReceipt = {
  migrationId: string;
  packageId: string;
  source: 'LOCAL_STORAGE' | 'SEED' | 'MERGE';
  sourceVersion?: string;
  recordsExamined: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  assetsCreated?: number;
  assetsUpdated?: number;
  deliverablesCreated?: number;
  deliverablesUpdated?: number;
  versionsCreated?: number;
  sequencesCreated?: number;
  errors: string[];
  completedAt: string;
  legacyBackup?: Record<string, unknown>;
};

export type CampaignPackageAuditEvent = {
  eventId: string;
  packageId: string;
  entryId: string;
  actor: string | null;
  eventType: CampaignAuditEventType;
  targetId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
};

export type CampaignPackageSnapshot = {
  package: CampaignPackageRecord;
  assets: CampaignAssetRecord[];
  deliverables: CampaignDeliverableRecord[];
  versions: CampaignDeliverableVersionRecord[];
  sequences: CampaignFormatSequenceRecord[];
  migrationReceipts: CampaignPackageMigrationReceipt[];
  auditEvents: CampaignPackageAuditEvent[];
};

export type CampaignPackageSaveState = 'idle' | 'saving' | 'saved' | 'failed';

export type CampaignSequenceConflict = {
  code: 'SEQUENCE_UPDATED_ELSEWHERE';
  message: string;
  currentSequence: CampaignFormatSequenceRecord;
};

export type LegacyEntry001LocalState = {
  overrides: Record<string, Record<string, unknown>>;
  removedAssetIds: string[];
  archivedAssets: Array<Record<string, unknown>>;
  extraAssets: Array<Record<string, unknown>>;
  deliverables?: Array<Record<string, unknown>>;
};
