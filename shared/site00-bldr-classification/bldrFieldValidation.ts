/**
 * BLDR intake field validation (landing + step fields).
 */

import {
  BLDR_SITE_TYPE_OTHER_SPECIFY_KEY,
  normalizeSiteTypes,
} from './siteTypeModel.js';

export type BldrFieldValues = Record<string, string | string[]>;

type BldrFieldSpec = {
  id: string;
  required?: boolean;
  type: 'single' | 'multi' | 'textarea' | 'audience-row';
};

function normalizeMulti(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeText(value: string | string[] | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value.join(', ');
}

export function validateBldrLandingFields(
  fields: BldrFieldSpec[],
  values: BldrFieldValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (!field.required) continue;
    const val = values[field.id];
    if (field.type === 'textarea') {
      if (!normalizeText(val).trim()) errors[field.id] = 'THIS FIELD IS REQUIRED.';
    } else if (field.type === 'single' || field.type === 'audience-row' || field.type === 'multi') {
      if (normalizeMulti(val).length === 0) errors[field.id] = 'SELECT AT LEAST ONE OPTION.';
    }
  }

  if (normalizeSiteTypes(values.type).includes('other')) {
    if (!normalizeText(values[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY]).trim()) {
      errors[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY] = 'THIS FIELD IS REQUIRED.';
    }
  }

  return errors;
}

export function validateBldrStepFields(
  fields: BldrFieldSpec[],
  values: BldrFieldValues,
): Record<string, string> {
  return validateBldrLandingFields(fields, values);
}
