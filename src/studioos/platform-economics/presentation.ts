import { platformDisclosureForFeatures } from './disclosure';
import { illustrativeTransactionPreview } from './illustration';
import { formatPlatformFeeRate } from './rate';
import type { AgreementStatus, ProjectPlatformAgreement } from './types';

/** Client-facing words for an agreement. The stored status stays the authority. */
export type ClientFacingAgreementState =
  | 'PROPOSED'
  | 'PENDING_ACCEPTANCE'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'TERMINATED'
  | 'SUSPENDED';

export function clientFacingAgreementState(status: AgreementStatus): ClientFacingAgreementState {
  switch (status) {
    case 'DRAFT':
    case 'FOUNDER_REVIEW':
    case 'OFFERED':
      return 'PROPOSED';
    case 'CLIENT_REVIEW':
    case 'ACCEPTED':
      return 'PENDING_ACCEPTANCE';
    case 'ACTIVE':
      return 'ACTIVE';
    case 'SUPERSEDED':
      return 'SUPERSEDED';
    case 'ENDED':
      return 'TERMINATED';
    case 'SUSPENDED':
      return 'SUSPENDED';
  }
}

/** A rate is an active deduction only while the agreement itself is active and the fee applies. */
export function agreementDeductionActive(status: AgreementStatus, platformFeeApplicable: boolean): boolean {
  return status === 'ACTIVE' && platformFeeApplicable;
}

export type BlueprintFinancialPresentation = {
  build: {
    heading: 'What it costs to build';
    amountLabel: string;
    guaranteed: false;
    source: 'CANONICAL_ESTIMATOR';
    includedPlatformShare: false;
  };
  platform: {
    heading: 'What SITE 00 earns after launch';
    line: string;
    presentation: ClientFacingAgreementState | 'NOT_APPLICABLE';
    deductionActive: boolean;
    rateLabel: string | null;
    rateBasisPoints: number | null;
    customRate: boolean;
    eligibleDefinition: string;
  };
  thirdParty: {
    heading: 'What other companies may charge';
    line: string;
    site00IsProcessor: false;
    settlementTimingPromised: false;
  };
  agreement: {
    heading: 'What you agree to';
    line: string;
    termsVersion: string | null;
    acceptanceRequired: true;
    legalReviewRequired: true;
    effectiveDateBehavior: string;
  };
  illustration: ReturnType<typeof illustrativeTransactionPreview> | null;
};

const ELIGIBLE_DEFINITION =
  'Eligible transactions are customer payments successfully collected through covered SITE 00 infrastructure. Tax, tips, government fees, regulatory fees, and approved pass-through amounts stay out unless the agreement says otherwise. Refunds and lost chargebacks reverse the matching share.';

const EFFECTIVE_DATE =
  'The share applies to collections on or after the agreement effective date, and only while that agreement is active. A later rate does not rewrite earlier transactions.';

export function blueprintFinancialPresentation(input: {
  featureIds: readonly string[];
  buildInvestmentLabel: string | null;
  agreement: ProjectPlatformAgreement | null;
}): BlueprintFinancialPresentation {
  const disclosure = platformDisclosureForFeatures(input.featureIds);
  const agreement = input.agreement;
  const applicable = agreement ? agreement.platformFeeApplicable : disclosure.platformFeeApplicable;
  const basisPoints = agreement?.platformFeeRateBasisPoints ?? disclosure.rateBasisPoints;
  const rateLabel = basisPoints == null ? null : formatPlatformFeeRate(basisPoints);
  const presentation: BlueprintFinancialPresentation['platform']['presentation'] = !applicable
    ? 'NOT_APPLICABLE'
    : agreement
      ? clientFacingAgreementState(agreement.status)
      : 'PROPOSED';
  const deductionActive = agreement ? agreementDeductionActive(agreement.status, agreement.platformFeeApplicable) : false;
  const customRate = agreement ? agreement.rateOverride != null : false;

  const platformLine = !applicable
    ? 'No platform share applies. This project does not take covered payments.'
    : deductionActive
      ? `The active agreement is ${rateLabel} of eligible transactions.`
      : presentation === 'SUPERSEDED'
        ? `A previous agreement used ${rateLabel}. It does not apply to new transactions.`
        : presentation === 'TERMINATED'
          ? `The agreement that used ${rateLabel} has ended. It is not an active charge.`
          : presentation === 'SUSPENDED'
            ? `The agreement at ${rateLabel} is paused. It is not an active charge.`
            : presentation === 'PENDING_ACCEPTANCE'
              ? `A ${rateLabel} share is waiting on acceptance. It is not an active charge.`
              : `A proposed share of ${rateLabel} of eligible transactions. It is not added to the build, and it is not an active charge.`;

  const illustration =
    applicable && basisPoints != null
      ? illustrativeTransactionPreview({
          currency: agreement?.currency ?? 'USD',
          basisPoints,
          customRate,
          applicable: true,
          processorFeeTreatment: agreement?.processorFeeTreatment,
        })
      : null;

  return {
    build: {
      heading: 'What it costs to build',
      amountLabel: input.buildInvestmentLabel ?? 'The build range appears when the estimate is shown. It is a projection, not a quote.',
      guaranteed: false,
      source: 'CANONICAL_ESTIMATOR',
      includedPlatformShare: false,
    },
    platform: {
      heading: 'What SITE 00 earns after launch',
      line: platformLine,
      presentation,
      deductionActive,
      rateLabel,
      rateBasisPoints: basisPoints,
      customRate,
      eligibleDefinition: ELIGIBLE_DEFINITION,
    },
    thirdParty: {
      heading: 'What other companies may charge',
      line: 'Payment processors and other outside services set their own fees. SITE 00 is not the payment processor, and this proposal does not promise when money settles.',
      site00IsProcessor: false,
      settlementTimingPromised: false,
    },
    agreement: {
      heading: 'What you agree to',
      line: deductionActive
        ? 'This share follows the active agreement. Legal review of the published terms is still required before production use.'
        : 'Nothing on this Blueprint is an accepted charge. A founder review comes first. You would accept a separate agreement before any share applies.',
      termsVersion: agreement?.commercialTermsVersion ?? null,
      acceptanceRequired: true,
      legalReviewRequired: true,
      effectiveDateBehavior: EFFECTIVE_DATE,
    },
    illustration,
  };
}
