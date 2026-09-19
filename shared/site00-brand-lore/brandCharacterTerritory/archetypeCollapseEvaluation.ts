/**
 * Archetype collapse detection — evaluates territories as a SET.
 */

import type { BrandCharacterTerritory } from './types.js';
import { extractTerritoryDistillation } from './providerSchemaMapping.js';

export const ARCHETYPE_COLLAPSE_FLAGS = [
  'GENERIC_BRAND_ARCHETYPE',
  'ADJECTIVE_PAIR_AS_CHARACTER',
  'CONSULTANCY_PERSONALITY_LANGUAGE',
  'VOICE_PROFILE_AS_CHARACTER',
  'AUDIENCE_PROMISE_AS_CHARACTER',
  'EXPERT_ARCHETYPE',
  'REBEL_ARCHETYPE',
  'SAGE_ARCHETYPE',
  'CURIOUS_OBSERVER_ARCHETYPE',
  'FRIENDLY_EXPERT_ARCHETYPE',
  'STYLE_AS_CHARACTER',
  'BEHAVIOR_WITHOUT_CHARACTER',
  'CHARACTER_WITHOUT_TENSION',
  'CHARACTER_WITHOUT_CULTURAL_SPECIFICITY',
  'CHARACTER_WITHOUT_ARTIFACT_POTENTIAL',
] as const;

export type ArchetypeCollapseFlag = (typeof ARCHETYPE_COLLAPSE_FLAGS)[number];

export type BrandCharacterArchetypeCollapseEvaluation = {
  territoryId: string;
  territoryName: string;
  flags: ArchetypeCollapseFlag[];
  hasProductiveTension: boolean;
  tensionNotes: string[];
  particularized: boolean;
  notes: string[];
};

const GENERIC_EXPERT_PHRASES = [
  'smart but approachable',
  'expert but friendly',
  'makes complex things simple',
  'knowledge without condescension',
  'accessible without dumbing down',
  'trusted expert',
  'generous expert',
];

const GENERIC_REBEL_PHRASES = [
  'edgy challenger',
  'rebel brand',
  'contrarian for its own sake',
  'provocateur',
  'disruptor',
];

const GENERIC_OBSERVER_PHRASES = [
  'always noticing',
  'keeps noticing',
  'devoted observer',
  'flâneur',
  'slow content',
];

const FLAT_ADJECTIVES = ['smart', 'bold', 'curious', 'authentic', 'approachable', 'witty', 'confident', 'warm'];

function textBlob(character: BrandCharacterTerritory): string {
  const d = extractTerritoryDistillation(character);
  return [
    character.name,
    d.character,
    d.coreTension,
    d.intelligence,
    d.humor,
    d.culturalPosition,
    d.taste,
    d.signatureBehavior,
    character.whyItIsNdxbook,
    ...(character.whatItMustNeverBecome ?? []),
  ]
    .join(' ')
    .toLowerCase();
}

function detectFlags(character: BrandCharacterTerritory): ArchetypeCollapseFlag[] {
  const blob = textBlob(character);
  const name = character.name.toLowerCase();
  const flags: ArchetypeCollapseFlag[] = [];
  const d = extractTerritoryDistillation(character);

  if (/generous expert|friendly expert|expert who|trusted expert/i.test(name + blob)) {
    flags.push('FRIENDLY_EXPERT_ARCHETYPE', 'EXPERT_ARCHETYPE');
  }
  if (/contrarian|committed contrarian|rebel|challenger/i.test(name + blob)) {
    flags.push('REBEL_ARCHETYPE');
  }
  if (/observer|noticing|devoted observer|synthesizer|archivist/i.test(name + blob)) {
    flags.push('CURIOUS_OBSERVER_ARCHETYPE');
  }
  if (/synthesizer|sage|wise|knowledge/i.test(name) && !/contrarian|enthusiast|accomplice/i.test(name)) {
    flags.push('SAGE_ARCHETYPE');
  }

  for (const phrase of GENERIC_EXPERT_PHRASES) {
    if (blob.includes(phrase)) flags.push('FRIENDLY_EXPERT_ARCHETYPE');
  }
  for (const phrase of GENERIC_REBEL_PHRASES) {
    if (blob.includes(phrase)) flags.push('REBEL_ARCHETYPE');
  }
  for (const phrase of GENERIC_OBSERVER_PHRASES) {
    if (blob.includes(phrase)) flags.push('CURIOUS_OBSERVER_ARCHETYPE');
  }

  if (/consultant|framework|methodology|best practice|thought leader/i.test(blob)) {
    flags.push('CONSULTANCY_PERSONALITY_LANGUAGE');
  }
  if (/tone of voice|voice profile|brand voice|verbal identity/i.test(blob)) {
    flags.push('VOICE_PROFILE_AS_CHARACTER');
  }
  if (/audience promise|we help you|our mission is|empower/i.test(blob)) {
    flags.push('AUDIENCE_PROMISE_AS_CHARACTER');
  }
  if (/aesthetic|visual style|moodboard|typography|color palette/i.test(blob) && !d.signatureBehavior) {
    flags.push('STYLE_AS_CHARACTER');
  }

  const wordCount = d.character.split(/\s+/).filter(Boolean).length;
  if (wordCount > 0 && wordCount < 8) flags.push('ADJECTIVE_PAIR_AS_CHARACTER');

  const adjHits = FLAT_ADJECTIVES.filter((a) => blob.includes(a));
  if (adjHits.length >= 3 && !d.coreTension) flags.push('GENERIC_BRAND_ARCHETYPE');

  if (d.signatureBehavior && !d.character) flags.push('BEHAVIOR_WITHOUT_CHARACTER');
  if (d.character && !d.coreTension) flags.push('CHARACTER_WITHOUT_TENSION');
  if (!d.culturalPosition || /culturally aware|references relevant moments/i.test(d.culturalPosition)) {
    flags.push('CHARACTER_WITHOUT_CULTURAL_SPECIFICITY');
  }
  if (!d.artifactPotential) flags.push('CHARACTER_WITHOUT_ARTIFACT_POTENTIAL');

  return [...new Set(flags)];
}

export function evaluateProductiveTension(character: BrandCharacterTerritory): {
  hasProductiveTension: boolean;
  notes: string[];
} {
  const d = extractTerritoryDistillation(character);
  const tensionText = d.coreTension.toLowerCase();
  const tensionMarkers = [
    'precision',
    'enthusiasm',
    'authority',
    'mischief',
    'certainty',
    'flexibility',
    'observation',
    'intervention',
    'generosity',
    'impatience',
    'warmth',
    'rigor',
    'contradiction',
    'tension',
  ];
  const hits = tensionMarkers.filter((m) => tensionText.includes(m));
  const hasPair = hits.length >= 2 || / × | x | versus | vs | while | but | and yet /i.test(d.coreTension);
  return {
    hasProductiveTension: hasPair && d.coreTension.length > 20,
    notes: hasPair
      ? [`Tension signals: ${hits.join(', ')}`]
      : ['Insufficient explicit governing contradiction for behavioral range'],
  };
}

export function evaluateArchetypeCollapse(
  character: BrandCharacterTerritory,
): BrandCharacterArchetypeCollapseEvaluation {
  const flags = detectFlags(character);
  const tension = evaluateProductiveTension(character);
  const d = extractTerritoryDistillation(character);
  const particularized =
    d.character.length > 40 &&
    d.coreTension.length > 20 &&
    tension.hasProductiveTension &&
    flags.filter((f) => !['GENERIC_BRAND_ARCHETYPE'].includes(f)).length < 4;

  return {
    territoryId: character.id,
    territoryName: character.name,
    flags,
    hasProductiveTension: tension.hasProductiveTension,
    tensionNotes: tension.notes,
    particularized,
    notes: particularized
      ? ['Territory contains particularized character seed beneath archetypal surface structure']
      : ['Archetypal patterns dominate — development required to test underlying specificity'],
  };
}

export function evaluateSetArchetypeCollapse(
  characters: BrandCharacterTerritory[],
): BrandCharacterArchetypeCollapseEvaluation[] {
  return characters.map(evaluateArchetypeCollapse);
}

export function adjectivePairAloneCannotSatisfyCharacter(flags: ArchetypeCollapseFlag[]): boolean {
  return flags.includes('ADJECTIVE_PAIR_AS_CHARACTER') || flags.includes('GENERIC_BRAND_ARCHETYPE');
}
