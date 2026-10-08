/**
 * Canonical SITE 00 platform usage rate.
 * 200 basis points = 2.00%. This is the only place that number is defined.
 * Money math uses integer basis points. It does not multiply by a float.
 */
export const DEFAULT_PLATFORM_FEE_BASIS_POINTS = 200;

export const BASIS_POINT_SCALE = 10_000;

export function formatPlatformFeeRate(basisPoints: number): string {
  if (!Number.isInteger(basisPoints) || basisPoints < 0) {
    throw new Error('RATE_NOT_BASIS_POINTS');
  }
  const whole = Math.trunc(basisPoints / 100);
  const fraction = basisPoints % 100;
  const fractionText = fraction < 10 ? `0${fraction}` : String(fraction);
  return `${whole}.${fractionText}%`;
}

export function isDefaultPlatformRate(basisPoints: number): boolean {
  return basisPoints === DEFAULT_PLATFORM_FEE_BASIS_POINTS;
}

export function canonicalPlatformFeeBasisPoints(): number {
  return DEFAULT_PLATFORM_FEE_BASIS_POINTS;
}
