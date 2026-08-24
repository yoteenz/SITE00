/**
 * Generic Studio World — Founder Workspace types.
 */

import type {
  DISCLOSURE_LAYERS,
  EXPERIMENT_JOURNEY_STAGES,
  FOUNDER_ATTENTION_LEVELS,
} from './constants.js';

export type DisclosureLayer = (typeof DISCLOSURE_LAYERS)[number];
export type FounderAttentionLevel = (typeof FOUNDER_ATTENTION_LEVELS)[number];
export type ExperimentJourneyStage = (typeof EXPERIMENT_JOURNEY_STAGES)[number];

export type WorkspaceNavItem = {
  id: string;
  label: string;
  path: string;
  attentionLevel?: FounderAttentionLevel;
};

export type OperationalPulseMetric = {
  id: string;
  label: string;
  value: number;
  attentionLevel?: FounderAttentionLevel;
};

export type ExperimentJourneyStageConfig = {
  stage: ExperimentJourneyStage;
  order: number;
  title: string;
  purpose: string;
  experimentIds: string[];
};

export type CreativeAssetPresentation = {
  assetId: string;
  title: string;
  previewUrl: string | null;
  format: string;
  channel?: string;
  attentionLevel: FounderAttentionLevel;
  statusLabel: string;
  reviewRoute?: string;
};

export type VersionLineageEntry = {
  versionId: string;
  label: string;
  founderSummary: string;
  isCurrent: boolean;
};
