import type { FictionDocumentType } from './types.js';
import { FICTION_PROPERTY_SLUG_THE_EXCHANGE } from './types.js';

/** Minimum document types before Opus context assembly is allowed (not full bible completeness). */
export const OPUS_EVALUATION_MINIMUM_DOCUMENT_TYPES: FictionDocumentType[] = [
  'SERIES_BIBLE',
  'WORLD_BIBLE',
  'CHARACTER_BIBLE',
  'INSTITUTION_BIBLE',
  'NARRATIVE_METHODOLOGY',
  'SEASON_ARCHITECTURE',
];

/** Full founder bible completeness checklist (ingestion readiness). */
export const FOUNDER_BIBLE_COMPLETENESS_TYPES: FictionDocumentType[] = [
  'SERIES_BIBLE',
  'WORLD_BIBLE',
  'CHARACTER_BIBLE',
  'FAMILY_HISTORY',
  'INSTITUTION_BIBLE',
  'TECHNOLOGY_BIBLE',
  'NARRATIVE_METHODOLOGY',
  'SEASON_ARCHITECTURE',
  'EPISODE_CONCEPT',
  'CONTINUITY_LEDGER',
  'AUDIENCE_KNOWLEDGE',
  'VISUAL_IDENTITY_REFERENCE',
  'COMMERCIAL_STRATEGY',
  'OPEN_QUESTIONS',
];

export const THE_EXCHANGE_PROPERTY = {
  slug: FICTION_PROPERTY_SLUG_THE_EXCHANGE,
  displayName: 'THE EXCHANGE',
  propertyType: 'SERIALIZED_FICTION' as const,
  ownership: 'FOUNDER_CONTROLLED' as const,
  productionIntegration: 'FUTURE_NDXBOOK_REUSE' as const,
};

/** Sloane — no invented asset URLs. */
export const THE_EXCHANGE_SLOANE_CHARACTER_ID = 'sloane-lockwood' as const;

export const THE_EXCHANGE_VISUAL_IDENTITY_STABLE_ID = 'visual-identity-sloane-lockwood' as const;
