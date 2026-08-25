/**
 * P0.5E.7 — Existing topic pipeline migration (preserve historical research).
 */

import { PILOT_OPPORTUNITY_SEEDS } from '../opportunityEngine.js';
import type { NDXContentSeed, TopicPipelineMigrationRecord } from './types.js';
import { CHARACTER_FIRST_PILOT_SEEDS } from './ndxContentSeed.js';

export function buildTopicPipelineMigrationRecords(
  seeds: NDXContentSeed[],
): TopicPipelineMigrationRecord[] {
  return PILOT_OPPORTUNITY_SEEDS.map((legacy) => {
    const reformulated = seeds.find(
      (s) => s.legacyTopicSubject?.toLowerCase() === legacy.subject.toLowerCase(),
    );
    const spec = CHARACTER_FIRST_PILOT_SEEDS.find(
      (s) => s.legacyTopicSubject.toLowerCase() === legacy.subject.toLowerCase(),
    );
    return {
      legacySubject: legacy.subject,
      legacySummary: legacy.summary,
      seedId: reformulated?.seedId ?? null,
      status: reformulated ? 'REFORMULATED' : 'NEEDS_CHARACTER_REFORMULATION',
      reformulatedPremise: spec?.spokenPremise ?? reformulated?.premise.spokenPremise ?? null,
    };
  });
}

export function historicalTopicResearchPreserved(records: TopicPipelineMigrationRecord[]): boolean {
  return records.every((r) => r.legacySummary.length > 0);
}
