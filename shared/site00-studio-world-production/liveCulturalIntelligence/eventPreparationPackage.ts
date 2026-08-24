/**
 * P0.5D.2 — Event preparation packages (pre-event research, not pre-written takes).
 */

import type { EventPreparationPackage, UpcomingCulturalMoment } from './types.js';
import { randomUUID } from 'node:crypto';

export function buildEventPreparationPackage(moment: UpcomingCulturalMoment): EventPreparationPackage {
  return {
    packageId: `epp-${randomUUID().slice(0, 8)}`,
    eventId: moment.id,
    eventName: moment.name,
    eventDate: moment.startAt,
    knownFacts: moment.knownContext,
    historicalContext: moment.historicalContext,
    relevantEntities: moment.possibleBrandRelevance,
    priorNarratives: moment.historicalContext,
    dataToGather: [
      'Prior year outcomes/results where relevant',
      'Audience overlap estimates',
      'Competing narratives in mainstream coverage',
    ],
    questionsToWatch: [
      'What changed since last cycle?',
      'What is everyone already saying?',
      'What would NDX notice that others miss?',
    ],
    visualSourceCandidates: ['archival photographs', 'public documents', 'event photographs'],
    postEventTriggers: ['results announced', 'speech moment', 'unexpected controversy'],
    lifecycle: 'UPCOMING',
    preparedAt: new Date().toISOString(),
  };
}

export function preEventIntelligenceIsNotFinalOpinion(): true {
  return true;
}
