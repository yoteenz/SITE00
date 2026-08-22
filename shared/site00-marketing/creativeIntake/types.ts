/** Adaptive creative intake — shared types */

import type { MarketingIntakeRecord, MarketingServiceCategory } from '../types.js';

export type CreativeIntakeFamily =
  | 'ATTENTION'
  | 'UGC_AUTHENTICITY'
  | 'FILM_SET'
  | 'CAMPAIGN_CONTROL'
  | 'PRODUCT_STAGING'
  | 'LAUNCH_SEQUENCE'
  | 'CONTENT_ENGINE'
  | 'UNSUPPORTED_FALLBACK';

export type SignatureArtifact =
  | 'ATTENTION_MAP'
  | 'UGC_STYLE_GUIDE'
  | 'FILM_TREATMENT'
  | 'CAMPAIGN_CONTROL'
  | 'PRODUCT_STAGE'
  | 'LAUNCH_BLUEPRINT'
  | 'CONTENT_SYSTEM_MAP'
  | 'GENERIC_FALLBACK';

export type CreativeIntakeFieldType =
  | 'text'
  | 'textarea'
  | 'platform-select'
  | 'objective-select'
  | 'tone-select'
  | 'launch-type-select'
  | 'format-select';

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
  mobileMode:
    | 'viewport-attention'
    | 'creator-frame'
    | 'director-monitor'
    | 'active-node'
    | 'product-stage'
    | 'launch-countdown'
    | 'system-architecture'
    | 'stacked';
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

export const UGC_TONE_OPTIONS = [
  'CONVERSATIONAL',
  'EDUCATIONAL',
  'ENTERTAINING',
  'RELATABLE',
  'INSPIRING',
  'DIRECT',
] as const;

export const UGC_CAMERA_STYLES = [
  'TALKING HEAD',
  'DEMO / HOW-TO',
  'TESTIMONIAL',
  'BEHIND THE SCENES',
  'LIFESTYLE MOMENT',
  'OTHER',
] as const;

export const LAUNCH_TYPE_OPTIONS = [
  'PRODUCT LAUNCH',
  'REBRAND LAUNCH',
  'CAMPAIGN LAUNCH',
  'EVENT / DROP',
] as const;

export const CONTENT_FORMAT_OPTIONS = [
  'ARTICLES / BLOGS',
  'SHORT-FORM VIDEO',
  'LONG-FORM VIDEO',
  'CAROUSELS',
  'PODCAST / AUDIO',
  'NEWSLETTER',
  'DOWNLOADS / GUIDES',
  'LIVE / WEBINAR',
  'OTHER',
] as const;
