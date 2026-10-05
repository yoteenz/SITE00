/**
 * P0.VR.DIAG.1R5 — Type-specific delta display for internal measurements.
 */

import type { DimensionValueTypeR5 } from './types.js';
import { formatTypedDimensionValue } from './typedDimensionFormatter.js';

export function compareTypedDimensions(input: {
  measurementType: string;
  valueType: DimensionValueTypeR5;
  authorityValue: string | number;
  currentValue: string | number;
}): { delta: string; status: 'MATCH' | 'MISMATCH' | 'DELTA' } {
  const auth = input.authorityValue;
  const cur = input.currentValue;

  if (input.valueType === 'COUNT') {
    const a = Number(auth);
    const c = Number(cur);
    if (!Number.isFinite(a) || !Number.isFinite(c)) return { delta: '—', status: 'MISMATCH' };
    const diff = c - a;
    const sign = diff > 0 ? '+' : '';
    return {
      delta: `${sign}${diff} ${Math.abs(diff) === 1 ? 'item' : 'items'}`,
      status: diff === 0 ? 'MATCH' : 'DELTA',
    };
  }

  if (input.valueType === 'ENUM' || input.valueType === 'BOOLEAN') {
    const match = String(auth).toUpperCase() === String(cur).toUpperCase();
    return { delta: match ? 'MATCH' : 'MISMATCH', status: match ? 'MATCH' : 'MISMATCH' };
  }

  if (input.valueType === 'RATIO' || input.valueType === 'PERCENT') {
    const a = Number.parseFloat(String(auth));
    const c = Number.parseFloat(String(cur));
    if (!Number.isFinite(a) || !Number.isFinite(c)) return { delta: '—', status: 'MISMATCH' };
    const diff = c - a;
    const sign = diff > 0 ? '+' : '';
    return {
      delta: input.valueType === 'PERCENT' ? `${sign}${Math.round(diff)}%` : `${sign}${Math.round(diff * 100) / 100}`,
      status: Math.abs(diff) < 0.01 ? 'MATCH' : 'DELTA',
    };
  }

  const a = Number.parseFloat(String(auth).replace(/px/gi, ''));
  const c = Number.parseFloat(String(cur).replace(/px/gi, ''));
  if (!Number.isFinite(a) || !Number.isFinite(c)) {
    return { delta: `${formatTypedDimensionValue(cur, input.valueType)} vs ${formatTypedDimensionValue(auth, input.valueType)}`, status: 'MISMATCH' };
  }
  const diff = c - a;
  const sign = diff > 0 ? '+' : '';
  return { delta: `${sign}${Math.round(diff * 10) / 10}px`, status: Math.abs(diff) < 1 ? 'MATCH' : 'DELTA' };
}
