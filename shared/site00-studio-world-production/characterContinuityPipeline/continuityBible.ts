/**
 * P0.5E.5 — Character Continuity Bible compiler.
 */

import { randomUUID } from 'node:crypto';
import { CONTINUITY_CATEGORIES } from './constants.js';
import type { CharacterContinuityBible, EmbodiedCharacterBible } from './types.js';

export function compileCharacterContinuityBible(bible: EmbodiedCharacterBible): CharacterContinuityBible {
  const categories = {} as CharacterContinuityBible['categories'];
  for (const cat of CONTINUITY_CATEGORIES) {
    categories[cat] = selectCategoryContent(bible, cat);
  }
  return {
    continuityBibleId: randomUUID(),
    bibleId: bible.id,
    bibleVersion: bible.version,
    categories,
    compiledAt: new Date().toISOString(),
  };
}

function selectCategoryContent(bible: EmbodiedCharacterBible, category: (typeof CONTINUITY_CATEGORIES)[number]): string[] {
  switch (category) {
    case 'IDENTITY':
      return bible.characterEssence ? [bible.characterEssence] : [];
    case 'FACE':
      return bible.faceLogic ? [JSON.stringify(bible.faceLogic)] : ['NOT_APPROVED'];
    case 'SKIN':
      return bible.skinLogic ? [JSON.stringify(bible.skinLogic)] : ['NOT_APPROVED'];
    case 'BODY':
      return bible.bodyLogic ? [JSON.stringify(bible.bodyLogic)] : ['NOT_APPROVED'];
    case 'HAIR':
      return bible.hairLogic ? [JSON.stringify(bible.hairLogic)] : ['NOT_APPROVED'];
    case 'WARDROBE':
      return bible.wardrobeLogic ? [JSON.stringify(bible.wardrobeLogic)] : [];
    case 'VOICE':
      return bible.voiceSystem ? [JSON.stringify(bible.voiceSystem)] : ['VOICE_IDENTITY_NOT_CAST'];
    case 'NEGATIVE_IDENTITY_CONSTRAINTS':
      return bible.negativeIdentityConstraints.map((c) => c.description);
    default:
      return [];
  }
}

export function continuityBibleAvoidsFullProseDump(categories: CharacterContinuityBible['categories']): boolean {
  const total = Object.values(categories).flat().join(' ').length;
  return total < 50000;
}
