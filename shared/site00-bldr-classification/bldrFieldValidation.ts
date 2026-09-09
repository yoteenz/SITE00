/**
 * BLDR landing field validation — site type multi + audience single.
 */

import {
  BLDR_SITE_TYPE_OTHER_SPECIFY_KEY,
  normalizeAudienceType,
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
    if (!field.required && field.type !== 'multi' && field.type !== 'single' && field.type !== 'audience-row') {
      continue;
    }

    const val = values[field.id];

    if (field.type === 'textarea') {
      if (field.required && !normalizeText(val).trim()) {
        errors[field.id] = 'THIS FIELD IS REQUIRED.';
      }
      continue;
    }

    if (field.id === 'type') {
      const siteTypes = normalizeSiteTypes(val);
      if (siteTypes.length === 0) {
        errors[field.id] = 'SELECT AT LEAST ONE SITE TYPE.';
      }
      if (siteTypes.includes('other') && !normalizeText(values[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY]).trim()) {
        errors[BLDR_SITE_TYPE_OTHER_SPECIFY_KEY] = 'PLEASE SPECIFY YOUR SITE TYPE.';
      }
      continue;
    }

    if (field.id === 'audience' || field.type === 'audience-row') {
      if (!normalizeAudienceType(val)) {
        errors[field.id] = 'SELECT WHO THIS SITE IS FOR.';
      }
      continue;
    }

    if (field.required && normalizeMulti(val).length === 0) {
      errors[field.id] = 'SELECT AT LEAST ONE OPTION.';
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

export function formatSiteTypesForReview(
  options: { id: string; label: string }[] | undefined,
  value: string | string[] | undefined,
  otherSpecify?: string,
): string {
  const siteTypes = normalizeSiteTypes(value);
  if (siteTypes.length === 0) return '—';
  const labels = siteTypes.map((id) => options?.find((o) => o.id === id)?.label ?? id.toUpperCase());
  if (siteTypes.includes('other') && otherSpecify?.trim()) {
    const idx = labels.findIndex((_, i) => siteTypes[i] === 'other');
    if (idx >= 0) labels[idx] = `${labels[idx]}: ${otherSpecify.trim().toUpperCase()}`;
  }
  return labels.join(', ');
}
