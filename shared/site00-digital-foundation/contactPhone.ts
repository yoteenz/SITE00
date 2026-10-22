import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const CONTACT_PHONE_MISSING = 'ENTER A CONTACT NUMBER TO CONTINUE.';
export const CONTACT_PHONE_INVALID = 'ENTER A VALID CONTACT NUMBER.';

export type ContactPhoneValidation =
  | { ok: true; e164?: string }
  | { ok: false; code: 'MISSING' | 'INVALID' };

/** Default region when no + prefix is supplied (existing US-first intake behavior). */
export const CONTACT_PHONE_DEFAULT_REGION = 'US';

export function validateContactPhoneForCompletion(raw: string, defaultRegion = CONTACT_PHONE_DEFAULT_REGION): ContactPhoneValidation {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, code: 'MISSING' };
  const parsed =
    parsePhoneNumberFromString(trimmed, defaultRegion as import('libphonenumber-js').CountryCode) ??
    parsePhoneNumberFromString(trimmed);
  if (!parsed?.isValid()) return { ok: false, code: 'INVALID' };
  return { ok: true, e164: parsed.format('E.164') };
}

export function contactPhoneFieldError(raw: string): string | undefined {
  const result = validateContactPhoneForCompletion(raw);
  if (result.ok) return undefined;
  return result.code === 'MISSING' ? CONTACT_PHONE_MISSING : CONTACT_PHONE_INVALID;
}
