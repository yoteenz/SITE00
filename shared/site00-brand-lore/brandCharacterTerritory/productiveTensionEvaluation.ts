/**
 * Productive tension evaluation for developed characters.
 */

import type { BrandCharacterCore } from './types.js';
import type { CharacterProductiveTensionEvaluation } from './developmentTypes.js';

const FLAT_TRAIT_LIST = ['smart', 'bold', 'curious', 'authentic', 'approachable', 'witty', 'confident', 'warm', 'nice'];

export function evaluateCharacterProductiveTension(core: BrandCharacterCore): CharacterProductiveTensionEvaluation {
  const contradiction = core.characterContradiction || core.internalTension || '';
  const blob = [
    contradiction,
    core.characterEssence,
    core.worldview,
    core.whatItValues,
    core.whatItRejects,
  ]
    .join(' ')
    .toLowerCase();

  const tensionPairs: string[] = [];
  const pairPatterns = [
    ['precision', 'enthusiasm'],
    ['authority', 'mischief'],
    ['certainty', 'flexibility'],
    ['observation', 'intervention'],
    ['generosity', 'impatience'],
    ['warmth', 'rigor'],
    ['fluency', 'restraint'],
  ];
  for (const [a, b] of pairPatterns) {
    if (blob.includes(a) && blob.includes(b)) tensionPairs.push(`${a.toUpperCase()} × ${b.toUpperCase()}`);
  }

  const flatHits = FLAT_TRAIT_LIST.filter((t) => blob.includes(t));
  const flatteningRisk = flatHits.length >= 3 && tensionPairs.length === 0;
  const hasBehavioralRange = tensionPairs.length > 0 && contradiction.length > 15;

  return {
    governingContradiction: contradiction,
    tensionPairs,
    hasBehavioralRange,
    flatteningRisk,
    notes: flatteningRisk
      ? [`Flattening into trait list: ${flatHits.join(', ')}`]
      : hasBehavioralRange
        ? [`Productive tension pairs: ${tensionPairs.join('; ')}`]
        : ['Insufficient governing contradiction for behavioral range'],
  };
}

export function internalProductiveTensionEvaluated(evalResult: CharacterProductiveTensionEvaluation): boolean {
  return evalResult.tensionPairs.length > 0 || evalResult.flatteningRisk;
}
