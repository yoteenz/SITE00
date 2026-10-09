import type { BusinessAmbitionGoalId } from './types.js';

/** SITE 00 digital scope vs AIO operational/compliance — metadata only, no bundled invoicing. */
export const AIO_REFERRAL_HINTS: readonly {
  trigger_goals: BusinessAmbitionGoalId[];
  summary: string;
  aio_domain: string;
}[] = [
  {
    trigger_goals: ['PURSUE_GOVERNMENT_CONTRACTS', 'PREPARE_EXPANSION'],
    summary: 'Authority, permitting, or trucking compliance may be delivered by AIO — separate engagement and billing.',
    aio_domain: 'COMPLIANCE_OPERATIONS',
  },
];

export const SITE00_VS_AIO_BOUNDARY = {
  site00: [
    'Digital infrastructure',
    'Digital presence preparation',
    'Opportunity readiness documentation',
    'Growth systems configuration',
  ],
  aio: [
    'Business formation support',
    'Trucking-related compliance',
    'Authority and permitting',
    'Bookkeeping and dispatch where appropriate',
  ],
  rule: 'Do not bundle AIO services into SITE 00 invoices without approved commercial arrangement.',
} as const;
