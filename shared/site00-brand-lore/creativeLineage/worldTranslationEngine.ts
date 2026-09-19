/**
 * World translation engine — salvage portable core into winning world without losing visual DNA.
 */

import type {
  CreativeConceptRecord,
  GoverningCreativeWorld,
  TranslatedConceptPreview,
} from './types.js';
import { runLosingWorldVisualDnaContaminationTest } from './contaminationGuard.js';

export function translateConceptIntoWinningWorld(params: {
  concept: Pick<
    CreativeConceptRecord,
    'name' | 'description' | 'originalExpression' | 'portableCore' | 'originDirectionName'
  >;
  originDirectionName: string;
  winningWorld: GoverningCreativeWorld;
  targetFormat: string;
  targetTopic: string;
}): TranslatedConceptPreview {
  const { concept, originDirectionName, winningWorld, targetFormat, targetTopic } = params;

  const winningWorldTranslation = `${winningWorld.canonicalDirectionName} expresses "${concept.portableCore}" for ${targetTopic} as ${targetFormat} — using ${winningWorld.canonicalTypographySystem}, ${winningWorld.canonicalColorSystem}, ${winningWorld.canonicalGraphicGrammar}. NOT ${originDirectionName}'s native visual treatment.`;

  const whatChanges = [
    'Typography → winning world system',
    'Palette → winning world colors',
    'Composition → winning world grammar',
    'Materials/artifacts → winning world language',
    'Annotation style → winning world behavior',
    `Visual metaphor from ${originDirectionName} → translated metaphor`,
  ];

  const whatStays = [
    concept.portableCore,
    'Editorial purpose and audience value',
    'Topic relevance',
    'Mechanic intent (ranking, archive, index, etc.)',
  ];

  const contaminationPayload = {
    translated: winningWorldTranslation,
    forbidden: [
      originDirectionName.toLowerCase(),
      concept.originalExpression.toLowerCase().slice(0, 40),
    ],
    allowed: [winningWorld.canonicalDirectionName.toLowerCase()],
  };

  return {
    originalIdea: concept.description,
    originalExpression: concept.originalExpression,
    portableCore: concept.portableCore,
    winningWorldTranslation,
    whatChanges,
    whatStays,
    contaminationTest: runLosingWorldVisualDnaContaminationTest({
      translatedPayload: contaminationPayload,
      originDirectionName,
      winningDirectionName: winningWorld.canonicalDirectionName,
      explicitTraitPromotion: false,
    }),
  };
}

export function runWorldTranslationTest(preview: TranslatedConceptPreview): { passed: boolean; notes: string[] } {
  const notes: string[] = [];
  if (!preview.portableCore) notes.push('Missing portable core');
  if (!preview.winningWorldTranslation.toLowerCase().includes('not')) {
    notes.push('Translation must reject origin visual treatment');
  }
  if (!preview.whatChanges.length || !preview.whatStays.length) notes.push('Missing change/stay analysis');
  return { passed: notes.length === 0, notes };
}
