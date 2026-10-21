/** NDXBOOK Kling 4 cinematic execution — isolated gate (default OFF). */

export const NDXBOOK_CINEMATIC_FEATURE_FLAGS = {
  NDXBOOK_KLING4_EXECUTION_ENABLED: 'NDXBOOK_KLING4_EXECUTION_ENABLED',
} as const;

export type NdxbookCinematicFeatureFlag =
  (typeof NDXBOOK_CINEMATIC_FEATURE_FLAGS)[keyof typeof NDXBOOK_CINEMATIC_FEATURE_FLAGS];

function envTruthy(key: string, defaultOn = false): boolean {
  const raw =
    (typeof process !== 'undefined' ? process.env[key] : undefined) ??
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)[key]
      : undefined);
  if (raw === undefined || raw === '') return defaultOn;
  return raw === '1' || raw.toLowerCase() === 'true';
}

export function isNdxbookKling4ExecutionEnabled(): boolean {
  return (
    envTruthy('NDXBOOK_KLING4_EXECUTION_ENABLED', false) &&
    envTruthy('VITE_NDXBOOK_KLING4_EXECUTION_ENABLED', false)
  );
}
