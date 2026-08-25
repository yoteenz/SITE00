/**
 * P0.CB.1 — Creative signal learning (variation as positive signal — no template cloning).
 */

import { randomUUID } from 'node:crypto';
import type { CreativeSignalLearningRecord, FounderCreativeParentSequence } from './types.js';

export function recordCreativeSignalLearning(sequences: FounderCreativeParentSequence[]): CreativeSignalLearningRecord {
  const territories = sequences.map((s) => {
    if (s.role === 'CHARACTER_WORLD') return 'CHARACTER / WORLD';
    if (s.role === 'POINT_OF_VIEW') return 'EDITORIAL / POINT OF VIEW';
    return 'ARCHIVE / EVIDENCE / COLLECTION';
  });

  return {
    signalId: randomUUID(),
    campaignId: sequences[0]?.campaignId ?? 'unknown',
    territoryLabels: territories,
    principles: [
      'NDX expresses one coherent brand through DIFFERENT visual territories',
      'Composition preference, typography behavior, tactile materials are learnable',
      'Lime restraint and editorial density vary by post role',
      'Do NOT infer: NDX posts must always look like these three',
    ],
    avoidsTemplateCloning: true,
    recordedAt: new Date().toISOString(),
  };
}

export function learningPreservesVariationNotTemplateCloning(signal: CreativeSignalLearningRecord): boolean {
  return signal.avoidsTemplateCloning && signal.territoryLabels.length >= 2;
}
