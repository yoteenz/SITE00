import type { DigitalFoundationIntake, IntakeNeedFlag } from '../types.js';

export type FoundationFixtureId =
  | 'A_BASE'
  | 'B_EXTRA_MAILBOXES'
  | 'C_LEGACY_MIGRATION'
  | 'D_DOMAIN_RECOVERY'
  | 'E_MULTI_USER'
  | 'F_EXISTING_DOMAIN'
  | 'G_NO_WEBSITE'
  | 'H_SIMPLE_BUILD'
  | 'I_AIO_REFERRAL'
  | 'J_PAYMENT_SUCCESS'
  | 'K_PAYMENT_FAILURE'
  | 'L_REFUND'
  | 'M_COMPLETE_CREDIT';

export type FoundationFixtureScenario = {
  id: FoundationFixtureId;
  label: string;
  referral_kind?: 'AIO' | 'DIRECT';
  intake: DigitalFoundationIntake;
  extra_addon_selections?: Array<{ addon_id: string; quantity: number }>;
  simulate_payment?: 'success' | 'failure' | 'refund';
  mark_complete?: boolean;
};

function needs(...flags: IntakeNeedFlag[]): IntakeNeedFlag[] {
  return flags;
}

export const FOUNDATION_FIXTURE_SCENARIOS: FoundationFixtureScenario[] = [
  {
    id: 'A_BASE',
    label: 'Base foundation — $500 / 2–3 days',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL', 'NEED_SIGNATURE') },
  },
  {
    id: 'B_EXTRA_MAILBOXES',
    label: 'Base + 3 additional mailboxes',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL', 'NEED_MULTI_MAILBOX'), team_size: 4 },
    extra_addon_selections: [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 3 }],
  },
  {
    id: 'C_LEGACY_MIGRATION',
    label: 'Base + legacy email migration',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL', 'NEED_MIGRATION') },
  },
  {
    id: 'D_DOMAIN_RECOVERY',
    label: 'Domain recovery / manual review',
    intake: { needs: needs('LOST_DOMAIN', 'NEED_PRO_EMAIL') },
  },
  {
    id: 'E_MULTI_USER',
    label: 'Multi-user business',
    intake: { needs: needs('OWN_DOMAIN', 'NEED_PRO_EMAIL', 'NEED_MULTI_MAILBOX'), team_size: 8 },
  },
  {
    id: 'F_EXISTING_DOMAIN',
    label: 'Existing domain — no new registration',
    intake: { needs: needs('OWN_DOMAIN', 'NEED_PRO_EMAIL'), existing_domain: 'example.com' },
  },
  {
    id: 'G_NO_WEBSITE',
    label: 'Client not ready for website',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL'), future_website_interest: 'no' },
  },
  {
    id: 'H_SIMPLE_BUILD',
    label: 'Client interested in simple build',
    intake: {
      needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL', 'EVENTUAL_WEBSITE'),
      future_website_interest: 'yes',
      website_status: 'none',
    },
  },
  {
    id: 'I_AIO_REFERRAL',
    label: 'Referred by AIO',
    referral_kind: 'AIO',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL') },
  },
  {
    id: 'J_PAYMENT_SUCCESS',
    label: 'Payment success path',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL') },
    simulate_payment: 'success',
  },
  {
    id: 'K_PAYMENT_FAILURE',
    label: 'Payment failure path',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL') },
    simulate_payment: 'failure',
  },
  {
    id: 'L_REFUND',
    label: 'Refund path',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL') },
    simulate_payment: 'refund',
  },
  {
    id: 'M_COMPLETE_CREDIT',
    label: 'Foundation complete + $200 credit',
    intake: { needs: needs('NEED_DOMAIN', 'NEED_PRO_EMAIL', 'EVENTUAL_WEBSITE'), future_website_interest: 'yes' },
    simulate_payment: 'success',
    mark_complete: true,
  },
];
