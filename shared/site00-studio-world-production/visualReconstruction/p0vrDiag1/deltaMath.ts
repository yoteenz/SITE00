/**
 * P0.VR.DIAG.1R3 — Delta math with zero/missing/range/enum semantics.
 */

import type { DimensionNormalizationResult } from './dimensionNormalization.js';
import { parseRangeBounds } from './dimensionNormalization.js';

export type DeltaMathStatus =
  | 'OK'
  | 'EQUAL'
  | 'BASELINE_ZERO'
  | 'WITHIN_RANGE'
  | 'OUTSIDE_RANGE'
  | 'ENUM_MATCH'
  | 'ENUM_MISMATCH'
  | 'NOT_COMPARABLE'
  | 'UNIT_MISMATCH';

export type DeltaMathResult = {
  authority: string | number;
  current: string | number;
  absoluteDelta: number | null;
  deltaPct: number | null;
  direction: 'INCREASE' | 'DECREASE' | 'NONE' | 'MISMATCH' | 'UNKNOWN';
  status: DeltaMathStatus;
  reason: string | null;
  displayDelta: string;
};

function formatPxDelta(abs: number): string {
  const sign = abs > 0 ? '+' : abs < 0 ? '' : '';
  const rounded = Math.round(abs * 10) / 10;
  return `${sign}${rounded}px`;
}

export function computeDeltaMath(
  _dimension: string,
  norm: DimensionNormalizationResult,
): DeltaMathResult {
  const authority = norm.rawAuthorityValue ?? '—';
  const current = norm.rawCurrentValue ?? '—';

  if (norm.normalizationStatus === 'INVALID_VALUE' || norm.errorCode === 'MISSING_SIDE') {
    return {
      authority,
      current,
      absoluteDelta: null,
      deltaPct: null,
      direction: 'UNKNOWN',
      status: 'NOT_COMPARABLE',
      reason: norm.errorCode,
      displayDelta: '—',
    };
  }

  if (norm.valueType === 'ENUM' || norm.valueType === 'BOOLEAN') {
    const match = norm.normalizedAuthorityValue === norm.normalizedCurrentValue;
    return {
      authority,
      current,
      absoluteDelta: null,
      deltaPct: null,
      direction: match ? 'NONE' : 'MISMATCH',
      status: match ? 'ENUM_MATCH' : 'ENUM_MISMATCH',
      reason: match ? null : 'ENUM_MISMATCH',
      displayDelta: match ? 'MATCH' : 'MISMATCH',
    };
  }

  if (norm.valueType === 'RANGE' && typeof norm.normalizedCurrentValue === 'number') {
    const range =
      typeof norm.normalizedAuthorityValue === 'object' && norm.normalizedAuthorityValue != null
        ? (norm.normalizedAuthorityValue as { low: number; high: number })
        : parseRangeBounds(authority);
    if (!range) {
      return {
        authority,
        current,
        absoluteDelta: null,
        deltaPct: null,
        direction: 'UNKNOWN',
        status: 'NOT_COMPARABLE',
        reason: 'INVALID_RANGE',
        displayDelta: '—',
      };
    }
    const cur = norm.normalizedCurrentValue;
    const within = cur >= range.low && cur <= range.high;
    return {
      authority,
      current,
      absoluteDelta: within ? 0 : cur < range.low ? cur - range.low : cur - range.high,
      deltaPct: null,
      direction: within ? 'NONE' : cur < range.low ? 'INCREASE' : 'DECREASE',
      status: within ? 'WITHIN_RANGE' : 'OUTSIDE_RANGE',
      reason: within ? 'WITHIN_RANGE' : 'OUTSIDE_RANGE',
      displayDelta: within ? 'WITHIN RANGE · 0px effective' : formatPxDelta(cur < range.low ? cur - range.low : cur - range.high),
    };
  }

  const auth = typeof norm.normalizedAuthorityValue === 'number' ? norm.normalizedAuthorityValue : null;
  const cur = typeof norm.normalizedCurrentValue === 'number' ? norm.normalizedCurrentValue : null;
  if (auth == null || cur == null) {
    return {
      authority,
      current,
      absoluteDelta: null,
      deltaPct: null,
      direction: 'UNKNOWN',
      status: 'NOT_COMPARABLE',
      reason: 'MISSING_NUMERIC',
      displayDelta: '—',
    };
  }

  const absoluteDelta = cur - auth;

  if (Math.abs(absoluteDelta) < 1e-9) {
    return {
      authority,
      current,
      absoluteDelta: 0,
      deltaPct: 0,
      direction: 'NONE',
      status: 'EQUAL',
      reason: null,
      displayDelta: norm.unit === 'count' ? '0 · 0%' : '0px · 0%',
    };
  }

  if (auth === 0 && cur === 0) {
    return {
      authority,
      current,
      absoluteDelta: 0,
      deltaPct: 0,
      direction: 'NONE',
      status: 'EQUAL',
      reason: null,
      displayDelta: '0 · 0%',
    };
  }

  if (auth === 0 && cur !== 0) {
    const sign = cur > 0 ? '+' : '';
    const suffix = norm.unit === 'count' ? '' : norm.unit === 'pct' ? '%' : 'px';
    return {
      authority,
      current,
      absoluteDelta,
      deltaPct: null,
      direction: cur > 0 ? 'INCREASE' : 'DECREASE',
      status: 'BASELINE_ZERO',
      reason: 'BASELINE_ZERO',
      displayDelta: norm.unit === 'count' ? `${sign}${cur} items` : `${sign}${Math.round(absoluteDelta * 10) / 10}${suffix}`,
    };
  }

  const deltaPct = (absoluteDelta / auth) * 100;
  if (!Number.isFinite(deltaPct)) {
    return {
      authority,
      current,
      absoluteDelta,
      deltaPct: null,
      direction: absoluteDelta > 0 ? 'INCREASE' : 'DECREASE',
      status: 'NOT_COMPARABLE',
      reason: 'NON_FINITE_PCT',
      displayDelta: formatPxDelta(absoluteDelta),
    };
  }

  const direction = absoluteDelta > 0 ? 'INCREASE' : 'DECREASE';
  const pctRounded = Math.round(deltaPct);
  const sign = absoluteDelta > 0 ? '+' : '';
  let displayDelta: string;
  if (norm.unit === 'count') {
    displayDelta = `${sign}${Math.round(absoluteDelta)} · ${sign}${pctRounded}%`;
  } else if (norm.unit === 'pct') {
    displayDelta = `${sign}${Math.round(absoluteDelta * 10) / 10}% · ${sign}${pctRounded}%`;
  } else if (norm.unit === 'ratio') {
    displayDelta = `${sign}${Math.round(absoluteDelta * 100) / 100}`;
  } else {
    displayDelta = `${formatPxDelta(absoluteDelta)} · ${sign}${pctRounded}%`;
  }

  return {
    authority,
    current,
    absoluteDelta,
    deltaPct: Math.round(deltaPct * 10) / 10,
    direction,
    status: 'OK',
    reason: null,
    displayDelta,
  };
}

/** Apply normalized delta math to an evidence row (preserves raw authority/current display strings). */
export function applyDeltaMathToEvidence<T extends {
  dimension: string;
  authorityValue: string | number;
  currentValue: string | number;
  unit: 'px' | 'pct' | 'ratio' | 'count' | 'none';
  delta: string | null;
  deltaPct: number | null;
  alignedWithinTolerance?: boolean;
}>(row: T, norm: DimensionNormalizationResult): T {
  const math = computeDeltaMath(row.dimension, norm);
  return {
    ...row,
    delta: math.displayDelta,
    deltaPct: math.deltaPct,
    alignedWithinTolerance:
      math.status === 'EQUAL' || math.status === 'WITHIN_RANGE' || math.status === 'ENUM_MATCH',
  };
}
