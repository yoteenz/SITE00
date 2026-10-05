/**
 * Deterministic validation for formation inputs and structured provider output.
 */

import { REQUIRED_DIRECTION_COUNT } from './config.js';
import {
  parseStructuredJson as parseStructuredJsonImpl,
  isJsonParseError,
  withStructuredJsonRetry,
  STRUCTURED_JSON_REVISION_HINT,
} from './structuredJson.js';
import type {
  CoreDirectionFormationInput,
  FormedCoreDirection,
  CoreDirectionCritiqueResult,
} from './types.js';

const GENERIC_PHRASES = [
  'clean and modern',
  'minimal and elegant',
  'timeless and versatile',
  'premium and sophisticated',
  'bold and dynamic',
  'could work for any brand',
];

export function validateFormationInput(input: CoreDirectionFormationInput): string[] {
  const errors: string[] = [];
  if (!input.organizationId) errors.push('organizationId required');
  if (!input.brandLoreProfileId) errors.push('brandLoreProfileId required');
  if (!input.brandLoreFingerprint) errors.push('brandLoreFingerprint required');
  if (input.formationVersion < 1) errors.push('formationVersion must be >= 1');
  return errors;
}

export function validateFormedDirections(directions: FormedCoreDirection[]): string[] {
  const errors: string[] = [];
  if (directions.length !== REQUIRED_DIRECTION_COUNT) {
    errors.push(`expected exactly ${REQUIRED_DIRECTION_COUNT} directions, got ${directions.length}`);
  }

  const names = new Set<string>();
  for (const d of directions) {
    if (!d.directionId) errors.push('directionId required');
    if (!d.directionName?.trim()) errors.push('directionName required');
    if (!d.bigIdea?.trim()) errors.push('bigIdea required');
    if (!d.loreLineage?.length) errors.push(`loreLineage required for ${d.directionName || d.directionId}`);
    if (!d.governingBehavior?.trim()) errors.push(`governingBehavior required for ${d.directionName}`);
    if (!d.primaryBrandArtifact?.trim()) errors.push(`primaryBrandArtifact required for ${d.directionName}`);
    if (names.has(d.directionName.toLowerCase())) errors.push(`duplicate direction name: ${d.directionName}`);
    names.add(d.directionName.toLowerCase());

    const genericHit = GENERIC_PHRASES.find((p) => d.bigIdea.toLowerCase().includes(p));
    if (genericHit) errors.push(`generic bigIdea detected for ${d.directionName}: ${genericHit}`);
  }

  return errors;
}

export function detectObviousDuplication(directions: FormedCoreDirection[]): Array<{
  directionA: string;
  directionB: string;
  overlapFields: string[];
}> {
  const pairs: Array<{ directionA: string; directionB: string; overlapFields: string[] }> = [];
  const fields: Array<keyof FormedCoreDirection> = [
    'directionName',
    'bigIdea',
    'visualMetaphor',
    'governingBehavior',
    'primaryBrandArtifact',
    'materialImageryLanguage',
  ];

  for (let i = 0; i < directions.length; i++) {
    for (let j = i + 1; j < directions.length; j++) {
      const a = directions[i];
      const b = directions[j];
      const overlap: string[] = [];
      for (const field of fields) {
        const av = String(a[field] ?? '').trim().toLowerCase();
        const bv = String(b[field] ?? '').trim().toLowerCase();
        if (av && bv && av === bv) overlap.push(field);
      }
      if (overlap.length > 0) {
        pairs.push({ directionA: a.directionName, directionB: b.directionName, overlapFields: overlap });
      }
    }
  }
  return pairs;
}

export function mergeCritiqueWithDeterministicChecks(
  critique: CoreDirectionCritiqueResult,
  directions: FormedCoreDirection[],
): CoreDirectionCritiqueResult {
  const duplicatePairs = detectObviousDuplication(directions);
  const distinctiveness = {
    passed: duplicatePairs.length === 0,
    duplicatePairs,
    worldDifferentiationQuestion:
      'If names and colors disappeared, would these still feel like three different worlds?',
    worldDifferentiationAnswer:
      duplicatePairs.length === 0
        ? 'Yes — governing behaviors, artifacts, and metaphors diverge.'
        : 'No — obvious field duplication detected.',
  };

  const failedIds = new Set(critique.failedDirectionIds);
  if (!distinctiveness.passed) {
    for (const pair of duplicatePairs) {
      const a = directions.find((d) => d.directionName === pair.directionA);
      const b = directions.find((d) => d.directionName === pair.directionB);
      if (a) failedIds.add(a.directionId);
      if (b) failedIds.add(b.directionId);
    }
  }

  for (const d of directions) {
    if (!d.loreLineage?.length) failedIds.add(d.directionId);
  }

  return {
    ...critique,
    distinctiveness,
    failedDirectionIds: [...failedIds],
    revisionRequired: failedIds.size > 0 || critique.revisionRequired,
  };
}

export function parseStructuredJson<T>(text: string): T {
  return parseStructuredJsonImpl<T>(text);
}

export { isJsonParseError, withStructuredJsonRetry, STRUCTURED_JSON_REVISION_HINT };
