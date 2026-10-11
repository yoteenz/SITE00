import { LIVE_MONEY_MOVEMENT, LIVE_PLATFORM_FEES_COLLECTED } from './processor';

/** AIO domains do not share one eligibility rule. Participation stays off. */
export const AIO_TRANSACTION_MODELS = [
  { id: 'BROKERAGE', eligibility: 'NOT_ASSUMED', coveredType: null, activated: false },
  { id: 'PERMITTING', eligibility: 'NOT_ASSUMED', coveredType: null, activated: false },
  { id: 'DISPATCHING', eligibility: 'NOT_ASSUMED', coveredType: null, activated: false },
  { id: 'INSURANCE', eligibility: 'NOT_ASSUMED', coveredType: null, activated: false },
  { id: 'BOOKKEEPING', eligibility: 'NOT_ASSUMED', coveredType: null, activated: false },
  { id: 'SERVICE_PAYMENT', eligibility: 'COMPATIBLE_WHEN_AGREEMENT_LISTS_SERVICE_PAYMENT', coveredType: 'SERVICE_PAYMENT', activated: false },
] as const;

export const AIO_PLATFORM_PARTICIPATION_ACTIVATED = false;

export const CLIENT_ACCOUNT_FINANCIAL_CONTRACT = {
  environment: 'EXISTING_SITE00_ACCOUNT',
  route: '/account',
  separateEnvironment: false,
  studioOsVisibleToClient: false,
  visualImplemented: false,
  existingDestinations: [
    { label: 'CONTROL ROOM', href: '/control' },
    { label: 'INTAKES', href: '/account/intakes' },
    { label: 'SIGN IN & SECURITY', href: '/idnty/sign-in-security' },
  ],
  proposedSection: {
    label: 'FINANCIAL RECORD',
    placement: 'A section inside the existing account page.',
  },
  surfaces: [
    { id: 'FINANCIAL_OVERVIEW', status: 'CONTRACT_ONLY' },
    { id: 'STATEMENT_HISTORY', status: 'CONTRACT_ONLY' },
    { id: 'STATEMENT_DETAIL', status: 'CONTRACT_ONLY' },
    { id: 'TRANSACTION_BREAKDOWN', status: 'CONTRACT_ONLY' },
    { id: 'PLATFORM_AGREEMENT', status: 'CONTRACT_ONLY' },
    { id: 'PAYOUT_INFORMATION', status: 'CONTRACT_ONLY' },
  ],
} as const;

export const STATEMENT_INTERACTIONS = {
  periodSelection: 'Select a covered period. Each period is a statement built from the ledger.',
  statementDetail: 'Open one statement. Figures are posted, pending, or unavailable. Settled stays separate.',
  transactionFilter: 'Filter the breakdown by source transaction. The rows come from the ledger explanation.',
  refundExplanation: 'A refund is the amount returned. The platform share on the statement is already net of the reversed fee.',
  agreementInspection: 'Show the agreement state, rate, and effective-date rule. An unaccepted rate is not an active deduction.',
  export: { available: false, reason: 'EXPORT_NOT_IMPLEMENTED' },
  payoutReconciliation: 'Draft batches are pending. This version does not settle them.',
  empty: 'No transactions were posted in this period.',
  loading: 'The statement is still being read from the ledger.',
  unavailable: 'This figure is withheld because the books do not yet support it.',
  error: 'The statement could not be read. Access failures stay access failures.',
  moneyFormat: 'Display uses the currency code. The stored amount stays integer minor units.',
} as const;

export const FINANCIAL_GATES = {
  legalReview: 'PENDING',
  processorReview: 'PENDING',
  liveMoneyMovement: LIVE_MONEY_MOVEMENT,
  livePlatformFeesCollected: LIVE_PLATFORM_FEES_COLLECTED,
  stripeConnectActivated: false,
  publicTermsPublished: false,
  topics: [
    'Client agreements',
    'Revenue-share disclosures',
    'Processor responsibilities',
    'Refund treatment',
    'Chargeback treatment',
    'Account ownership',
    'Payout obligations',
    'Tax implications',
    'Termination and disputes',
    'Jurisdiction-specific requirements',
  ],
} as const;
