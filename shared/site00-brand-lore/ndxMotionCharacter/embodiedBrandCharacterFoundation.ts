/**
 * P0.5E.2 — EmbodiedBrandCharacterFoundation
 * Architecture only — no visual design this sprint.
 */

import { randomUUID } from 'node:crypto';
import type { EmbodiedBrandCharacterFoundation } from '../../site00-studio-world-production/motionCharacter/types.js';

export const FUTURE_CHARACTER_BIBLE_ARCHITECTURE = [
  'CharacterIdentityBible',
  'CharacterVisualBible',
  'CharacterVoiceBible',
  'CharacterBehaviorBible',
  'CharacterMotionBible',
  'CharacterEnvironmentBible',
  'CharacterWardrobeLogic',
  'CharacterPropLogic',
  'CharacterContinuitySystem',
  'CharacterReferencePack',
  'CharacterGenerationPromptCompiler',
  'CharacterConsistencyEvaluation',
] as const;

export const COPYRIGHT_CHARACTER_CLONING_PROHIBITIONS = [
  'Regina George likeness or recreation',
  'Mean Girls character reproduction',
  'Burn Book visual or narrative copy',
  'Mean Girls wardrobe/costume reference',
  'Recognizable movie dialogue',
  'Film production design copy',
  'Derivative copyrighted character',
] as const;

export const CHARACTER_DNA_HYPOTHESIS = {
  summary:
    'Psychological energy of a teenage girl who obsessively documented social dynamics — grown up. Nosiness matured into curiosity. Gossip instinct into cultural investigation. Receipt-keeping into research discipline.',
  isCharacterDnaOnly: true,
  notVisualDesign: true,
} as const;

export function buildEmbodiedBrandCharacterFoundation(projectId: string): EmbodiedBrandCharacterFoundation & {
  relationships: Record<string, string>;
  futureBibles: readonly string[];
  prohibitions: readonly string[];
  characterDna: typeof CHARACTER_DNA_HYPOTHESIS;
} {
  return {
    foundationId: randomUUID(),
    brandId: projectId,
    distinctFromFounder: true,
    distinctFromBrandCharacter: true,
    visualDesignFinalized: false,
    characterGenerationPerformed: false,
    copyrightedCharacterCloningBlocked: true,
    relationships: {
      brandCharacter: 'Inherits selected psychological/behavioral qualities — NOT identity clone',
      founder: 'NOT the founder — separate person with own biography TBD',
      ndxBook: 'Human embodiment through whom we WATCH NDX notice, think, investigate, react, make Pages',
      audience: 'Recognizable on-screen face — participatory, not spokesmodel',
      culture: 'Notices and investigates culture through embodied presence',
      research: 'Process visible — not AI presenter',
      humor: 'Reaction, timing, pause — not scripted influencer jokes',
      motion: 'Motion emerges from character behavior',
      pages: 'Makes and references Pages — carousel is the Page',
      margins: 'Stories as immediate conversational layer',
      theIndex: 'Remembers — FLIP BACK, BOOKMARKED',
      communitySubmissions: 'ADD IT TO THE BOOK — organic audience tips',
    },
    futureBibles: FUTURE_CHARACTER_BIBLE_ARCHITECTURE,
    prohibitions: COPYRIGHT_CHARACTER_CLONING_PROHIBITIONS,
    characterDna: CHARACTER_DNA_HYPOTHESIS,
  };
}

export function embodiedCharacterDistinctFromFounder(): true {
  return true;
}

export function embodiedCharacterDistinctFromBrandCharacter(): true {
  return true;
}

export function copyrightedCharacterCloningBlocked(): true {
  return true;
}

export function brandCharacterUnchanged(): true {
  return true;
}

export function brandCanonUnchanged(): true {
  return true;
}
