import { formatPlatformFeeRate, DEFAULT_PLATFORM_FEE_BASIS_POINTS } from './rate';
import { PLATFORM_ECONOMICS_VERSION } from './version';
import type { CoveredTransactionType } from './types';

const TRANSACTION_FEATURES: Record<string, CoveredTransactionType[]> = {
  ECOMMERCE: ['ECOMMERCE'],
  PAYMENTS: ['SERVICE_PAYMENT', 'INVOICE_PAYMENT', 'PORTAL_PAYMENT'],
  BOOKING: ['BOOKING'],
  MEMBERSHIP: ['MEMBERSHIP', 'SUBSCRIPTION'],
  MARKETPLACE: ['MARKETPLACE'],
};

export type PlatformDisclosure = {
  transactionCapable: boolean;
  platformFeeApplicable: boolean;
  rateLabel: string | null;
  rateBasisPoints: number | null;
  customRate: false;
  coveredTransactionTypes: CoveredTransactionType[];
  summary: string;
  learnHowThisWorks: { label: 'LEARN HOW THIS WORKS'; body: string };
  includedInBuildInvestment: false;
  legalReviewRequired: true;
  economicsVersion: string;
};

export type OngoingServiceDisclosure = {
  status: 'OPTIONAL' | 'SELECTED' | 'NOT_CONTRACTED';
  summary: string;
  separateFromPlatformUsage: true;
  separateFromBuildInvestment: true;
};

export type BlueprintPlatformLine = { key: string; label: string; value: string };

const LEARN_BODY =
  'Platform usage is a percentage of eligible transactions processed through covered SITE 00 infrastructure. It is separate from the build investment and from optional ongoing support. Eligible volume is successfully collected customer commerce. Taxes, refunds, reversed payments, chargebacks, gratuities, government fees, regulatory fees, and approved third-party pass-through charges are excluded unless the project agreement says otherwise. Processor fees follow that agreement and are not assumed. A refund reverses the corresponding platform fee. The fee becomes active only when the project agreement is active. A Blueprint or a quote does not activate it.';

export function platformDisclosureForFeatures(featureIds: readonly string[]): PlatformDisclosure {
  const covered = new Set<CoveredTransactionType>();
  for (const featureId of featureIds) {
    for (const type of TRANSACTION_FEATURES[featureId] ?? []) covered.add(type);
  }
  if (featureIds.includes('WORLD_SPATIAL') && featureIds.includes('PAYMENTS')) covered.add('WORLD_COMMERCE');
  const applicable = covered.size > 0;
  const rateLabel = applicable ? formatPlatformFeeRate(DEFAULT_PLATFORM_FEE_BASIS_POINTS) : null;
  return {
    transactionCapable: applicable,
    platformFeeApplicable: applicable,
    rateLabel,
    rateBasisPoints: applicable ? DEFAULT_PLATFORM_FEE_BASIS_POINTS : null,
    customRate: false,
    coveredTransactionTypes: [...covered],
    summary: applicable
      ? `Platform usage is ${rateLabel} of eligible transactions. It is not added to the build investment.`
      : 'Platform usage is not applicable. This project has no covered transactions.',
    learnHowThisWorks: { label: 'LEARN HOW THIS WORKS', body: LEARN_BODY },
    includedInBuildInvestment: false,
    legalReviewRequired: true,
    economicsVersion: PLATFORM_ECONOMICS_VERSION,
  };
}

export function ongoingServiceDisclosure(status: OngoingServiceDisclosure['status'] = 'OPTIONAL'): OngoingServiceDisclosure {
  const summary =
    status === 'SELECTED'
      ? 'Ongoing support is selected and billed separately from the build and from platform usage.'
      : status === 'NOT_CONTRACTED'
        ? 'No ongoing support is contracted.'
        : 'Ongoing support is optional. It is not included in the build range.';
  return { status, summary, separateFromPlatformUsage: true, separateFromBuildInvestment: true };
}

export function blueprintPlatformLines(featureIds: readonly string[]): BlueprintPlatformLine[] {
  const disclosure = platformDisclosureForFeatures(featureIds);
  const on = disclosure.platformFeeApplicable;
  return [
    { key: 'COMMERCE', label: 'COMMERCE', value: on ? 'ENABLED' : 'NOT ENABLED' },
    { key: 'PLATFORM', label: 'PLATFORM', value: on ? 'SITE 00 INFRASTRUCTURE' : 'NOT APPLICABLE' },
    { key: 'PLATFORM_USAGE', label: 'PLATFORM USAGE', value: on ? `${disclosure.rateLabel} OF ELIGIBLE TRANSACTIONS` : 'NOT APPLICABLE' },
    { key: 'PAYMENT_PROCESSING', label: 'PAYMENT PROCESSING', value: on ? 'TO BE CONFIGURED' : 'NOT PART OF THIS PROJECT' },
    { key: 'ONGOING_SUPPORT', label: 'ONGOING SUPPORT', value: 'OPTIONAL' },
  ];
}

export function budgetScopeRetainsPlatform(input: { coveredInfrastructureRemains: boolean; upfrontBuildReduced: boolean }): {
  buildCostChanged: boolean;
  platformFeeApplicable: boolean;
  note: string;
} {
  return {
    buildCostChanged: input.upfrontBuildReduced,
    platformFeeApplicable: input.coveredInfrastructureRemains,
    note: input.coveredInfrastructureRemains
      ? 'Reducing the upfront build does not remove platform usage while covered infrastructure remains.'
      : 'Platform usage is not applicable once no covered transaction infrastructure remains.',
  };
}

export type SavedBlueprintVariant = {
  variantId: string;
  label: string;
  buildInvestmentLabel: string;
  platform: PlatformDisclosure;
  ongoingService: OngoingServiceDisclosure;
};

export function saveBlueprintVariant(input: SavedBlueprintVariant): SavedBlueprintVariant {
  return {
    ...input,
    platform: { ...input.platform, includedInBuildInvestment: false },
    ongoingService: { ...input.ongoingService },
  };
}

export const BUILD_TIER_ECONOMICS = {
  SIMPLE: { status: 'NOT_ACTIVATED', rateRule: null },
  ADVANCED: { status: 'NOT_ACTIVATED', rateRule: null },
  CUSTOM: { status: 'NOT_ACTIVATED', rateRule: null },
} as const;

export const PUBLIC_TERMS_PUBLISHED = false;

export function draftPlatformCopy(): {
  status: 'DRAFT_PRODUCT_COPY';
  published: false;
  legalReviewRequired: true;
  paragraphs: string[];
} {
  const rate = formatPlatformFeeRate(DEFAULT_PLATFORM_FEE_BASIS_POINTS);
  return {
    status: 'DRAFT_PRODUCT_COPY',
    published: false,
    legalReviewRequired: true,
    paragraphs: [
      'SITE 00 PLATFORM',
      'Transaction-enabled digital locations built on SITE 00 may include an ongoing platform usage fee.',
      `Default platform usage: ${rate} of eligible transactions processed through covered SITE 00 infrastructure.`,
      'Your Blueprint and commercial agreement will identify which transactions are covered, any exclusions, and the exact rate applicable to your project.',
      'This is DRAFT PRODUCT COPY. Do not publish.',
    ],
  };
}

export const LEGAL_REVIEW_REQUIRED = true;

export const LEGAL_TOPIC_IDS = [
  'ELIGIBLE_TRANSACTION',
  'PLATFORM_RATE',
  'TERM',
  'REFUND_POLICY',
  'DISPUTE_HANDLING',
  'PROCESSOR_FEES',
  'PAYOUT_MECHANICS',
  'TERMINATION',
  'HISTORICAL_OBLIGATIONS',
  'TAXES',
  'REPORTING',
] as const;

export function legalClause(topic: (typeof LEGAL_TOPIC_IDS)[number]): {
  topic: string;
  text: null;
  status: 'LEGAL_REVIEW_REQUIRED';
} {
  return { topic, text: null, status: 'LEGAL_REVIEW_REQUIRED' };
}

export const STUDIO_OS_PLATFORM_LOCATION = {
  project: ['STUDIO OS', 'PROJECT', 'COMMERCIAL', 'PLATFORM ECONOMICS'],
  portfolio: ['STUDIO OS', 'OPERATIONS / FINANCE', 'PLATFORM REVENUE'],
  projectRoute: '/admin/site00/projects/:projectId/commercial',
  portfolioRoute: '/admin/site00/finance/platform',
  newRootNav: false,
} as const;

export const AIO_PLATFORM_CONTRACT = {
  consumer: 'AIO',
  ownsEngine: false,
  location: ['AIO OFFICE', 'MORE', 'BILLING', 'PLATFORM / REVENUE SHARE'],
  views: ['OVERVIEW', 'TRANSACTIONS', 'ACCRUALS', 'PAYOUTS', 'ADJUSTMENTS', 'STATEMENTS'],
  visualAuthorityImplemented: false,
  reports: {
    location: ['AIO OFFICE', 'REPORTS', 'FINANCIAL / REVENUE'],
    mayAggregatePlatformFees: true,
    ownsLedger: false,
  },
} as const;
