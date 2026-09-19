/**
 * Founder-facing field display with completeness truth — never show blank as valid content.
 */

import type { BrandCharacterTerritory } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import type { CharacterFieldDisplayState } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/fieldCompleteness';
import { displayStateLabel } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/fieldCompleteness';
import { recoverCanonicalFieldValue } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/providerSchemaMapping';

export type FieldDisplay = {
  label: string;
  value: string;
  state: CharacterFieldDisplayState;
  stateLabel: string;
};

const DEVELOPMENT_STAGE_FIELDS = new Set([
  'HUMOR SYSTEM',
  'LANGUAGE CHARACTER',
  'EXPRESSIVE BEHAVIOR',
  'EMOTIONAL RANGE',
]);

export function resolveTerritoryFieldDisplay(
  character: BrandCharacterTerritory,
  label: string,
  fieldPath: string,
): FieldDisplay {
  if (DEVELOPMENT_STAGE_FIELDS.has(label)) {
    return {
      label,
      value: '',
      state: 'NOT_FORMED_AT_TERRITORY_STAGE',
      stateLabel: displayStateLabel('NOT_FORMED_AT_TERRITORY_STAGE'),
    };
  }

  const { value: recovered, provenance } = recoverCanonicalFieldValue(character, fieldPath);
  if (recovered) {
    return {
      label,
      value: recovered,
      state: provenance ? 'RECOVERABLE_PROVIDER_OUTPUT' : 'AVAILABLE',
      stateLabel: provenance ? 'Recovered from provider response' : '',
    };
  }

  return {
    label,
    value: '',
    state: 'MISSING_PROVIDER_OUTPUT',
    stateLabel: displayStateLabel('MISSING_PROVIDER_OUTPUT'),
  };
}

export function renderFieldValue(display: FieldDisplay): string {
  if (display.value.trim()) return display.value;
  if (display.state === 'NOT_FORMED_AT_TERRITORY_STAGE') {
    return display.stateLabel || 'Developed after territory selection';
  }
  if (display.state === 'RECOVERABLE_PROVIDER_OUTPUT') {
    return display.stateLabel;
  }
  if (display.state === 'MISSING_PROVIDER_OUTPUT') {
    return 'Not generated at territory stage';
  }
  if (display.state === 'DATA_PIPELINE_ERROR') {
    return 'Pipeline error — see forensic audit';
  }
  return display.stateLabel || '—';
}
