/**
 * Forensic audit of Brand Character Formation runs — trace blank fields to root cause.
 */

import type { BrandCharacterFormationRun, BrandCharacterTerritory } from './types.js';
import { recoverCanonicalFieldValue, PROVIDER_FIELD_ALTERNATES } from './providerSchemaMapping.js';
import type { BlankFieldRootCause, CharacterFieldCompleteness, CharacterFieldDisplayState } from './fieldCompleteness.js';
import { BRAND_CHARACTER_TERRITORY_V1 } from './constants.js';

const UI_CANONICAL_FIELDS = [
  'core.characterThesis',
  'core.characterEssence',
  'intellectual.intelligenceStyle',
  'social.conversationalBehavior',
  'humorWit.humorLogic',
  'culturalIntelligence.culturalPosition',
  'social.audienceRelationship',
  'taste.tasteLogic',
  'artifactRelationship.makerPresence',
  'whyItIsNdxbook',
] as const;

const DEVELOPMENT_ONLY_FIELDS = [
  'emotional.emotionalRange',
  'language.verbalCadence',
  'expressiveBehavior.typographyBehavior',
  'humorWit.shadeBehavior',
  'culturalIntelligence.referenceSelectionLogic',
] as const;

export type TerritoryForensicAudit = {
  territoryId: string;
  territoryName: string;
  methodologyVersion: string;
  providerTruncated: boolean;
  fieldInventory: CharacterFieldCompleteness[];
  summary: {
    available: number;
    recoverable: number;
    missing: number;
    pipelineError: number;
    notFormedAtTerritory: number;
  };
  primaryRootCause: BlankFieldRootCause;
};

export type FormationRunForensicAudit = {
  runId: string;
  formationVersion: number;
  methodologyVersion: string;
  rawProviderResponsePersisted: boolean;
  outputTokensAtLimit: boolean;
  territories: TerritoryForensicAudit[];
  blankFieldRootCause: BlankFieldRootCause;
  historicalMutation: false;
  historicalRecoveryPerformed: boolean;
  conclusion: string;
};

function getNestedString(obj: Record<string, unknown>, path: string): string {
  const [section, field] = path.split('.');
  const sec = obj[section!];
  if (!sec || typeof sec !== 'object') return '';
  const v = (sec as Record<string, unknown>)[field!];
  return typeof v === 'string' ? v.trim() : '';
}

function classifyField(
  character: BrandCharacterTerritory,
  fieldPath: string,
  run: BrandCharacterFormationRun,
  isLastCharacter: boolean,
): CharacterFieldCompleteness {
  const belongsToStage: 'TERRITORY' | 'DEVELOPMENT' | 'SYSTEM' = (
    DEVELOPMENT_ONLY_FIELDS as readonly string[]
  ).includes(fieldPath)
    ? 'DEVELOPMENT'
    : 'TERRITORY';

  if (belongsToStage === 'DEVELOPMENT') {
    return {
      fieldPath,
      displayState: 'NOT_FORMED_AT_TERRITORY_STAGE',
      rootCause: 'INTENTIONALLY_NOT_FORMED',
      canonicalValue: null,
      recoveredValue: null,
      recoveryProvenance: null,
      belongsToStage,
    };
  }

  const charRecord = character as unknown as Record<string, unknown>;
  const canonicalValue = fieldPath === 'whyItIsNdxbook'
    ? character.whyItIsNdxbook?.trim() || null
    : getNestedString(charRecord, fieldPath) || null;

  const { value: recoveredValue, provenance } = recoverCanonicalFieldValue(character, fieldPath);

  let rootCause: BlankFieldRootCause = 'UNKNOWN';
  let displayState: CharacterFieldDisplayState = 'NOT_EVALUATED';

  if (canonicalValue) {
    displayState = 'AVAILABLE';
    rootCause = recoveredValue && !getNestedString(charRecord, fieldPath) ? 'NORMALIZATION_DROPPED' : 'UNKNOWN';
    if (canonicalValue) rootCause = 'UNKNOWN';
  } else if (recoveredValue && provenance) {
    displayState = 'RECOVERABLE_PROVIDER_OUTPUT';
    rootCause = 'SCHEMA_DROPPED';
  } else if (isLastCharacter && run.formationReceipt?.outputTokens === 12000) {
    displayState = 'MISSING_PROVIDER_OUTPUT';
    rootCause = 'PROVIDER_TRUNCATED';
  } else if (PROVIDER_FIELD_ALTERNATES[fieldPath] && !recoveredValue) {
    displayState = 'MISSING_PROVIDER_OUTPUT';
    rootCause = 'PROVIDER_MISSING';
  } else if (character.methodologyVersion === BRAND_CHARACTER_TERRITORY_V1 && run.methodologyVersion === BRAND_CHARACTER_TERRITORY_V1) {
    displayState = 'DATA_PIPELINE_ERROR';
    rootCause = 'NORMALIZATION_DROPPED';
  } else {
    displayState = 'MISSING_PROVIDER_OUTPUT';
    rootCause = 'PROVIDER_EMPTY';
  }

  return {
    fieldPath,
    displayState,
    rootCause,
    canonicalValue,
    recoveredValue,
    recoveryProvenance: provenance,
    belongsToStage,
  };
}

export function auditTerritoryForensics(
  character: BrandCharacterTerritory,
  run: BrandCharacterFormationRun,
  isLastCharacter: boolean,
): TerritoryForensicAudit {
  const fieldInventory = UI_CANONICAL_FIELDS.map((fp) =>
    classifyField(character, fp, run, isLastCharacter),
  );

  const mustNever = character.whatItMustNeverBecome?.length
    ? character.whatItMustNeverBecome
    : [];
  if (mustNever.length === 0 && isLastCharacter) {
    fieldInventory.push({
      fieldPath: 'whatItMustNeverBecome',
      displayState: 'MISSING_PROVIDER_OUTPUT',
      rootCause: 'PROVIDER_TRUNCATED',
      canonicalValue: null,
      recoveredValue: null,
      recoveryProvenance: null,
      belongsToStage: 'TERRITORY',
    });
  }

  const summary = {
    available: fieldInventory.filter((f) => f.displayState === 'AVAILABLE').length,
    recoverable: fieldInventory.filter((f) => f.displayState === 'RECOVERABLE_PROVIDER_OUTPUT').length,
    missing: fieldInventory.filter((f) => f.displayState === 'MISSING_PROVIDER_OUTPUT').length,
    pipelineError: fieldInventory.filter((f) => f.displayState === 'DATA_PIPELINE_ERROR').length,
    notFormedAtTerritory: fieldInventory.filter((f) => f.displayState === 'NOT_FORMED_AT_TERRITORY_STAGE').length,
  };

  const providerTruncated = isLastCharacter && run.formationReceipt?.outputTokens === 12000;

  let primaryRootCause: BlankFieldRootCause = 'SCHEMA_DROPPED';
  if (summary.recoverable > summary.available) primaryRootCause = 'SCHEMA_DROPPED';
  else if (providerTruncated) primaryRootCause = 'PROVIDER_TRUNCATED';
  else if (summary.pipelineError > 0) primaryRootCause = 'NORMALIZATION_DROPPED';

  return {
    territoryId: character.id,
    territoryName: character.name,
    methodologyVersion: character.methodologyVersion,
    providerTruncated,
    fieldInventory,
    summary,
    primaryRootCause,
  };
}

export function auditFormationRunForensics(run: BrandCharacterFormationRun): FormationRunForensicAudit {
  const characters = run.characters ?? [];
  const territories = characters.map((c, i) =>
    auditTerritoryForensics(c, run, i === characters.length - 1),
  );

  const outputTokensAtLimit = run.formationReceipt?.outputTokens === 12000;
  const historicalRecoveryPerformed = territories.some((t) =>
    t.fieldInventory.some((f) => f.displayState === 'RECOVERABLE_PROVIDER_OUTPUT'),
  );

  const blankFieldRootCause: BlankFieldRootCause = historicalRecoveryPerformed
    ? 'SCHEMA_DROPPED'
    : outputTokensAtLimit
      ? 'PROVIDER_TRUNCATED'
      : 'NORMALIZATION_DROPPED';

  const conclusion =
    blankFieldRootCause === 'SCHEMA_DROPPED'
      ? 'Anthropic generated rich character content using an alternate field schema. P0.5B normalization expected canonical field names, filled empty strings, and UI showed misleading blanks. Provider data remains recoverable from persisted alternate keys.'
      : outputTokensAtLimit
        ? 'Provider response hit maxTokens (12000). Last territory partially truncated. Combined with schema mismatch, UI showed incomplete dimensions.'
        : 'Blank fields primarily from pipeline normalization, not absent provider generation.';

  return {
    runId: run.runId,
    formationVersion: run.formationVersion,
    methodologyVersion: run.methodologyVersion,
    rawProviderResponsePersisted: Boolean(run.rawProviderResponse),
    outputTokensAtLimit,
    territories,
    blankFieldRootCause,
    historicalMutation: false,
    historicalRecoveryPerformed,
    conclusion,
  };
}
