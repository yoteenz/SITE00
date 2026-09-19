/**
 * P0.5E.7A — Current nine V2.3 topic character authority migration.
 */

import { EXPERIMENT_01_TOPIC_SPECS } from '../../brandMarketingExpression/characterEventFormulation.js';
import type { CharacterAuthorityMigrationRecord } from './types.js';
import { seedCharacterFirstContentSeeds } from './ndxContentSeed.js';
import { buildCharacterPremiseAuthority } from './characterPremiseAuthority.js';
import { buildNDXThoughtArcSnapshot } from './ndxThoughtArcSnapshot.js';
import { buildNDXPageRoleMap } from './ndxPageRoleMap.js';
import { evaluateExperienceFirstEntry } from './characterFirstEvaluations.js';

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function evaluateCharacterAuthorityMigration(projectId: string): CharacterAuthorityMigrationRecord[] {
  const seeds = seedCharacterFirstContentSeeds(projectId);
  return EXPERIMENT_01_TOPIC_SPECS.map((spec) => {
    const seed =
      seeds.find((s) => normalize(s.legacyTopicSubject ?? '') === normalize(spec.subject)) ??
      seeds.find((s) => spec.headline.toUpperCase().includes(s.premise.spokenPremise.slice(0, 12).toUpperCase())) ??
      null;

    if (!seed) {
      return {
        legacySubject: spec.subject,
        topicIndex: spec.topicIndex,
        seedId: null,
        status: 'NEEDS_PREMISE',
        blockReason: 'No character-first seed mapped — topic-only regeneration blocked',
      };
    }

    const experience = evaluateExperienceFirstEntry(seed);
    if (!experience.passed) {
      return {
        legacySubject: spec.subject,
        topicIndex: spec.topicIndex,
        seedId: seed.seedId,
        status: 'NEEDS_THOUGHT_ARC',
        blockReason: experience.failures[0] ?? 'FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY',
      };
    }

    const premise = buildCharacterPremiseAuthority(seed);
    if (!premise.spokenPremise) {
      return {
        legacySubject: spec.subject,
        topicIndex: spec.topicIndex,
        seedId: seed.seedId,
        status: 'NEEDS_PREMISE',
        blockReason: 'Missing spoken premise',
      };
    }

    const arc = buildNDXThoughtArcSnapshot(seed);
    if (!arc.beats.length) {
      return {
        legacySubject: spec.subject,
        topicIndex: spec.topicIndex,
        seedId: seed.seedId,
        status: 'NEEDS_THOUGHT_ARC',
        blockReason: 'Thought arc incomplete',
      };
    }

    const roleMap = buildNDXPageRoleMap(seed);
    if (roleMap.entries.length < 3) {
      return {
        legacySubject: spec.subject,
        topicIndex: spec.topicIndex,
        seedId: seed.seedId,
        status: 'NEEDS_PAGE_ROLE_MAP',
        blockReason: 'Page role map incomplete',
      };
    }

    return {
      legacySubject: spec.subject,
      topicIndex: spec.topicIndex,
      seedId: seed.seedId,
      status: 'READY_TO_REGENERATE',
      blockReason: null,
    };
  });
}

export function migrationBlockersVisible(records: CharacterAuthorityMigrationRecord[]): string[] {
  return records.filter((r) => r.status !== 'READY_TO_REGENERATE').map((r) => `${r.legacySubject}: ${r.status}`);
}

export function currentNineCharacterAuthorityMigrationImplemented(): true {
  return true;
}

export function autoProviderRequestsDuringMigration(): 0 {
  return 0;
}
