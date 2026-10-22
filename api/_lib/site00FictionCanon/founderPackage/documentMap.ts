import type { FictionCanonDocumentRecord, FictionDocumentType } from '../../../../shared/site00-fiction-canon/types.js';

export type FounderPackageDocumentSpec = {
  file: string;
  documentType: FictionDocumentType;
  stableIdentifier: string;
  title: string;
  knowledgeLayer?: FictionCanonDocumentRecord['knowledgeLayer'];
  canonStatusOverride?: FictionCanonDocumentRecord['canonStatus'];
};

/** Maps founder ZIP markdown/JSON to fiction-canon document types (one file may map to multiple records). */
export const FOUNDER_BIBLE_V1_DOCUMENT_MAP: FounderPackageDocumentSpec[] = [
  {
    file: '00_READ_ME.md',
    documentType: 'SOURCE_PACKAGE_README',
    stableIdentifier: 'founder-package-readme-v1',
    title: 'Founder source package README',
  },
  {
    file: '01_SERIES_THESIS.md',
    documentType: 'SERIES_BIBLE',
    stableIdentifier: 'founder-series-thesis-v1',
    title: 'Series thesis',
  },
  {
    file: '02_WORLD_AND_CULTURE.md',
    documentType: 'WORLD_BIBLE',
    stableIdentifier: 'founder-world-and-culture-v1',
    title: 'World and culture',
  },
  {
    file: '03_EXCHANGE_INSTITUTION.md',
    documentType: 'INSTITUTION_BIBLE',
    stableIdentifier: 'founder-exchange-institution-v1',
    title: 'Exchange institution',
  },
  {
    file: '04_CHARACTER_AND_FAMILY.md',
    documentType: 'CHARACTER_BIBLE',
    stableIdentifier: 'founder-character-and-family-v1',
    title: 'Character and family',
    knowledgeLayer: 'WORLD_TRUTH',
  },
  {
    file: '05_HIDDEN_HISTORY_AND_REVELATIONS.md',
    documentType: 'FAMILY_HISTORY',
    stableIdentifier: 'founder-family-history-v1',
    title: 'Hidden family history',
    knowledgeLayer: 'WORLD_TRUTH',
  },
  {
    file: '05_HIDDEN_HISTORY_AND_REVELATIONS.md',
    documentType: 'CONTINUITY_LEDGER',
    stableIdentifier: 'founder-continuity-ledger-v1',
    title: 'Continuity and revelation discipline',
    knowledgeLayer: 'WORLD_TRUTH',
  },
  {
    file: '05_HIDDEN_HISTORY_AND_REVELATIONS.md',
    documentType: 'AUDIENCE_KNOWLEDGE',
    stableIdentifier: 'founder-audience-knowledge-v1',
    title: 'Audience knowledge map',
    knowledgeLayer: 'AUDIENCE_KNOWLEDGE',
  },
  {
    file: '06_SPECULATIVE_TECHNOLOGY.md',
    documentType: 'TECHNOLOGY_BIBLE',
    stableIdentifier: 'founder-speculative-technology-v1',
    title: 'Speculative technology',
  },
  {
    file: '07_SEASON_ONE_AND_THIRTY_PARTS.md',
    documentType: 'SEASON_ARCHITECTURE',
    stableIdentifier: 'founder-season-one-v1',
    title: 'Season one architecture',
  },
  {
    file: '08_STORY_AND_PRODUCTION_METHOD.md',
    documentType: 'NARRATIVE_METHODOLOGY',
    stableIdentifier: 'founder-story-production-method-v1',
    title: 'Story and production method',
  },
  {
    file: '09_COMMERCIAL_STRATEGY.md',
    documentType: 'COMMERCIAL_STRATEGY',
    stableIdentifier: 'founder-commercial-strategy-v1',
    title: 'Commercial strategy',
  },
  {
    file: '10_OPEN_QUESTIONS_AND_OPUS_BRIEF.md',
    documentType: 'OPEN_QUESTIONS',
    stableIdentifier: 'founder-open-questions-v1',
    title: 'Open questions and Opus brief',
  },
  {
    file: 'episode_slate.json',
    documentType: 'EPISODE_CONCEPT',
    stableIdentifier: 'founder-episode-slate-v1',
    title: 'Episode slate (10 × 3)',
    canonStatusOverride: 'PROPOSED',
  },
];

export const FOUNDER_VERIFIED_NARROW_SELECTIONS = [
  'THE EXCHANGE title',
  'Sloane Lockwood name',
  'independent property',
  'three-part episodes, ten-episode initial slate',
  'privacy-first vivid retrofuturist world direction',
  'living retired father, deceased mother, older sister',
  'family legacy/maternal final exchange core mystery',
  'Sloane visual selection',
] as const;
