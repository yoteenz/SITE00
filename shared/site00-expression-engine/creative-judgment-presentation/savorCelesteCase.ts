/**
 * P0.CJ.2 — Savor Celeste real fragrance brand case (profile-grounded demo).
 * Does NOT hallucinate live site details — intake fields are founder/profile sourced.
 */

import type { CreativeJudgmentInput, TerritoryCandidate } from '../creative-judgment-intelligence/types.js';
import type { BrandCaseProfile, ConceptPanel } from './types.js';
import { mapJudgmentToConceptPanel } from './conceptPanelMapper.js';

export const SAVOR_CELESTE_BRAND_ID = 'savor-celeste';

export const SAVOR_CELESTE_PROFILE: BrandCaseProfile = {
  brandId: SAVOR_CELESTE_BRAND_ID,
  brandName: 'Savor Celeste',
  category: 'Luxury fragrance',
  websiteUrl: 'https://www.savorceleste.com',
  groundingMode: 'profile_grounded',
  groundingLabel: 'PROFILE-GROUNDED',
  brandEssence:
    'Intimate luxury — scent as remembered space, not public status theater. Founder-entered profile; live site not scraped in this build.',
  targetAudience: 'Design-conscious adults seeking personal ritual fragrance, not loud logo luxury',
  productLineSummary: 'Eau de parfum collection — enter specific SKUs via uploaded product photography when available',
  visualLanguageNotes:
    'Soft celestial naming, restrained palette, editorial product stills — confirm via uploaded assets',
  packagingCues: 'Minimal glass, subtle typography, gift-ready presentation',
  positioningNotes:
    'Premium but private — fragrance as an inner room you return to, not a billboard identity',
  founderReferences: ['www.savorceleste.com — verify visuals via upload or live fetch when enabled'],
  uploadedScreenshots: [],
  uploadedProductImages: [],
  intakeComplete: true,
  liveFetchAvailable: false,
};

export const THE_PRIVATE_ROOM_TERRITORY: TerritoryCandidate = {
  territoryId: 'savor-celeste-private-room',
  conceptName: 'THE PRIVATE ROOM',
  oneSentenceIdea:
    'Luxury is not the party — it is the room you close the door to and remember in scent',
  mechanism: 'PUBLIC STATUS → INTIMATE MEMORY → SCENT AS ARCHITECTURE',
  emotionalArc: 'PERFORMANCE → WITHDRAWAL → BELONGING',
  visualWorld: 'A remembered interior — low light, linen, glass on marble, no audience',
  argument:
    'Fragrance should feel like returning to a private room, not wearing a badge of expense',
  channelTreatmentHash: 'reel-intimacy|carousel-ritual|email-invitation|story-doorway',
};

export function buildSavorCelestePrivateRoomInput(
  overrides: Partial<CreativeJudgmentInput> = {},
): CreativeJudgmentInput {
  return {
    projectId: SAVOR_CELESTE_BRAND_ID,
    brandId: SAVOR_CELESTE_BRAND_ID,
    entryId: null,
    campaignId: 'savor-celeste-private-room-demo',
    territory: THE_PRIVATE_ROOM_TERRITORY,
    interjection: 'You already know this room. You just forgot which scent opened the door.',
    worldRole: 'Interior memory architecture — scent maps to lived space',
    artifactRole: 'Half-burned candle, keyed lock, linen fold',
    subjectRole: 'Guest who chooses intimacy over display',
    reasoningMode: 'DETERMINISTIC',
    ...overrides,
  };
}

export function buildSavorCelesteConceptPanel(
  judgment: import('../creative-judgment-intelligence/types.js').CreativeJudgmentResult,
): ConceptPanel {
  return mapJudgmentToConceptPanel({
    judgment,
    territory: THE_PRIVATE_ROOM_TERRITORY,
    brandName: 'Savor Celeste',
    caseType: 'real_brand',
    groundingMode: 'profile_grounded',
    conceptTitle: 'THE PRIVATE ROOM',
    oneLinePremise: THE_PRIVATE_ROOM_TERRITORY.oneSentenceIdea,
    interjection: 'You already know this room. You just forgot which scent opened the door.',
    artifact: 'Vanilla smoke, keyed lock, linen fold on marble',
    reveal: 'The bottle is not jewelry — it is a key to a room with no witnesses',
    payoff: 'Scent returns you to intimacy luxury forgot to advertise',
    heroMove: 'Close the door. The campaign happens inside.',
    expressionContext: 'REAL BRAND CASE DEMO · FRAGRANCE',
    isDemoCase: true,
    isRealBrandDemo: true,
    heroSymbol: '◌ PRIVATE ROOM',
  });
}
