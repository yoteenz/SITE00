/**
 * Validate resolved project presence colors.
 */

import { SITE00_HOST_ACCENT } from './constants.js';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const NAMED = /^(transparent|currentcolor)$/i;

export function isValidCssColor(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (!v || v === 'transparent') return false;
  if (HEX.test(v)) return true;
  if (NAMED.test(v)) return false;
  if (v.startsWith('rgb') || v.startsWith('hsl')) return true;
  return false;
}

export function validateProjectPresenceColor(value: string | null | undefined): {
  valid: boolean;
  normalized: string | null;
} {
  if (!isValidCssColor(value)) {
    return { valid: false, normalized: null };
  }
  const normalized = value!.trim();
  if (normalized.toLowerCase() === 'transparent') {
    return { valid: false, normalized: null };
  }
  return { valid: true, normalized };
}

export function safeProjectPresenceColor(value: string | null | undefined): string {
  const { valid, normalized } = validateProjectPresenceColor(value);
  return valid && normalized ? normalized : SITE00_HOST_ACCENT;
}
