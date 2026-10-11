/** Communications Family F — all marketing and unapproved transactional sends default OFF. */

export const DF_COMM_FEATURE_FLAGS = {
  SITE00_DF_COMMUNICATIONS_UI: 'SITE00_DF_COMMUNICATIONS_UI',
  SITE00_DF_EMAIL_TEMPLATE_PREVIEW: 'SITE00_DF_EMAIL_TEMPLATE_PREVIEW',
  SITE00_DF_TRANSACTIONAL_EMAIL_SEND: 'SITE00_DF_TRANSACTIONAL_EMAIL_SEND',
  SITE00_DF_OPERATIONAL_REMINDERS: 'SITE00_DF_OPERATIONAL_REMINDERS',
  SITE00_DF_MARKETING_EMAIL_SEND: 'SITE00_DF_MARKETING_EMAIL_SEND',
  SITE00_DF_MARKETING_JOURNEYS: 'SITE00_DF_MARKETING_JOURNEYS',
} as const;

function envTruthy(key: string, defaultOn = false): boolean {
  const raw =
    (typeof process !== 'undefined' ? process.env[key] : undefined) ??
    (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string | undefined>)[key] : undefined);
  if (raw === undefined || raw === '') return defaultOn;
  return raw === '1' || raw.toLowerCase() === 'true';
}

export function isDfCommunicationFlagEnabled(flag: (typeof DF_COMM_FEATURE_FLAGS)[keyof typeof DF_COMM_FEATURE_FLAGS]): boolean {
  return envTruthy(`VITE_${flag}`, false) && envTruthy(flag, false);
}
