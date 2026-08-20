/** Adaptive creative intake — shared types */

import type { MarketingIntakeRecord, MarketingServiceCategory } from '../types.js';

export type CreativeIntakeFamily =
  | 'ATTENTION'
  | 'FILM_SET'
  | 'CAMPAIGN_CONTROL'
  | 'EDITORIAL'
  | 'UNSUPPORTED_FALLBACK';

export type SignatureArtifact =
  | 'ATTENTION_MAP'
  | 'FILM_TREATMENT'
  | 'CAMPAIGN_CONTROL'
  | 'STORY_FILE'
  | 'GENERIC_FALLBACK';

export type CreativeIntakeFieldType = 'text' | 'textarea' | 'platform-select' | 'objective-select';

export type CreativeIntakeStageField = {
  id: keyof MarketingIntakeRecord | string;
  type: CreativeIntakeFieldType;
  /** Screen-reader / accessibility label */
  a11yLabel: string;
};

export type CreativeIntakeStage = {
  id: string;
  /** Creative prompt (visible) */
  prompt: string;
  /** Supporting clarification */
  hint: string;
  /** Progress label — discipline-specific, not generic STEP 01 */
  progressLabel: string;
  fields: CreativeIntakeStageField[];
};

export type CreativeIntakeExperience = {
  discipline: MarketingServiceCategory;
  family: CreativeIntakeFamily;
  environment: string;
  visualMode: string;
  signatureArtifact: SignatureArtifact;
  progressMetaphor: string;
  completionLanguage: string;
  /** Headline-removal differentiation marker */
  differentiationMarker: SignatureArtifact;
  stages: CreativeIntakeStage[];
  mobileMode: 'viewport-attention' | 'director-monitor' | 'active-node' | 'specimen-record' | 'stacked';
};

export type CreativeIntakeDraft = {
  serviceId: MarketingServiceCategory;
  stageIndex: number;
  form: Record<string, string | string[]>;
  updatedAt: string;
};

export const SUPPORTED_PLATFORMS = [
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'FACEBOOK',
  'LINKEDIN',
  'OTHER',
] as const;

export const CAMPAIGN_OBJECTIVE_TERRITORIES = [
  'AWARENESS',
  'LAUNCH',
  'CONSIDERATION',
  'CONVERSION',
  'RETENTION',
  'REPOSITIONING',
  'OTHER',
] as const;
