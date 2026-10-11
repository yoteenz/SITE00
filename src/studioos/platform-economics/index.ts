export { PLATFORM_ECONOMICS_VERSION, COMMERCIAL_TERMS_VERSION } from './version';
export { DEFAULT_PLATFORM_FEE_BASIS_POINTS, BASIS_POINT_SCALE, canonicalPlatformFeeBasisPoints, formatPlatformFeeRate, isDefaultPlatformRate } from './rate';
export { applyBasisPoints, money, sumMoney, zeroMoney } from './money';
export type { Money } from './money';
export { classifyCollected, platformFeeMinor } from './eligibility';
export { canAdminister, canReadClientOrg } from './permissions';
export { createPlatformBooks } from './books';
export type { PlatformBooks, CaptureInput, CreateAgreementInput } from './books';
export { accrueAioServicePayment } from './aio';
export { createStripeConnectAdapter } from './stripeConnect';
export { LIVE_MONEY_MOVEMENT, LIVE_PLATFORM_FEES_COLLECTED, quotePlatformFee, blockedProcessorCall } from './processor';
export type { PlatformPaymentProvider } from './processor';
export {
  AIO_PLATFORM_CONTRACT,
  BUILD_TIER_ECONOMICS,
  LEGAL_REVIEW_REQUIRED,
  LEGAL_TOPIC_IDS,
  PUBLIC_TERMS_PUBLISHED,
  STUDIO_OS_PLATFORM_LOCATION,
  blueprintPlatformLines,
  budgetScopeRetainsPlatform,
  draftPlatformCopy,
  legalClause,
  ongoingServiceDisclosure,
  platformDisclosureForFeatures,
  saveBlueprintVariant,
} from './disclosure';
export type { PlatformDisclosure, SavedBlueprintVariant } from './disclosure';
export { formatMinorForDisplay } from './format';
export { illustrativeTransactionPreview, ELIGIBILITY_CONTRACT_NOTES, ILLUSTRATIVE_EXAMPLE_COMPONENTS } from './illustration';
export { blueprintFinancialPresentation, clientFacingAgreementState, agreementDeductionActive } from './presentation';
export type { BlueprintFinancialPresentation, ClientFacingAgreementState } from './presentation';
export { clientStatement, clientStatementHistory, clientTransactionBreakdown } from './clientStatement';
export type { ClientFinancialStatement, ClientStatementResult } from './clientStatement';
export {
  AIO_PLATFORM_PARTICIPATION_ACTIVATED,
  AIO_TRANSACTION_MODELS,
  CLIENT_ACCOUNT_FINANCIAL_CONTRACT,
  FINANCIAL_GATES,
  STATEMENT_INTERACTIONS,
} from './clientExperience';
export { runFoundationHarness } from './harness';
export type { HarnessCase } from './harness';
export type {
  AgreementStatus,
  CoveredTransactionType,
  LedgerEntry,
  LedgerEventType,
  PlatformActor,
  PlatformPayoutBatch,
  PlatformStatement,
  ProjectPlatformAgreement,
  RevenueType,
} from './types';
