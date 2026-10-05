/**
 * Resolve founder-selected Experiment G parent concepts for direction development.
 */

import type { BrandPresentationConceptFormationRun } from '../brandPresentationConceptTerritory/types.js';
import {
  ELIGIBLE_PARENT_CONCEPT_NAMES,
  SELECTED_PARENT_CONCEPT_COUNT,
} from './constants.js';
import type { FrozenParentConceptSnapshot } from './types.js';

function normalizeName(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function isEligibleParentConceptName(name: string): boolean {
  return ELIGIBLE_PARENT_CONCEPT_NAMES.some((n) => normalizeName(n) === normalizeName(name));
}

export function resolveSelectedParentConcepts(
  conceptRun: BrandPresentationConceptFormationRun | null | undefined,
): { ok: true; parents: FrozenParentConceptSnapshot[] } | { ok: false; error: string } {
  if (!conceptRun?.concepts?.length) {
    return { ok: false, error: 'Experiment G concepts not formed — complete concept formation first.' };
  }

  const loved = conceptRun.concepts.filter((c) => c.founderJudgment === 'LOVE_THE_CONCEPT');
  if (loved.length < SELECTED_PARENT_CONCEPT_COUNT) {
    return {
      ok: false,
      error: `Need ${SELECTED_PARENT_CONCEPT_COUNT} LOVE THE CONCEPT judgments — found ${loved.length}.`,
    };
  }

  const parents: FrozenParentConceptSnapshot[] = [];
  for (const expectedName of ELIGIBLE_PARENT_CONCEPT_NAMES) {
    const match = loved.find((c) => normalizeName(c.name) === normalizeName(expectedName));
    if (!match) {
      return {
        ok: false,
        error: `Missing loved parent concept: ${expectedName}. Only founder-selected Experiment G concepts may participate.`,
      };
    }
    parents.push(freezeParentConcept(match, conceptRun.intelligenceSnapshot?.fingerprint ?? null));
  }

  const excluded = conceptRun.concepts.filter(
    (c) => c.founderJudgment !== 'LOVE_THE_CONCEPT' || !isEligibleParentConceptName(c.name),
  );
  if (excluded.some((c) => c.founderJudgment === 'LOVE_THE_CONCEPT' && !isEligibleParentConceptName(c.name))) {
    return { ok: false, error: 'Unexpected loved concept outside the top-3 selection — review Experiment G judgments.' };
  }

  return { ok: true, parents };
}

export function canDevelopTop3Directions(
  conceptRun: BrandPresentationConceptFormationRun | null | undefined,
): boolean {
  return resolveSelectedParentConcepts(conceptRun).ok;
}

export function freezeParentConcept(
  concept: BrandPresentationConceptFormationRun['concepts'][number],
  intelligenceSnapshotFingerprint: string | null,
): FrozenParentConceptSnapshot {
  return {
    id: concept.id,
    name: concept.name,
    conceptThesis: concept.conceptThesis,
    brandExistenceModel: concept.brandExistenceModel,
    audienceRelationship: concept.audienceRelationship,
    brandBehavior: concept.brandBehavior,
    publishingLogic: concept.publishingLogic,
    artifactLogic: concept.artifactLogic,
    knowledgeBehavior: concept.knowledgeBehavior,
    authorityModel: concept.authorityModel,
    participationLogic: concept.participationLogic,
    recurrenceEngine: concept.recurrenceEngine,
    topicIndependence: concept.topicIndependence,
    socialNativeBehavior: concept.socialNativeBehavior,
    expansionPotential: concept.expansionPotential,
    possibleDirectionRange: concept.possibleDirectionRange,
    antiCollapseRules: concept.antiCollapseRules,
    notThis: concept.notThis,
    snapshotFingerprint: concept.snapshotFingerprint,
    formationFingerprint: concept.formationPromptFingerprint,
    founderJudgment: concept.founderJudgment,
    frozenAt: new Date().toISOString(),
    intelligenceSnapshotFingerprint,
  };
}

export function rejectedConceptsPreserved(
  conceptRun: BrandPresentationConceptFormationRun,
  selectedIds: string[],
): boolean {
  const selected = new Set(selectedIds);
  return conceptRun.concepts.every((c) => selected.has(c.id) || c.founderJudgment !== 'LOVE_THE_CONCEPT' || !selected.has(c.id));
}
