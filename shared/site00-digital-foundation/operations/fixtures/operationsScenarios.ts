/** Operations-layer fixture ids (A–M) — pair with commerce fixtures where noted. */
export type OperationsFixtureId =
  | 'OPS_A_BASE'
  | 'OPS_B_CLOUDFLARE_GOOGLE'
  | 'OPS_C_EXISTING_DOMAIN'
  | 'OPS_D_DOMAIN_RECOVERY'
  | 'OPS_E_MIGRATION'
  | 'OPS_F_EXTRA_MAILBOXES'
  | 'OPS_G_CLIENT_BLOCKER'
  | 'OPS_H_PROVIDER_WAIT'
  | 'OPS_I_DNS_FAIL'
  | 'OPS_J_ESCALATION'
  | 'OPS_K_VERIFY_PASS'
  | 'OPS_L_VERIFY_BLOCKED'
  | 'OPS_M_COMPLETE';

export type OperationsFixtureHint = {
  id: OperationsFixtureId;
  commerce_fixture?: string;
  provider_config?: { email_provider_id?: string; dns_provider_id?: string; domain_registrar_id?: string };
  simulate?: 'client_blocker' | 'provider_wait' | 'dns_fail' | 'escalation' | 'verify_pass' | 'verify_blocked';
};

export const OPERATIONS_FIXTURE_HINTS: OperationsFixtureHint[] = [
  { id: 'OPS_A_BASE', commerce_fixture: 'A_BASE' },
  { id: 'OPS_B_CLOUDFLARE_GOOGLE', commerce_fixture: 'J_PAYMENT_SUCCESS', provider_config: { dns_provider_id: 'cloudflare', email_provider_id: 'google_workspace' } },
  { id: 'OPS_C_EXISTING_DOMAIN', commerce_fixture: 'F_EXISTING_DOMAIN' },
  { id: 'OPS_D_DOMAIN_RECOVERY', commerce_fixture: 'D_DOMAIN_RECOVERY' },
  { id: 'OPS_E_MIGRATION', commerce_fixture: 'C_LEGACY_MIGRATION' },
  { id: 'OPS_F_EXTRA_MAILBOXES', commerce_fixture: 'B_EXTRA_MAILBOXES' },
  { id: 'OPS_G_CLIENT_BLOCKER', commerce_fixture: 'J_PAYMENT_SUCCESS', simulate: 'client_blocker' },
  { id: 'OPS_H_PROVIDER_WAIT', commerce_fixture: 'J_PAYMENT_SUCCESS', simulate: 'provider_wait' },
  { id: 'OPS_I_DNS_FAIL', commerce_fixture: 'J_PAYMENT_SUCCESS', simulate: 'dns_fail' },
  { id: 'OPS_J_ESCALATION', commerce_fixture: 'J_PAYMENT_SUCCESS', simulate: 'escalation' },
  { id: 'OPS_K_VERIFY_PASS', commerce_fixture: 'J_PAYMENT_SUCCESS', simulate: 'verify_pass' },
  { id: 'OPS_L_VERIFY_BLOCKED', commerce_fixture: 'J_PAYMENT_SUCCESS', simulate: 'verify_blocked' },
  { id: 'OPS_M_COMPLETE', commerce_fixture: 'M_COMPLETE_CREDIT' },
];
