/**
 * Partial orientation seed from sprint brief — WORKING_CONCEPT only, not full bible.
 */

import type { FictionIngestImportItem } from './types.js';
import {
  THE_EXCHANGE_PROPERTY,
  THE_EXCHANGE_SLOANE_CHARACTER_ID,
  THE_EXCHANGE_VISUAL_IDENTITY_STABLE_ID,
} from './constants.js';

export function buildTheExchangeOrientationSeedImports(): FictionIngestImportItem[] {
  const seedMeta = {
    sourceId: 'sprint-p0-orientation-seed-v1',
    sourceKind: 'SEED_ORIENTATION' as const,
    note: 'Partial orientation only — not the definitive founder bible.',
  };

  return [
    {
      sourceId: `${seedMeta.sourceId}-series`,
      documentType: 'SERIES_BIBLE',
      stableIdentifier: 'series-the-exchange-core',
      title: 'THE EXCHANGE — orientation seed',
      format: 'json',
      payload: {
        title: 'THE EXCHANGE',
        protagonist: 'SLOANE LOCKWOOD',
        genre: [
          'Speculative social mystery',
          'Family drama',
          'Retrofuturist science fiction',
          'Character-driven entertainment',
          'Humor',
          'Slow-burn romance',
        ],
        format: { episodeConcepts: 10, partsPerEpisode: 3, plannedPrimaryReleases: 30 },
        narrativeLaw: [
          'Audience experiences the world before being required to understand it.',
          'Character attachment precedes major mythology revelations.',
          'Each exchange delivers standalone story; family mythology develops gradually.',
        ],
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'WORLD_TRUTH',
    },
    {
      sourceId: `${seedMeta.sourceId}-world`,
      documentType: 'WORLD_BIBLE',
      stableIdentifier: 'world-parallel-contemporary',
      format: 'json',
      payload: {
        premise: 'Parallel contemporary society; alternative technological and cultural development.',
        timelineNotes: ['No COVID-19 pandemic in this timeline.'],
        socialPrinciples: [
          'Vibrant, expressive, colorful, nostalgic, deeply physical social life.',
          'Privacy reduces unauthorized recording and public distribution.',
          'Witnessing ≠ permission to document or distribute.',
          'Governed private communication and personal access.',
        ],
        technologyTheme: 'Relational systems, consent, identity, presence, disclosure, discretion.',
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'WORLD_TRUTH',
    },
    {
      sourceId: `${seedMeta.sourceId}-character-sloane`,
      documentType: 'CHARACTER_BIBLE',
      stableIdentifier: THE_EXCHANGE_SLOANE_CHARACTER_ID,
      format: 'json',
      payload: {
        characterId: THE_EXCHANGE_SLOANE_CHARACTER_ID,
        name: 'Sloane Lockwood',
        traits: [
          'Perceptive',
          'Charismatic',
          'Funny',
          'Sophisticated',
          'Emotionally guarded',
          'Socially magnetic',
        ],
        coreWound: 'Struggles to believe she must be useful to deserve love.',
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'WORLD_TRUTH',
      characterReferences: [THE_EXCHANGE_SLOANE_CHARACTER_ID],
    },
    {
      sourceId: `${seedMeta.sourceId}-family`,
      documentType: 'FAMILY_HISTORY',
      stableIdentifier: 'family-lockwood-core',
      format: 'json',
      payload: {
        father: 'Alive; retired from active exchange work; beloved advisor to Sloane.',
        sisterNadine: 'Older; more complicated understanding of family and institution.',
        mother: 'Deceased; pivotal to network ethical and technological development.',
        unresolved: {
          mothersFinalExchange:
            'Connected to her death and father retirement — exact events and outcome UNRESOLVED.',
        },
        _provenance: seedMeta,
      },
      canonStatus: 'UNRESOLVED',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'WORLD_TRUTH',
      characterReferences: [THE_EXCHANGE_SLOANE_CHARACTER_ID],
    },
    {
      sourceId: `${seedMeta.sourceId}-technology`,
      documentType: 'TECHNOLOGY_BIBLE',
      stableIdentifier: 'technology-relational-systems',
      format: 'json',
      payload: {
        principles: [
          'Advanced technology emphasizes relational systems, consent, identity, presence, disclosure, discretion.',
          'Technology expands human possibility without manufacturing consent, affection, honesty, or forgiveness.',
        ],
        limitations: 'Detailed mechanisms require founder bible — not invented in seed.',
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'WORLD_TRUTH',
    },
    {
      sourceId: `${seedMeta.sourceId}-institution`,
      documentType: 'INSTITUTION_BIBLE',
      stableIdentifier: 'institution-the-exchange',
      format: 'json',
      payload: {
        theExchange:
          'Selective institution facilitating extraordinary human arrangements (technological, interpersonal, emotional, social, access-based).',
        quietNetwork:
          'Trusted infrastructure of authorized relationships, communications, introductions, obligations.',
        not: ['Police agency', 'Conventional criminal organization'],
        purpose: 'Human connection under carefully governed conditions.',
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'WORLD_TRUTH',
    },
    {
      sourceId: `${seedMeta.sourceId}-methodology`,
      documentType: 'NARRATIVE_METHODOLOGY',
      stableIdentifier: 'narrative-methodology-v1',
      format: 'json',
      payload: {
        serialization: 'Three parts per episode; standalone exchange + gradual Lockwood mythology.',
        romance: 'Slow-burn recurring collaborator; mutual respect; organic across episodes.',
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'UNSPECIFIED',
    },
    {
      sourceId: `${seedMeta.sourceId}-season`,
      documentType: 'SEASON_ARCHITECTURE',
      stableIdentifier: 'season-1-episode-concepts',
      format: 'json',
      payload: {
        workingEpisodeTitles: [
          'THE INVITATION',
          'THE FAVOR',
          'SEVEN DEGREES',
          'THE PROMISE',
          'THE COLLABORATOR',
          'THE ANNIVERSARY',
          'THE EXCEPTION',
          'NO STRINGS',
          'THE UNFINISHED BUSINESS',
          'THE RECALL',
        ],
        disclaimer: 'Concept candidates only — not approved plot outlines.',
        _provenance: seedMeta,
      },
      canonStatus: 'PROPOSED',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'UNSPECIFIED',
    },
    {
      sourceId: `${seedMeta.sourceId}-visual-sloane`,
      documentType: 'VISUAL_IDENTITY_REFERENCE',
      stableIdentifier: THE_EXCHANGE_VISUAL_IDENTITY_STABLE_ID,
      format: 'json',
      payload: {
        characterId: THE_EXCHANGE_SLOANE_CHARACTER_ID,
        status: 'AWAITING_FOUNDER_ASSET',
        note:
          'Founder-selected facial identity exists from creative development; no repository URL registered in this sprint.',
        _provenance: seedMeta,
      },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: 'UNSPECIFIED',
      characterReferences: [THE_EXCHANGE_SLOANE_CHARACTER_ID],
      visualReferenceStatus: 'AWAITING_FOUNDER_ASSET',
    },
  ];
}

export function theExchangePropertyDefinition() {
  return THE_EXCHANGE_PROPERTY;
}
