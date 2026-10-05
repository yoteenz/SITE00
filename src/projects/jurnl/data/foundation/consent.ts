/** Canonical consent model (W1.7). One record in repository; F01 + F02 write through sync helpers. */

export type ConsentType =
  | 'DATA_REMEMBER'
  | 'LINKED_ACCOUNTS'
  | 'NO_DATA_SALE'
  | 'AI_PERSONALIZED'
  | 'AI_CATEGORIZATION'
  | 'AI_BUDGET'
  | 'AI_NATURAL_LANGUAGE'
  | 'AI_MARKET_TRENDS'
  | 'ASK_JURNL_CONTEXT';

export type ConsentStatus = 'GRANTED' | 'DENIED' | 'UNSET';

export type ConsentRecord = {
  consent_type: ConsentType;
  status: ConsentStatus;
  version: string;
  granted_at: string | null;
  revoked_at: string | null;
  source: string;
};

export const CONSENT_VERSION = '2026-10-05';

export function defaultConsentRecords(): ConsentRecord[] {
  const now = null;
  const base = (consent_type: ConsentType, status: ConsentStatus): ConsentRecord => ({
    consent_type,
    status,
    version: CONSENT_VERSION,
    granted_at: status === 'GRANTED' ? new Date().toISOString() : now,
    revoked_at: status === 'DENIED' ? new Date().toISOString() : now,
    source: 'DEFAULT',
  });
  return [
    base('DATA_REMEMBER', 'GRANTED'),
    base('LINKED_ACCOUNTS', 'GRANTED'),
    base('NO_DATA_SALE', 'GRANTED'),
    base('AI_PERSONALIZED', 'DENIED'),
    base('AI_CATEGORIZATION', 'DENIED'),
    base('AI_BUDGET', 'DENIED'),
    base('AI_NATURAL_LANGUAGE', 'DENIED'),
    base('AI_MARKET_TRENDS', 'DENIED'),
    base('ASK_JURNL_CONTEXT', 'DENIED'),
  ];
}

export function consentGranted(records: ConsentRecord[], type: ConsentType): boolean {
  return records.find((r) => r.consent_type === type)?.status === 'GRANTED';
}

export function patchConsent(records: ConsentRecord[], type: ConsentType, granted: boolean, source: string): ConsentRecord[] {
  const now = new Date().toISOString();
  return records.map((r) =>
    r.consent_type !== type ?
      r
    : {
        ...r,
        status: granted ? 'GRANTED' : 'DENIED',
        granted_at: granted ? now : r.granted_at,
        revoked_at: granted ? null : now,
        source,
      },
  );
}
