/**
 * Controlled direction production-field completion — fills ONLY missing fields.
 * Separate from formation/reform. Preserves bigIdea, thesis, governingBehavior, name.
 */

import {
  DIRECTION_PRODUCTION_COMPLETION_PROMPT_VERSION,
  DIRECTION_PRODUCTION_COMPLETION_SYSTEM_PROMPT,
} from './directionCompletionPrompts.js';
import { parseStructuredJson } from './formationValidation.js';
import { getCreativeIntelligenceProvider } from './providerRegistry.js';
import { saveFormationRecord, getFormationRecordById } from './formationStore/storeAdapter.js';
import {
  NDXBOOK_V1_FORMATION_ID,
  NDXBOOK_V2_FORMATION_ID,
} from './founderComparisonSet.js';
import {
  assessDirectionProductionCompleteness,
  normalizeFormedDirection,
  type FounderDirectionFieldKey,
} from './directionFieldContract.js';
import type {
  CoreDirectionFormationInput,
  CoreDirectionFormationRecord,
  DirectionCompletionOverlay,
  FormedCoreDirection,
  ProviderRequestUsage,
} from './types.js';

const COUSIN_WARNINGS: Record<string, { cousin: string; preserve: string[]; doNot: string[] }> = {
  'THE MARKED-UP COPY': {
    cousin: 'THE ANNOTATED COPY',
    preserve: [
      'active edit state',
      'work-in-progress thinking',
      'crossed-out replacements',
      'secondary voices interrupting',
      'margin argument',
      'evidence of thought happening live',
    ],
    doNot: ['pre-lived-in reading copy', 'passive annotation history'],
  },
  'THE COUNTDOWN ROOM': {
    cousin: 'THE ROOM WHERE IT HAPPENS',
    preserve: [
      'rankings',
      'countdown logic',
      'scoreboards',
      'placements',
      'opinionated ordering',
      'public argument',
      'list revisions',
      'competitive editorial energy',
    ],
    doNot: ['newsroom access', 'production-space architecture without ranking'],
  },
  'THE PERSONAL ARCHIVE': {
    cousin: 'THE INDEX',
    preserve: [
      'saved files',
      'screenshot stashes',
      'personal folders',
      'link dumps',
      'useful disorder',
      'prior ownership',
      'taste-driven curation',
      'found-object energy',
    ],
    doNot: ['taxonomy', 'reference system', 'classification database'],
  },
};

const IMMUTABLE_FIELDS = new Set([
  'directionId',
  'directionName',
  'bigIdea',
  'oneLineThesis',
  'governingBehavior',
]);

const FIELD_TO_DIRECTION_KEY: Record<FounderDirectionFieldKey, keyof FormedCoreDirection> = {
  name: 'directionName',
  bigIdea: 'bigIdea',
  thesis: 'oneLineThesis',
  brandConnection: 'brandConnection',
  loreLineage: 'loreLineage',
  centralMetaphor: 'visualMetaphor',
  conceptualAncestor: 'conceptualAncestor',
  audienceRole: 'audienceRole',
  brandRole: 'brandRole',
  governingBehavior: 'governingBehavior',
  primaryArtifact: 'primaryBrandArtifact',
  materialLanguage: 'materialImageryLanguage',
  imageryLanguage: 'imageryLanguage',
  typographicAttitude: 'typographicAttitude',
  colorLogic: 'colorLogic',
  motionSeed: 'motionSeed',
  socialExpressionHypothesis: 'socialExpressionHypothesis',
  risks: 'risks',
  qualityConfidence: 'qualityConfidence',
};

export function listMissingProductionFields(direction: FormedCoreDirection): FounderDirectionFieldKey[] {
  return assessDirectionProductionCompleteness(normalizeFormedDirection(direction)).missingFields;
}

export function applyDirectionCompletionOverlays(
  directions: FormedCoreDirection[],
  overlays: DirectionCompletionOverlay[],
): FormedCoreDirection[] {
  const overlayById = new Map(overlays.map((o) => [o.directionId, o]));
  return directions.map((direction) => {
    const overlay = overlayById.get(direction.directionId);
    if (!overlay) return normalizeFormedDirection(direction);

    const base = normalizeFormedDirection(direction);
    const merged = { ...base, ...overlay.completedFields };
    merged.bigIdea = base.bigIdea;
    merged.oneLineThesis = base.oneLineThesis;
    merged.governingBehavior = base.governingBehavior;
    merged.directionName = base.directionName;
    merged.directionId = base.directionId;
    return normalizeFormedDirection(merged);
  });
}

function extractCompletedFieldsFromResponse(
  raw: Record<string, unknown>,
  missingFields: FounderDirectionFieldKey[],
): Partial<FormedCoreDirection> {
  const completedFields: Partial<FormedCoreDirection> = {};
  const source = (raw.completedFields ?? raw) as Record<string, unknown>;

  for (const field of missingFields) {
    if (IMMUTABLE_FIELDS.has(FIELD_TO_DIRECTION_KEY[field])) continue;
    const key = FIELD_TO_DIRECTION_KEY[field];
    const value = source[key as string] ?? source[field];
    if (value == null) continue;
    (completedFields as Record<string, unknown>)[key as string] = value;
  }

  return completedFields;
}

export type CompleteDirectionProductionFieldsResult = {
  direction: FormedCoreDirection;
  overlay: DirectionCompletionOverlay | null;
  anthropicRequestCount: number;
};

export async function completeDirectionProductionFields(params: {
  direction: FormedCoreDirection;
  formationInput: CoreDirectionFormationInput;
}): Promise<CompleteDirectionProductionFieldsResult> {
  const direction = normalizeFormedDirection(params.direction);
  const missingFields = listMissingProductionFields(direction);

  if (!missingFields.length) {
    return { direction, overlay: null, anthropicRequestCount: 0 };
  }

  const provider = getCreativeIntelligenceProvider();
  if (provider.providerId === 'unavailable') {
    throw new Error('CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE');
  }

  const cousinWarning = COUSIN_WARNINGS[direction.directionName];

  const userPayload = {
    directionId: direction.directionId,
    directionName: direction.directionName,
    preservedFields: {
      bigIdea: direction.bigIdea,
      oneLineThesis: direction.oneLineThesis,
      governingBehavior: direction.governingBehavior,
    },
    missingFields: missingFields.map((f) => FIELD_TO_DIRECTION_KEY[f]),
    brandLore: params.formationInput,
    cousinDirectionWarning: cousinWarning
      ? {
          cousinDirectionName: cousinWarning.cousin,
          mustPreserve: cousinWarning.preserve,
          mustNotBecome: cousinWarning.doNot,
        }
      : null,
    constraints: [
      'THIS IS A COMPLETION TASK, NOT A REFORMATION TASK',
      'Do not rename the direction',
      'Do not rewrite bigIdea, oneLineThesis, or governingBehavior',
      'Do not merge with similar directions from other formations',
      cousinWarning
        ? `Do not collapse into cousin direction "${cousinWarning.cousin}"`
        : 'No cousin direction for this completion',
    ],
  };

  const capability = provider.capability;
  if (capability.providerId !== 'anthropic') {
    throw new Error('Direction completion requires anthropic provider in production');
  }

  const { callAnthropicForCompletion } = await import('./anthropicCompletion.js');
  const { text, usage } = await callAnthropicForCompletion(
    DIRECTION_PRODUCTION_COMPLETION_SYSTEM_PROMPT,
    userPayload,
  );

  const parsed = parseStructuredJson(text) as Record<string, unknown>;
  const completedFields = extractCompletedFieldsFromResponse(parsed, missingFields);
  const fieldsCompleted = missingFields.filter((f) => {
    const key = FIELD_TO_DIRECTION_KEY[f];
    const val = (completedFields as Record<string, unknown>)[key as string];
    return val != null && (Array.isArray(val) ? val.length > 0 : String(val).trim().length > 0);
  });

  const overlay: DirectionCompletionOverlay = {
    directionId: direction.directionId,
    directionName: direction.directionName,
    completedAt: new Date().toISOString(),
    promptVersion: DIRECTION_PRODUCTION_COMPLETION_PROMPT_VERSION,
    fieldsRequested: missingFields,
    fieldsCompleted,
    preservedFields: ['bigIdea', 'oneLineThesis', 'governingBehavior', 'directionName'],
    completedFields,
    requestUsage: usage,
  };

  const merged = applyDirectionCompletionOverlays([direction], [overlay])[0]!;

  return {
    direction: merged,
    overlay,
    anthropicRequestCount: 1,
  };
}

export type CompleteFormationDirectionsResult = {
  record: CoreDirectionFormationRecord;
  anthropicRequestCount: number;
  directionsCompleted: number;
};

/** Complete all directions on a formation record that lack production fields. */
export async function completeFormationDirectionsIfNeeded(
  record: CoreDirectionFormationRecord,
): Promise<CompleteFormationDirectionsResult> {
  const input = record.formationInput;
  if (!input) {
    return { record, anthropicRequestCount: 0, directionsCompleted: 0 };
  }

  let anthropicRequestCount = 0;
  let directionsCompleted = 0;
  const overlays = [...(record.directionCompletionOverlays ?? [])];

  const updatedDirections = [...record.finalDirections];

  for (let i = 0; i < updatedDirections.length; i++) {
    const existingOverlay = overlays.find((o) => o.directionId === updatedDirections[i]!.directionId);
    const base = existingOverlay
      ? applyDirectionCompletionOverlays([updatedDirections[i]!], [existingOverlay])[0]!
      : normalizeFormedDirection(updatedDirections[i]!);

    const missing = listMissingProductionFields(base);
    if (!missing.length) {
      updatedDirections[i] = base;
      continue;
    }

    const result = await completeDirectionProductionFields({
      direction: base,
      formationInput: input,
    });

    anthropicRequestCount += result.anthropicRequestCount;
    if (result.overlay) {
      overlays.push(result.overlay);
      directionsCompleted += 1;
    }
    updatedDirections[i] = result.direction;
  }

  const nextRecord: CoreDirectionFormationRecord = {
    ...record,
    finalDirections: updatedDirections,
    directionCompletionOverlays: overlays,
    updatedAt: new Date().toISOString(),
  };

  const persisted = await saveFormationRecord(nextRecord);
  return { record: persisted, anthropicRequestCount, directionsCompleted };
}

export function mergeCompletionUsage(
  overlays: DirectionCompletionOverlay[],
): ProviderRequestUsage {
  return overlays.reduce(
    (acc, o) => ({
      inputTokens: (acc.inputTokens ?? 0) + (o.requestUsage?.inputTokens ?? 0),
      outputTokens: (acc.outputTokens ?? 0) + (o.requestUsage?.outputTokens ?? 0),
      estimatedCostUsd:
        (acc.estimatedCostUsd ?? 0) + (o.requestUsage?.estimatedCostUsd ?? 0),
    }),
    {} as ProviderRequestUsage,
  );
}

/** Complete NDX BOOK v1 formation directions 01–03 only — additive overlays, no reformation. */
export async function completeNdxbookV1Directions(): Promise<CompleteFormationDirectionsResult> {
  const v1 = await getFormationRecordById(NDXBOOK_V1_FORMATION_ID);
  if (!v1) {
    throw new Error('NDXBOOK_V1_FORMATION_NOT_FOUND');
  }
  if (v1.formationVersion !== 1) {
    throw new Error('EXPECTED_V1_FORMATION');
  }
  return completeFormationDirectionsIfNeeded(v1);
}

export function validateImmutableAnchorsPreserved(
  before: FormedCoreDirection,
  after: FormedCoreDirection,
): boolean {
  return (
    before.bigIdea === after.bigIdea &&
    before.oneLineThesis === after.oneLineThesis &&
    before.governingBehavior === after.governingBehavior &&
    before.directionName === after.directionName
  );
}

export { NDXBOOK_V1_FORMATION_ID, NDXBOOK_V2_FORMATION_ID };
