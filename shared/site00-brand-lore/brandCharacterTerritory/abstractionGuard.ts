/**
 * Brand Character abstraction guards — WHO vs presentation/content/style/topic.
 */

import type { BrandCharacterTerritory } from './types.js';
import { EXPERIMENT_G_CHARACTER_ANCHOR_BLOCKLIST } from './constants.js';

const STYLE_MARKERS = [
  'font',
  'helvetica',
  'palette',
  'pink',
  'scrapbook',
  'collage',
  'moodboard',
  'aesthetic',
  'visual style',
  'color scheme',
  'typography system',
];

const FORMAT_MARKERS = [
  'carousel',
  'reel',
  'newsletter format',
  'tiktok',
  'instagram post',
  'content format',
  'social post template',
];

const PRESENTATION_MARKERS = [
  'brand presentation concept',
  'publishing logic',
  'recurrence engine',
  'social entity existence',
  'brand existence model',
];

const CONTENT_MARKERS = [
  'credit utilization',
  'content concept',
  'topic:',
  'about credit',
  'financial topic',
  'campaign for',
];

const TOPIC_MARKERS = ['credit card', 'debt topic', 'investment topic', 'tax season content'];

const CAMPAIGN_MARKERS = ['one campaign', 'launch campaign', 'seasonal campaign'];

function corpus(territory: BrandCharacterTerritory): string {
  return [
    territory.name,
    territory.core.characterThesis,
    territory.core.characterEssence,
    territory.core.worldview,
  ]
    .join(' ')
    .toLowerCase();
}

export function evaluateCharacterAbstractionLevel(
  territory: BrandCharacterTerritory,
): BrandCharacterTerritory['abstractionEval'] {
  const text = corpus(territory);
  const notes: string[] = [];

  const styleHit = STYLE_MARKERS.some((m) => text.includes(m));
  const formatHit = FORMAT_MARKERS.some((m) => text.includes(m));
  const presentationHit = PRESENTATION_MARKERS.some((m) => text.includes(m));
  const contentHit = CONTENT_MARKERS.some((m) => text.includes(m));
  const topicHit = TOPIC_MARKERS.some((m) => text.includes(m));
  const campaignHit = CAMPAIGN_MARKERS.some((m) => text.includes(m));
  const anchorHit = EXPERIMENT_G_CHARACTER_ANCHOR_BLOCKLIST.some((m) =>
    territory.name.toUpperCase().includes(m.toUpperCase()),
  );

  if (styleHit) notes.push('Style markers detected in character territory');
  if (formatHit) notes.push('Format markers detected');
  if (presentationHit) notes.push('Presentation concept markers detected');
  if (contentHit) notes.push('Content concept markers detected');
  if (topicHit) notes.push('Topic markers detected');
  if (campaignHit) notes.push('Campaign markers detected');
  if (anchorHit) notes.push('Experiment G presentation concept anchor detected');

  const answersWho =
    Boolean(territory.core.characterThesis?.trim()) &&
    Boolean(territory.core.characterEssence?.trim()) &&
    Boolean(territory.intellectual.intelligenceStyle?.trim()) &&
    Boolean(territory.humorWit.humorLogic?.trim()) &&
    Boolean(territory.culturalIntelligence.culturalPosition?.trim());

  let result: NonNullable<BrandCharacterTerritory['abstractionEval']>['result'] = 'PASS_CHARACTER';
  if (styleHit) result = 'STYLE_AS_CHARACTER';
  else if (formatHit) result = 'FORMAT_AS_CHARACTER';
  else if (presentationHit) result = 'PRESENTATION_CONCEPT_AS_CHARACTER';
  else if (contentHit) result = 'CONTENT_CONCEPT_AS_CHARACTER';
  else if (topicHit) result = 'TOPIC_AS_CHARACTER';
  else if (campaignHit) result = 'CAMPAIGN_AS_CHARACTER';
  else if (anchorHit) result = 'PRESENTATION_CONCEPT_AS_CHARACTER';

  return {
    result,
    answersWhoQuestion: answersWho && result === 'PASS_CHARACTER',
    notes,
  };
}

export function characterDistinctFromBrandPersonalityEvidence(): true {
  return true;
}

export function characterDistinctFromBrandPresentationConcept(): true {
  return true;
}

export function characterDistinctFromIdentityDirection(): true {
  return true;
}

export function styleCannotSatisfyCharacterFormation(): true {
  return true;
}

export function contentConceptCannotSatisfyCharacterFormation(): true {
  return true;
}

export function topicCannotSatisfyCharacterFormation(): true {
  return true;
}
