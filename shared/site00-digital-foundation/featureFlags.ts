/** Feature flags — SITE 00 Digital Foundation Artifact V1 */

export const DF_FEATURE_FLAGS = {
  SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1: 'SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1',
  SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1: 'SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1',
  SITE00_DIGITAL_FOUNDATION_PORTAL_V1: 'SITE00_DIGITAL_FOUNDATION_PORTAL_V1',
  SITE00_DIGITAL_FOUNDATION_BUILD_UPSELL_V1: 'SITE00_DIGITAL_FOUNDATION_BUILD_UPSELL_V1',
  /** P07–P10 project portal views (roadmap, stage detail, needs-you, records). */
  SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2: 'SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2',
} as const;

export type DigitalFoundationFeatureFlag = (typeof DF_FEATURE_FLAGS)[keyof typeof DF_FEATURE_FLAGS];

function envTruthy(key: string, defaultOn = true): boolean {
  const raw =
    (typeof process !== 'undefined' ? process.env[key] : undefined) ??
    (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string | undefined>)[key] : undefined);
  if (raw === undefined || raw === '') return defaultOn;
  return raw === '1' || raw.toLowerCase() === 'true';
}

export function isDigitalFoundationFlagEnabled(flag: DigitalFoundationFeatureFlag): boolean {
  switch (flag) {
    case DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1:
      return envTruthy('VITE_SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1', true) && envTruthy('SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1', true);
    case DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1:
      return envTruthy('VITE_SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1', true) && envTruthy('SITE00_DIGITAL_FOUNDATION_CHECKOUT_V1', true);
    case DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_PORTAL_V1:
      return envTruthy('VITE_SITE00_DIGITAL_FOUNDATION_PORTAL_V1', true) && envTruthy('SITE00_DIGITAL_FOUNDATION_PORTAL_V1', true);
    case DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_BUILD_UPSELL_V1:
      return envTruthy('VITE_SITE00_DIGITAL_FOUNDATION_BUILD_UPSELL_V1', true) &&
        envTruthy('SITE00_DIGITAL_FOUNDATION_BUILD_UPSELL_V1', true);
    case DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2:
      return (
        envTruthy('VITE_SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2', true) &&
        envTruthy('SITE00_DIGITAL_FOUNDATION_PROJECT_PORTAL_V2', true) &&
        isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_PORTAL_V1)
      );
    default:
      return false;
  }
}
