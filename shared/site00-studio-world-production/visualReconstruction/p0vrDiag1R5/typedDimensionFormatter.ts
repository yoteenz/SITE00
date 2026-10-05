/**
 * P0.VR.DIAG.1R5 — Founder-facing typed dimension display.
 */

import type { DimensionValueTypeR5 } from './types.js';

export function formatTypedDimensionValue(
  value: string | number,
  valueType: DimensionValueTypeR5,
  unit?: string,
): string {
  const s = String(value).trim();
  if (valueType === 'COUNT') {
    const n = typeof value === 'number' ? value : Number.parseInt(s, 10);
    if (Number.isFinite(n)) return `${n} ${n === 1 ? 'item' : 'items'}`;
    return s.includes('item') ? s : `${s} items`;
  }
  if (valueType === 'PERCENT') return s.includes('%') ? s : `${s}%`;
  if (valueType === 'RATIO') {
    const n = typeof value === 'number' ? value : Number.parseFloat(s);
    if (Number.isFinite(n) && n <= 1 && n >= 0) return `${Math.round(n * 100)}%`;
    return s;
  }
  if (valueType === 'BOOLEAN') {
    if (s === '1' || s.toLowerCase() === 'true' || s.toUpperCase() === 'YES') return 'YES';
    if (s === '0' || s.toLowerCase() === 'false' || s.toUpperCase() === 'NO') return 'NO';
    return s.toUpperCase();
  }
  if (valueType === 'ENUM') return s.toUpperCase();
  if (valueType === 'RANGE') return s;
  if (valueType === 'COORDINATE' || valueType === 'PIXEL') {
    if (s.includes('px')) return s;
    const n = typeof value === 'number' ? value : Number.parseFloat(s);
    return Number.isFinite(n) ? `${Math.round(n * 10) / 10}px` : s;
  }
  if (unit === 'count') return formatTypedDimensionValue(value, 'COUNT');
  return s;
}

export function inferDimensionValueTypeR5(dimension: string, unit: string): DimensionValueTypeR5 {
  const d = dimension.toLowerCase();
  if (d.includes('count') || d === 'itemcount' || d === 'cellcount') return 'COUNT';
  if (d.includes('ratio') || d.includes('fillratio') || d.includes('aspect')) return 'RATIO';
  if (d.includes('alignment') || d.includes('order')) return 'ENUM';
  if (d.includes('present') || d.startsWith('has')) return 'BOOLEAN';
  if (unit === 'count') return 'COUNT';
  if (unit === 'pct') return 'PERCENT';
  if (unit === 'ratio') return 'RATIO';
  if (d.includes('inset') || d.includes('gap') || d.includes('height') || d.includes('width')) return 'PIXEL';
  return 'PIXEL';
}
