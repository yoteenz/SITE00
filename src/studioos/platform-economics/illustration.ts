import { createPlatformBooks } from './books';
import { classifyCollected } from './eligibility';
import { formatMinorForDisplay } from './format';
import { quotePlatformFee } from './processor';
import { formatPlatformFeeRate } from './rate';
import type { MoneyComponent, ProcessorFeeTreatment } from './types';

/**
 * Example inputs, not a client history and not a rate.
 * Shipping is intentionally absent: the engine has no SHIPPING exclusion code.
 */
export const ILLUSTRATIVE_EXAMPLE_COMPONENTS: readonly MoneyComponent[] = [
  { code: 'SERVICE', minor: 10_000 },
  { code: 'TAX', minor: 800 },
  { code: 'GRATUITY', minor: 500 },
  { code: 'PASS_THROUGH', minor: 200 },
];

export const ILLUSTRATIVE_PROCESSOR_FEE_MINOR = 290;

export const ELIGIBILITY_CONTRACT_NOTES = [
  {
    topic: 'SHIPPING',
    status: 'NOT_A_DISTINCT_EXCLUSION',
    detail:
      'Shipping is not its own exclusion code. It is not treated as eligible commerce, and it is not silently excluded. Record it as PASS_THROUGH only when the agreement says that charge is a pass-through.',
  },
  {
    topic: 'TIPS',
    status: 'MAPS_TO_GRATUITY',
    detail: 'A tip is a gratuity. The default agreement excludes gratuities.',
  },
  {
    topic: 'CLIENT_NET_ON_CAPTURE',
    status: 'NOT_AUTHORITATIVE_WHEN_PROCESSOR_UNSPECIFIED',
    detail:
      'The ledger field clientNet subtracts a recorded processor fee from eligible volume even when processor treatment is UNSPECIFIED. Client statements do not present that field as money the client keeps until the agreement states the processor treatment.',
  },
] as const;

export type IllustrativePreview = {
  label: 'EXAMPLE';
  notClientHistory: true;
  notGuaranteedRevenue: true;
  currency: string;
  rateLabel: string;
  rateBasisPoints: number;
  customRate: boolean;
  components: { code: string; minor: number; display: string }[];
  grossMinor: number;
  grossDisplay: string;
  excludedMinor: number;
  excludedDisplay: string;
  eligibleMinor: number;
  eligibleDisplay: string;
  platformFeeMinor: number;
  platformFeeDisplay: string;
  processorFeeMinor: number;
  processorFeeDisplay: string;
  processorFeeTreatment: ProcessorFeeTreatment;
  clientProceeds: { state: 'UNAVAILABLE'; reason: string } | { state: 'POSTED'; minor: number; display: string };
  oneLine: string;
  movedFunds: false;
};

export function illustrativeTransactionPreview(input: {
  currency: string;
  basisPoints: number;
  customRate: boolean;
  applicable: boolean;
  processorFeeTreatment?: ProcessorFeeTreatment;
}): IllustrativePreview {
  const books = createPlatformBooks();
  const created = books.createAgreement({
    projectId: 'example-project',
    clientOrgId: 'example-client',
    currency: input.currency,
    platformFeeApplicable: input.applicable,
    basisPoints: input.basisPoints,
    coveredTransactionTypes: ['SERVICE_PAYMENT'],
    processorFeeTreatment: input.processorFeeTreatment,
    rateOverride: input.customRate
      ? { author: 'example', reason: 'Illustrative custom rate', timestamp: '2026-10-09T00:00:00.000Z' }
      : undefined,
  });
  if (!created.ok) throw new Error(created.code);
  const agreement = created.agreement;
  const treatment = agreement.processorFeeTreatment;
  const classified = classifyCollected(
    [...ILLUSTRATIVE_EXAMPLE_COMPONENTS],
    agreement.calculationConfig,
    ILLUSTRATIVE_PROCESSOR_FEE_MINOR,
    treatment,
  );
  const quote = quotePlatformFee({
    currency: input.currency,
    eligibleMinor: classified.eligibleMinor,
    basisPoints: agreement.platformFeeRateBasisPoints,
    applicable: agreement.platformFeeApplicable,
  });
  const rateLabel = formatPlatformFeeRate(agreement.platformFeeRateBasisPoints);
  const clientProceeds = clientProceedsForExample(classified.eligibleMinor, quote.platformFee.minor, ILLUSTRATIVE_PROCESSOR_FEE_MINOR, treatment, input.currency);
  const oneLine = `Example only, not your sales: a ${formatMinorForDisplay(input.currency, 10_000)} payment with tax, tip, and pass-through set aside leaves ${formatMinorForDisplay(input.currency, classified.eligibleMinor)} eligible. At ${rateLabel} the share is ${formatMinorForDisplay(input.currency, quote.platformFee.minor)}.`;
  return {
    label: 'EXAMPLE',
    notClientHistory: true,
    notGuaranteedRevenue: true,
    currency: input.currency,
    rateLabel,
    rateBasisPoints: agreement.platformFeeRateBasisPoints,
    customRate: agreement.rateOverride != null,
    components: ILLUSTRATIVE_EXAMPLE_COMPONENTS.map((component) => ({
      code: component.code,
      minor: component.minor,
      display: formatMinorForDisplay(input.currency, component.minor),
    })),
    grossMinor: classified.grossMinor,
    grossDisplay: formatMinorForDisplay(input.currency, classified.grossMinor),
    excludedMinor: classified.excludedMinor,
    excludedDisplay: formatMinorForDisplay(input.currency, classified.excludedMinor),
    eligibleMinor: classified.eligibleMinor,
    eligibleDisplay: formatMinorForDisplay(input.currency, classified.eligibleMinor),
    platformFeeMinor: quote.platformFee.minor,
    platformFeeDisplay: formatMinorForDisplay(input.currency, quote.platformFee.minor),
    processorFeeMinor: ILLUSTRATIVE_PROCESSOR_FEE_MINOR,
    processorFeeDisplay: formatMinorForDisplay(input.currency, ILLUSTRATIVE_PROCESSOR_FEE_MINOR),
    processorFeeTreatment: treatment,
    clientProceeds,
    oneLine,
    movedFunds: quote.movedFunds,
  };
}

function clientProceedsForExample(
  eligibleMinor: number,
  platformFeeMinor: number,
  processorFeeMinor: number,
  treatment: ProcessorFeeTreatment,
  currency: string,
): IllustrativePreview['clientProceeds'] {
  if (treatment === 'UNSPECIFIED') {
    return { state: 'UNAVAILABLE', reason: 'PROCESSOR_FEE_TREATMENT_UNSPECIFIED' };
  }
  const minor = treatment === 'INCLUDED' ? eligibleMinor - platformFeeMinor - processorFeeMinor : eligibleMinor - platformFeeMinor;
  if (minor < 0) return { state: 'UNAVAILABLE', reason: 'CLIENT_PROCEEDS_NOT_RECONCILED' };
  return { state: 'POSTED', minor, display: formatMinorForDisplay(currency, minor) };
}
