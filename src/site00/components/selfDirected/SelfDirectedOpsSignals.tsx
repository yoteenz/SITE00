import type { ClientAppManifest } from '../../../../shared/site00-client-app/types.js';
import { createEvolveOperationsIntelligence } from '../../../../shared/site00-evolve-operations/index.js';
import type { EvolveProjectOpsInput } from '../../../../shared/site00-evolve-operations/types.js';

type SelfDirectedOpsSignalsProps = {
  manifest: ClientAppManifest;
};

function manifestToOpsInput(manifest: ClientAppManifest): EvolveProjectOpsInput {
  const reviewCount = manifest.reviewableObjects?.length ?? 0;
  return {
    projectId: manifest.projectSlug,
    accountId: manifest.projectSlug,
    projectName: manifest.displayName,
    organizationSlug: manifest.projectSlug,
    deliveryMode: 'SELF_DIRECTED',
    servicePackage: 'EVOLVE_SOLO',
    revenueTierCents: 3_900,
    launchUrgencyDays: null,
    slaHours: null,
    spend: {
      includedMonthlyCredits: 100,
      purchasedCredits: 0,
      remainingCredits: Math.max(0, 100 - reviewCount * 5),
      usedCredits: reviewCount * 5,
      providerCostCents: 0,
      productiveSpendCents: reviewCount * 500,
      failedSpendCents: 0,
      regenerationSpendCents: 0,
      retrySpendCents: 0,
      projectedBurnCredits: reviewCount * 5 + 10,
      approvedPendingSpendCredits: 0,
      blockedSpendCredits: 0,
      hardLimitCredits: 100,
      softLimitCredits: 85,
      cycleDaysRemaining: 14,
      cycleDaysTotal: 30,
      hasTopUp: false,
    },
    failedJobCount: 0,
    repeatedFailureCount: 0,
    lastFailureClass: null,
    lastMeaningfulProgressAt: new Date().toISOString(),
    approvalPendingSince: manifest.attentionState === 'YOUR_TURN' ? new Date().toISOString() : null,
    approvalWaitingOn: manifest.attentionState === 'YOUR_TURN' ? 'CLIENT' : null,
    openReviewCount: reviewCount,
    unresolvedBlockerCount: 0,
    clientResponseLagHours: null,
    productionCompletionPercent: 50,
    paymentState: 'CURRENT',
    projectStage: manifest.currentPhaseLabel,
    providerId: null,
  };
}

/** Client-safe operational signals for self-directed Evolve home. */
export function SelfDirectedOpsSignals({ manifest }: SelfDirectedOpsSignalsProps) {
  const engine = createEvolveOperationsIntelligence();
  const view = engine.getClientSafeView(engine.analyzeProject(manifestToOpsInput(manifest)));
  const safe = view;

  return (
    <div className="site00-sd-home__ops-signals" data-visual-authority="VISUAL_AUTHORITY_REQUIRED">
      <article className="site00-sd-ops-signal">
        <strong>{safe.creditsRemaining}</strong>
        <span>RUNS LEFT</span>
      </article>
      <article className="site00-sd-ops-signal">
        <strong>{safe.healthLabel}</strong>
        <span>PROJECT HEALTH</span>
      </article>
      {safe.needsAttention ? (
        <article className="site00-sd-ops-signal">
          <strong>{safe.pendingReviews}</strong>
          <span>NEEDS ATTENTION</span>
        </article>
      ) : null}
      {safe.nextAction ? (
        <article className="site00-sd-ops-signal">
          <strong>→</strong>
          <span>{safe.nextAction}</span>
        </article>
      ) : null}
    </div>
  );
}
