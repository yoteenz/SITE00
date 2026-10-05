/**
 * P0.CJ.2 — Concept Review presentation model (summary-first, diagnostics collapsed).
 */

import type { CreativeJudgmentResult } from '../creative-judgment-intelligence/types.js';
import type { FounderJudgmentLabel } from '../creative-judgment-intelligence/failureClasses.js';

export const CONCEPT_CASE_TYPES = ['invented', 'real_brand'] as const;
export type ConceptCaseType = (typeof CONCEPT_CASE_TYPES)[number];

export const CONCEPT_GROUNDING_MODES = ['live_grounded', 'asset_grounded', 'profile_grounded'] as const;
export type ConceptGroundingMode = (typeof CONCEPT_GROUNDING_MODES)[number];

export const CONCEPT_PANEL_STATUSES = [
  'DRAFT',
  'READY_FOR_REVIEW',
  'FOUNDER_REVIEWED',
  'APPROVED_FOR_NEXT_STAGE',
  'ON_HOLD',
  'REVISE',
] as const;
export type ConceptPanelStatus = (typeof CONCEPT_PANEL_STATUSES)[number];

export const PRESENTATION_FOUNDER_JUDGMENTS = [
  'LOVE_IT',
  'PROMISING',
  'TOO_CLOSE',
  'NOT_NDXBOOK',
  'REVISE',
  'HOLD',
  'APPROVED_FOR_NEXT_STAGE',
] as const;
export type PresentationFounderJudgment = (typeof PRESENTATION_FOUNDER_JUDGMENTS)[number];

export type ConceptPanelAsset = {
  assetId: string;
  kind: 'hero_visual' | 'screenshot' | 'product_photo' | 'symbol' | 'reference';
  label: string;
  url: string | null;
  symbolicTreatment?: string | null;
};

export type ConceptPanelDiagnostics = {
  fullReasoning: string;
  selectionRationale: string;
  rejectionNotes: string[];
  channelTranslationNotes: string[];
  brandFidelityAnalysis: string;
  leakAnalysis: string;
  risks: string[];
  suggestedRefinements: string[];
  engineJudgment: CreativeJudgmentResult | null;
};

export type ConceptPanel = {
  id: string;
  brandName: string;
  caseType: ConceptCaseType;
  groundingMode: ConceptGroundingMode;
  groundingLabel: string;
  conceptTitle: string;
  territoryName: string;
  oneLinePremise: string;
  centralTension: string;
  mechanism: string;
  world: string;
  artifact: string;
  reveal: string;
  payoff: string;
  heroMove: string;
  interjection: string;
  expressionContext: string;
  primaryChannels: string[];
  decision: string;
  score: number;
  failureClass: string | null;
  brandFidelityStatus: string;
  ndxLeakStatus: string;
  strengths: string[];
  weaknesses: string[];
  nextPush: string | null;
  founderJudgment: PresentationFounderJudgment | FounderJudgmentLabel | null;
  founderNotes: {
    whyIFeelThis: string | null;
    whatsMissing: string | null;
    whatToPreserve: string | null;
    whatToPush: string | null;
  };
  assets: ConceptPanelAsset[];
  heroVisualAssetId: string | null;
  status: ConceptPanelStatus;
  isDemoCase: boolean;
  isRealBrandDemo: boolean;
  diagnostics: ConceptPanelDiagnostics;
};

export type BrandCaseProfile = {
  brandId: string;
  brandName: string;
  category: string;
  websiteUrl: string | null;
  groundingMode: ConceptGroundingMode;
  groundingLabel: string;
  brandEssence: string;
  targetAudience: string;
  productLineSummary: string;
  visualLanguageNotes: string;
  packagingCues: string;
  positioningNotes: string;
  founderReferences: string[];
  uploadedScreenshots: ConceptPanelAsset[];
  uploadedProductImages: ConceptPanelAsset[];
  intakeComplete: boolean;
  liveFetchAvailable: boolean;
};

export type ConceptGalleryPayload = {
  presentationVersion: string;
  level: 'CONCEPT_GALLERY';
  concepts: ConceptPanel[];
  brandCases: BrandCaseProfile[];
  compareSelection: string[];
  trailerModeAvailable: boolean;
  visualAuthority: string;
};

export type ConceptFounderJudgmentInput = {
  conceptId: string;
  judgment: PresentationFounderJudgment;
  whyIFeelThis?: string | null;
  whatsMissing?: string | null;
  whatToPreserve?: string | null;
  whatToPush?: string | null;
};
