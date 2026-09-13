import type { DesignPageAuthorityReviewSession } from '../types.js';

export type DerivationButtonState =
  | 'DISABLED'
  | 'GENERATE_DERIVATIVES'
  | 'GENERATING'
  | 'REVIEW_DERIVATIVES'
  | 'RESOLVE_BLOCKERS'
  | 'DERIVATION_FAILED';

export type DerivationButtonView = {
  state: DerivationButtonState;
  label: string;
  disabled: boolean;
  testId: string;
};

export function resolveDerivationButtonView(session: DesignPageAuthorityReviewSession): DerivationButtonView {
  const pair = session.authorityPipeline?.authorityPair;
  const derivation = session.designWorkspaceDerivation;
  const activeRun =
    derivation?.activeRunId ? derivation.runs.find((r) => r.id === derivation.activeRunId) : null;

  if (activeRun?.status === 'QUEUED' || activeRun?.status === 'DERIVING') {
    return {
      state: 'GENERATING',
      label: 'GENERATING DERIVATIVES…',
      disabled: true,
      testId: 'v3-derivation-generating',
    };
  }

  const latestRun = derivation?.runs.at(-1);
  if (latestRun?.status === 'FAILED') {
    return {
      state: 'DERIVATION_FAILED',
      label: 'DERIVATION FAILED · RETRY',
      disabled: false,
      testId: 'v3-derivation-failed',
    };
  }

  if (latestRun?.status === 'BLOCKED') {
    return {
      state: 'RESOLVE_BLOCKERS',
      label: 'RESOLVE DERIVATION BLOCKERS',
      disabled: false,
      testId: 'v3-derivation-blocked',
    };
  }

  if (pair?.derivationStatus === 'COMPLETE' && derivation?.latestPackageId) {
    return {
      state: 'REVIEW_DERIVATIVES',
      label: 'REVIEW DERIVATIVES',
      disabled: false,
      testId: 'v3-review-derivatives',
    };
  }

  if (pair?.status === 'PAIR_LOCKED' && pair.derivationStatus === 'READY') {
    return {
      state: 'GENERATE_DERIVATIVES',
      label: 'GENERATE DERIVATIVES',
      disabled: false,
      testId: 'v3-generate-derivatives-mobile-primary',
    };
  }

  return {
    state: 'DISABLED',
    label: 'GENERATE DERIVATIVES',
    disabled: true,
    testId: 'v3-derivation-disabled',
  };
}

/** @deprecated use resolveDerivationButtonView */
export function derivationPrimaryActionLabel(session: DesignPageAuthorityReviewSession): string {
  return resolveDerivationButtonView(session).label;
}
