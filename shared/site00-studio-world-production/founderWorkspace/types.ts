/**
 * Generic Studio World — Founder Workspace presentation types.
 * Brand-agnostic; NDX adapters supply labels and accent tokens.
 */

export type FounderAttentionLevel =
  | 'NEEDS_YOUR_DECISION'
  | 'READY_TO_REVIEW'
  | 'MOVING_WITHOUT_YOU'
  | 'DEVELOPING'
  | 'INFORMATIONAL'
  | 'ARCHIVED';

export type WorkspaceNavId =
  | 'OVERVIEW'
  | 'CREATE'
  | 'REVIEW'
  | 'LEARN'
  | 'INTELLIGENCE'
  | 'CHARACTER'
  | 'ARCHIVE';

export type WorkspaceNavItem = {
  id: WorkspaceNavId;
  label: string;
  href: string;
  badge?: number;
};

export type OperationalPulseCounts = {
  beingMade: number;
  needYourEye: number;
  developing: number;
  fromAudience: number;
};

export type OperationalPulse = {
  counts: OperationalPulseCounts;
  primaryAction: {
    label: string;
    href: string;
  } | null;
  attentionLevel: FounderAttentionLevel;
};

export type CreativeAssetPresentation = {
  id: string;
  title: string;
  previewUrl: string | null;
  formatLabel: string;
  channelLabel: string;
  attention: FounderAttentionLevel;
  statusLabel: string;
  internalStatus: string;
  subtitle?: string;
};

export type EditorialLeadPresentation = {
  id: string;
  headline: string;
  leadLine: string;
  attention: FounderAttentionLevel;
  sourceHint?: string;
  inspectScore?: number;
};

export type ContentLanePresentation = {
  laneId: string;
  label: string;
  assets: CreativeAssetPresentation[];
};

export type CampaignDayPresentation = {
  date: string;
  dayLabel: string;
  lanes: ContentLanePresentation[];
};

export type ExperimentStageId =
  | 'UNDERSTAND'
  | 'DISCOVER'
  | 'EXPRESS'
  | 'EMBODY'
  | 'PUBLISH'
  | 'LEARN';

export type ExperimentStagePresentation = {
  stageId: ExperimentStageId;
  order: number;
  label: string;
  purpose: string;
  experimentIds: string[];
  stateLabel: string;
};

/** Used by buildDefaultExperimentJourneyStages */
export type ExperimentJourneyStageConfig = {
  stage: ExperimentStageId;
  order: number;
  title: string;
  purpose: string;
  experimentIds: string[];
};

export type VersionLineageEntry = {
  version: string;
  summary: string;
};

export type InspectorSection = {
  id: string;
  title: string;
  content: string | Record<string, unknown>;
};

export type CulturalSignalPresentation = {
  id: string;
  headline: string;
  category: string;
  leadLine: string;
  strengthHint?: string;
  inspectScore?: number;
  attention: FounderAttentionLevel;
};

export type PerformanceCreativePresentation = {
  id: string;
  title: string;
  previewUrl: string | null;
  metricsSummary: string;
  attention: FounderAttentionLevel;
};

export type CharacterSynthesisPresentation = {
  herInASentence: string | null;
  whoSheIs: string | null;
  calibrationPct: number | null;
  workingDraftLabel: string | null;
  attention: FounderAttentionLevel;
};

export type LearningSignalPresentation = {
  id: string;
  observation: string;
  confidence: string;
  founderAccepted: boolean;
};
