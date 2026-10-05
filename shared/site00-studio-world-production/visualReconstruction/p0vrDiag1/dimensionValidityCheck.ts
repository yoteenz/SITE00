/**
 * P0.VR.DIAG.1R2 — Dimension validity checks.
 */

import type { DimensionMeasurementSource } from './types.js';

export function isFiniteNumber(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value);
}

export function validatePxDimension(input: {
  name: string;
  value: number | null;
  viewportWidth: number;
  viewportHeight: number;
  source?: DimensionMeasurementSource | null;
}): { valid: boolean; reason?: string } {
  if (!isFiniteNumber(input.value)) {
    return { valid: false, reason: `${input.name}: missing value` };
  }
  if (input.value < 0) {
    return { valid: false, reason: `${input.name}: negative` };
  }
  const max = Math.max(input.viewportWidth, input.viewportHeight) * 2;
  if (input.value > max) {
    return { valid: false, reason: `${input.name}: exceeds viewport bounds` };
  }
  if (!input.source) {
    return { valid: false, reason: `${input.name}: no source` };
  }
  return { valid: true };
}

export function dedupeDimensionNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

/** Reject viewport-width padding applied to every region without region-specific geometry. */
export function isGenericViewportWidthGaming(
  dimension: string,
  value: number,
  viewportWidth: number,
  regionWidth: number,
): boolean {
  if (dimension !== 'width' && dimension !== 'bandWidth' && dimension !== 'railWidth') return false;
  return Math.abs(value - viewportWidth) < 2 && Math.abs(regionWidth - viewportWidth) > 8;
}
