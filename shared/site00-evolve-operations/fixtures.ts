/**
 * Acceptance fixtures — scenarios A–H + 1,000-project scale.
 */

import type { EvolveProjectOpsInput, EvolveSpendSnapshot } from './types.js';

const BASE_SPEND: EvolveSpendSnapshot = {
  includedMonthlyCredits: 100,
  purchasedCredits: 0,
  remainingCredits: 15,
  usedCredits: 85,
  providerCostCents: 1200,
  productiveSpendCents: 10000,
  failedSpendCents: 500,
  regenerationSpendCents: 0,
  retrySpendCents: 200,
  projectedBurnCredits: 95,
  approvedPendingSpendCredits: 0,
  blockedSpendCredits: 0,
  hardLimitCredits: 100,
  softLimitCredits: 85,
  cycleDaysRemaining: 11,
  cycleDaysTotal: 30,
  hasTopUp: false,
};

export const FIXTURE_SELF_DIRECTED_CREDIT_WATCH: EvolveProjectOpsInput = {
  projectId: 'proj-solo-watch',
  accountId: 'acct-solo',
  projectName: 'SOLO CREDIT WATCH',
  organizationSlug: 'solo-creator',
  deliveryMode: 'SELF_DIRECTED',
  servicePackage: 'EVOLVE_SOLO',
  revenueTierCents: 3_900,
  launchUrgencyDays: null,
  slaHours: null,
  spend: { ...BASE_SPEND, usedCredits: 85, remainingCredits: 15 },
  failedJobCount: 0,
  repeatedFailureCount: 0,
  lastFailureClass: null,
  lastMeaningfulProgressAt: new Date(Date.now() - 86400000).toISOString(),
  approvalPendingSince: null,
  approvalWaitingOn: null,
  openReviewCount: 0,
  unresolvedBlockerCount: 0,
  clientResponseLagHours: null,
  productionCompletionPercent: 40,
  paymentState: 'CURRENT',
  projectStage: 'CAMPAIGN',
  providerId: 'fal',
};

export const FIXTURE_TRANSIENT_FAILURE: EvolveProjectOpsInput = {
  ...FIXTURE_SELF_DIRECTED_CREDIT_WATCH,
  projectId: 'proj-transient',
  failedJobCount: 1,
  lastFailureClass: 'PROVIDER_TIMEOUT',
};

export const FIXTURE_BAD_CROP: EvolveProjectOpsInput = {
  ...FIXTURE_SELF_DIRECTED_CREDIT_WATCH,
  projectId: 'proj-bad-crop',
  failedJobCount: 1,
  lastFailureClass: 'BAD_CROP',
};

export const FIXTURE_GROWTH_PARTNER_LAUNCH: EvolveProjectOpsInput = {
  projectId: 'proj-growth-launch',
  accountId: 'acct-growth',
  projectName: 'GROWTH PARTNER LAUNCH',
  organizationSlug: 'growth-brand',
  deliveryMode: 'SITE00_DIRECTED',
  servicePackage: 'GROWTH_PARTNER',
  revenueTierCents: 480_000,
  launchUrgencyDays: 1,
  slaHours: 4,
  spend: {
    ...BASE_SPEND,
    includedMonthlyCredits: 500,
    usedCredits: 200,
    remainingCredits: 300,
    providerCostCents: 45000,
  },
  failedJobCount: 0,
  repeatedFailureCount: 0,
  lastFailureClass: null,
  lastMeaningfulProgressAt: new Date(Date.now() - 3600000).toISOString(),
  approvalPendingSince: new Date(Date.now() - 5 * 3600000).toISOString(),
  approvalWaitingOn: 'CLIENT',
  openReviewCount: 1,
  unresolvedBlockerCount: 0,
  clientResponseLagHours: 5,
  productionCompletionPercent: 85,
  paymentState: 'CURRENT',
  projectStage: 'LAUNCH',
  providerId: 'fal',
};

export const FIXTURE_MARKETING_RETAINER_STALL: EvolveProjectOpsInput = {
  projectId: 'proj-retainer-stall',
  accountId: 'acct-retainer',
  projectName: 'RETAINER CAMPAIGN',
  organizationSlug: 'retainer-client',
  deliveryMode: 'SITE00_DIRECTED',
  servicePackage: 'MARKETING_RETAINER',
  revenueTierCents: 2_500_00,
  launchUrgencyDays: 7,
  slaHours: 24,
  spend: { ...BASE_SPEND, providerCostCents: 8000 },
  failedJobCount: 0,
  repeatedFailureCount: 0,
  lastFailureClass: null,
  lastMeaningfulProgressAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  approvalPendingSince: new Date(Date.now() - 4 * 86400000).toISOString(),
  approvalWaitingOn: 'CLIENT',
  openReviewCount: 1,
  unresolvedBlockerCount: 0,
  clientResponseLagHours: 96,
  productionCompletionPercent: 60,
  paymentState: 'CURRENT',
  projectStage: 'CAMPAIGN',
  providerId: 'fal',
};

export const FIXTURE_MARGIN_WATCH: EvolveProjectOpsInput = {
  projectId: 'proj-margin-watch',
  accountId: 'acct-directed',
  projectName: 'DIRECTED MARGIN',
  organizationSlug: 'directed-client',
  deliveryMode: 'SITE00_DIRECTED',
  servicePackage: 'DIRECTED_BUILD',
  revenueTierCents: 480_000,
  launchUrgencyDays: 14,
  slaHours: 24,
  spend: {
    ...BASE_SPEND,
    providerCostCents: 31200,
    productiveSpendCents: 31200,
    failedSpendCents: 800,
  },
  failedJobCount: 0,
  repeatedFailureCount: 0,
  lastFailureClass: null,
  lastMeaningfulProgressAt: new Date().toISOString(),
  approvalPendingSince: null,
  approvalWaitingOn: null,
  openReviewCount: 0,
  unresolvedBlockerCount: 0,
  clientResponseLagHours: null,
  productionCompletionPercent: 55,
  paymentState: 'CURRENT',
  projectStage: 'BUILD',
  providerId: 'fal',
};

export const FIXTURE_MARGIN_WATCH_ERODING: EvolveProjectOpsInput = {
  ...FIXTURE_MARGIN_WATCH,
  projectId: 'proj-margin-eroding',
  margin: {
    clientRevenueCents: 480_000,
    providerCostCents: 312_000,
    humanDeliveryCostCents: 108_000,
    otherDeliveryCostCents: 50_000,
    marginCents: 10_000,
    marginPercent: 2,
    health: 'ERODING',
    reasons: [{ code: 'LOW_MARGIN', label: 'DELIVERY COST EXCEEDS MARGIN POLICY' }],
  },
};

export function generateThousandProjectFixtures(): EvolveProjectOpsInput[] {
  const packages = ['EVOLVE_SOLO', 'EVOLVE_STUDIO', 'MARKETING_RETAINER', 'GROWTH_PARTNER', 'DIRECTED_BUILD'] as const;
  const out: EvolveProjectOpsInput[] = [];
  for (let i = 0; i < 1000; i += 1) {
    const pkg = packages[i % packages.length]!;
    const directed = pkg !== 'EVOLVE_SOLO' && pkg !== 'EVOLVE_STUDIO';
    out.push({
      projectId: `proj-scale-${i}`,
      accountId: `acct-${i % 100}`,
      projectName: `PROJECT ${i}`,
      organizationSlug: `org-${i}`,
      deliveryMode: directed ? 'SITE00_DIRECTED' : 'SELF_DIRECTED',
      servicePackage: pkg,
      revenueTierCents: directed ? 200_000 + (i % 50) * 1000 : 3_900 + (i % 10) * 100,
      launchUrgencyDays: i % 17 === 0 ? 1 : null,
      slaHours: directed ? 24 : null,
      spend: {
        ...BASE_SPEND,
        usedCredits: 20 + (i % 80),
        remainingCredits: 80 - (i % 80),
      },
      failedJobCount: i % 23 === 0 ? 2 : 0,
      repeatedFailureCount: i % 47 === 0 ? 3 : 0,
      lastFailureClass: i % 23 === 0 ? 'PROVIDER_TIMEOUT' : null,
      lastMeaningfulProgressAt: new Date(Date.now() - (i % 10) * 86400000).toISOString(),
      approvalPendingSince: i % 7 === 0 ? new Date(Date.now() - 2 * 86400000).toISOString() : null,
      approvalWaitingOn: i % 7 === 0 ? (i % 2 === 0 ? 'CLIENT' : 'SITE00') : null,
      openReviewCount: i % 5,
      unresolvedBlockerCount: i % 31 === 0 ? 1 : 0,
      clientResponseLagHours: i % 7 === 0 ? 48 : null,
      productionCompletionPercent: 10 + (i % 90),
      paymentState: i % 99 === 0 ? 'PAST_DUE' : 'CURRENT',
      projectStage: 'CAMPAIGN',
      providerId: 'fal',
    });
  }
  return out;
}

export function generateProviderOutageFailures(count = 30): import('./providerIncident.js').ProviderFailureRecord[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    jobId: `job-outage-${i}`,
    providerId: 'fal-primary',
    providerName: 'FAL PRIMARY',
    failureClass: 'PROVIDER_TIMEOUT' as const,
    timestamp: new Date(now - i * 60000).toISOString(),
  }));
}
