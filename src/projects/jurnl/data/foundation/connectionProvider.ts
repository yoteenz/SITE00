/** Honest connection provider abstraction (W1.6). No fake live bank integration. */

export type ConnectionProviderStatus =
  | 'PROVIDER_UNAVAILABLE'
  | 'MANUAL_ONLY'
  | 'MOCK_DEV'
  | 'CONNECTION_IN_PROGRESS'
  | 'CONNECTED'
  | 'REAUTH_REQUIRED'
  | 'CONNECTION_ERROR';

export type ConnectionProvider = {
  provider_id: string;
  provider_type: 'BANK_AGGREGATION';
  availability: ConnectionProviderStatus;
  capabilities: string[];
};

export const JURNL_BANK_CONNECTION_PROVIDER: ConnectionProvider = {
  provider_id: 'jurnl.bank.none',
  provider_type: 'BANK_AGGREGATION',
  availability: 'PROVIDER_UNAVAILABLE',
  capabilities: [],
};

export function honestAccountsConnectionLabel(accounts: 'CONNECTED' | 'NAMED' | 'SKIPPED' | null): string {
  if (accounts === 'NAMED') return 'MANUAL ACCOUNT';
  if (accounts === 'CONNECTED') return 'PREVIEW ONLY — NO LIVE BANK LINK';
  if (accounts === 'SKIPPED') return 'NO ACCOUNT NAMED';
  return 'NOT SET';
}
