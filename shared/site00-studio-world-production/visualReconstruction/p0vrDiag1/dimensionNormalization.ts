/**
 * P0.VR.DIAG.1R3 — Normalize forensic dimension values for comparable delta math.
 */

export const DIMENSION_VALUE_TYPES = [
  'NUMBER',
  'PERCENT',
  'COUNT',
  'BOOLEAN',
  'ENUM',
  'RANGE',
  'COORDINATE',
  'DIMENSION',
  'UNKNOWN',
] as const;
export type DimensionValueType = (typeof DIMENSION_VALUE_TYPES)[number];

export type DimensionNormalizationResult = {
  rawAuthorityValue: string | number | null;
  rawCurrentValue: string | number | null;
  normalizedAuthorityValue: number | string | boolean | { low: number; high: number } | null;
  normalizedCurrentValue: number | string | boolean | null;
  unit: 'px' | 'pct' | 'ratio' | 'count' | 'none';
  valueType: DimensionValueType;
  authorityValid: boolean;
  currentValid: boolean;
  normalizationStatus: 'OK' | 'INVALID_VALUE' | 'MISSING' | 'UNIT_MISMATCH';
  errorCode: string | null;
};

const RANGE_RE = /^([\d.]+)\s*[–-]\s*([\d.]+)\s*(px|%|)?$/i;

export function parseNumericToken(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const s = String(raw).trim();
  if (!s || s === '—' || s === '-') return null;
  const range = RANGE_RE.exec(s.replace(/~/g, ''));
  if (range) {
    const low = Number(range[1]);
    const high = Number(range[2]);
    if (Number.isFinite(low) && Number.isFinite(high)) return (low + high) / 2;
  }
  const m = /^([+-]?[\d.]+)/.exec(s.replace(/px|%/gi, '').trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function parseRangeBounds(raw: string | number | null | undefined): { low: number; high: number } | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  const range = RANGE_RE.exec(s);
  if (!range) return null;
  const low = Number(range[1]);
  const high = Number(range[2]);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

export function inferValueType(dimension: string, unit: DimensionNormalizationResult['unit']): DimensionValueType {
  if (unit === 'count') return 'COUNT';
  if (unit === 'pct') return 'PERCENT';
  if (unit === 'ratio') return 'NUMBER';
  if (dimension.includes('alignment') || dimension.includes('Alignment')) return 'ENUM';
  if (unit === 'px' && (dimension === 'x' || dimension === 'y' || dimension.includes('Offset'))) return 'COORDINATE';
  if (unit === 'px') return 'DIMENSION';
  return 'NUMBER';
}

export function normalizeDimensionPair(input: {
  dimension: string;
  authorityValue: string | number;
  currentValue: string | number;
  unit: DimensionNormalizationResult['unit'];
}): DimensionNormalizationResult {
  const rawAuthorityValue = input.authorityValue;
  const rawCurrentValue = input.currentValue;

  const authRange = parseRangeBounds(rawAuthorityValue);
  const authNum = parseNumericToken(rawAuthorityValue);
  const curNum = parseNumericToken(rawCurrentValue);

  const valueType = inferValueType(input.dimension, input.unit);

  if (valueType === 'ENUM' || valueType === 'BOOLEAN') {
    const a = String(rawAuthorityValue).trim().toUpperCase();
    const c = String(rawCurrentValue).trim().toUpperCase();
    const authorityValid = a.length > 0;
    const currentValid = c.length > 0;
    return {
      rawAuthorityValue,
      rawCurrentValue,
      normalizedAuthorityValue: a,
      normalizedCurrentValue: c,
      unit: input.unit,
      valueType,
      authorityValid,
      currentValid,
      normalizationStatus: authorityValid && currentValid ? 'OK' : 'MISSING',
      errorCode: authorityValid && currentValid ? null : 'MISSING_SIDE',
    };
  }

  if (authRange && curNum != null) {
    const within = curNum >= authRange.low && curNum <= authRange.high;
    return {
      rawAuthorityValue,
      rawCurrentValue,
      normalizedAuthorityValue: authRange,
      normalizedCurrentValue: curNum,
      unit: input.unit,
      valueType: 'RANGE',
      authorityValid: true,
      currentValid: true,
      normalizationStatus: within ? 'OK' : 'OK',
      errorCode: null,
    };
  }

  if (authNum == null && curNum == null) {
    return {
      rawAuthorityValue,
      rawCurrentValue,
      normalizedAuthorityValue: null,
      normalizedCurrentValue: null,
      unit: input.unit,
      valueType,
      authorityValid: false,
      currentValid: false,
      normalizationStatus: 'INVALID_VALUE',
      errorCode: 'INVALID_VALUE',
    };
  }

  if (authNum == null || curNum == null) {
    return {
      rawAuthorityValue,
      rawCurrentValue,
      normalizedAuthorityValue: authNum,
      normalizedCurrentValue: curNum,
      unit: input.unit,
      valueType,
      authorityValid: authNum != null,
      currentValid: curNum != null,
      normalizationStatus: 'MISSING',
      errorCode: 'MISSING_SIDE',
    };
  }

  return {
    rawAuthorityValue,
    rawCurrentValue,
    normalizedAuthorityValue: authNum,
    normalizedCurrentValue: curNum,
    unit: input.unit,
    valueType,
    authorityValid: true,
    currentValid: true,
    normalizationStatus: 'OK',
    errorCode: null,
  };
}
