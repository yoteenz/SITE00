/**
 * Methodology journey — founder navigation layer over experiment inventory.
 */

import type { ExperimentJourneyStageConfig } from './types.js';

/** Generic stage definitions — client adapters map experiment IDs into stages. */
export function buildDefaultExperimentJourneyStages(): ExperimentJourneyStageConfig[] {
  return [
    {
      stage: 'UNDERSTAND',
      order: 1,
      title: 'UNDERSTAND',
      purpose: 'Lore, appetite, and how the founder shows up before creative work.',
      experimentIds: ['lore-calibration', 'creative-appetite', 'personality-replay'],
    },
    {
      stage: 'DISCOVER',
      order: 2,
      title: 'DISCOVER',
      purpose: 'Concept territory and who NDXBOOK is before presentation.',
      experimentIds: [
        'experiment-a',
        'experiment-b',
        'experiment-d',
        'experiment-f',
        'brand-character-formation',
        'experiment-g',
      ],
    },
    {
      stage: 'EXPRESS',
      order: 3,
      title: 'EXPRESS',
      purpose: 'Marketing expression, feed artifacts, visual authority, authored grammar.',
      experimentIds: ['brand-marketing-expression', 'marketing-expression-experiment-01'],
    },
    {
      stage: 'EMBODY',
      order: 4,
      title: 'EMBODY',
      purpose: 'Character discovery, language, voice, casting, continuity.',
      experimentIds: [
        'embodied-character-discovery',
        'founder-character-discovery',
        'character-continuity-pipeline',
        'motion-character-book-language',
      ],
    },
    {
      stage: 'PUBLISH',
      order: 5,
      title: 'PUBLISH',
      purpose: 'Content operations, campaign production, daily plan.',
      experimentIds: ['content-operations', 'content-operations-campaign-board', 'content-operations-daily-plan'],
    },
    {
      stage: 'LEARN',
      order: 6,
      title: 'LEARN',
      purpose: 'Cultural intelligence, performance, audience evidence.',
      experimentIds: [
        'cultural-intelligence',
        'cultural-intelligence-weekly-forecast',
        'content-operations-performance',
        'content-library',
      ],
    },
  ];
}

export function resolveExperimentStage(
  experimentId: string,
  stages: ExperimentJourneyStageConfig[],
): ExperimentJourneyStageConfig | null {
  return stages.find((s) => s.experimentIds.includes(experimentId)) ?? null;
}
