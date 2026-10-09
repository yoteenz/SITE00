/** Business Growth — disabled until founder commercial activation. */
export const BGI_FEATURE_FLAGS = {
  SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1: 'SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1',
  SITE00_BUSINESS_AMBITION_INTAKE_V1: 'SITE00_BUSINESS_AMBITION_INTAKE_V1',
  SITE00_BUSINESS_GROWTH_CHECKOUT_V1: 'SITE00_BUSINESS_GROWTH_CHECKOUT_V1',
} as const;

function envTruthy(key: string): boolean {
  const raw =
    (typeof process !== 'undefined' ? process.env[key] : undefined) ??
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)[key]
      : undefined);
  return raw === '1' || raw?.toLowerCase() === 'true';
}

/** Default off — no public Growth activation without founder flags. */
export function isBusinessGrowthFlagEnabled(flag: keyof typeof BGI_FEATURE_FLAGS): boolean {
  return envTruthy(BGI_FEATURE_FLAGS[flag]);
}

export function isBusinessGrowthIntelligenceActive(): boolean {
  return isBusinessGrowthFlagEnabled('SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1');
}
