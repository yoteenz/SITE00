/**
 * B5.7 — Canonical project operating state types.
 */

import type { OperationalPulse } from '../../../site00-studio-world-production/founderWorkspace/types.js';

export type ProjectEntryStage =
  | 'CREATIVE_DIRECTION'
  | 'STORYBOARD'
  | 'PRODUCTION'
  | 'PACKAGE_ASSEMBLY'
  | 'FOUNDER_REVIEW'
  | 'COMPLETE'
  | 'DEVELOPING'
  | 'RESEARCH';

export type ProjectEntryState = {
  entryId: string;
  entryNumber: number;
  title: string;
  subtitle: string;
  stage: ProjectEntryStage;
  stageLabel: string;
  needsFounderReview: boolean;
  isCanon: boolean;
  href: string;
};

export type ProjectProductionCard = {
  id: string;
  title: string;
  tag: string | null;
  tone: 'priority' | 'default';
  subtitle: string;
  href: string;
  artworkPath?: string;
};

export type ProjectApprovalItem = {
  id: string;
  label: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  href?: string;
};

export type ProjectLabSystemCard = {
  systemId: string;
  label: string;
  category: 'CREATIVE_BRAIN' | 'CHARACTER' | 'CONTINUITY' | 'CAMPAIGN_SYSTEMS' | 'EXPERIMENTS';
  status: 'READY' | 'ACTIVE' | 'PARTIAL' | 'CANON_PARTIAL' | 'VISUAL_AUTHORITY_NEEDED' | 'BLOCKED' | 'STALE';
  statusLabel: string;
  href?: string;
};

export type Entry001StateAudit = {
  activeArchiveCount: number;
  archivedRemovedCount: number;
  packageDeliverableCount: number;
  carouselSlideCount: number;
  storyFrameCount: number;
  archivePackageConsistent: boolean;
  explanation: string;
  mismatchRepairApplied: boolean;
};

export type ProjectOperatingState = {
  projectId: string;
  projectStateVersion: number;
  lastUpdatedAt: string;
  chapterId: string;
  chapterTitle: string;
  pulse: OperationalPulse;
  entries: ProjectEntryState[];
  inProduction: ProjectProductionCard[];
  currentWork: string[];
  approvalsNeeded: ProjectApprovalItem[];
  opportunities: Array<{ label: string; score?: string }>;
  signals: Array<{ label: string; strength?: string }>;
  radarItems: string[];
  labSystems: ProjectLabSystemCard[];
  entry001Audit: Entry001StateAudit;
};

export type StaleProjectFailureClass =
  | 'STALE_PROJECT_CONTENT'
  | 'CROSS_TAB_STATE_MISMATCH'
  | 'DEMO_FIXTURE_IN_ACTIVE_UI'
  | 'ASSET_TYPE_CONTEXT_IGNORED'
  | 'ASPECT_RATIO_SIGNAL_IGNORED'
  | 'PACKAGE_SEQUENCE_NOT_INFERRED'
  | 'ARCHIVE_PACKAGE_STATE_AMBIGUOUS'
  | 'ASSET_USAGE_NOT_TRACKED'
  | 'CURRENT_WORK_NOT_CANONICAL'
  | 'LAB_STATUS_STALE'
  | 'OVERVIEW_COUNT_STALE';
