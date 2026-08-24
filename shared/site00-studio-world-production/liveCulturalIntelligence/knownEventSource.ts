/**
 * P0.5D.2 — Known event / calendar intelligence (curated + manual).
 */

import type { UpcomingCulturalMoment } from './types.js';
import { buildUpcomingCulturalMoment } from './forecast.js';

export type CuratedKnownEvent = {
  name: string;
  category: UpcomingCulturalMoment['category'];
  daysFromWeekStart: number;
  durationDays?: number;
  expectedAttention: UpcomingCulturalMoment['expectedAttention'];
  source: string;
  knownContext?: string[];
};

export const DEFAULT_CURATED_KNOWN_EVENTS: CuratedKnownEvent[] = [
  {
    name: 'Scheduled economic data release',
    category: 'DATA_RELEASES',
    daysFromWeekStart: 2,
    expectedAttention: 'MODERATE',
    source: 'CURATED_EVENT_CALENDAR',
    knownContext: ['Public bureau quarterly household debt report'],
  },
  {
    name: 'Major entertainment industry event',
    category: 'AWARD_SHOWS',
    daysFromWeekStart: 5,
    expectedAttention: 'MAJOR',
    source: 'CURATED_EVENT_CALENDAR',
    knownContext: ['Red carpet + speech moments historically drive weekend discourse'],
  },
  {
    name: 'Consumer technology product announcement window',
    category: 'PRODUCT_LAUNCH',
    daysFromWeekStart: 4,
    expectedAttention: 'HIGH',
    source: 'CURATED_EVENT_CALENDAR',
    knownContext: ['Recurring Q3 hardware/software launch season'],
  },
];

export function buildKnownEventsFromCurated(params: {
  projectId: string;
  weekStart: string;
  events?: CuratedKnownEvent[];
}): UpcomingCulturalMoment[] {
  const start = new Date(params.weekStart);
  const events = params.events ?? DEFAULT_CURATED_KNOWN_EVENTS;

  return events.map((ev) => {
    const startDate = new Date(start);
    startDate.setUTCDate(startDate.getUTCDate() + ev.daysFromWeekStart);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + (ev.durationDays ?? 0));
    return buildUpcomingCulturalMoment({
      projectId: params.projectId,
      name: ev.name,
      category: ev.category,
      startAt: startDate.toISOString().slice(0, 10),
      endAt: endDate.toISOString().slice(0, 10),
      expectedAttention: ev.expectedAttention,
      knownContext: ev.knownContext ?? [`Source: ${ev.source}`],
    });
  });
}

export function futureEventCannotBeCompletedFact(moment: UpcomingCulturalMoment, asOf: string): boolean {
  return moment.startAt > asOf.slice(0, 10);
}
